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
    level2_id: {
      type: Schema.Types.ObjectId,
      ref: "MusicGenreLevel2",
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
    level2_key: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    tag: {
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
          aliases: [String], // Aliases específicos por idioma
        },
        { _id: false }
      ),
    },
    aliases: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ], // Aliases principales en inglés

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

    popularity_score: { type: Number, default: 50, min: 0, max: 100 },
    usage_count: { type: Number, default: 0 }, // Cuántas entidades usan este género

    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    collection: "music_genres_level3",
  }
);

// Performance indexes
schema.index({ level2_id: 1, popularity_score: -1 });
schema.index({ level1_key: 1, level2_key: 1, tag: 1 }, { unique: true });
schema.index({ tag: "text", aliases: "text", name: "text" });
schema.index({ popularity_score: -1, isActive: 1 });

module.exports = { schema };
