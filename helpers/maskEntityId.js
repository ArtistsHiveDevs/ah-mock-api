const mongoose = require("mongoose");

const SENSITIVE_HIDDEN_FIELDS = ["sub", "password"];
const SENSITIVE_DATA_MASK_FIELDS = [
  "email",
  "mobile_phone",
  "phone",
  "phone_number",
  "whatsapp",
];

const HINT_FIELDS = ["username", "name", "email", "title", "stage_name"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Enmascara un valor sensible según su forma:
 * - Email: conserva la primera letra del local-part y reemplaza el resto por 5 asteriscos
 *   fijos (no preserva longitud); el dominio queda intacto.
 * - Numérico (teléfono, whatsapp, etc.): reemplaza los últimos 5 dígitos por '*', uno a
 *   uno, preservando cualquier separador (+, espacios, guiones, paréntesis) tal cual.
 * - Cualquier otro valor (sin dígitos, no string, vacío) se devuelve sin cambios.
 * @param {string} key - nombre del campo (informativo; el formato se detecta por el valor)
 * @param {*} value
 * @returns {*} valor enmascarado, o el original si no aplica ningún patrón
 */
function dataFieldMask(key, value) {
  if (typeof value !== "string" || !value) {
    return value;
  }

  if (value.includes("***")) {
    return value;
  }

  if (EMAIL_REGEX.test(value)) {
    const [localPart, domain] = value.split("@");
    return `${localPart[0]}*****@${domain}`;
  }

  const digitPositions = [];
  for (let i = 0; i < value.length; i++) {
    if (/\d/.test(value[i])) {
      digitPositions.push(i);
    }
  }

  if (!digitPositions.length) {
    return value;
  }

  const positionsToMask = new Set(digitPositions.slice(-5));
  return value
    .split("")
    .map((char, index) => (positionsToMask.has(index) ? "*" : char))
    .join("");
}

/**
 * Recolecta los ObjectId crudos referenciados en entityRoleMap[].ids
 * (forma usada por Artist/Place/CalendarActivity: { role, ids: [ObjectId] }),
 * para resolverlos en un solo query contra EntityDirectory antes de enmascarar.
 */
function collectRoleMapUserIds(data, acc) {
  if (Array.isArray(data)) {
    data.forEach((item) => collectRoleMapUserIds(item, acc));
    return;
  }

  if (!isPlainMaskableObject(data)) {
    return;
  }

  const plainData =
    typeof data.toObject === "function" ? data.toObject() : data;

  Object.entries(plainData).forEach(([key, value]) => {
    if (key === "entityRoleMap" && Array.isArray(value)) {
      value.forEach((group) => {
        if (Array.isArray(group?.ids)) {
          group.ids.forEach((id) => {
            if (id !== undefined && id !== null) {
              acc.add(String(id));
            }
          });
        }
      });
      return;
    }
    collectRoleMapUserIds(value, acc);
  });
}

/**
 * Resuelve un set de ObjectId (string) de User contra EntityDirectory, devolviendo
 * un Map id crudo -> sID. Sigue el mismo patrón de resolución de conexión que
 * normalizeProfileId (models/appbase/EntityDirectory.js): deriva el entorno de la
 * conexión recibida y usa la conexión "principal" cacheada de ese entorno.
 */
async function resolveEntityRoleMapUserSids(rawIds, connection) {
  const map = new Map();

  if (!rawIds.size || !connection) {
    return map;
  }

  try {
    const { connections } = require("../db/db_g");
    const env = connection.environment || connection.name;
    const entityDirectoryConnection = connections[env] || connection;
    const EntityDirectory = entityDirectoryConnection.model("EntityDirectory");

    const objectIds = [...rawIds].filter((id) =>
      mongoose.Types.ObjectId.isValid(id),
    );

    if (!objectIds.length) {
      return map;
    }

    const entries = await EntityDirectory.find({
      entityType: "User",
      id: { $in: objectIds },
    })
      .select("id sID")
      .lean();

    entries.forEach((entry) => {
      if (entry.sID) {
        map.set(String(entry.id), entry.sID);
      }
    });
  } catch (error) {
    // console.warn(
    //   `[maskIds] Error resolviendo entityRoleMap.ids contra EntityDirectory: ${error.message}`,
    // );
  }

  return map;
}

// Formas de identificar un recurso. Superset de EntityDirectory.identifier
// (models/appbase/EntityDirectory.js:73-75: username || sID || id || _id, "la
// mejor" una sola); acá se necesitan TODAS por separado, para comparar cada
// forma contra su propio campo (un username nunca debería matchear un _id).
// `sub` (Cognito) se suma aparte: está en SENSITIVE_HIDDEN_FIELDS y nunca se
// expone en la respuesta, pero sigue siendo válido para matchear "es el viewer".
const IDENTIFIER_FIELDS = ["username", "sID", "id", "_id", "sub"];

/**
 * Normaliza el identifier del viewer a un objeto {username?, sID?, id?, _id?,
 * sub?} (strings). Un string suelto se trata como id/_id (compat: es lo único
 * que suelen tener a mano los call sites hoy, ej. req.userId). Un objeto se
 * filtra a solo los campos conocidos, ya en string.
 * @param {string|object|null|undefined} viewer
 * @returns {Partial<Record<'username'|'sID'|'id'|'_id'|'sub', string>>}
 */
function normalizeViewerIdentity(viewer) {
  if (!viewer) {
    return {};
  }

  if (typeof viewer === "string") {
    return { id: viewer, _id: viewer };
  }

  return IDENTIFIER_FIELDS.reduce((identity, field) => {
    if (viewer[field] === undefined || viewer[field] === null) {
      return identity;
    }

    const value = String(viewer[field]);

    if (
      (field === "id" || field === "_id") &&
      !mongoose.Types.ObjectId.isValid(value)
    ) {
      identity.sID = value;
      return identity;
    }

    identity[field] = value;
    return identity;
  }, {});
}

/**
 * true si alguna forma de `identity` (ya normalizada) coincide con el campo del
 * mismo tipo en `plainData`.
 */
function matchesIdentity(plainData, identity) {
  return Object.keys(identity).some(
    (field) =>
      plainData[field] !== undefined &&
      plainData[field] !== null &&
      String(plainData[field]) === identity[field],
  );
}

/**
 * true si el viewer no debe ver este objeto enmascarado. Tres formas de matchear:
 * 1. plainData ES el propio viewer (alguna forma de su identity coincide con el
 *    campo del mismo tipo en plainData).
 * 2. plainData es una entidad que el viewer trae en su PROPIO snapshot
 *    denormalizado (viewerIdentity.roles[].entityRoleMap[], de CUALQUIER
 *    entityName -Artist, Place, etc-, no solo el que aplique al request actual).
 *    Sirve de respaldo cuando el entityRoleMap del RECURSO no llega (bug/legacy)
 *    o no se quiere depender de resolver ids crudos.
 * 3. El viewer aparece dentro del entityRoleMap del propio recurso (cualquier
 *    role: owner, admin, etc.), comparando ids crudos.
 * @param {*} plainData - objeto crudo (antes de aplicar el masking de este nivel)
 * @param {string|object|null} viewerIdentity - id de User del viewer, como string
 *   suelto (se asume id/_id), o como objeto parcial {username, sID, id, _id, sub,
 *   roles} cuando el caller sabe exactamente cuál forma está pasando. `roles`,
 *   si viene, es el user.roles completo (array de {entityName, entityRoleMap}).
 */
function viewerCanSeeUnmasked(plainData, viewerIdentity) {
  if (!plainData || typeof plainData !== "object") {
    return false;
  }

  const identity = normalizeViewerIdentity(viewerIdentity);
  const identityFields = Object.keys(identity);

  if (identityFields.length && matchesIdentity(plainData, identity)) {
    return true;
  }

  const viewerRoles =
    viewerIdentity && typeof viewerIdentity === "object"
      ? viewerIdentity?.roles
      : null;

  if (Array.isArray(viewerRoles)) {
    const relatedEntityCandidates = viewerRoles.flatMap(
      (role) => role?.entityRoleMap || [],
    );
    const matchesAnyRelatedEntity = relatedEntityCandidates.some((candidate) =>
      matchesIdentity(plainData, normalizeViewerIdentity(candidate)),
    );
    if (matchesAnyRelatedEntity) {
      return true;
    }
  }

  if (!Array.isArray(plainData.entityRoleMap)) {
    return false;
  }

  // entityRoleMap[].ids siempre son ObjectId crudos (ver collectRoleMapUserIds),
  // así que solo pueden matchear contra la forma id/_id del viewer.
  const viewerRawId = identity.id || identity._id;
  if (!viewerRawId) {
    return false;
  }

  return plainData.entityRoleMap.some(
    (group) =>
      Array.isArray(group?.ids) &&
      group.ids.some(
        (id) => id !== undefined && id !== null && String(id) === viewerRawId,
      ),
  );
}

function maskEntityRoleMapGroup(
  group,
  sidByUserId,
  path,
  viewerIdentity,
  forceView = [],
) {
  if (!group || !Array.isArray(group.ids)) {
    return maskIdsCore(group, path, sidByUserId, viewerIdentity, forceView);
  }

  const maskedIds = group.ids.reduce((acc, rawId) => {
    const sid = sidByUserId.get(String(rawId));
    if (sid) {
      acc.push(sid);
    } else {
      // console.warn(
      //   `[maskIds] EntityDirectory sin sID para ${path} (id=${rawId}); se omite del array`,
      // );
    }
    return acc;
  }, []);

  return { ...group, ids: maskedIds };
}

function maskIdsCore(data, path, sidByUserId, viewerIdentity, forceView = []) {
  if (Array.isArray(data)) {
    return data.map((item, index) =>
      maskIdsCore(
        item,
        `${path}[${index}]`,
        sidByUserId,
        viewerIdentity,
        forceView,
      ),
    );
  }

  if (!isPlainMaskableObject(data)) {
    return data;
  }

  const plainData =
    typeof data.toObject === "function" ? data.toObject() : data;

  const entityLabel =
    data.constructor?.modelName || plainData.entityType || plainData.__t;

  const hasSID = plainData.sID !== undefined && plainData.sID !== null;
  const has_Id = plainData._id !== undefined && plainData._id !== null;
  const hasIdVirtual = plainData.id !== undefined && plainData.id !== null;
  const hasMaskableId = hasSID && (has_Id || hasIdVirtual);

  if (!hasSID && has_Id) {
    const hintField = HINT_FIELDS.find(
      (field) => plainData[field] !== undefined && plainData[field] !== null,
    );
    const hint = hintField ? `, ${hintField}="${plainData[hintField]}"` : "";
    // console.warn(
    //   `[maskIds] sID ausente en ${path}${entityLabel ? ` (${entityLabel})` : ""} ` +
    //     `(id=${plainData._id ?? plainData.id}${hint}); se expone el ObjectId real`,
    // );
  }

  const canSeeUnmasked = viewerCanSeeUnmasked(plainData, viewerIdentity);

  const masked = {};
  Object.keys(plainData).forEach((key) => {
    if (hasMaskableId && key === "sID") {
      return;
    }
    if (SENSITIVE_HIDDEN_FIELDS.includes(key)) {
      return;
    }

    if (SENSITIVE_DATA_MASK_FIELDS.includes(key)) {
      masked[key] =
        canSeeUnmasked || forceView.includes(key)
          ? plainData[key]
          : dataFieldMask(key, plainData[key]);
      return;
    }

    if (
      key === "entityRoleMap" &&
      Array.isArray(plainData[key]) &&
      sidByUserId
    ) {
      masked[key] = plainData[key].map((group) =>
        maskEntityRoleMapGroup(
          group,
          sidByUserId,
          `${path}.${key}`,
          viewerIdentity,
          forceView,
        ),
      );
      return;
    }

    masked[key] = maskIdsCore(
      plainData[key],
      `${path}.${key}`,
      sidByUserId,
      viewerIdentity,
      forceView,
    );
  });

  if (hasMaskableId) {
    if (has_Id) {
      delete masked._id;
    }
    masked.id = plainData.sID;
  }

  return masked;
}

/**
 * Enmascara _id -> sID recursivamente. Comportamiento sin cambios respecto al
 * original: síncrono, no toca entityRoleMap[].ids (esos ObjectId crudos quedan
 * expuestos tal cual, igual que siempre). Usada por ~30 call sites existentes.
 * Para resolver entityRoleMap.ids contra EntityDirectory usar
 * maskIdsWithEntityDirectory en su lugar.
 * @param {*} data
 * @param {string} [path]
 * @param {string|object|null} [viewerIdentity] - identifier de quien hace la
 *   petición: un string suelto (ej. req.userId) se asume id/_id, o un objeto
 *   parcial {username, sID, id, _id, sub} cuando se sabe exactamente qué forma se
 *   tiene a mano. Si se pasa, los campos de SENSITIVE_DATA_MASK_FIELDS no se
 *   enmascaran para un recurso que sea el propio viewer o que lo tenga en su
 *   entityRoleMap (cualquier role). Por defecto null: se enmascara todo, igual
 *   que antes de este parámetro.
 */
function maskIds(data, path = "root", viewerIdentity = null, forceView = []) {
  return maskIdsCore(data, path, null, viewerIdentity, forceView);
}

/**
 * Variante async de maskIds: además de enmascarar _id -> sID, resuelve los
 * ObjectId crudos de entityRoleMap[].ids (forma { role, ids } usada por
 * Artist/Place/CalendarActivity) contra EntityDirectory y los reemplaza por su
 * sID. Los ids sin match en EntityDirectory (dato huérfano/legacy) se omiten del
 * array, con un warning en consola.
 * @param {*} data
 * @param {import("mongoose").Connection} connection - conexión del entorno actual
 *   (ej. connections[req.serverEnvironment] de db/db_g.js)
 * @param {object} [options]
 * @param {string|object|null} [options.viewerIdentity] - ver documentación en maskIds
 * @param {Array} [options.forceView]
 */
async function maskIdsWithEntityDirectory(data, connection, options = {}) {
  const { viewerIdentity = null, forceView = [] } = options;

  if (!connection) {
    // Sin conexión disponible no hay forma de resolver EntityDirectory: se
    // deja entityRoleMap.ids intacto (igual que maskIds) en vez de vaciarlo,
    // para no confundir "sin conexión" con "id sin match".
    return maskIdsCore(data, "root", null, viewerIdentity, forceView);
  }

  const rawIds = new Set();
  collectRoleMapUserIds(data, rawIds);
  const sidByUserId = await resolveEntityRoleMapUserSids(rawIds, connection);

  return maskIdsCore(data, "root", sidByUserId, viewerIdentity, forceView);
}

function isPlainMaskableObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  if (value instanceof Date || Buffer.isBuffer(value) || value instanceof Map) {
    return false;
  }

  if (typeof value.toHexString === "function") {
    return false;
  }
  return true;
}

module.exports = {
  maskIds,
  maskIdsWithEntityDirectory,
  dataFieldMask,
  IDENTIFIER_FIELDS,
};
