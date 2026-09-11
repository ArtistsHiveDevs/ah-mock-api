const mongoose = require("mongoose");
const { Schema } = mongoose;

const { connections } = require("../../db/db_g");
const { schema: FollowerSchema } = require("./Follower.schema");
const { sIDPlugin } = require("../../helpers/sIDPlugin");

const schema = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    entityType: String,
    // entityId guarda históricamente el sID/identifier de la entidad, no su ObjectId de Mongo
    // (ver datos legacy: p.ej. "nRO6ybjvNs"). No se puede tipar como ObjectId + refPath sin
    // migrar esos documentos, así que se resuelve a mano por sID/username en el populate.
    entityId: String,
    identifier: { type: Schema.Types.String },
    issuedDate: { type: Schema.Types.Date },
  },
  {
    timestamps: true,
  },
);

schema.plugin(sIDPlugin);

module.exports = { schema };
