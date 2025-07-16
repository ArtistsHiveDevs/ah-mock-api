const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChatParticipantSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    profile_id: {
      type: Schema.Types.ObjectId, // Definir id como ObjectId para referenciar otros documentos
      required: true,
      refPath: "entityType", // Referencia dinámica a la colección correspondiente
    }, // Artist, Venue, etc
    role: {
      type: String,
      enum: String, // ['OWNER', 'MANAGER', 'INSTRUMENTIST', 'COMMUNICATIONS', 'ADMIN', 'GUEST'],
      required: true,
    },
    joined_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const schema = new Schema(
  {
    participants: [ChatParticipantSchema],
    topic: {
      type: String,
      //enum: ['GENERAL', 'TECHNICAL', 'FINANCIAL', 'LOGISTICS', 'COMMUNICATIONS'],
      default: "GENERAL",
    },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    last_updated: { type: Date, default: Date.now },

    group_name: String, // opcional para conversas grupales
    description: String,
    group_avatar: String, // opcional
  },
  { timestamps: true }
);

module.exports = { schema };
