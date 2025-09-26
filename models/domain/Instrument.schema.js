const mongoose = require("mongoose");
const { Schema } = mongoose;

// Enhanced Instrument Schema integrating with existing geographic models
const InstrumentSchema = new Schema(
  {
    // Basic identification
    uniqueId: { type: String, required: true, unique: true }, // e.g., "STR-GTR-ELE-001"
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    
    // Classification
    family: { 
      type: String, 
      required: true,
      enum: ["strings", "keyboards", "percussion", "winds", "electronic", "voice"]
    },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    
    // Musician-friendly classification
    musicianClassification: {
      id: String, // References musician_classifications
      displayName: String,
      techniqueSimilarityScore: { type: Number, min: 0, max: 100 }
    },
    
    // Physical properties with queryable ranges
    physicalProperties: {
      dimensions: {
        length: {
          value: Number,
          unit: { type: String, default: "cm" },
          min: Number,
          max: Number,
          notes: String
        },
        width: {
          value: Number,
          unit: { type: String, default: "cm" },
          min: Number,
          max: Number
        },
        height: {
          value: Number,
          unit: { type: String, default: "cm" },
          min: Number,
          max: Number
        },
        weight: {
          value: Number,
          unit: { type: String, default: "kg" },
          min: Number,
          max: Number,
          notes: String
        }
      },
      materials: {
        body: [String],
        neck: [String],
        fingerboard: [String],
        hardware: [String],
        strings: [String],
        other: [String]
      },
      construction: {
        solidBody: Boolean,
        hollowBody: Boolean,
        semiHollow: Boolean,
        neckJoint: [String],
        frets: {
          standard: Number,
          min: Number,
          max: Number
        }
      }
    },
    
    // Musical properties
    musicalProperties: {
      pitchRange: {
        lowestNote: String,
        highestNote: String,
        lowestFrequency: Number, // Hz
        highestFrequency: Number, // Hz
        octaves: Number,
        standardTuning: String,
        alternateTunings: [String]
      },
      isAcoustic: { type: Boolean, required: true },
      isElectric: { type: Boolean, required: true },
      amplification: {
        needsAmplification: {
          type: String,
          enum: ["always", "usually", "sometimes", "usually_no", "never"]
        },
        pickupTypes: [String],
        outputImpedance: {
          min: Number,
          max: Number,
          unit: String,
          notes: String
        },
        cableType: String,
        powerRequirements: String
      }
    },
    
    // Technical specifications
    technicalSpecs: {
      skillLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "professional", "all_levels"]
      },
      learningCurve: {
        type: String,
        enum: ["easy", "moderate", "difficult", "very_difficult"]
      },
      difficultyScore: {
        min: { type: Number, min: 1, max: 10 },
        max: { type: Number, min: 1, max: 10 },
        scale: { type: String, default: "1-10" },
        notes: String
      },
      maintenance: {
        frequencyDays: {
          min: Number,
          max: Number,
          typical: Number
        },
        commonIssues: [String],
        replacementParts: [String],
        professionalService: [String]
      },
      lifespan: {
        stringsDays: {
          min: Number,
          max: Number,
          notes: String
        },
        fretsYears: {
          min: Number,
          max: Number,
          notes: String
        },
        electronicsYears: {
          min: Number,
          max: Number
        },
        instrumentYears: {
          min: Number,
          max: Number,
          notes: String
        }
      }
    },
    
    // Transport and logistics
    transportLogistics: {
      portabilityScore: { type: Number, min: 1, max: 10 },
      caseRequired: Boolean,
      caseTypes: [String],
      setupTimeMinutes: {
        min: Number,
        max: Number,
        typical: Number
      },
      fitsIn: {
        carTrunk: Boolean,
        van: Boolean,
        airplaneCabin: Boolean,
        airplaneCargo: Boolean,
        tourBus: Boolean
      },
      specialHandling: [String],
      insuranceCategory: {
        type: String,
        enum: ["standard", "fragile", "high_value", "vintage"]
      },
      shippingConsiderations: String
    },
    
    // Usage context
    usageContext: {
      genres: [String],
      venueTypes: [String],
      capacityRange: {
        min: Number,
        max: Number,
        notes: String
      },
      volumeLevel: {
        acoustic: {
          min: Number,
          max: Number,
          unit: { type: String, default: "dB" }
        },
        amplified: {
          min: Number,
          max: Number,
          unit: { type: String, default: "dB" }
        }
      },
      typicalRoles: [String],
      ensembleCompatibility: [String],
      recordingSuitability: {
        type: String,
        enum: ["excellent", "good", "fair", "poor", "not_suitable"]
      }
    },
    
    // Health considerations
    healthConsiderations: {
      physicalImpactScore: { type: Number, min: 1, max: 10 },
      commonInjuries: [String],
      prevention: [String],
      volumeExposure: {
        min: Number,
        max: Number,
        unit: { type: String, default: "dB" },
        notes: String
      },
      sessionDurationRecommended: {
        beginnerMinutes: {
          min: Number,
          max: Number
        },
        intermediateMinutes: {
          min: Number,
          max: Number
        },
        advancedMinutes: {
          min: Number,
          max: Number
        }
      }
    },
    
    // Internationalization using existing Language model
    i18n: {
      name: { type: Map, of: String }, // key: language_code, value: translated_name
      description: { type: Map, of: String },
      variants: { type: Map, of: String },
      commonUse: { type: Map, of: String }
    },
    
    // Geographic and cultural context (integrating with existing models)
    geographic: {
      originCountry: { type: Schema.Types.ObjectId, ref: "Country" },
      originRegion: String,
      culturalSignificance: String,
      popularIn: [{ type: Schema.Types.ObjectId, ref: "Country" }], // Countries where popular
      regionalVariants: [
        {
          region: String,
          country: { type: Schema.Types.ObjectId, ref: "Country" },
          variantName: String,
          differences: String
        }
      ]
    },
    
    // Media and assets
    media: {
      images: {
        primary: String, // URL
        gallery: [String], // Array of URLs
        thumbnails: {
          small: String,
          medium: String,
          large: String
        }
      },
      audioSamples: [
        {
          name: String,
          url: String,
          description: String,
          technique: String
        }
      ],
      videoDemos: [
        {
          title: String,
          url: String,
          description: String,
          duration: Number // seconds
        }
      ]
    },
    
    // Popularity and scoring
    popularityScore: { type: Number, min: 0, max: 100, default: 50 },
    
    // Status and metadata
    status: {
      type: String,
      enum: ["active", "deprecated", "historical", "draft"],
      default: "active"
    },
    isQueryOptimized: { type: Boolean, default: true },
    
    // Audit fields
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient querying
InstrumentSchema.index({ family: 1, category: 1, subcategory: 1 });
InstrumentSchema.index({ uniqueId: 1 }, { unique: true });
InstrumentSchema.index({ slug: 1 }, { unique: true });
InstrumentSchema.index({ popularityScore: -1 });
InstrumentSchema.index({ "physicalProperties.dimensions.weight.min": 1, "physicalProperties.dimensions.weight.max": 1 });
InstrumentSchema.index({ "transportLogistics.portabilityScore": -1 });
InstrumentSchema.index({ "transportLogistics.fitsIn.carTrunk": 1 });
InstrumentSchema.index({ "transportLogistics.fitsIn.airplaneCabin": 1 });
InstrumentSchema.index({ "usageContext.capacityRange.min": 1, "usageContext.capacityRange.max": 1 });
InstrumentSchema.index({ status: 1 });
InstrumentSchema.index({ "geographic.originCountry": 1 });
InstrumentSchema.index({ "geographic.popularIn": 1 });

// Virtual for related brands (populated from separate BrandModel collection)
InstrumentSchema.virtual('brands', {
  ref: 'InstrumentBrand',
  localField: '_id',
  foreignField: 'instrumentId'
});

// Virtual for musician classification details
InstrumentSchema.virtual('classificationDetails', {
  ref: 'MusicianClassification',
  localField: 'musicianClassification.id',
  foreignField: 'id'
});

// Instance methods
InstrumentSchema.methods.getLocalizedName = function(languageCode = 'en') {
  return this.i18n.name.get(languageCode) || this.name;
};

InstrumentSchema.methods.getLocalizedDescription = function(languageCode = 'en') {
  return this.i18n.description.get(languageCode) || '';
};

InstrumentSchema.methods.isPortableFor = function(transportType) {
  const transportMap = {
    'car': this.transportLogistics.fitsIn.carTrunk,
    'van': this.transportLogistics.fitsIn.van,
    'airplane_cabin': this.transportLogistics.fitsIn.airplaneCabin,
    'airplane_cargo': this.transportLogistics.fitsIn.airplaneCargo,
    'tour_bus': this.transportLogistics.fitsIn.tourBus
  };
  return transportMap[transportType] || false;
};

InstrumentSchema.methods.getWeightRange = function(unit = 'kg') {
  const weight = this.physicalProperties.dimensions.weight;
  if (weight.unit === unit) {
    return { min: weight.min, max: weight.max, unit: weight.unit };
  }
  // Add unit conversion logic here if needed
  return { min: weight.min, max: weight.max, unit: weight.unit };
};

// Static methods
InstrumentSchema.statics.findByFamily = function(family) {
  return this.find({ family: family, status: 'active' });
};

InstrumentSchema.statics.findPortableInstruments = function(maxWeight = 5, transportType = 'car') {
  const query = {
    status: 'active',
    'physicalProperties.dimensions.weight.max': { $lte: maxWeight }
  };
  
  if (transportType) {
    query[`transportLogistics.fitsIn.${transportType === 'car' ? 'carTrunk' : transportType}`] = true;
  }
  
  return this.find(query);
};

InstrumentSchema.statics.findByCountry = function(countryId) {
  return this.find({
    $or: [
      { 'geographic.originCountry': countryId },
      { 'geographic.popularIn': countryId }
    ],
    status: 'active'
  });
};

InstrumentSchema.statics.searchByGenre = function(genre) {
  return this.find({
    'usageContext.genres': { $in: [genre] },
    status: 'active'
  }).sort({ popularityScore: -1 });
};

module.exports = { schema: InstrumentSchema };