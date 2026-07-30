/**
 * Reportes de usuarios sobre un perfil (Artist / Place) -- "Reportar perfil".
 *
 * Router dedicado en vez de createCRUDRoutes(): su GET de listado es solo para
 * admins de plataforma (no cualquier usuario logueado, que es lo que expondría
 * el CRUD genérico), y su cambio de estado no encaja en updateEntity() de
 * crud-actions.js, que exige entityRoleMap con rol OWNER/ADMIN del propio
 * usuario sobre la entidad -- ReportClaim no tiene ese concepto.
 */
const express = require("express");
const helpers = require("../../../helpers");
const ErrorCodes = require("../../../constants/errors");
const {
  createPaginatedDataResponse,
  mapDatabaseErrorToResponse,
} = require("../../../helpers/apiHelperFunctions");
const { getModel } = require("../../../helpers/getModel");
const {
  REPORT_CLAIM_REASONS,
  REPORT_CLAIM_STATUSES,
} = require("../../../models/domain/ReportClaim.schema");

const router = express.Router();

// Requiere sesión válida Y is_platform_admin === true; el reporte de un perfil
// ajeno no le da al usuario ningún permiso sobre ese perfil.
const adminMiddlewares = [
  ...helpers.getWriteMiddlewares(),
  helpers.requirePlatformAdmin,
];

const REPORTABLE_ENTITY_TYPES = ["Artist", "Place"];
const REVIEW_STATUSES = ["REVIEWED", "DISMISSED"];

router.post("/", ...helpers.getWriteMiddlewares(), async (req, res) => {
  try {
    const { entityType, entityId, reason, description, identifier } = req.body;

    if (!REPORTABLE_ENTITY_TYPES.includes(entityType)) {
      return res.status(400).json({
        message: `entityType inválido. Debe ser uno de: ${REPORTABLE_ENTITY_TYPES.join(", ")}.`,
        errorCode: ErrorCodes.VALIDATION_ERROR,
      });
    }

    if (!REPORT_CLAIM_REASONS.includes(reason)) {
      return res.status(400).json({
        message: `reason inválido. Debe ser uno de: ${REPORT_CLAIM_REASONS.join(", ")}.`,
        errorCode: ErrorCodes.VALIDATION_ERROR,
      });
    }

    const EntityModel = await getModel(req.serverEnvironment, entityType);
    const entity = await EntityModel.findById(entityId);

    if (!entity) {
      return res.status(404).json({
        message: `${entityType} '${entityId}' no encontrado.`,
        errorCode: ErrorCodes.CONTENT_NOT_FOUND,
      });
    }

    const ReportClaimModel = await getModel(
      req.serverEnvironment,
      "ReportClaim",
    );

    const existingPendingReport = await ReportClaimModel.findOne({
      user: req.userId,
      entityType,
      entityId,
      status: "PENDING",
    });

    if (existingPendingReport) {
      return res.status(409).json({
        message: "Ya tienes un reporte pendiente para este perfil.",
        errorCode: ErrorCodes.VALIDATION_DUPLICATE_KEY,
      });
    }

    const reportClaim = await ReportClaimModel.create({
      user: req.userId,
      entityType,
      entityId,
      reason,
      description,
      identifier,
      status: "PENDING",
    });

    res.json(createPaginatedDataResponse(reportClaim));
  } catch (err) {
    console.error("[reportClaims] Error creating:", err);
    const { status, body } = mapDatabaseErrorToResponse(err);
    res.status(status).json(body);
  }
});

async function attachReportedEntityName(req, reportClaim) {
  const EntityModel = await getModel(
    req.serverEnvironment,
    reportClaim.entityType,
  );
  const entity = await EntityModel.findById(reportClaim.entityId).select(
    "name",
  );

  return {
    ...reportClaim.toObject(),
    entityName: entity?.name || null,
  };
}

router.get("/admin", ...adminMiddlewares, async (req, res) => {
  try {
    const { status } = req.query;

    if (status && !REPORT_CLAIM_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status inválido. Debe ser uno de: ${REPORT_CLAIM_STATUSES.join(", ")}.`,
        errorCode: ErrorCodes.VALIDATION_ERROR,
      });
    }

    const ReportClaimModel = await getModel(
      req.serverEnvironment,
      "ReportClaim",
    );

    const reportClaims = await ReportClaimModel.find(
      status ? { status } : {},
    )
      .populate({ path: "user", select: "username name" })
      .sort({ createdAt: -1 });

    const reportClaimsWithEntityName = await Promise.all(
      reportClaims.map((reportClaim) =>
        attachReportedEntityName(req, reportClaim),
      ),
    );

    res.json(createPaginatedDataResponse(reportClaimsWithEntityName));
  } catch (err) {
    console.error("[reportClaims] Error listing:", err);
    const { status, body } = mapDatabaseErrorToResponse(err);
    res.status(status).json(body);
  }
});

router.post("/admin/review", ...adminMiddlewares, async (req, res) => {
  try {
    const { id, status } = req.body;

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

    const ReportClaimModel = await getModel(
      req.serverEnvironment,
      "ReportClaim",
    );

    const updatedReportClaim = await ReportClaimModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true },
    );

    if (!updatedReportClaim) {
      return res.status(404).json({
        message: `ReportClaim '${id}' no encontrado.`,
        errorCode: ErrorCodes.CONTENT_NOT_FOUND,
      });
    }

    res.json(createPaginatedDataResponse(updatedReportClaim));
  } catch (err) {
    console.error("[reportClaims] Error reviewing:", err);
    const { status, body } = mapDatabaseErrorToResponse(err);
    res.status(status).json(body);
  }
});

module.exports = router;
