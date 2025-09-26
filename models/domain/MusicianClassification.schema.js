const mongoose = require("mongoose");
const { Schema } = mongoose;

// Musician-friendly instrument classifications
const MusicianClassificationSchema = new Schema(
  {
    // Unique identifier
    id: { type: String, required: true, unique: true }, // e.g., "MUS-ELE-GTR"
    
    // Display information
    displayName: { type: String, required: true },
    description: String,
    icon: String, // emoji or icon reference
    color: String, // hex color for UI
    
    // Technical classification
    techniqueFamily: { type: String, required: true }, // e.g., "guitar_fretted", "keyboard_88key"
    techniqueSimilarityScore: { type: Number, min: 0, max: 100, required: true },
    
    // Instrument coverage
    coversInstruments: [{ type: Schema.Types.ObjectId, ref: "Instrument" }],
    excludesInstruments: [{ type: Schema.Types.ObjectId, ref: "Instrument" }],
    
    // Business importance
    brandImportance: { type: Number, min: 1, max: 10, required: true },
    sponsorPotential: { type: Number, min: 1, max: 10, required: true },
    
    // Skill transferability
    crossoverDifficulty: {
      type: Map,
      of: Number // key: other_classification_id, value: difficulty_score_1_to_10
    },
    skillTransferability: {
      chordProgressions: Boolean,
      pickingTechnique: Boolean,
      fingerpicking: Boolean,
      strummingPatterns: Boolean,
      bowingTechnique: Boolean,
      breathControl: Boolean,
      embouchure: Boolean,
      limbCoordination: Boolean,
      handTechniques: Boolean,
      soundDesign: Boolean,
      programming: Boolean,
      musicTheory: Boolean,
      sightReading: Boolean,
      improvisation: Boolean,
      amplifierKnowledge: Boolean,
      effectsUsage: Boolean,
      microphoneTechnique: Boolean,
      stagePresence: Boolean,
      other: [String]
    },
    
    // Typical brands for this classification
    typicalBrands: [
      {
        brandName: String,
        tier: {
          type: String,
          enum: ["budget", "intermediate", "professional", "vintage"]
        },
        sponsorAvailable: Boolean,
        marketShare: Number // percentage
      }
    ],
    
    // Geographic popularity (integrating with existing Country model)
    geographicPopularity: [
      {
        country: { type: Schema.Types.ObjectId, ref: "Country" },
        popularityScore: { type: Number, min: 0, max: 100 },
        culturalSignificance: String,
        traditionalStyles: [String]
      }
    ],
    
    // Usage statistics
    usageStats: {
      averageAge: {
        beginners: Number,
        professionals: Number
      },
      genderDistribution: {
        male: Number,
        female: Number,
        other: Number,
        notSpecified: Number
      },
      genreDistribution: {
        type: Map,
        of: Number // key: genre, value: percentage
      },
      venueTypeUsage: {
        type: Map,
        of: Number // key: venue_type, value: percentage
      }
    },
    
    // Learning and education
    educationalInfo: {
      typicalStartAge: {
        min: Number,
        max: Number
      },
      prerequisiteSkills: [String],
      learningProgression: [String],
      commonMethodBooks: [String],
      onlineResources: [String],
      certificationPrograms: [String]
    },
    
    // Internationalization
    i18n: {
      displayName: { type: Map, of: String },
      description: { type: Map, of: String },
      skillNames: { type: Map, of: [String] }
    },
    
    // UI configuration
    uiConfig: {
      selectionPriority: { type: Number, default: 50 }, // Higher = shown first
      categoryGroup: String, // e.g., "strings", "keyboards"
      requiresSubSelection: Boolean, // If user needs to specify further
      subSelectionOptions: [String],
      helpText: String,
      warningText: String // e.g., "Requires significant practice"
    },
    
    // Status and metadata
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false }, // For featuring in UI
    
    // Audit fields
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
MusicianClassificationSchema.index({ id: 1 }, { unique: true });
MusicianClassificationSchema.index({ techniqueFamily: 1 });
MusicianClassificationSchema.index({ techniqueSimilarityScore: -1 });
MusicianClassificationSchema.index({ brandImportance: -1, sponsorPotential: -1 });
MusicianClassificationSchema.index({ isActive: 1, isPopular: -1 });
MusicianClassificationSchema.index({ "uiConfig.selectionPriority": -1 });
MusicianClassificationSchema.index({ "geographicPopularity.country": 1 });

// Virtual for covered instrument count
MusicianClassificationSchema.virtual('coveredInstrumentCount', {
  ref: 'Instrument',
  localField: 'coversInstruments',
  foreignField: '_id',
  count: true
});

// Instance methods
MusicianClassificationSchema.methods.getLocalizedName = function(languageCode = 'en') {
  return this.i18n.displayName.get(languageCode) || this.displayName;
};

MusicianClassificationSchema.methods.getLocalizedDescription = function(languageCode = 'en') {
  return this.i18n.description.get(languageCode) || this.description;
};

MusicianClassificationSchema.methods.getCrossoverDifficulty = function(otherClassificationId) {
  return this.crossoverDifficulty.get(otherClassificationId) || 10; // Default: very difficult
};

MusicianClassificationSchema.methods.getPopularityInCountry = function(countryId) {
  const countryData = this.geographicPopularity.find(
    geo => geo.country.toString() === countryId.toString()
  );
  return countryData ? countryData.popularityScore : 0;
};

MusicianClassificationSchema.methods.getCompatibleClassifications = function(maxDifficulty = 5) {
  const compatible = [];
  for (const [classificationId, difficulty] of this.crossoverDifficulty) {
    if (difficulty <= maxDifficulty) {
      compatible.push({ classificationId, difficulty });
    }
  }
  return compatible.sort((a, b) => a.difficulty - b.difficulty);
};

// Static methods
MusicianClassificationSchema.statics.findByTechniqueFamily = function(techniqueFamily) {
  return this.find({ 
    techniqueFamily: techniqueFamily, 
    isActive: true 
  }).sort({ techniqueSimilarityScore: -1 });
};

MusicianClassificationSchema.statics.findPopularInCountry = function(countryId, limit = 10) {
  return this.find({
    'geographicPopularity.country': countryId,
    isActive: true
  }).sort({ 'geographicPopularity.popularityScore': -1 }).limit(limit);
};

MusicianClassificationSchema.statics.findHighSponsorPotential = function(minScore = 8) {
  return this.find({
    sponsorPotential: { $gte: minScore },
    isActive: true
  }).sort({ sponsorPotential: -1, brandImportance: -1 });
};

MusicianClassificationSchema.statics.findForUI = function(categoryGroup = null) {
  const query = { isActive: true };
  if (categoryGroup) {
    query['uiConfig.categoryGroup'] = categoryGroup;
  }
  
  return this.find(query).sort({ 
    'uiConfig.selectionPriority': -1,
    isPopular: -1,
    displayName: 1 
  });
};

MusicianClassificationSchema.statics.findCompatibleClassifications = function(classificationId, maxDifficulty = 5) {
  return this.findById(classificationId)
    .then(classification => {
      if (!classification) return [];
      return classification.getCompatibleClassifications(maxDifficulty);
    });
};

module.exports = { schema: MusicianClassificationSchema };