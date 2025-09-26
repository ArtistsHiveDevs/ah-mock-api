const mongoose = require("mongoose");
const { Schema } = mongoose;

// Sponsor contract schema
const SponsorContractSchema = new Schema({
  hasContract: { type: Boolean, default: false },
  brand: String,
  contractType: {
    type: String,
    enum: ["exclusive_endorsement", "preferred_use", "artist_signature_series", "product_loan", "discount_program"]
  },
  visibilityRequired: Boolean,
  exclusivityLevel: {
    type: String,
    enum: ["absolute", "category", "flexible"]
  },
  contractStart: Date,
  contractEnd: Date,
  compensation: {
    type: {
      type: String,
      enum: ["monetary", "equipment", "both", "none"]
    },
    amount: Number,
    currency: { type: String, default: "USD" }
  },
  obligations: [String],
  restrictions: [String]
}, { _id: false });

// Technical requirements schema
const TechnicalRequirementsSchema = new Schema({
  minimumConditionRating: { type: Number, min: 1, max: 10, default: 6 },
  specificModelsAcceptable: [String],
  specificModelsPreferred: [String],
  
  amplification: {
    required: Boolean,
    minimumWattage: Number,
    preferredAmpTypes: [String], // tube, solid_state, modeling
    effectsNeeded: [String], // reverb, delay, chorus, etc
    diBoxAcceptable: Boolean
  },
  
  specialRequirements: {
    leftHanded: Boolean,
    extendedRange: Boolean, // 7-string guitar, 5-string bass, etc
    customTuning: String,
    customSetup: String,
    vintageRequired: Boolean,
    specificYearRange: {
      min: Number,
      max: Number
    },
    specificFeatures: [String] // active pickups, locking tuners, etc
  }
}, { _id: false });

// Brand preferences schema
const BrandPreferencesSchema = new Schema({
  preferredBrands: [String],
  acceptableBrands: [String],
  avoidBrands: [String],
  sponsorContract: SponsorContractSchema
}, { _id: false });

// Instrument requirement schema
const InstrumentRequirementSchema = new Schema({
  instrumentClassification: { 
    type: String, 
    required: true 
  }, // References MusicianClassification.id
  instrumentRole: {
    type: String,
    enum: ["lead", "rhythm", "backing", "solo", "section"]
  },
  priority: {
    type: Number,
    enum: [1, 2, 3], // 1=essential, 2=preferred, 3=optional
    required: true
  },
  
  brandPreferences: BrandPreferencesSchema,
  technicalRequirements: TechnicalRequirementsSchema,
  
  alternatives: {
    canUseDifferentBrand: { type: Boolean, default: true },
    canUseLowerCondition: { type: Boolean, default: false },
    canUseDifferentModel: { type: Boolean, default: true },
    willBringOwnIfUnavailable: { type: Boolean, default: false },
    backupInstrumentTypes: [String]
  },
  
  transportFromArtist: {
    willTransportInstrument: { type: Boolean, default: false },
    willTransportAmplifier: { type: Boolean, default: false },
    willTransportEffects: { type: Boolean, default: false },
    additionalGear: [String] // pedals, cases, stands, etc
  },
  
  notes: String
}, { _id: false });

// Band member configuration schema
const BandMemberSchema = new Schema({
  member: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
  memberName: String, // denormalized for quick access
  role: String, // guitarist, vocalist, drummer, etc
  isEssential: { type: Boolean, default: true },
  backupMember: { type: Schema.Types.ObjectId, ref: "Artist" },
  
  instrumentsRequired: [InstrumentRequirementSchema],
  
  // Member-specific requirements
  personalRequirements: {
    dressingRoomNeeded: Boolean,
    specialDietaryNeeds: String,
    accessibilityNeeds: String,
    travelRestrictions: String
  }
}, { _id: false });

// Stage requirements schema
const StageRequirementsSchema = new Schema({
  minimumStageSize: {
    widthMeters: { type: Number, required: true },
    depthMeters: { type: Number, required: true }
  },
  powerRequirements: {
    outletsNeeded: Number,
    voltage: { type: Number, default: 110 }, // 110, 220, etc
    amperage: Number
  },
  monitorRequirements: {
    floorWedgesNeeded: Number,
    inEarMonitorCapable: Boolean,
    sideFillNeeded: Boolean,
    drumMonitorNeeded: Boolean
  },
  lightingRequirements: {
    basicStageWash: { type: Boolean, default: true },
    specialLighting: Boolean,
    lightingTechNeeded: Boolean,
    followSpotsNeeded: Number
  },
  specialStaging: {
    pianoRequired: Boolean,
    drumRiserNeeded: Boolean,
    backdropNeeded: Boolean,
    specialSetup: String
  }
}, { _id: false });

// Sound requirements schema
const SoundRequirementsSchema = new Schema({
  paSystem: {
    minimumWattage: Number,
    minimumChannels: Number,
    mixingConsoleDigital: Boolean,
    effectsProcessingNeeded: Boolean
  },
  microphones: [
    {
      purpose: {
        type: String,
        enum: ["lead_vocal", "backing_vocal", "instrument", "ambient", "drum"]
      },
      typePreferred: {
        type: String,
        enum: ["dynamic", "condenser", "ribbon"]
      },
      specificModelPreferred: String,
      quantity: { type: Number, default: 1 },
      wirelessRequired: Boolean
    }
  ],
  soundTechRequirements: {
    soundEngineerRequired: Boolean,
    experiencedWithGenre: Boolean,
    monitorEngineerNeeded: Boolean,
    soundcheckDurationMinutes: Number
  }
}, { _id: false });

// Venue compatibility schema
const VenueCompatibilitySchema = new Schema({
  venueTypesSuitable: [String], // club, theater, arena, outdoor, etc
  capacityRange: {
    minCapacity: Number,
    maxCapacity: Number,
    optimalCapacity: Number
  },
  acousticRequirements: {
    acousticTreatmentNeeded: Boolean,
    reverbTimePreference: {
      type: String,
      enum: ["dry", "medium", "live", "any"]
    },
    noiseFloorMaximum: Number // dB
  },
  geographicPreferences: {
    preferredCountries: [{ type: Schema.Types.ObjectId, ref: "Country" }],
    avoidCountries: [{ type: Schema.Types.ObjectId, ref: "Country" }],
    maxTravelDistance: Number, // km from home base
    homeBaseCountry: { type: Schema.Types.ObjectId, ref: "Country" },
    homeBaseCity: String
  }
}, { _id: false });

// Logistical requirements schema
const LogisticalRequirementsSchema = new Schema({
  setupTimeMinutes: Number,
  breakdownTimeMinutes: Number,
  soundcheckTimeMinutes: Number,
  changeoverTimeMinutes: Number,
  
  crewRequirements: {
    guitarTechNeeded: Boolean,
    drumTechNeeded: Boolean,
    keyboardTechNeeded: Boolean,
    monitorEngineerNeeded: Boolean,
    lightingOperatorNeeded: Boolean,
    roadieCount: Number
  },
  
  transportLogistics: {
    vanRequired: Boolean,
    trailerRequired: Boolean,
    flyDatePossible: Boolean,
    localEquipmentRentalAcceptable: Boolean,
    internationalTravelOk: Boolean
  },
  
  accommodationNeeds: {
    hotelRoomsNeeded: Number,
    singleRoomsRequired: Boolean,
    budgetLevel: {
      type: String,
      enum: ["budget", "mid_range", "upscale", "luxury"]
    }
  }
}, { _id: false });

// Pricing structure schema
const PricingStructureSchema = new Schema({
  basePerformanceFee: Number,
  currency: { type: String, default: "USD" },
  
  additionalCosts: {
    equipmentRentalBudget: Number,
    technicalCrewBudget: Number,
    travelAccommodationBudget: Number,
    riderRequirementsCost: Number,
    merchandiseCost: Number
  },
  
  paymentTerms: {
    depositPercentage: { type: Number, default: 50 },
    paymentSchedule: String,
    cancellationPolicy: String
  },
  
  negotiables: {
    feeNegotiable: { type: Boolean, default: false },
    equipmentCostFlexible: { type: Boolean, default: true },
    traveCostShared: { type: Boolean, default: false }
  }
}, { _id: false });

// Main Show Configuration Schema
const ShowConfigurationSchema = new Schema({
  showId: { type: String, required: true }, // unique per band
  showName: { type: String, required: true },
  description: String,
  showType: {
    type: String,
    enum: ["acoustic", "electric", "full_production", "stripped_down", "orchestral"],
    required: true
  },
  
  durationMinutes: {
    min: Number,
    max: Number,
    typical: { type: Number, required: true }
  },
  
  genreTags: [String],
  targetAudience: String,
  difficultyLevel: {
    type: String,
    enum: ["simple", "moderate", "complex", "very_complex"]
  },
  
  // Band configuration
  bandMembers: [BandMemberSchema],
  
  // Technical requirements
  stageRequirements: StageRequirementsSchema,
  soundRequirements: SoundRequirementsSchema,
  venueCompatibility: VenueCompatibilitySchema,
  logisticalRequirements: LogisticalRequirementsSchema,
  pricingStructure: PricingStructureSchema,
  
  // Flexibility ratings
  flexibilityRatings: {
    equipmentFlexibility: { type: Number, min: 1, max: 10, default: 5 },
    venueSizeFlexibility: { type: Number, min: 1, max: 10, default: 5 },
    technicalRequirementsFlexibility: { type: Number, min: 1, max: 10, default: 5 },
    schedulingFlexibility: { type: Number, min: 1, max: 10, default: 5 },
    budgetFlexibility: { type: Number, min: 1, max: 10, default: 5 }
  },
  
  // Performance history and statistics
  performanceHistory: {
    timesPerformed: { type: Number, default: 0 },
    successfulVenueMatches: [{ type: Schema.Types.ObjectId, ref: "Place" }],
    problematicVenues: [
      {
        venue: { type: Schema.Types.ObjectId, ref: "Place" },
        issues: [String],
        resolution: String,
        date: Date
      }
    ],
    averageRating: { type: Number, min: 1, max: 10 },
    lastPerformed: Date,
    totalRevenue: Number,
    averageTicketPrice: Number
  },
  
  // Media and promotional assets
  mediaAssets: {
    audioSamples: [String], // URLs
    videoSamples: [String], // URLs
    setlistExamples: [String],
    stagePlot: String, // URL to PDF/image
    inputList: String, // URL to PDF/spreadsheet
    riderTemplate: String, // URL to technical rider
    promotionalImages: [String],
    pressKit: String // URL to press kit
  },
  
  // Seasonal and scheduling preferences
  schedulingPreferences: {
    preferredMonths: [Number], // 1-12
    avoidMonths: [Number],
    preferredDaysOfWeek: [Number], // 0-6, Sunday = 0
    preferredTimeSlots: [String], // "afternoon", "evening", "late_night"
    holidayAvailability: Boolean,
    tourFriendly: Boolean
  },
  
  // Status and metadata
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true }, // visible to venue searches
  isFeatured: { type: Boolean, default: false },
  priority: { type: Number, default: 1 }, // for band's own prioritization
  
  // Approval and verification
  approvalStatus: {
    type: String,
    enum: ["draft", "pending_review", "approved", "rejected"],
    default: "draft"
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  approvalNotes: String,
  
  // Audit fields
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
}, { 
  timestamps: true,
  _id: false 
});

// Main Band Show Configuration Document Schema
const BandShowConfigurationSchema = new Schema(
  {
    // Band reference (integrating with existing Artist model)
    band: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
    bandName: String, // denormalized for quick access
    
    // Geographic context (using existing models)
    homeLocation: {
      country: { type: Schema.Types.ObjectId, ref: "Country" },
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    
    // Multiple show configurations
    showConfigurations: [ShowConfigurationSchema],
    
    // Default preferences across all shows
    defaultPreferences: {
      preferredShowConfiguration: String, // showId
      fallbackConfiguration: String, // showId
      equipmentTransportPolicy: {
        type: String,
        enum: ["always_bring_own", "venue_provided_preferred", "flexible", "never_bring_own"],
        default: "flexible"
      },
      venueSizePreference: {
        type: String,
        enum: ["intimate", "medium", "large", "any"],
        default: "any"
      },
      tourLogistics: {
        maxTravelDistanceKm: Number,
        overnightAccommodationRequired: Boolean,
        flyDatesAcceptable: Boolean,
        internationalToursAcceptable: Boolean,
        minimumDaysBetweenShows: { type: Number, default: 1 }
      }
    },
    
    // Band-wide sponsor relationships
    globalSponsorships: [
      {
        brand: String,
        contractType: String,
        appliesToAllMembers: Boolean,
        appliesToInstrumentTypes: [String],
        startDate: Date,
        endDate: Date,
        exclusivityLevel: String,
        notes: String
      }
    ],
    
    // Performance statistics aggregated across all shows
    aggregateStats: {
      totalPerformances: Number,
      totalRevenue: Number,
      averagePerformanceFee: Number,
      successRate: Number, // percentage of successful bookings
      repeatVenueRate: Number, // percentage of repeat venue bookings
      averageVenueRating: Number,
      preferredVenueTypes: [String],
      mostUsedEquipmentBrands: [String]
    },
    
    // Booking and availability management
    availability: {
      generalAvailability: {
        availableDaysPerMonth: Number,
        blackoutPeriods: [
          {
            startDate: Date,
            endDate: Date,
            reason: String
          }
        ],
        seasonalAvailability: {
          type: Map,
          of: Boolean // key: season (spring, summer, fall, winter), value: available
        }
      },
      
      currentBookings: [
        {
          venue: { type: Schema.Types.ObjectId, ref: "Place" },
          showConfiguration: String, // showId
          performanceDate: Date,
          status: {
            type: String,
            enum: ["confirmed", "pending", "cancelled", "completed"]
          },
          revenue: Number
        }
      ]
    },
    
    // Integration with existing models
    followers: { type: [Schema.Types.ObjectId], ref: "Artist" }, // fans following this band's shows
    
    // Status and metadata
    isActive: { type: Boolean, default: true },
    isPublicProfile: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
    
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

// Indexes for efficient querying
BandShowConfigurationSchema.index({ band: 1 });
BandShowConfigurationSchema.index({ "homeLocation.country": 1 });
BandShowConfigurationSchema.index({ "homeLocation.city": 1 });
BandShowConfigurationSchema.index({ isActive: 1, isPublicProfile: 1 });
BandShowConfigurationSchema.index({ "showConfigurations.showType": 1 });
BandShowConfigurationSchema.index({ "showConfigurations.genreTags": 1 });
BandShowConfigurationSchema.index({ "showConfigurations.venueCompatibility.capacityRange.minCapacity": 1 });
BandShowConfigurationSchema.index({ "showConfigurations.venueCompatibility.capacityRange.maxCapacity": 1 });
BandShowConfigurationSchema.index({ "showConfigurations.pricingStructure.basePerformanceFee": 1 });
BandShowConfigurationSchema.index({ "showConfigurations.isActive": 1, "showConfigurations.isPublic": 1 });

// Compound index for geographic searches
BandShowConfigurationSchema.index({ 
  "showConfigurations.venueCompatibility.geographicPreferences.preferredCountries": 1,
  "showConfigurations.venueCompatibility.capacityRange.optimalCapacity": 1
});

// Virtual for active show configurations
BandShowConfigurationSchema.virtual('activeShowConfigurations').get(function() {
  return this.showConfigurations.filter(show => show.isActive);
});

// Virtual for featured show configuration
BandShowConfigurationSchema.virtual('featuredShow').get(function() {
  return this.showConfigurations.find(show => show.isFeatured && show.isActive);
});

// Instance methods
BandShowConfigurationSchema.methods.getShowConfiguration = function(showId) {
  return this.showConfigurations.find(show => show.showId === showId);
};

BandShowConfigurationSchema.methods.addShowConfiguration = function(showConfig) {
  this.showConfigurations.push(showConfig);
  return this.save();
};

BandShowConfigurationSchema.methods.updateShowConfiguration = function(showId, updates) {
  const show = this.showConfigurations.find(show => show.showId === showId);
  if (show) {
    Object.assign(show, updates);
    return this.save();
  }
  throw new Error(`Show configuration ${showId} not found`);
};

BandShowConfigurationSchema.methods.getCompatibleVenues = function(showId, searchCriteria = {}) {
  const show = this.getShowConfiguration(showId);
  if (!show) {
    throw new Error(`Show configuration ${showId} not found`);
  }
  
  // This would typically call the matching algorithm
  // Implementation would be in a separate service
  return {
    show: show,
    searchCriteria: searchCriteria,
    // Results would be populated by matching algorithm
  };
};

BandShowConfigurationSchema.methods.calculateTotalRequiredEquipment = function(showId) {
  const show = this.getShowConfiguration(showId);
  if (!show) return [];
  
  const equipment = [];
  
  show.bandMembers.forEach(member => {
    member.instrumentsRequired.forEach(instrument => {
      equipment.push({
        memberName: member.memberName,
        instrumentType: instrument.instrumentClassification,
        priority: instrument.priority,
        brandPreferences: instrument.brandPreferences,
        technicalRequirements: instrument.technicalRequirements
      });
    });
  });
  
  return equipment;
};

BandShowConfigurationSchema.methods.estimateTotalCost = function(showId, venueEquipmentData = {}) {
  const show = this.getShowConfiguration(showId);
  if (!show) return 0;
  
  let totalCost = show.pricingStructure.basePerformanceFee || 0;
  
  // Add estimated equipment rental costs
  totalCost += show.pricingStructure.additionalCosts.equipmentRentalBudget || 0;
  
  // Add crew costs
  totalCost += show.pricingStructure.additionalCosts.technicalCrewBudget || 0;
  
  // Add travel and accommodation
  totalCost += show.pricingStructure.additionalCosts.travelAccommodationBudget || 0;
  
  return totalCost;
};

// Static methods
BandShowConfigurationSchema.statics.findByGenre = function(genre) {
  return this.find({
    "showConfigurations.genreTags": genre,
    "showConfigurations.isActive": true,
    "showConfigurations.isPublic": true,
    isActive: true
  });
};

BandShowConfigurationSchema.statics.findByCapacityRange = function(minCapacity, maxCapacity) {
  return this.find({
    "showConfigurations.venueCompatibility.capacityRange.minCapacity": { $lte: maxCapacity },
    "showConfigurations.venueCompatibility.capacityRange.maxCapacity": { $gte: minCapacity },
    "showConfigurations.isActive": true,
    isActive: true
  });
};

BandShowConfigurationSchema.statics.findByLocation = function(countryId, maxDistance = null) {
  const query = {
    $or: [
      { "homeLocation.country": countryId },
      { "showConfigurations.venueCompatibility.geographicPreferences.preferredCountries": countryId }
    ],
    isActive: true
  };
  
  if (maxDistance) {
    // Add distance calculation logic here
  }
  
  return this.find(query);
};

BandShowConfigurationSchema.statics.findByBudgetRange = function(minBudget, maxBudget) {
  return this.find({
    "showConfigurations.pricingStructure.basePerformanceFee": {
      $gte: minBudget,
      $lte: maxBudget
    },
    "showConfigurations.isActive": true,
    isActive: true
  });
};

module.exports = { schema: BandShowConfigurationSchema };