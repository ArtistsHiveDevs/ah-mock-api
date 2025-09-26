const mongoose = require("mongoose");
const { Schema } = mongoose;

// Individual equipment item schema
const EquipmentItemSchema = new Schema({
  itemId: { type: String, required: true }, // Unique per venue
  instrumentRef: { type: Schema.Types.ObjectId, ref: "Instrument", required: true },
  
  // Brand and model information
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: Number,
  serialNumber: String,
  
  // Detailed specifications (instrument-specific)
  specifications: {
    // Guitar specifications
    bodyType: String, // solid, semi-hollow, hollow
    pickupConfiguration: String, // SSS, HSS, HH, etc
    neckType: String, // bolt-on, set, neck-through
    frets: Number,
    scaleLength: Number, // inches
    finish: String,
    
    // Amplifier specifications
    wattage: Number,
    channels: Number,
    speakerConfiguration: String, // 1x12, 2x12, 4x10, etc
    ampType: String, // tube, solid_state, modeling, hybrid
    effects: [String], // reverb, chorus, delay, etc
    inputs: Number,
    footswitchIncluded: Boolean,
    
    // Drum specifications
    configuration: String, // 4-piece, 5-piece, etc
    kickSize: String, // 20x16, 22x18, etc
    snareIncluded: Boolean,
    tomSizes: [String], // 10x8, 12x9, etc
    floorTomSize: String,
    shellMaterial: String, // birch, maple, etc
    hardwareFinish: String,
    
    // Keyboard specifications
    keyCount: { type: Number, default: 88 },
    weightedKeys: Boolean,
    pedalCount: Number,
    builtInSounds: Number,
    polyphony: Number,
    
    // Generic specifications
    color: String,
    weight: Number, // kg
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: { type: String, default: "cm" }
    }
  },
  
  // Condition assessment
  condition: {
    rating: { type: Number, min: 1, max: 10, required: true },
    description: String,
    lastInspected: { type: Date, required: true },
    inspectedBy: String, // technician name
    
    // Specific condition details
    cosmeticCondition: { type: Number, min: 1, max: 10 },
    functionalCondition: { type: Number, min: 1, max: 10 },
    electronicCondition: { type: Number, min: 1, max: 10 }, // for electric instruments
    
    // Issues and notes
    knownIssues: [String],
    repairHistory: [
      {
        date: Date,
        issue: String,
        repair: String,
        cost: Number,
        technician: String
      }
    ]
  },
  
  // Availability and booking
  availability: {
    status: {
      type: String,
      enum: ["available", "maintenance", "reserved", "retired", "damaged"],
      default: "available"
    },
    calendarBookings: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        eventId: { type: Schema.Types.ObjectId, ref: "Event" },
        bandName: String,
        notes: String,
        bookingStatus: {
          type: String,
          enum: ["confirmed", "pending", "cancelled"],
          default: "pending"
        }
      }
    ],
    
    // Advance booking requirements
    advanceBookingDays: { type: Number, default: 7 },
    blackoutDates: [
      {
        startDate: Date,
        endDate: Date,
        reason: String
      }
    ]
  },
  
  // Maintenance scheduling
  maintenance: {
    lastSetup: Date,
    nextServiceDue: Date,
    maintenanceFrequencyDays: { type: Number, default: 90 },
    
    // Service history
    serviceHistory: [
      {
        date: { type: Date, required: true },
        serviceType: {
          type: String,
          enum: ["routine", "repair", "setup", "cleaning", "calibration", "emergency"]
        },
        technician: String,
        cost: Number,
        notes: String,
        partsReplaced: [String]
      }
    ],
    
    // Scheduled maintenance
    scheduledMaintenance: [
      {
        scheduledDate: Date,
        serviceType: String,
        notes: String,
        priority: {
          type: String,
          enum: ["low", "medium", "high", "urgent"],
          default: "medium"
        }
      }
    ]
  },
  
  // Rental and pricing
  rental: {
    includedInBackline: { type: Boolean, default: true },
    rentalRatePerDay: { type: Number, default: 0 },
    damageDeposit: Number,
    replacementValue: { type: Number, required: true },
    
    // Pricing tiers based on condition and brand
    pricingTier: {
      type: String,
      enum: ["budget", "standard", "premium", "vintage"],
      default: "standard"
    }
  },
  
  // Accessories and extras
  accessories: {
    caseIncluded: Boolean,
    strapIncluded: Boolean,
    cablesIncluded: Boolean,
    picksIncluded: Boolean,
    standsIncluded: Boolean,
    benchIncluded: Boolean, // for keyboards
    footswitchIncluded: Boolean, // for amps
    
    // Additional items
    additionalItems: [
      {
        item: String,
        included: Boolean,
        condition: String,
        notes: String
      }
    ]
  },
  
  // Media and documentation
  media: {
    images: [String], // URLs
    manuals: [
      {
        title: String,
        url: String,
        format: String // PDF, etc.
      }
    ],
    audioSamples: [String], // URLs to audio files
    notes: String
  },
  
  // Location within venue
  location: {
    area: String, // stage, backline_room, storage, etc.
    position: String, // stage_left, center, etc.
    storageLocation: String,
    isPortable: Boolean,
    requiresAssembly: Boolean,
    setupTimeMinutes: Number
  },
  
  // Insurance and liability
  insurance: {
    policyNumber: String,
    insuredValue: Number,
    deductible: Number,
    coverageType: String
  },
  
  // Internal tracking
  internalNotes: String,
  tags: [String], // for internal organization
  
  // Audit fields
  addedBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
}, {
  timestamps: true
});

// Main Venue Equipment Schema
const VenueEquipmentSchema = new Schema(
  {
    // Venue reference (integrating with existing Place model)
    venue: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    venueName: String, // Denormalized for quick access
    
    // Geographic context (using existing models)
    location: {
      country: { type: Schema.Types.ObjectId, ref: "Country" },
      city: String,
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    
    // Equipment inventory organized by category
    inventory: {
      // String instruments
      guitars: {
        electric: [EquipmentItemSchema],
        acoustic: [EquipmentItemSchema],
        bass: [EquipmentItemSchema],
        other: [EquipmentItemSchema]
      },
      
      // Amplifiers
      amplifiers: {
        guitar: [EquipmentItemSchema],
        bass: [EquipmentItemSchema],
        keyboard: [EquipmentItemSchema]
      },
      
      // Drums and percussion
      drums: {
        acoustic: [EquipmentItemSchema],
        electronic: [EquipmentItemSchema],
        percussion: [EquipmentItemSchema],
        cymbals: [EquipmentItemSchema]
      },
      
      // Keyboards
      keyboards: {
        pianos: [EquipmentItemSchema],
        synthesizers: [EquipmentItemSchema],
        organs: [EquipmentItemSchema]
      },
      
      // PA and sound system
      sound: {
        mixers: [EquipmentItemSchema],
        speakers: [EquipmentItemSchema],
        microphones: [EquipmentItemSchema],
        monitors: [EquipmentItemSchema],
        processors: [EquipmentItemSchema]
      },
      
      // Other equipment
      other: [EquipmentItemSchema]
    },
    
    // Venue policies and terms
    policies: {
      backlineUsage: {
        includedInVenueFee: { type: Boolean, default: true },
        additionalCost: Number,
        damageDepositRequired: { type: Boolean, default: false },
        damageDepositAmount: Number,
        artistInsuranceRequired: Boolean
      },
      
      equipmentRestrictions: {
        noOutsideAmps: Boolean,
        noOutsideDrums: Boolean,
        volumeLimitations: {
          maxDbLevel: Number,
          soundLimiterInstalled: Boolean
        },
        curfewRestrictions: {
          soundcheckEnd: String, // "18:00"
          performanceEnd: String, // "23:00"
          loadOutEnd: String // "24:00"
        }
      },
      
      setupPolicies: {
        loadInTime: String,
        soundcheckDuration: Number, // minutes
        changeoverTime: Number, // minutes
        techSupportAvailable: Boolean,
        additionalTechCost: Number,
        setupAssistanceIncluded: Boolean
      },
      
      // Cancellation and modification policies
      bookingPolicies: {
        advanceBookingRequired: Number, // days
        cancellationPolicyDays: Number,
        modificationAllowed: Boolean,
        depositRequired: Boolean,
        depositPercentage: Number
      }
    },
    
    // Contact information for equipment-related queries
    contacts: {
      techManager: {
        name: String,
        phone: String,
        email: String,
        availableHours: String
      },
      equipmentQuestions: {
        name: String,
        phone: String,
        email: String,
        preferredContactMethod: String
      },
      bookingContact: {
        name: String,
        phone: String,
        email: String
      }
    },
    
    // Venue capabilities and features
    capabilities: {
      stageSize: {
        width: Number, // meters
        height: Number, // meters
        depth: Number, // meters
      },
      
      powerSupply: {
        outlets: Number,
        voltage: Number, // 110, 220, etc.
        amperage: Number,
        distribution: String, // description of power distribution
      },
      
      acoustics: {
        roomType: String, // live, dead, variable, etc.
        acousticTreatment: Boolean,
        reverbTime: Number, // seconds
        noiseFloor: Number, // dB
        soundProofing: Boolean
      },
      
      climate: {
        climateControlled: Boolean,
        temperatureRange: {
          min: Number,
          max: Number
        },
        humidityControlled: Boolean
      }
    },
    
    // Statistics and analytics
    statistics: {
      totalEquipmentValue: Number,
      averageConditionRating: Number,
      equipmentUtilizationRate: Number, // percentage
      maintenanceCosts: {
        monthly: Number,
        yearly: Number
      },
      
      // Usage statistics
      mostPopularEquipment: [
        {
          itemId: String,
          usageCount: Number,
          revenue: Number
        }
      ],
      
      // Booking statistics
      bookingStats: {
        totalBookings: Number,
        cancelledBookings: Number,
        averageBookingValue: Number,
        repeatCustomers: Number
      }
    },
    
    // Metadata
    lastInventoryUpdate: { type: Date, default: Date.now },
    inventoryVersion: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    featuredEquipment: [String], // Array of itemIds to feature
    
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
VenueEquipmentSchema.index({ venue: 1 });
VenueEquipmentSchema.index({ "location.country": 1 });
VenueEquipmentSchema.index({ "location.city": 1 });
VenueEquipmentSchema.index({ isActive: 1 });
VenueEquipmentSchema.index({ lastInventoryUpdate: -1 });

// Compound indexes for equipment searches
VenueEquipmentSchema.index({ 
  "inventory.guitars.electric.brand": 1, 
  "inventory.guitars.electric.condition.rating": -1 
});
VenueEquipmentSchema.index({ 
  "inventory.guitars.electric.availability.status": 1 
});
VenueEquipmentSchema.index({ 
  "inventory.amplifiers.guitar.specifications.wattage": 1 
});

// Virtual for total equipment count
VenueEquipmentSchema.virtual('totalEquipmentCount').get(function() {
  let count = 0;
  
  // Count all equipment items
  Object.values(this.inventory).forEach(category => {
    Object.values(category).forEach(subcategory => {
      if (Array.isArray(subcategory)) {
        count += subcategory.length;
      }
    });
  });
  
  return count;
});

// Virtual for available equipment count
VenueEquipmentSchema.virtual('availableEquipmentCount').get(function() {
  let count = 0;
  
  Object.values(this.inventory).forEach(category => {
    Object.values(category).forEach(subcategory => {
      if (Array.isArray(subcategory)) {
        count += subcategory.filter(item => item.availability.status === 'available').length;
      }
    });
  });
  
  return count;
});

// Instance methods
VenueEquipmentSchema.methods.findEquipmentByBrand = function(brand) {
  const results = [];
  
  Object.values(this.inventory).forEach(category => {
    Object.values(category).forEach(subcategory => {
      if (Array.isArray(subcategory)) {
        const matches = subcategory.filter(item => 
          item.brand.toLowerCase().includes(brand.toLowerCase())
        );
        results.push(...matches);
      }
    });
  });
  
  return results;
};

VenueEquipmentSchema.methods.checkAvailability = function(startDate, endDate, equipmentType = null) {
  const available = [];
  const conflicts = [];
  
  Object.entries(this.inventory).forEach(([categoryName, category]) => {
    Object.entries(category).forEach(([subcategoryName, items]) => {
      if (Array.isArray(items)) {
        items.forEach(item => {
          // Skip if equipment type filter doesn't match
          if (equipmentType && !categoryName.includes(equipmentType)) {
            return;
          }
          
          // Check for booking conflicts
          const hasConflict = item.availability.calendarBookings.some(booking => {
            return booking.bookingStatus === 'confirmed' &&
                   ((new Date(startDate) >= new Date(booking.startDate) && new Date(startDate) < new Date(booking.endDate)) ||
                    (new Date(endDate) > new Date(booking.startDate) && new Date(endDate) <= new Date(booking.endDate)) ||
                    (new Date(startDate) <= new Date(booking.startDate) && new Date(endDate) >= new Date(booking.endDate)));
          });
          
          if (!hasConflict && item.availability.status === 'available') {
            available.push({
              category: categoryName,
              subcategory: subcategoryName,
              item: item
            });
          } else if (hasConflict) {
            conflicts.push({
              category: categoryName,
              subcategory: subcategoryName,
              item: item,
              conflictingBookings: item.availability.calendarBookings.filter(booking => 
                booking.bookingStatus === 'confirmed' &&
                ((new Date(startDate) >= new Date(booking.startDate) && new Date(startDate) < new Date(booking.endDate)) ||
                 (new Date(endDate) > new Date(booking.startDate) && new Date(endDate) <= new Date(booking.endDate)) ||
                 (new Date(startDate) <= new Date(booking.startDate) && new Date(endDate) >= new Date(booking.endDate)))
              )
            });
          }
        });
      }
    });
  });
  
  return { available, conflicts };
};

VenueEquipmentSchema.methods.getMaintenanceDue = function() {
  const maintenanceDue = [];
  const today = new Date();
  
  Object.values(this.inventory).forEach(category => {
    Object.values(category).forEach(subcategory => {
      if (Array.isArray(subcategory)) {
        subcategory.forEach(item => {
          if (item.maintenance.nextServiceDue && new Date(item.maintenance.nextServiceDue) <= today) {
            maintenanceDue.push(item);
          }
        });
      }
    });
  });
  
  return maintenanceDue;
};

VenueEquipmentSchema.methods.updateInventoryStats = function() {
  let totalValue = 0;
  let totalRating = 0;
  let itemCount = 0;
  
  Object.values(this.inventory).forEach(category => {
    Object.values(category).forEach(subcategory => {
      if (Array.isArray(subcategory)) {
        subcategory.forEach(item => {
          totalValue += item.rental.replacementValue || 0;
          totalRating += item.condition.rating || 0;
          itemCount++;
        });
      }
    });
  });
  
  this.statistics.totalEquipmentValue = totalValue;
  this.statistics.averageConditionRating = itemCount > 0 ? totalRating / itemCount : 0;
  this.lastInventoryUpdate = new Date();
  
  return this.save();
};

// Static methods
VenueEquipmentSchema.statics.findByLocation = function(countryId, city = null) {
  const query = {
    'location.country': countryId,
    isActive: true
  };
  
  if (city) {
    query['location.city'] = new RegExp(city, 'i');
  }
  
  return this.find(query);
};

VenueEquipmentSchema.statics.searchEquipment = function(searchCriteria) {
  const {
    brand,
    model,
    equipmentType,
    minCondition = 1,
    maxCondition = 10,
    startDate,
    endDate,
    location
  } = searchCriteria;
  
  // This is a complex search that would be implemented with aggregation pipeline
  return this.find({ isActive: true }); // Simplified for now
};

module.exports = { schema: VenueEquipmentSchema };