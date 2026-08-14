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
    },
  },
  { timestamps: true }
);

// NOTA: No usamos índice unique aquí porque en arrays embebidos, el índice unique

module.exports = { schema };
