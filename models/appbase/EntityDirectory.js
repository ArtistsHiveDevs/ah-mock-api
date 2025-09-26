const mongoose = require("mongoose");
const { Schema } = mongoose;

const LocationSchema = new Schema(
  {
    country_name: String,
    country_alpha2: String,
    country_alpha3: String,
    state: String,
    city: String,
    address: String,
    latitude: Number,
    longitude: Number,
    locationPrecision: String,
  },
  { _id: false }
);
// Definir el esquema para EventTemplate
const schema = new Schema(
  {
    entityType: String,
    id: {
      type: Schema.Types.ObjectId, // Definir id como ObjectId para referenciar otros documentos
      required: true,
      refPath: "entityType", // Referencia dinámica a la colección correspondiente
    },
    shortId: String,
    profile_pic: String,
    name: String,
    username: String,
    subtitle: String,
    verified_status: Number,
    search_cache: String,
    location: [LocationSchema],
    
    // 🎵 NEW: Genre classification for fast filtering
    genres: {
      level1_key: { type: String, index: true },           // "latin", "rock", "electronic"  
      level1_name: String,                                  // "Latin Music", "Rock", "Electronic"
      level2_key: { type: String, index: true },           // "latin_pop_rock", "alternative_rock"
      level2_name: String,                                  // "Latin Pop & Rock", "Alternative Rock"
      hierarchy_path: { type: String, index: true },       // "latin.latin_pop_rock"
      primary_tags: [String],                               // Top 3-5 Level-3 genres ["latin indie", "rock en español"]
      
      // Geographic relevance for search ranking
      continent_relevance: String,                          // Primary continent: "south_america"
      country_relevance: [String],                          // Top countries: ["colombia", "mexico", "spain"]
      
      // Search optimization
      all_tags: { type: [String], index: true },           // All Level-3 tags for this entity (flattened)
      search_keywords: String                               // Space-separated keywords for text search
    },
    
    isActive: { type: Boolean, default: true },
    lastActivity: { type: Date, default: new Date() },
    lastSession: { type: Date, default: new Date() },
    main_date: { type: Date, default: null },
    // lang
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// 🎵 Add genre-specific indexes for performance
schema.index({ entityType: 1, "genres.level1_key": 1, isActive: 1 });
schema.index({ entityType: 1, "genres.level2_key": 1 });
schema.index({ entityType: 1, "genres.hierarchy_path": 1 });
schema.index({ entityType: 1, "genres.all_tags": 1 });
schema.index({ "genres.continent_relevance": 1, entityType: 1 });
schema.index({ "genres.country_relevance": 1, entityType: 1 });

// Combined search + genre indexes
schema.index({ 
  entityType: 1, 
  "genres.level1_key": 1, 
  verified_status: 1, 
  lastActivity: -1 
});

module.exports = { schema };
