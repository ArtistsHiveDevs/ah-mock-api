const mongoose = require("mongoose");
const { Schema } = mongoose;

// Genre schema for the 3-level hierarchy
const schema = new Schema(
  {
    level1_key: { type: String, required: true, index: true },        // "latin", "rock", "electronic"
    level1_name: { type: String, required: true },                   // "Latin Music", "Rock", "Electronic"
    level2_key: { type: String, required: true, index: true },       // "latin_pop_rock", "alternative_rock"
    level2_name: { type: String, required: true },                   // "Latin Pop & Rock", "Alternative Rock"
    level3_genres: [String],                                          // Array of specific genre tags
    search_keywords: [String],                                        // Flattened for text search
    hierarchy_path: { type: String, required: true, index: true },   // "latin.latin_pop_rock"
    
    // Geographic influence scores (0.0 - 1.0)
    continent_weight: {
      type: Map,
      of: Number,
      default: {}
    },
    country_weight: {
      type: Map, 
      of: Number,
      default: {}
    },
    
    isActive: { type: Boolean, default: true, index: true }
  },
  {
    timestamps: true,
    collection: "genres"
  }
);

// Compound indexes for performance
schema.index({ level1_key: 1, level2_key: 1 });
schema.index({ hierarchy_path: 1, isActive: 1 });
schema.index({ level1_key: 1, "continent_weight": 1 });

// Text search index
schema.index({ 
  level1_name: "text", 
  level2_name: "text", 
  search_keywords: "text" 
});

module.exports = { schema };