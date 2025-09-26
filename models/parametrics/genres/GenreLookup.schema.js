const mongoose = require("mongoose");
const { Schema } = mongoose;

// Genre Lookup schema for fast Level 3 → Level 1/2 mapping
const schema = new Schema(
  {
    level3_tag: { type: String, required: true, index: true },       // Specific genre tag "latin indie"
    level1_key: { type: String, required: true, index: true },       // Parent Level 1 "latin"
    level1_name: { type: String, required: true },                   // "Latin Music"
    level2_key: { type: String, required: true, index: true },       // Parent Level 2 "latin_pop_rock"  
    level2_name: { type: String, required: true },                   // "Latin Pop & Rock"
    hierarchy_path: { type: String, required: true, index: true },   // "latin.latin_pop_rock"
    
    aliases: [String],                                                // Alternative names ["indie latino", "latin independent"]
    
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
    
    popularity_score: { type: Number, default: 50, min: 0, max: 100 }, // 0-100 based on venue usage
    isActive: { type: Boolean, default: true, index: true }
  },
  {
    timestamps: true,
    collection: "genrelookups"
  }
);

// Performance indexes
schema.index({ level3_tag: 1, hierarchy_path: 1 });
schema.index({ level1_key: 1, popularity_score: -1 });
schema.index({ level2_key: 1, "country_weight": 1 });

// Text search with aliases
schema.index({ 
  level3_tag: "text", 
  aliases: "text",
  level1_name: "text",
  level2_name: "text"
});

// Geographic + popularity compound indexes
schema.index({ level1_key: 1, "country_weight": 1, popularity_score: -1 });

module.exports = { schema };