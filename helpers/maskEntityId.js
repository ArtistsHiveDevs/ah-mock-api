const mongoose = require("mongoose");

const SENSITIVE_FIELDS = ["sub", "password"];

const HINT_FIELDS = ["username", "name", "email", "title", "stage_name"];

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

function maskEntityRoleMapGroup(group, sidByUserId, path) {
  if (!group || !Array.isArray(group.ids)) {
    return maskIdsCore(group, path, sidByUserId);
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

function maskIdsCore(data, path, sidByUserId) {
  if (Array.isArray(data)) {
    return data.map((item, index) =>
      maskIdsCore(item, `${path}[${index}]`, sidByUserId),
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

  const masked = {};
  Object.keys(plainData).forEach((key) => {
    if (hasMaskableId && key === "sID") {
      return;
    }
    if (SENSITIVE_FIELDS.includes(key)) {
      return;
    }

    if (
      key === "entityRoleMap" &&
      Array.isArray(plainData[key]) &&
      sidByUserId
    ) {
      masked[key] = plainData[key].map((group) =>
        maskEntityRoleMapGroup(group, sidByUserId, `${path}.${key}`),
      );
      return;
    }

    masked[key] = maskIdsCore(plainData[key], `${path}.${key}`, sidByUserId);
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
 */
function maskIds(data, path = "root") {
  return maskIdsCore(data, path, null);
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
 */
async function maskIdsWithEntityDirectory(data, connection) {
  if (!connection) {
    // Sin conexión disponible no hay forma de resolver EntityDirectory: se
    // deja entityRoleMap.ids intacto (igual que maskIds) en vez de vaciarlo,
    // para no confundir "sin conexión" con "id sin match".
    return maskIdsCore(data, "root", null);
  }

  const rawIds = new Set();
  collectRoleMapUserIds(data, rawIds);
  const sidByUserId = await resolveEntityRoleMapUserSids(rawIds, connection);

  return maskIdsCore(data, "root", sidByUserId);
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

module.exports = { maskIds, maskIdsWithEntityDirectory };
