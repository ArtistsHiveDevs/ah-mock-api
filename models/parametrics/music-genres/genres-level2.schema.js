const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    level1_id: {
      type: Schema.Types.ObjectId,
      ref: "MusicGenreLevel1",
      required: true,
      index: true,
    },
    level1_key: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
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
    total_tags: { type: Number, default: 0 },
    popularity_score: { type: Number, default: 50, min: 0, max: 100 },

    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    collection: "music_genres_level2",
  }
);

// Compound indexes
schema.index({ level1_id: 1, sort_order: 1 });
schema.index({ level1_key: 1, key: 1 }, { unique: true });
schema.index({ level1_key: 1, popularity_score: -1 });
schema.index({ name: "text" });

module.exports = { schema };
