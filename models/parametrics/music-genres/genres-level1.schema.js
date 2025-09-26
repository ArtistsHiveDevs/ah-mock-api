const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true }, // Nombre principal en inglés
    i18n: {
      type: Map,
      of: new mongoose.Schema(
        {
          name: String,
          description: String,
        },
        { _id: false }
      ),
    },
    description: String, // Descripción principal en inglés
    icon_url: String,
    color_hex: { type: String, default: "#666666" },
    sort_order: { type: Number, default: 50 },

    // Geographic influence scores (0.0 - 1.0)
    continent_weight: {
      type: Map,
      of: Number,
      default: {},
    },
    country_weight: {
      type: Map,
      of: Number,
      default: {},
    },

    // Metadata
    total_subgenres: { type: Number, default: 0 },
    total_tags: { type: Number, default: 0 },
    popularity_score: { type: Number, default: 50, min: 0, max: 100 },

    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    collection: "music_genres_level1",
  }
);

// Indexes for performance
schema.index({ sort_order: 1, isActive: 1 });
schema.index({ popularity_score: -1, isActive: 1 });
schema.index({ name: "text" });

module.exports = { schema };
