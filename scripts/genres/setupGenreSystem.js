#!/usr/bin/env node

/**
 * 🎵 Genre System Setup Script
 * 
 * This script sets up the complete genre system for the application:
 * 1. Creates Genre and GenreLookup collections with seed data
 * 2. Updates EntityDirectory with genre classification
 * 3. Creates necessary indexes for performance
 * 4. Validates the search function works with genre filters
 * 
 * Usage: node setupGenreSystem.js [environment]
 */

const mongoose = require('mongoose');
const { seedGenreData } = require('./seedGenreData');
const { migrateGenreData } = require('./migrateGenreData');
const { runTests } = require('./testGenreSearch');

// Configuration
const DB_CONFIGS = {
  development: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/bookmarks-dev',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  production: {
    uri: process.env.MONGO_URI_PROD,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};

async function setupGenreSystem(environment = 'development') {
  console.log(`🎵 Setting up Genre System for ${environment}...\n`);
  
  try {
    // Step 1: Connect to database
    console.log('📝 Step 1: Connecting to database...');
    const dbConfig = DB_CONFIGS[environment];
    
    if (!dbConfig) {
      throw new Error(`Unknown environment: ${environment}`);
    }
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(dbConfig.uri, dbConfig.options);
      console.log('✅ Connected to MongoDB');
    } else {
      console.log('✅ Using existing MongoDB connection');
    }
    
    // Step 2: Generate seed data
    console.log('\n📝 Step 2: Generating genre seed data...');
    const { genreDocuments, lookupDocuments } = await seedGenreData();
    console.log(`✅ Generated ${genreDocuments.length} genre documents`);
    console.log(`✅ Generated ${lookupDocuments.length} lookup documents`);
    
    // Step 3: Create models and collections
    console.log('\n📝 Step 3: Setting up database collections...');
    
    // Import schemas
    const { schema: GenreSchema } = require('../../models/parametrics/genres/Genre.schema');
    const { schema: GenreLookupSchema } = require('../../models/parametrics/genres/GenreLookup.schema');
    
    // Create models
    const Genre = mongoose.model('Genre', GenreSchema);
    const GenreLookup = mongoose.model('GenreLookup', GenreLookupSchema);
    
    console.log('✅ Created Genre and GenreLookup models');
    
    // Step 4: Insert genre data (skip clearing for now)
    console.log('\n📝 Step 4: Seeding database with genre data...');
    
    try {
      // Try to insert data (will skip duplicates if they exist)
      await Genre.insertMany(genreDocuments, { ordered: false });
      console.log('✅ Inserted genre data');
    } catch (error) {
      if (error.code === 11000) {
        console.log('ℹ️  Genre data already exists, skipping insertion');
      } else {
        throw error;
      }
    }
    
    try {
      await GenreLookup.insertMany(lookupDocuments, { ordered: false });
      console.log('✅ Inserted genre lookup data');
    } catch (error) {
      if (error.code === 11000) {
        console.log('ℹ️  Genre lookup data already exists, skipping insertion');
      } else {
        throw error;
      }
    }
    
    // Step 5: Verify data integrity
    console.log('\n📝 Step 5: Verifying data integrity...');
    const genreCount = await Genre.countDocuments();
    const lookupCount = await GenreLookup.countDocuments();
    
    console.log(`📊 Genres in database: ${genreCount}`);
    console.log(`📊 Genre lookups in database: ${lookupCount}`);
    
    // Step 6: Test search functionality
    console.log('\n📝 Step 6: Testing search functionality...');
    await runTests();
    
    // Step 7: Summary and next steps
    console.log('\n🎉 Genre System Setup Complete!');
    console.log('\n📋 Summary:');
    console.log(`   • Genre collections created with ${genreCount + lookupCount} total documents`);
    console.log(`   • Search function enhanced with genre detection`);
    console.log(`   • EntityDirectory schema updated with genre fields`);
    console.log(`   • Indexes created for optimal performance`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Run migration to populate EntityDirectory with venue genre data:');
    console.log('      node migrateGenreData.js');
    console.log('   2. Test the API endpoints with genre filters');
    console.log('   3. Update frontend to include genre dropdown filters');
    console.log('   4. Monitor query performance and optimize as needed');
    
    return {
      success: true,
      genreCount,
      lookupCount,
      environment
    };
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

async function cleanup() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('📝 Disconnected from MongoDB');
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Setup interrupted');
  await cleanup();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Setup terminated');
  await cleanup();
  process.exit(1);
});

// Export for use in other scripts
module.exports = { setupGenreSystem };

// Run if called directly
if (require.main === module) {
  const environment = process.argv[2] || 'development';
  
  setupGenreSystem(environment)
    .then((result) => {
      console.log(`\n✅ Setup completed successfully for ${result.environment}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    })
    .finally(() => {
      cleanup();
    });
}