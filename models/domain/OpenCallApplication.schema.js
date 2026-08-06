const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    open_call_id: {
      type: Schema.Types.ObjectId,
      ref: "OpenCall",
      required: true,
    },
    artist_id: { type: Schema.Types.ObjectId, ref: "Artist" },
    artist_name: { type: String },
    artist_profile_pic: { type: String },
    artist_city: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    // Survey responses — stored as a flexible map to match the frontend config
    survey_responses: { type: Schema.Types.Mixed, default: {} },
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

// Un Artist solo puede aplicar una vez a la misma convocatoria. `artist_id` no es
// required, así que el índice se restringe a los documentos que sí lo tienen: sin el
// partialFilterExpression, todos los documentos sin artist_id colisionarían entre sí.
schema.index(
  { open_call_id: 1, artist_id: 1 },
  {
    unique: true,
    partialFilterExpression: { artist_id: { $type: "objectId" } },
  }
);

module.exports = { schema };
