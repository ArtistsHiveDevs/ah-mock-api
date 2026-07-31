/**
 * Cola de revisión manual de perfiles (Artist / Place) para admins de plataforma.
 *
 * Router nuevo y separado en vez de extender /artists o /places: Artist tiene
 * router dedicado con handlers manuales y Place usa createCRUDRoutes() genérico
 * (compartido por Country, Event, Prebooking, OpenCall, etc.) -- ninguno de los
 * dos soporta filtrar listados por un valor de campo fijo pedido por el cliente,
 * y agregarlo ahí acoplaría esta feature de moderación al contrato público de
 * ambas entidades. Este router no modifica en nada GET /artists ni GET /places.
 *
 * `approval_status` es solo informativo (ver schemas): esta cola es la única
 * forma de cambiarlo fuera del default "pending" al crear la entidad.
 */
const express = require("express");
const helpers = require("../../../../helpers");
const ErrorCodes = require("../../../../constants/errors");
const {
  createPaginatedDataResponse,
  mapDatabaseErrorToResponse,
} = require("../../../../helpers/apiHelperFunctions");
const { getModel } = require("../../../../helpers/getModel");

const router = express.Router();

// Requiere sesión válida Y is_platform_admin === true; ownership de la propia
// entidad (OWNER/ADMIN en entityRoleMap) NO alcanza para esta cola.
const adminMiddlewares = [
  ...helpers.getWriteMiddlewares(),
  helpers.requirePlatformAdmin,
];

const REVIEWABLE_ENTITY_TYPES = ["Artist", "Place"];
const REVIEW_STATUSES = ["approved", "rejected"];

// Campos mínimos para identificar el perfil en la UI de revisión.
const PENDING_PROJECTION =
  "_id name username profile_pic city country_alpha2 approval_status createdAt";

async function findPendingByType(req, entityType, limit) {
  const Model = await getModel(req.serverEnvironment, entityType);
  const docs = await Model.find({ approval_status: "pending" })
    .select(PENDING_PROJECTION)
    .limit(limit)
    .sort({ createdAt: 1 });

  return docs.map((doc) => ({ ...doc.toObject(), entityType }));
}

router.get("/", ...adminMiddlewares, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;

    const [artists, places] = await Promise.all([
      findPendingByType(req, "Artist", limit),
      findPendingByType(req, "Place", limit),
    ]);

    res.json(createPaginatedDataResponse({ artists, places }));
  } catch (err) {
    console.error("[pendingProfiles] Error listing:", err);
    const { status, body } = mapDatabaseErrorToResponse(err);
    res.status(status).json(body);
  }
});

router.post("/review", ...adminMiddlewares, async (req, res) => {
  try {
    const { entityType, id, status } = req.body;

    if (!REVIEWABLE_ENTITY_TYPES.includes(entityType)) {
      return res.status(400).json({
        message: `entityType inválido. Debe ser uno de: ${REVIEWABLE_ENTITY_TYPES.join(", ")}.`,
        errorCode: ErrorCodes.VALIDATION_ERROR,
      });
    }

    if (!REVIEW_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status inválido. Debe ser uno de: ${REVIEW_STATUSES.join(", ")}.`,
        errorCode: ErrorCodes.VALIDATION_ERROR,
      });
    }

    if (!id) {
      return res.status(400).json({
        message: "id es requerido.",
        errorCode: ErrorCodes.VALIDATION_ERROR,
      });
    }

    const Model = await getModel(req.serverEnvironment, entityType);
    const updatedEntity = await Model.findByIdAndUpdate(
      id,
      { $set: { approval_status: status } },
      { new: true, runValidators: true },
    ).select(PENDING_PROJECTION);

    if (!updatedEntity) {
      return res.status(404).json({
        message: `${entityType} '${id}' no encontrado.`,
        errorCode: ErrorCodes.CONTENT_NOT_FOUND,
      });
    }

    // Este endpoint actualiza approval_status directo sobre el modelo (no pasa
    // por updateEntity() de crud-actions.js), así que replica acá el mismo
    // resync de snapshots que updateEntity ya dispara para el resto de campos.
    const entityRoleMapInfo = await Model.findById(id).select("entityRoleMap");
    const UserModel = await getModel(req.serverEnvironment, "User");
    await helpers.syncEntityRoleMapUserSnapshots({
      entityName: entityType,
      updatedEntity: entityRoleMapInfo,
      newInfo: { approval_status: status },
      UserModel,
    });

    res.json(
      createPaginatedDataResponse({
        ...updatedEntity.toObject(),
        entityType,
      }),
    );
  } catch (err) {
    console.error("[pendingProfiles] Error reviewing:", err);
    const { status, body } = mapDatabaseErrorToResponse(err);
    res.status(status).json(body);
  }
});

module.exports = router;
