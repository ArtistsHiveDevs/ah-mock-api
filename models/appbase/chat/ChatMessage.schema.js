const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    conversation_id: {
      type: Schema.Types.ObjectId,
      ref: "ChatConversation",
      required: true,
    },
    sender_user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender_profile_id: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    sender_role: { type: String },

    content: { type: String },
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
    timestamp: { type: Date, default: Date.now },

    status: {
      delivered_to: [{ type: Schema.Types.ObjectId, ref: "User" }],
      read_by: [{ type: Schema.Types.ObjectId, ref: "User" }],
      edited: { type: Boolean, default: false },
      edited_at: { type: Date },
      deleted_by: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },

    reactions: {
      type: Map,
      of: String, // Ej: { "userId": "❤️" }
    },

    attachments: [
      {
        url: String,
        type: { type: String },
        size: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = { schema };
