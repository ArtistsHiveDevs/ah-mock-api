const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Acceso (temporal o de confianza) que un recurso (Artist/Place/...) le otorga a un perfil
 * puntual (`identifier`) sobre alguna de sus subpages/secciones protegidas. Ver
 * getViewerAccessGrants en operations/domain/artists/router.js (backend) y
 * hasTemporaryAccessTo/hasTrustedAccessTo en models/base/model.ts (frontend).
 *
 * Colección separada en vez de embebida en el documento del recurso: expiresAt se usa como TTL
 * index para el borrado automático, algo que Mongo no soporta sobre subdocumentos de un array.
 */
const schema = new Schema(
  {
    identifier: { type: String, required: true },
    targetEntityType: { type: String, required: true },
    targetEntityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetEntityType",
    },
    grantType: {
      type: String,
      enum: ["temporary", "trusted"],
      default: "temporary",
    },
    expiresAt: { type: Date, required: true },
    fieldPaths: { type: [String], default: [] },
    reason: { type: String },
    // Solo aplica cuando grantType === "trusted" (ej. OWNER, MANAGER, MUSICIAN, BOOKER).
    roles: { type: [String], default: undefined },
  },
  { timestamps: true },
);

schema.index({ targetEntityType: 1, targetEntityId: 1, identifier: 1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = { schema };
