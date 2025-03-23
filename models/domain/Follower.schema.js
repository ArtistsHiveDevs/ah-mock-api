const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    entityDirectoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "EntityDirectory",
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "entityType", // Referencia dinámica
    },
    entityType: {
      type: String,
      required: true,
      // enum: ["User", "Artist", "Festival", "Place"], // Tipos permitidos
    },
    isFollowing: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

schema.index({ entityId: 1, entityType: 1 }, { unique: true });

module.exports = { schema };
