const mongoose = require("mongoose");
const { Schema } = mongoose;

const ACTIVITY_TYPES = ["rehearsal", "soundcheck", "other"];

const schema = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ACTIVITY_TYPES, default: "other" },
    start: { type: Date, required: true },
    end: { type: Date },
    allDay: { type: Boolean, default: false },
    notes: { type: String },
    // Dueño real de la actividad: el perfil activo con el que se creó
    // (Artist/Place/User). Lo setea el servidor, nunca el cliente.
    owner_profile_id: {
      type: Schema.Types.ObjectId,
      index: true,
      immutable: true,
    },
    owner_profile_entity: { type: String, immutable: true },
    // entityRoleMap lo setea createEntity() con el User autenticado; se conserva
    // como trazabilidad de quién creó, pero la visibilidad va por perfil.
    entityRoleMap: [
      {
        ids: [mongoose.Types.ObjectId],
        role: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = { schema, ACTIVITY_TYPES };
