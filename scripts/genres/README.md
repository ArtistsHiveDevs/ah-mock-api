# 🎵 Genre System Implementation

This directory contains the complete implementation of the hierarchical genre system for the bookmarks application.

## Overview

The genre system provides:
- **3-level genre hierarchy**: Level 1 (Latin Music) → Level 2 (Latin Pop & Rock) → Level 3 (latin indie, rock en español)
- **Hybrid search**: Detects genres in text queries ("latin indie artists") + explicit dropdown filters
- **Geographic relevance**: Boosts results based on user location (country/continent)
- **Performance optimized**: Uses EntityDirectory for fast filtering with proper indexing

## Files

### Core Schema Files
- `Genre.schema.js` - Main genre hierarchy collection (Level 1 + Level 2 + Level 3 array)
- `GenreLookup.schema.js` - Fast lookup collection (Level 3 → hierarchy mapping)

### Data Generation
- `seedGenreData.js` - Generates genre seed data from server-genres.json structure
- `migrateGenreData.js` - Populates EntityDirectory with genre classifications from places_genres.json

### Testing & Setup
- `testGenreSearch.js` - Test cases for genre-enhanced search functionality  
- `setupGenreSystem.js` - Complete setup script for the entire genre system

## Updated Files

### Search Function Enhanced
**File:** `../../operations/domain/all/router.js`

**New Features:**
- `detectGenresInText()` - Parses text queries for genre keywords
- `buildGenreFilters()` - Combines explicit + detected genre filters  
- `basicGenreDetection()` - Fallback when GenreLookup model doesn't exist
- Enhanced aggregation pipeline with genre + geographic scoring

### EntityDirectory Schema
**File:** `../../models/appbase/EntityDirectory.js`

**Added Fields:**
- `genres.level1_key` - Primary genre category
- `genres.level2_key` - Subgenre category
- `genres.hierarchy_path` - Full hierarchy path
- `genres.primary_tags` - Top genre tags for entity
- `genres.continent_relevance` - Geographic relevance
- `genres.country_relevance` - Country-specific relevance
- `genres.all_tags` - All genre tags (indexed for search)

## Quick Start

### 1. Run Complete Setup
```bash
# Setup entire genre system
node setupGenreSystem.js

# Or for production
node setupGenreSystem.js production
```

### 2. Test Search Function
```bash
# Test genre-enhanced search
node testGenreSearch.js
```

### 3. Run Migration (when ready)
```bash
# Populate venues with genre data
node migrateGenreData.js
```

## API Usage

### New Search Parameters

```javascript
// Text-based genre detection
GET /api/search?q=latin indie artists

// Explicit genre filters  
GET /api/search?genre_l1=latin&genre_l2=latin_pop_rock
GET /api/search?genre_tags=salsa,cumbia,latin indie

// Geographic boosting
GET /api/search?q=music&country=colombia&continent=south_america

// Combined filters
GET /api/search?q=venues&genre_l1=latin&country=colombia&et=Place
```

### Search Examples

```javascript
// Natural language queries
"rock bands bogota"     → Detects: level1="rock" + location boost
"latin indie artists"   → Detects: level3="latin indie" → maps to hierarchy  
"salsa venues madrid"   → Detects: level3="salsa" + geographic relevance
"cumbia this weekend"   → Genre + availability (future feature)

// Explicit filter combinations
q: "venues in madrid" + genre_l2: "salsa_tropical"
q: "indie music" + genre_l1: "latin" → Narrows to latin indie
```

## Data Structure

### Genre Collection
```javascript
{
  level1_key: "latin",
  level1_name: "Latin Music", 
  level2_key: "latin_pop_rock",
  level2_name: "Latin Pop & Rock",
  level3_genres: ["latin indie", "latin pop", "rock en español"],
  hierarchy_path: "latin.latin_pop_rock",
  continent_weight: { south_america: 1.0, north_america: 0.8, europe: 0.6 },
  country_weight: { colombia: 0.9, mexico: 0.9, spain: 0.8 }
}
```

### GenreLookup Collection  
```javascript
{
  level3_tag: "latin indie",
  level1_key: "latin",
  level2_key: "latin_pop_rock", 
  hierarchy_path: "latin.latin_pop_rock",
  aliases: ["indie latino", "latin independent"],
  popularity_score: 85,
  continent_weight: { south_america: 1.0, north_america: 0.8 },
  country_weight: { colombia: 0.9, mexico: 0.8, spain: 0.7 }
}
```

### EntityDirectory Genre Fields
```javascript
{
  // ... existing fields ...
  genres: {
    level1_key: "latin",
    level1_name: "Latin Music",
    level2_key: "latin_pop_rock", 
    level2_name: "Latin Pop & Rock",
    hierarchy_path: "latin.latin_pop_rock",
    primary_tags: ["latin indie", "rock en español"],
    continent_relevance: "south_america",
    country_relevance: ["colombia", "mexico", "spain"],
    all_tags: ["latin indie", "latin pop", "rock en español"],
    search_keywords: "latin music latin pop rock latin indie"
  }
}
```

## Performance

### Indexes Created
- EntityDirectory: `{ entityType: 1, "genres.level1_key": 1, isActive: 1 }`
- EntityDirectory: `{ "genres.all_tags": 1 }`  
- Genre: `{ level1_key: 1, level2_key: 1 }`
- GenreLookup: `{ level3_tag: 1, hierarchy_path: 1 }`

### Query Performance
- **Target**: < 100ms for genre-filtered searches
- **Optimizations**: Compound indexes, aggregation pipeline scoring
- **Monitoring**: Track query execution time and index utilization

## Storage Usage

### Estimated Storage (MongoDB Free Tier: 500MB)
- **Genre Collection**: ~139 documents × 800 bytes = 111KB
- **GenreLookup Collection**: ~2000 documents × 600 bytes = 1.2MB
- **EntityDirectory Updates**: +250 bytes per entity
- **Indexes**: ~15MB for all genre-related indexes
- **Total Additional**: ~94MB (well within 500MB limit)

## Future Extensions

### Phase 2: Availability Integration (2-3 weeks)
- Parameters already reserved: `availability_date`, `availability_range`
- No breaking changes to genre system
- Combine genre + availability filters for optimal UX

### Phase 3: Advanced Features
- Genre recommendations based on user preferences
- Trending genres by geographic region  
- Auto-classification improvements based on usage data
- Machine learning genre detection for new content

## Troubleshooting

### Common Issues

**GenreLookup model not found**
- The search function gracefully falls back to basic genre detection
- Run `setupGenreSystem.js` to create the collections

**No genre matches found**
- Check if genre tags in places_genres.json match Level 3 genres in server-genres.json
- Update genre classification logic in `migrateGenreData.js`

**Slow query performance**  
- Verify indexes are created: `db.entitydirectories.getIndexes()`
- Monitor query execution: `db.entitydirectories.find().explain("executionStats")`

**Storage limit exceeded**
- Consider archiving old/inactive entities
- Optimize genre tag arrays (limit to top 10 per entity)
- Use separate database for analytics/historical data

## Support

For issues or questions about the genre system implementation:
1. Check the test cases in `testGenreSearch.js`
2. Review the setup logs from `setupGenreSystem.js`
3. Verify data integrity with database queries
4. Monitor application logs for genre-related warnings