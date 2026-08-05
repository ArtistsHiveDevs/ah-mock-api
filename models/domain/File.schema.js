const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      ref: "EntityDirectory",
    },
    path: {
      type: String,
      required: true,
      refPath: "entityType", // Referencia dinámica
    },
    src: {
      type: String,
      required: true,
      // enum: ["User", "Artist", "Festival", "Place"], // Tipos permitidos
    },
  },
  { timestamps: true }
);

module.exports = { schema };
