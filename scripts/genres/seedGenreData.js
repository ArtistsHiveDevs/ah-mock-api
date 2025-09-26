const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');

// Sample genre structure (simplified for initial testing)
const serverGenres = {
  "latin": {
    "name": "Latin Music",
    "subgenres": {
      "latin_pop_rock": {
        "name": "Latin Pop & Rock",
        "genres": ["latin indie", "latin pop", "latin rock", "rock en español", "latin alternative"]
      },
      "salsa_tropical": {
        "name": "Salsa & Tropical",
        "genres": ["salsa", "salsa romantica", "timba", "son cubano", "cumbia", "chicha", "merengue", "bachata"]
      },
      "regional_mexican": {
        "name": "Regional Mexican",
        "genres": ["mariachi", "ranchera", "banda", "norteño", "corrido", "vallenato"]
      }
    }
  },
  "rock": {
    "name": "Rock",
    "subgenres": {
      "alternative_rock": {
        "name": "Alternative Rock",
        "genres": ["alternative rock", "indie rock", "grunge", "post-rock", "art rock"]
      },
      "classic_rock": {
        "name": "Classic Rock",
        "genres": ["classic rock", "hard rock", "blues rock", "southern rock"]
      }
    }
  },
  "electronic": {
    "name": "Electronic",
    "subgenres": {
      "house": {
        "name": "House",
        "genres": ["house", "deep house", "tech house", "latin house", "afro house"]
      },
      "techno": {
        "name": "Techno",
        "genres": ["techno", "melodic techno", "acid techno", "hard techno"]
      }
    }
  }
};

// Geographic weights based on music industry influence
const CONTINENT_WEIGHTS = {
  'rock': { north_america: 1.0, europe: 0.9, oceania: 0.8, south_america: 0.6, asia: 0.4, africa: 0.3 },
  'metal': { europe: 1.0, north_america: 0.9, oceania: 0.7, south_america: 0.5, asia: 0.4, africa: 0.2 },
  'punk': { north_america: 1.0, europe: 0.9, oceania: 0.6, south_america: 0.5, asia: 0.3, africa: 0.2 },
  'pop': { north_america: 1.0, asia: 0.9, europe: 0.8, oceania: 0.7, south_america: 0.6, africa: 0.4 },
  'hip_hop': { north_america: 1.0, europe: 0.7, africa: 0.8, south_america: 0.6, asia: 0.5, oceania: 0.4 },
  'electronic': { europe: 1.0, north_america: 0.8, asia: 0.7, oceania: 0.6, south_america: 0.5, africa: 0.3 },
  'latin': { south_america: 1.0, north_america: 0.8, europe: 0.6, asia: 0.3, oceania: 0.2, africa: 0.2 },
  'rnb_soul': { north_america: 1.0, europe: 0.6, africa: 0.7, oceania: 0.4, south_america: 0.5, asia: 0.3 },
  'jazz': { north_america: 1.0, europe: 0.8, south_america: 0.6, africa: 0.7, asia: 0.4, oceania: 0.3 },
  'country': { north_america: 1.0, oceania: 0.6, europe: 0.4, south_america: 0.2, asia: 0.1, africa: 0.1 },
  'reggae': { north_america: 0.8, south_america: 0.6, europe: 0.5, africa: 0.9, oceania: 0.4, asia: 0.2 },
  'folk': { europe: 0.9, north_america: 0.8, south_america: 0.6, asia: 0.7, oceania: 0.5, africa: 0.6 },
  'blues': { north_america: 1.0, europe: 0.6, africa: 0.8, oceania: 0.4, south_america: 0.3, asia: 0.2 },
  'classical': { europe: 1.0, north_america: 0.8, asia: 0.7, south_america: 0.5, oceania: 0.4, africa: 0.3 },
  'world': { africa: 1.0, asia: 0.9, south_america: 0.8, europe: 0.7, oceania: 0.6, north_america: 0.5 }
};

const COUNTRY_WEIGHTS = {
  'rock': { usa: 0.9, uk: 0.9, germany: 0.7, canada: 0.7, australia: 0.6, japan: 0.5, brazil: 0.4 },
  'metal': { sweden: 0.9, finland: 0.9, norway: 0.8, germany: 0.8, usa: 0.7, uk: 0.6, brazil: 0.4 },
  'latin': { colombia: 0.9, mexico: 0.9, spain: 0.8, argentina: 0.8, chile: 0.6, usa: 0.7, france: 0.3, japan: 0.4 },
  'hip_hop': { usa: 1.0, canada: 0.6, uk: 0.7, france: 0.6, germany: 0.5, brazil: 0.5, japan: 0.3 },
  'electronic': { germany: 0.9, uk: 0.8, france: 0.8, netherlands: 0.8, usa: 0.7, sweden: 0.7, japan: 0.5 },
  'reggae': { jamaica: 1.0, uk: 0.7, usa: 0.6, colombia: 0.5, spain: 0.4, france: 0.4 }
};

async function seedGenreData() {
  console.log('🎵 Starting genre data seeding...');
  
  const genreDocuments = [];
  const lookupDocuments = [];
  
  // Process each Level 1 genre
  Object.entries(serverGenres).forEach(([level1Key, level1Data]) => {
    const level1Name = level1Data.name;
    const continentWeight = CONTINENT_WEIGHTS[level1Key] || {};
    const countryWeight = COUNTRY_WEIGHTS[level1Key] || {};
    
    // Process each Level 2 subgenre
    Object.entries(level1Data.subgenres).forEach(([level2Key, level2Data]) => {
      const level2Name = level2Data.name;
      const hierarchyPath = `${level1Key}.${level2Key}`;
      const level3Genres = level2Data.genres || [];
      
      // Create search keywords
      const searchKeywords = [
        level1Name.toLowerCase(),
        level2Name.toLowerCase(),
        ...level3Genres.map(g => g.toLowerCase())
      ];
      
      // Create Genre document (Level 1 + Level 2 + Level 3 array)
      genreDocuments.push({
        level1_key: level1Key,
        level1_name: level1Name,
        level2_key: level2Key,
        level2_name: level2Name,
        level3_genres: level3Genres,
        search_keywords: searchKeywords,
        hierarchy_path: hierarchyPath,
        continent_weight: new Map(Object.entries(continentWeight)),
        country_weight: new Map(Object.entries(countryWeight)),
        isActive: true
      });
      
      // Create GenreLookup documents (individual Level 3 → hierarchy mapping)
      level3Genres.forEach((level3Tag, index) => {
        // Calculate popularity based on position (earlier = more popular)
        const popularityScore = Math.max(30, 90 - (index * 5));
        
        // Generate aliases for common variations
        const aliases = generateAliases(level3Tag);
        
        lookupDocuments.push({
          level3_tag: level3Tag,
          level1_key: level1Key,
          level1_name: level1Name,
          level2_key: level2Key,
          level2_name: level2Name,
          hierarchy_path: hierarchyPath,
          aliases: aliases,
          continent_weight: new Map(Object.entries(continentWeight)),
          country_weight: new Map(Object.entries(countryWeight)),
          popularity_score: popularityScore,
          isActive: true
        });
      });
    });
  });
  
  console.log(`📊 Generated ${genreDocuments.length} genre documents`);
  console.log(`📊 Generated ${lookupDocuments.length} lookup documents`);
  
  // Save to JSON files for import
  const genresFilePath = path.join(__dirname, 'genres-seed.json');
  const lookupsFilePath = path.join(__dirname, 'genre-lookups-seed.json');
  
  fs.writeFileSync(genresFilePath, JSON.stringify(genreDocuments, null, 2));
  fs.writeFileSync(lookupsFilePath, JSON.stringify(lookupDocuments, null, 2));
  
  console.log(`✅ Saved genres seed data to: ${genresFilePath}`);
  console.log(`✅ Saved lookups seed data to: ${lookupsFilePath}`);
  
  return { genreDocuments, lookupDocuments };
}

function generateAliases(genreTag) {
  const aliases = [];
  
  // Common variations
  if (genreTag.includes('latin')) {
    aliases.push(genreTag.replace('latin', 'latino'));
    aliases.push(genreTag.replace('latin', 'latinx'));
  }
  
  if (genreTag.includes('indie')) {
    aliases.push(genreTag.replace('indie', 'independent'));
    aliases.push(genreTag.replace('indie', 'alternativo'));
  }
  
  if (genreTag.includes('rock')) {
    aliases.push(genreTag.replace('rock', 'rock music'));
  }
  
  if (genreTag.includes('metal')) {
    aliases.push(genreTag.replace('metal', 'metal music'));
  }
  
  // Spanish translations for common terms
  if (genreTag === 'rock en español') {
    aliases.push('spanish rock', 'rock español', 'rock hispano');
  }
  
  if (genreTag === 'latin indie') {
    aliases.push('indie latino', 'indie latinoamericano', 'latin independent');
  }
  
  return aliases.filter(Boolean);
}

// Export for use in migration scripts
module.exports = { seedGenreData };

// Run if called directly
if (require.main === module) {
  seedGenreData().catch(console.error);
}