const mongoose = require("mongoose");
const { generateSID } = require("../../helpers/sID");
const { Schema } = mongoose;

const REPORT_CLAIM_REASONS = [
  "DUPLICADO",
  "FALSO",
  "INFORMACION_ERRONEA",
  "ME_PERTENECE_PERO_ASIGNADO_A_OTRO",
  "CONTENIDO_INAPROPIADO",
  "OTRO",
];

const REPORT_CLAIM_STATUSES = ["PENDING", "REVIEWED", "DISMISSED"];

const schema = new mongoose.Schema(
  {
    sID: {
      type: String,
      default: generateSID,
      unique: true,
      sparse: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    entityType: { type: String, required: true },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
    },
    reason: { type: String, required: true, enum: REPORT_CLAIM_REASONS },
    description: { type: Schema.Types.String },
    identifier: { type: Schema.Types.String },
    status: {
      type: String,
      enum: REPORT_CLAIM_STATUSES,
      default: "PENDING",
    },
  },
  { timestamps: true },
);

module.exports = { schema, REPORT_CLAIM_REASONS, REPORT_CLAIM_STATUSES };
