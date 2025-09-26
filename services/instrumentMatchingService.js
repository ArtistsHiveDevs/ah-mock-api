const { connections } = require("../db/db_g");
const { schema: InstrumentSchema } = require("../models/domain/Instrument.schema");
const { schema: VenueEquipmentSchema } = require("../models/domain/VenueEquipment.schema");
const { schema: BandShowConfigurationSchema } = require("../models/domain/BandShowConfiguration.schema");
const { schema: PlaceSchema } = require("../models/domain/Place.schema");

class InstrumentMatchingService {
  constructor(connectionName = 'default') {
    const connection = connections[connectionName];
    this.models = {
      Instrument: connection.model('Instrument', InstrumentSchema),
      VenueEquipment: connection.model('VenueEquipment', VenueEquipmentSchema),
      BandShowConfiguration: connection.model('BandShowConfiguration', BandShowConfigurationSchema),
      Place: connection.model('Place', PlaceSchema)
    };
  }

  /**
   * Find compatible venues for a band's show configuration
   * @param {string} bandId - Band ObjectId
   * @param {string} showConfigId - Show configuration ID
   * @param {Object} searchCriteria - Additional search criteria
   * @returns {Array} Array of venue matches with scores
   */
  async findCompatibleVenues(bandId, showConfigId, searchCriteria = {}) {
    try {
      // Get band show configuration
      const bandConfig = await this.models.BandShowConfiguration.findOne({ band: bandId });
      if (!bandConfig) {
        throw new Error('Band configuration not found');
      }

      const showConfig = bandConfig.getShowConfiguration(showConfigId);
      if (!showConfig) {
        throw new Error('Show configuration not found');
      }

      // Step 1: Initial filtering - get venues that meet hard requirements
      const hardRequirements = await this._buildHardRequirements(showConfig, searchCriteria);
      const candidateVenues = await this._findCandidateVenues(hardRequirements);

      // Step 2: Score each venue
      const scoredVenues = [];
      for (const venue of candidateVenues) {
        const score = await this._calculateVenueScore(venue, showConfig, searchCriteria);
        if (score.overallScore >= 60) { // Minimum viable score
          scoredVenues.push({
            venue,
            score: score.overallScore,
            componentScores: score.componentScores,
            strengths: score.strengths,
            concerns: score.concerns,
            equipmentGaps: score.equipmentGaps,
            estimatedCosts: score.estimatedCosts
          });
        }
      }

      // Step 3: Sort by score and categorize
      scoredVenues.sort((a, b) => b.score - a.score);

      return {
        searchCriteria,
        showConfiguration: {
          showId: showConfig.showId,
          showName: showConfig.showName,
          showType: showConfig.showType
        },
        matches: {
          perfectMatches: scoredVenues.filter(v => v.score >= 95),
          excellentMatches: scoredVenues.filter(v => v.score >= 85 && v.score < 95),
          goodMatches: scoredVenues.filter(v => v.score >= 75 && v.score < 85),
          acceptableMatches: scoredVenues.filter(v => v.score >= 60 && v.score < 75)
        },
        totalMatches: scoredVenues.length,
        searchMetadata: {
          candidateVenuesFound: candidateVenues.length,
          hardRequirementsPassed: candidateVenues.length,
          minimumScoreFilter: scoredVenues.length
        }
      };

    } catch (error) {
      console.error('Error in venue matching:', error);
      throw error;
    }
  }

  /**
   * Build hard requirements query for initial venue filtering
   */
  async _buildHardRequirements(showConfig, searchCriteria) {
    const requirements = {
      isActive: true
    };

    // Venue capacity requirements
    if (showConfig.venueCompatibility?.capacityRange) {
      const capacity = showConfig.venueCompatibility.capacityRange;
      if (capacity.minCapacity) requirements['capacity'] = { $gte: capacity.minCapacity };
      if (capacity.maxCapacity) {
        requirements['capacity'] = { 
          ...requirements['capacity'], 
          $lte: capacity.maxCapacity 
        };
      }
    }

    // Geographic preferences
    if (showConfig.venueCompatibility?.geographicPreferences?.preferredCountries?.length > 0) {
      requirements['country'] = { 
        $in: showConfig.venueCompatibility.geographicPreferences.preferredCountries 
      };
    }

    // Venue type requirements
    if (showConfig.venueCompatibility?.venueTypesSuitable?.length > 0) {
      requirements['place_type'] = { 
        $in: showConfig.venueCompatibility.venueTypesSuitable 
      };
    }

    // Search criteria overrides
    if (searchCriteria.location?.country) {
      requirements['country'] = searchCriteria.location.country;
    }
    if (searchCriteria.location?.city) {
      requirements['city'] = new RegExp(searchCriteria.location.city, 'i');
    }
    if (searchCriteria.capacityRange) {
      requirements['capacity'] = {
        $gte: searchCriteria.capacityRange.min || 0,
        $lte: searchCriteria.capacityRange.max || 100000
      };
    }

    return requirements;
  }

  /**
   * Find candidate venues based on hard requirements
   */
  async _findCandidateVenues(hardRequirements) {
    const venues = await this.models.Place.find(hardRequirements)
      .populate('country', 'name alpha2 alpha3')
      .limit(100); // Limit for performance

    return venues;
  }

  /**
   * Calculate comprehensive score for a venue
   */
  async _calculateVenueScore(venue, showConfig, searchCriteria) {
    const componentScores = {};
    const strengths = [];
    const concerns = [];
    const equipmentGaps = [];
    const estimatedCosts = { base: 0, equipment: 0, crew: 0, transport: 0, total: 0 };

    // Get venue equipment data
    const venueEquipment = await this.models.VenueEquipment.findOne({ venue: venue._id });

    // Component 1: Equipment Compatibility (35% weight)
    componentScores.equipmentCompatibility = await this._scoreEquipmentCompatibility(
      venueEquipment, 
      showConfig, 
      equipmentGaps, 
      estimatedCosts
    );

    // Component 2: Brand Preference Match (15% weight)
    componentScores.brandPreferenceMatch = await this._scoreBrandPreferenceMatch(
      venueEquipment, 
      showConfig
    );

    // Component 3: Venue Size Optimization (15% weight)
    componentScores.venueSizeOptimization = this._scoreVenueSizeOptimization(
      venue, 
      showConfig
    );

    // Component 4: Technical Capabilities (15% weight)
    componentScores.technicalCapabilities = this._scoreTechnicalCapabilities(
      venue, 
      venueEquipment, 
      showConfig
    );

    // Component 5: Logistical Compatibility (10% weight)
    componentScores.logisticalCompatibility = this._scoreLogisticalCompatibility(
      venue, 
      venueEquipment, 
      showConfig
    );

    // Component 6: Cost Efficiency (10% weight)
    componentScores.costEfficiency = this._scoreCostEfficiency(
      estimatedCosts, 
      showConfig
    );

    // Calculate weighted overall score
    const weights = {
      equipmentCompatibility: 0.35,
      brandPreferenceMatch: 0.15,
      venueSizeOptimization: 0.15,
      technicalCapabilities: 0.15,
      logisticalCompatibility: 0.10,
      costEfficiency: 0.10
    };

    let overallScore = 0;
    Object.keys(componentScores).forEach(component => {
      overallScore += componentScores[component] * weights[component];
    });

    // Add bonuses and penalties
    const bonuses = this._calculateBonuses(venue, venueEquipment, showConfig);
    const penalties = this._calculatePenalties(venue, venueEquipment, showConfig);
    
    overallScore += bonuses - penalties;
    overallScore = Math.max(0, Math.min(100, overallScore)); // Clamp to 0-100

    // Generate strengths and concerns
    this._generateStrengthsAndConcerns(componentScores, strengths, concerns);

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      componentScores,
      strengths,
      concerns,
      equipmentGaps,
      estimatedCosts
    };
  }

  /**
   * Score equipment compatibility
   */
  async _scoreEquipmentCompatibility(venueEquipment, showConfig, equipmentGaps, estimatedCosts) {
    if (!venueEquipment) {
      equipmentGaps.push({
        issue: 'No equipment inventory available',
        severity: 'high'
      });
      return 20; // Low score for missing equipment data
    }

    const requiredEquipment = this._extractRequiredEquipment(showConfig);
    let totalScore = 0;
    let totalWeight = 0;

    for (const requirement of requiredEquipment) {
      const availableItems = this._findAvailableEquipment(venueEquipment, requirement);
      const itemScore = this._scoreEquipmentItem(availableItems, requirement);
      
      // Weight by priority (essential=3, preferred=2, optional=1)
      const weight = requirement.priority === 1 ? 3 : (requirement.priority === 2 ? 2 : 1);
      
      totalScore += itemScore * weight;
      totalWeight += weight;

      if (itemScore < 30) {
        equipmentGaps.push({
          instrument: requirement.instrumentClassification,
          issue: itemScore === 0 ? 'Not available' : 'Poor condition or wrong specs',
          suggestedSolution: 'Rent or bring own equipment',
          estimatedCost: this._estimateEquipmentRentalCost(requirement)
        });
        estimatedCosts.equipment += this._estimateEquipmentRentalCost(requirement);
      }
    }

    return totalWeight > 0 ? (totalScore / totalWeight) : 50;
  }

  /**
   * Score brand preference match
   */
  async _scoreBrandPreferenceMatch(venueEquipment, showConfig) {
    if (!venueEquipment) return 50;

    const requiredEquipment = this._extractRequiredEquipment(showConfig);
    let totalScore = 0;
    let totalItems = 0;

    for (const requirement of requiredEquipment) {
      if (!requirement.brandPreferences) continue;

      const availableItems = this._findAvailableEquipment(venueEquipment, requirement);
      let itemScore = 50; // Default score

      for (const item of availableItems) {
        if (requirement.brandPreferences.preferredBrands?.includes(item.brand)) {
          itemScore = 100;
          break;
        } else if (requirement.brandPreferences.acceptableBrands?.includes(item.brand)) {
          itemScore = 80;
        } else if (requirement.brandPreferences.avoidBrands?.includes(item.brand)) {
          itemScore = 20;
        }
      }

      // Apply sponsor contract penalties
      if (requirement.brandPreferences.sponsorContract?.hasContract) {
        const contract = requirement.brandPreferences.sponsorContract;
        const hasCorrectBrand = availableItems.some(item => 
          item.brand === contract.brand
        );

        if (contract.contractType === 'exclusive_endorsement' && !hasCorrectBrand) {
          itemScore = 0; // Cannot use venue if exclusive contract violated
        } else if (contract.contractType === 'preferred_use' && !hasCorrectBrand) {
          itemScore *= 0.6; // Significant penalty for non-preferred brand
        }
      }

      totalScore += itemScore;
      totalItems++;
    }

    return totalItems > 0 ? (totalScore / totalItems) : 50;
  }

  /**
   * Score venue size optimization
   */
  _scoreVenueSizeOptimization(venue, showConfig) {
    const capacity = venue.capacity || 0;
    const optimal = showConfig.venueCompatibility?.capacityRange?.optimalCapacity;
    const min = showConfig.venueCompatibility?.capacityRange?.minCapacity || 0;
    const max = showConfig.venueCompatibility?.capacityRange?.maxCapacity || 100000;

    if (capacity < min || capacity > max) return 20; // Outside acceptable range

    if (optimal) {
      const difference = Math.abs(capacity - optimal);
      const percentDiff = difference / optimal;

      if (percentDiff <= 0.1) return 100; // Within 10% of optimal
      if (percentDiff <= 0.25) return 95;  // Within 25% of optimal
      if (percentDiff <= 0.5) return 85;   // Within 50% of optimal
      return 70; // Within range but not optimal
    }

    // If no optimal specified, score based on being within range
    return 80;
  }

  /**
   * Score technical capabilities
   */
  _scoreTechnicalCapabilities(venue, venueEquipment, showConfig) {
    let score = 50; // Base score

    // PA System adequacy
    const requiredWattage = showConfig.soundRequirements?.paSystem?.minimumWattage || 0;
    if (venueEquipment?.capabilities?.paSystem?.wattage >= requiredWattage) {
      score += 20;
    }

    // Monitor system
    if (showConfig.stageRequirements?.monitorRequirements) {
      const monitors = showConfig.stageRequirements.monitorRequirements;
      if (monitors.inEarMonitorCapable && venueEquipment?.capabilities?.monitors?.inEar) {
        score += 15;
      } else if (monitors.floorWedgesNeeded && venueEquipment?.capabilities?.monitors?.wedges) {
        score += 10;
      }
    }

    // Stage size
    const stageReq = showConfig.stageRequirements?.minimumStageSize;
    const venueStage = venueEquipment?.capabilities?.stageSize;
    if (stageReq && venueStage) {
      if (venueStage.width >= stageReq.widthMeters && venueStage.depth >= stageReq.depthMeters) {
        score += 15;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Score logistical compatibility
   */
  _scoreLogisticalCompatibility(venue, venueEquipment, showConfig) {
    let score = 50;

    // Setup time compatibility
    const requiredSetup = showConfig.logisticalRequirements?.setupTimeMinutes || 60;
    if (venueEquipment?.policies?.setupPolicies?.loadInTime) {
      score += 20; // Venue has clear setup policies
    }

    // Tech support availability
    if (showConfig.logisticalRequirements?.crewRequirements) {
      const needsTech = Object.values(showConfig.logisticalRequirements.crewRequirements)
        .some(needed => needed);
      
      if (needsTech && venueEquipment?.policies?.setupPolicies?.techSupportAvailable) {
        score += 20;
      }
    }

    // Load-in accessibility (this would need to be added to venue data)
    score += 10; // Default bonus for standard load-in

    return Math.min(100, score);
  }

  /**
   * Score cost efficiency
   */
  _scoreCostEfficiency(estimatedCosts, showConfig) {
    const totalBudget = showConfig.pricingStructure?.basePerformanceFee || 0;
    const additionalBudget = Object.values(showConfig.pricingStructure?.additionalCosts || {})
      .reduce((sum, cost) => sum + (cost || 0), 0);
    
    const availableBudget = totalBudget + additionalBudget;
    
    if (availableBudget === 0) return 50; // No budget info available

    const costRatio = estimatedCosts.total / availableBudget;

    if (costRatio <= 0.8) return 100; // Significantly under budget
    if (costRatio <= 1.0) return 80;  // Within budget
    if (costRatio <= 1.2) return 60;  // Slightly over budget
    return 20; // Significantly over budget
  }

  /**
   * Helper methods
   */
  _extractRequiredEquipment(showConfig) {
    const equipment = [];
    
    if (showConfig.bandMembers) {
      showConfig.bandMembers.forEach(member => {
        if (member.instrumentsRequired) {
          member.instrumentsRequired.forEach(instrument => {
            equipment.push({
              memberName: member.memberName,
              ...instrument
            });
          });
        }
      });
    }

    return equipment;
  }

  _findAvailableEquipment(venueEquipment, requirement) {
    const available = [];
    const classification = requirement.instrumentClassification;

    // Map classifications to inventory categories
    const categoryMap = {
      'electric_guitar': 'inventory.guitars.electric',
      'acoustic_guitar': 'inventory.guitars.acoustic', 
      'bass_guitar': 'inventory.guitars.bass',
      'piano': 'inventory.keyboards.pianos',
      'drum_kit': 'inventory.drums.acoustic'
    };

    const inventoryPath = categoryMap[classification];
    if (inventoryPath && venueEquipment) {
      const items = this._getNestedProperty(venueEquipment, inventoryPath) || [];
      available.push(...items.filter(item => 
        item.availability?.status === 'available' &&
        item.condition?.rating >= (requirement.technicalRequirements?.minimumConditionRating || 1)
      ));
    }

    return available;
  }

  _getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  _scoreEquipmentItem(availableItems, requirement) {
    if (availableItems.length === 0) return 0;

    let bestScore = 0;

    availableItems.forEach(item => {
      let itemScore = 50; // Base score for available item

      // Condition score
      const condition = item.condition?.rating || 5;
      const minCondition = requirement.technicalRequirements?.minimumConditionRating || 6;
      
      if (condition >= minCondition) {
        itemScore += (condition - minCondition) * 5;
      } else {
        itemScore -= (minCondition - condition) * 10;
      }

      // Brand preference score (simplified)
      if (requirement.brandPreferences?.preferredBrands?.includes(item.brand)) {
        itemScore += 20;
      } else if (requirement.brandPreferences?.acceptableBrands?.includes(item.brand)) {
        itemScore += 10;
      }

      bestScore = Math.max(bestScore, itemScore);
    });

    return Math.min(100, Math.max(0, bestScore));
  }

  _estimateEquipmentRentalCost(requirement) {
    // Simplified cost estimation
    const baseCosts = {
      'electric_guitar': 25,
      'acoustic_guitar': 20,
      'bass_guitar': 25,
      'piano': 75,
      'drum_kit': 50
    };

    return baseCosts[requirement.instrumentClassification] || 30;
  }

  _calculateBonuses(venue, venueEquipment, showConfig) {
    let bonus = 0;

    // Historical success bonus (would need to be implemented)
    // if (venue has successful history with similar shows) bonus += 10;

    // Location bonus
    // if (venue in preferred location) bonus += 5;

    // Additional services bonus
    if (venueEquipment?.capabilities?.additionalServices) {
      bonus += 5;
    }

    return bonus;
  }

  _calculatePenalties(venue, venueEquipment, showConfig) {
    let penalty = 0;

    // Risk factors
    if (!venueEquipment) penalty += 10; // No equipment data is risky

    return penalty;
  }

  _generateStrengthsAndConcerns(componentScores, strengths, concerns) {
    Object.entries(componentScores).forEach(([component, score]) => {
      if (score >= 90) {
        strengths.push(this._getStrengthMessage(component));
      } else if (score < 60) {
        concerns.push(this._getConcernMessage(component));
      }
    });
  }

  _getStrengthMessage(component) {
    const messages = {
      equipmentCompatibility: "Excellent equipment match",
      brandPreferenceMatch: "Perfect brand alignment",
      venueSizeOptimization: "Ideal venue size",
      technicalCapabilities: "Outstanding technical setup",
      logisticalCompatibility: "Smooth logistics expected",
      costEfficiency: "Great value for budget"
    };
    return messages[component] || "Strong compatibility";
  }

  _getConcernMessage(component) {
    const messages = {
      equipmentCompatibility: "Equipment gaps may require rentals",
      brandPreferenceMatch: "Brand preferences not fully met",
      venueSizeOptimization: "Venue size not optimal",
      technicalCapabilities: "Technical limitations present",
      logisticalCompatibility: "Complex setup requirements",
      costEfficiency: "May exceed budget expectations"
    };
    return messages[component] || "Compatibility concerns";
  }
}

module.exports = InstrumentMatchingService;