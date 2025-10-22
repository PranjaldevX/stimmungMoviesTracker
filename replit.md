# Stimmung - Mood-Based Movie & Series Tracker

## Overview

Stimmung is a comprehensive web application that helps users discover movies and TV series from around the world based on their current mood. The app now supports:
- **Regional Indian Cinema**: Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, Marathi, Punjabi movies
- **International Web Series**: Korean dramas, Turkish series, English shows
- **Superhero Content**: Dedicated mood/category for Marvel, DC, and superhero films
- **Content Type Toggle**: Switch between Movies and TV Series seamlessly
- **Language-Based Search**: Filter content by multiple languages simultaneously
- **Streaming Integration**: See where content is available (Netflix, Prime, Hotstar, Zee5, etc.)

The application combines traditional filter-based search with AI-powered mood interpretation to provide personalized recommendations. Users can either select predefined mood tags or describe their feelings in natural language, which the AI interprets to find matching content.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 22, 2025)

### Extended Regional & International Content Support
- **Regional Indian Movies**: Full support for 8 Indian languages (Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, Marathi, Punjabi)
- **International Web Series**: Added Korean (K-dramas), Turkish, and Pakistani content support
- **Superhero Category**: New "Energized" mood maps to superhero movies from Marvel, DC, and other franchises
- **Content Type Unified Schema**: Movies and TV Series use discriminated union types (`Movie | TVSeries`)
- **Language Filters**: Multi-select language filter UI with 11 language options
- **Streaming Platforms**: Expanded to include Indian platforms (Hotstar, Zee5, SonyLIV, Voot) alongside international ones

### TMDB API Integration Updates
- Language-aware content discovery using region codes (hi-IN, ta-IN, te-IN, ml-IN, kn-IN, bn-IN, mr-IN, pa-IN, ko-KR, tr-TR, ur-PK)
- TV series search with `discover/tv` endpoint
- Superhero genre filtering using keywords (Marvel, DC, Avengers, Batman, Superman, Spider-Man, etc.)
- Dubbed content detection via title analysis
- Number of seasons tracking for TV series
- First air date mapping for series

### WatchMode API Integration Updates  
- Added Indian region filtering (`regions=IN`) for regional streaming platforms
- Platform mapping includes Hotstar, Zee5, SonyLIV, Voot, Eros Now, Alt Balaji
- Streaming availability for both movies and TV series

### Frontend UI Enhancements
- **Movies/TV Series Toggle**: Pill-style toggle in hero section to switch content types
- **Language Filter Section**: Multi-select buttons for 11 languages (Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, Marathi, Punjabi, English, Korean, Turkish)
- **Enhanced Movie Cards**: Now display TV series icon, season count, and dubbed badges
- **Updated Hero Copy**: "From Bollywood to Hollywood, Korean dramas to superhero sagas"
- **Content Type-Aware Search Button**: Changes text to "Find My Movies" or "Find My Series"

### Backend Route Updates
- `POST /api/search-movies`: Now accepts `contentType` ("movie" | "tv") and `languages` array
- Search response returns both `movies: Movie[]` and `tvSeries: TVSeries[]`
- Language codes validated against supported list
- Backward compatible with existing API contracts

### Movie Detail Modal Feature
- Implemented clickable movie cards that open a detailed modal view
- Added new API endpoint `/api/movie/:id/credits` to fetch cast information
- Created `MovieDetailModal` component displaying:
  - Full movie/series overview and synopsis
  - Backdrop image with gradient overlay
  - Cast members with profile pictures (up to 10 actors)
  - Streaming platform availability with direct links
  - Runtime/seasons, release year, rating, and genres
  - TV series icon for series content
- Modal fetches cast data dynamically with loading and error states
- Added proper error handling and empty states for failed API calls

### API Configuration Centralization
- Created `server/config/api.ts` for centralized API management
- All services (Gemini, TMDb, Watchmode) now import from centralized config
- To upgrade to premium models or switch providers, simply edit `server/config/api.ts`
- Example: Change `GEMINI_CONFIG.model` from "gemini-2.5-pro" to "gemini-2.5-flash" in one line

### Era Filter Implementation
- Added decade-based era filtering (1950s through 2020s)
- Era options defined in `shared/schema.ts` with `eraOptions` array
- UI dropdown in Home page allows users to select specific decades
- Filters apply to TMDb search queries via yearFrom/yearTo parameters
- Default era set to "All Classics" (1950-2025)

### Footer Cleanup
- Removed TMDb attribution and logo from footer
- Simplified footer to 3 columns instead of 4
- Professional appearance without third-party branding

### Recommended Movies Fallback
- When search returns no results, app now shows 3 curated classics:
  - The Godfather (1972)
  - The Godfather Part II (1974)
  - Schindler's List (1993)
- Implemented in `server/routes.ts` and `server/services/tmdb.ts`
- Ensures users always see quality recommendations

### Bug Fixes
- Fixed Navigation component nested anchor tag warning
- Link component from wouter now used correctly without wrapper tags
- Fixed type safety issues with Content discriminated union
- Updated all components to handle both Movie and TVSeries types

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript and Vite
- **Routing**: wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state and data fetching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system based on cinematic aesthetics

**Design Philosophy**: The application follows a reference-based design approach inspired by Netflix (discovery patterns), Letterboxd (cinephile aesthetic), and Spotify (mood-based UX). The color system features mood-driven theming with dynamic accent colors that shift based on selected moods (happy/yellow, sad/blue, nostalgic/amber, energized/purple for superhero content, etc.). Typography uses a combination of 'Libre Baskerville' for cinematic headers, 'Inter' for body text, and 'DM Sans' for UI elements.

**Key Components**:
- `MoodSelector`: Visual mood selection with icon-based buttons (includes new "Energized" superhero mood)
- `AIMoodInterpreter`: Text input for natural language mood descriptions (language-aware)
- `MovieCard`: Rich content display with poster, metadata, streaming sources, TV icon for series, dubbed badges
- `MovieDetailModal`: Full movie/series details modal with cast, streaming platforms, and synopsis
- `ResultsGrid`: Responsive grid layout for search results supporting both movies and series
- `Navigation`: App header with theme toggle
- `Footer`: Simplified footer without third-party branding

### Backend Architecture

**Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM module system
- **Development Server**: Integrated Vite development server in middleware mode for HMR

**API Design**: RESTful endpoints with JSON request/response format
- `/api/health`: Health check endpoint
- `/api/interpret-mood`: AI-powered mood interpretation using Gemini (language-aware)
- `/api/search-movies`: Movie/series search with mood, language, and content type filters
- `/api/movie/:id/availability`: Streaming availability lookup (supports Indian platforms)
- `/api/movie/:id/credits`: Movie/series cast and crew information from TMDb

**Data Storage**: In-memory storage implementation with interface-based design (`IStorage`) allowing future migration to persistent database. Current implementation uses `MemStorage` with Maps for movie cache and feedback storage.

**Rationale**: The in-memory approach was chosen for rapid prototyping and testing. The storage interface provides abstraction for future database integration without requiring API changes.

### AI Integration

**Service**: Google Gemini AI (gemini-2.5-pro model)
- **Purpose**: Natural language processing to convert user mood descriptions into structured search parameters
- **Language Awareness**: Can interpret queries like "Hindi dubbed Korean drama" or "Tamil action movie"
- **Output Schema**: JSON-formatted mood interpretations with mood type, preferred genres, runtime preferences, era ranges, language preferences, and confidence scores
- **Fallback**: System can operate with direct mood selection if AI interpretation is unavailable

**Design Decision**: Gemini was selected for its strong natural language understanding and JSON schema support, enabling reliable structured outputs for search parameter generation. The model can understand multilingual context and regional preferences.

### Movie Data Sources

**TMDb (The Movie Database)**:
- Primary source for movie and TV series metadata (titles, descriptions, posters, ratings, genres)
- Genre mapping system converts natural language genres to TMDb genre IDs
- Superhero keyword filtering for Marvel, DC, and other superhero content
- Multi-language support for 11 languages across Indian, Korean, Turkish, and English content
- Region-specific content discovery (hi-IN, ta-IN, te-IN, ml-IN, kn-IN, bn-IN, mr-IN, pa-IN, en-US, ko-KR, tr-TR, ur-PK)
- TV series metadata including number of seasons, episode count, first air date
- Dubbed content detection via title pattern matching

**Watchmode API**:
- Provides streaming availability data across multiple platforms globally and in India
- Supports Netflix, Prime Video, Hotstar, Zee5, SonyLIV, Voot, Eros Now, Alt Balaji, and more
- Returns platform names, types (subscription/rent/buy), and web URLs
- Asynchronous loading to avoid blocking search results
- Regional filtering for accurate Indian platform availability

**Architecture Pattern**: Data fetching follows a two-tier approach - initial search results load quickly from TMDb, followed by progressive enhancement with streaming data from Watchmode. Content type (movie vs series) is handled via discriminated union types for type safety.

### Data Validation

**Zod Schema Validation**: All API inputs and outputs use Zod schemas for type-safe validation
- `searchRequestSchema`: Validates search parameters including contentType and languages
- `moodInterpretationSchema`: Validates AI interpretation results
- `movieSchema`: Ensures movie data consistency with contentType discriminator
- `tvSeriesSchema`: Validates TV series specific fields (numberOfSeasons, firstAirDate)
- `contentSchema`: Union type for Movie | TVSeries with discriminated union on contentType

## Supported Languages & Regions

### Indian Languages (8)
- Hindi (hi)
- Tamil (ta)
- Telugu (te)
- Malayalam (ml)
- Kannada (kn)
- Bengali (bn)
- Marathi (mr)
- Punjabi (pa)

### International Languages (3)
- English (en)
- Korean (ko) - K-dramas and Korean movies
- Turkish (tr) - Turkish series and cinema

### Streaming Platforms
- **Global**: Netflix, Prime Video, Apple TV+, Disney+, Hulu, HBO Max
- **Indian**: Hotstar, Zee5, SonyLIV, Voot, Eros Now, Alt Balaji, Jio Cinema

## Content Categories

### Moods
- Happy (Comedy, Romance)
- Sad (Drama, emotional stories)
- Nostalgic (Period pieces, retro content)
- Adventurous (Action, Adventure, Thriller)
- Romantic (Romance, Drama)
- Energized (Superhero, Action - NEW)
- Relaxed (Slice of life, Light-hearted)
- Curious (Mystery, Sci-Fi, Documentary)

### Superhero Content
The "Energized" mood specifically maps to superhero content using keyword filtering:
- Marvel Cinematic Universe (Avengers, Iron Man, Spider-Man, etc.)
- DC Extended Universe (Batman, Superman, Wonder Woman, etc.)
- Other superhero franchises (X-Men, Guardians of the Galaxy, etc.)

## External Dependencies

### Third-Party APIs

1. **TMDb API** (`TMDB_API_KEY`)
   - Movie and TV series metadata, posters, ratings, genre information
   - Discovery and search endpoints for regional and international content
   - Credit information for cast and crew
   - Required for core search functionality

2. **Watchmode API** (`WATCHMODE_API_KEY`)
   - Streaming availability across global and Indian platforms
   - Optional enhancement - app functions without it
   - Regional filtering for accurate Indian platform data

3. **Google Gemini AI** (configured via OpenAI integration)
   - Natural language mood interpretation with language awareness
   - Falls back to manual mood selection if unavailable
   - Can interpret multilingual queries

### Database

**Current**: In-memory storage (development/testing)
**Planned**: PostgreSQL with Drizzle ORM
- Drizzle configuration already present (`drizzle.config.ts`)
- Schema defined in `shared/schema.ts`
- Migration system configured for future database integration

**Note**: The application uses `@neondatabase/serverless` for planned Neon PostgreSQL integration but currently operates without persistent storage.

### UI Framework

**Radix UI**: Headless component primitives for accessibility
- Comprehensive set of 25+ components (Dialog, Popover, Tooltip, etc.)
- Built-in keyboard navigation and ARIA attributes
- Styled with Tailwind CSS via shadcn/ui patterns

### Build Tools

- **Vite**: Fast development server and optimized production builds
- **TypeScript**: Type safety across frontend and backend
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **esbuild**: Backend bundling for production deployment

### Development Environment

**Replit Integration**:
- Cartographer plugin for code navigation
- Runtime error overlay for debugging
- Dev banner in development mode
- Configured for Replit's deployment workflow

## Feature Highlights

### What Makes Stimmung Unique
1. **Mood-First Discovery**: Unlike traditional filters, users express their feelings first
2. **Regional Diversity**: Equal support for Hollywood, Bollywood, and regional Indian cinema
3. **Language Flexibility**: Multi-language filtering and dubbed content detection
4. **AI-Powered**: Natural language understanding for nuanced mood interpretation
5. **Streaming Integration**: One-click access to where content is available
6. **Content Type Flexibility**: Seamlessly switch between movies and TV series
7. **Superhero Category**: Dedicated filtering for superhero content across Marvel and DC
8. **Progressive Enhancement**: Fast initial load with async streaming data

## Migration Notes

### Successfully Migrated From Previous Agent
- All features from original Stimmung app preserved and extended
- npm/tsx dependency conflicts resolved
- API integrations verified working (TMDB, WatchMode)
- Schema extended to support TV series and regional content
- Frontend UI enhanced with language filters and content type toggle
- All existing mood-based filtering preserved
- Dark mode support maintained
- Responsive design intact

### Future Enhancements
- User authentication and watchlist feature
- Personalized recommendations based on viewing history
- Social features (reviews, ratings, lists)
- Migration from in-memory to PostgreSQL database
- Expanded AI capabilities for contextual recommendations
- More granular genre filtering within languages
