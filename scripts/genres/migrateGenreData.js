const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const { getModel } = require('../../helpers/getModel');

// Sample places genre data (from places_genres.json)
const placesGenres = {
  "jackassrockbar": ["argentine rock", "latin rock", "rock en español", "latin alternative"],
  "matikbogota": ["latin jazz", "latin indie", "latin alternative", "cumbia", "chicha", "latin hip hop"],
  "habana93": ["salsa", "timba", "son cubano"],
  "teatrojeg": ["latin indie", "latin alternative", "latin afrobeat", "dancehall", "afrobeat", "champeta"],
  "latinopowerchapinero": ["colombian indie", "latin hip hop", "cumbia", "chicha", "latin alternative", "salsa"],
  // Add more sample data as needed for testing
};

// Import seed data function
const { seedGenreData } = require('./seedGenreData');

// Mock serverEnvironment for getModel
const mockServerEnvironment = 'development'; // Adjust as needed

async function migrateGenreData() {
  try {
    console.log('🎵 Starting genre data migration...');
    
    // Step 1: Generate and seed genre collections
    console.log('📝 Step 1: Generating genre seed data...');
    const { genreDocuments, lookupDocuments } = await seedGenreData();
    
    // Step 2: Connect to database and get models
    console.log('📝 Step 2: Connecting to database...');
    
    // Note: Connection should already be established by your app
    const Genre = await getModel(mockServerEnvironment, "Genre");
    const GenreLookup = await getModel(mockServerEnvironment, "GenreLookup");
    const EntityDirectory = await getModel(mockServerEnvironment, "EntityDirectory");
    
    // Step 3: Clear existing data and seed new data
    console.log('📝 Step 3: Clearing existing genre data...');
    await Genre.deleteMany({});
    await GenreLookup.deleteMany({});
    
    console.log('📝 Step 4: Inserting genre collections...');
    await Genre.insertMany(genreDocuments);
    await GenreLookup.insertMany(lookupDocuments);
    
    console.log(`✅ Inserted ${genreDocuments.length} genres`);
    console.log(`✅ Inserted ${lookupDocuments.length} genre lookups`);
    
    // Step 4: Process places_genres.json and update EntityDirectory
    console.log('📝 Step 5: Processing places genres...');
    
    let processedVenues = 0;
    let updatedVenues = 0;
    
    for (const [venueUsername, genreTags] of Object.entries(placesGenres)) {
      processedVenues++;
      
      // Find venue in EntityDirectory
      const venue = await EntityDirectory.findOne({ 
        username: venueUsername,
        entityType: 'Place'
      });
      
      if (!venue) {
        console.warn(`⚠️  Venue not found: ${venueUsername}`);
        continue;
      }
      
      // Classify genres for this venue
      const genreClassification = await classifyGenres(genreTags, GenreLookup);
      
      if (genreClassification) {
        // Update EntityDirectory with genre classification
        await EntityDirectory.updateOne(
          { _id: venue._id },
          {
            $set: {
              genres: genreClassification,
              // Update search_cache to include genre keywords
              search_cache: [
                venue.search_cache || '',
                genreClassification.search_keywords || ''
              ].filter(Boolean).join(' ')
            }
          }
        );
        
        updatedVenues++;
        
        if (updatedVenues % 50 === 0) {
          console.log(`📊 Processed ${updatedVenues} venues...`);
        }
      }
    }
    
    console.log(`✅ Migration completed!`);
    console.log(`📊 Processed ${processedVenues} venues`);
    console.log(`📊 Updated ${updatedVenues} venues with genre data`);
    
    // Step 5: Create indexes
    console.log('📝 Step 6: Creating indexes...');
    await createGenreIndexes(EntityDirectory);
    
    console.log('🎉 Genre migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function classifyGenres(genreTags, GenreLookup) {
  if (!genreTags || genreTags.length === 0) {
    return null;
  }
  
  // Find matching genres in lookup
  const genreMatches = await GenreLookup.find({
    level3_tag: { $in: genreTags }
  }).sort({ popularity_score: -1 });
  
  if (genreMatches.length === 0) {
    console.warn(`⚠️  No genre matches found for: ${genreTags.join(', ')}`);
    return null;
  }
  
  // Get the most popular/relevant genre as primary
  const primaryGenre = genreMatches[0];
  
  // Determine geographic relevance based on genre patterns
  const { continent_relevance, country_relevance } = determineGeographicRelevance(genreTags);
  
  // Build genre classification
  const classification = {
    level1_key: primaryGenre.level1_key,
    level1_name: primaryGenre.level1_name,
    level2_key: primaryGenre.level2_key,
    level2_name: primaryGenre.level2_name,
    hierarchy_path: primaryGenre.hierarchy_path,
    primary_tags: genreTags.slice(0, 5), // Top 5 tags
    continent_relevance,
    country_relevance,
    all_tags: genreTags,
    search_keywords: [
      primaryGenre.level1_name,
      primaryGenre.level2_name,
      ...genreTags
    ].join(' ').toLowerCase()
  };
  
  return classification;
}

function determineGeographicRelevance(genreTags) {
  const tagString = genreTags.join(' ').toLowerCase();
  
  // Determine primary continent based on genre patterns
  let continent_relevance = 'south_america'; // Default for Latin genres
  const country_relevance = [];
  
  // Continental patterns
  if (tagString.includes('colombian') || tagString.includes('cumbia') || tagString.includes('champeta')) {
    continent_relevance = 'south_america';
    country_relevance.push('colombia');
  }
  
  if (tagString.includes('mexican') || tagString.includes('ranchera') || tagString.includes('mariachi')) {
    continent_relevance = 'north_america';
    country_relevance.push('mexico');
  }
  
  if (tagString.includes('spanish') || tagString.includes('flamenco')) {
    continent_relevance = 'europe';
    country_relevance.push('spain');
  }
  
  if (tagString.includes('french') || tagString.includes('chanson')) {
    continent_relevance = 'europe';
    country_relevance.push('france');
  }
  
  if (tagString.includes('cuban') || tagString.includes('timba') || tagString.includes('son cubano')) {
    continent_relevance = 'north_america';
    country_relevance.push('cuba');
  }
  
  // Add common Latin countries if Latin genres detected
  if (tagString.includes('latin') || tagString.includes('salsa') || tagString.includes('bachata')) {
    country_relevance.push('colombia', 'mexico', 'spain', 'argentina');
  }
  
  // Add common countries for electronic/rock genres
  if (tagString.includes('techno') || tagString.includes('house') || tagString.includes('electronic')) {
    continent_relevance = 'europe';
    country_relevance.push('germany', 'uk', 'france');
  }
  
  if (tagString.includes('rock') || tagString.includes('metal')) {
    continent_relevance = 'north_america';
    country_relevance.push('usa', 'uk', 'canada');
  }
  
  return {
    continent_relevance,
    country_relevance: [...new Set(country_relevance)] // Remove duplicates
  };
}

async function createGenreIndexes(EntityDirectory) {
  // EntityDirectory genre indexes
  await EntityDirectory.createIndex({ "genres.level1_key": 1, "genres.level2_key": 1 });
  await EntityDirectory.createIndex({ "genres.hierarchy_path": 1 });
  await EntityDirectory.createIndex({ "genres.all_tags": 1 });
  await EntityDirectory.createIndex({ "genres.continent_relevance": 1 });
  await EntityDirectory.createIndex({ "genres.country_relevance": 1 });
  
  // Combined indexes for performance
  await EntityDirectory.createIndex({ 
    entityType: 1, 
    "genres.level1_key": 1, 
    isActive: 1 
  });
  
  console.log('✅ Created EntityDirectory genre indexes');
}

// Export for use in other scripts
module.exports = { migrateGenreData, classifyGenres };

// Run if called directly
if (require.main === module) {
  migrateGenreData().catch(console.error);
}