# Stimmung - Mood-Based Classic Movie Recommender

## Overview

Stimmung is a web application that helps users discover classic films from Bollywood, Hollywood, and international cinema based on their current mood. The app combines traditional filter-based search with AI-powered mood interpretation to provide personalized movie recommendations. Users can either select predefined mood tags or describe their feelings in natural language, which the AI interprets to find matching classic films. The application integrates with TMDb for movie data and Watchmode API for streaming availability information.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 22, 2025)

### Movie Detail Modal Feature
- Implemented clickable movie cards that open a detailed modal view
- Added new API endpoint `/api/movie/:id/credits` to fetch cast information
- Created `MovieDetailModal` component displaying:
  - Full movie overview and synopsis
  - Movie backdrop image with gradient overlay
  - Cast members with profile pictures (up to 10 actors)
  - Streaming platform availability with direct links
  - Runtime, release year, rating, and genres
- Modal fetches cast data dynamically with loading and error states
- Added proper error handling and empty states for failed API calls
- Improved user experience with seamless detail viewing without leaving the browsing context

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

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript and Vite
- **Routing**: wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state and data fetching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system based on cinematic aesthetics

**Design Philosophy**: The application follows a reference-based design approach inspired by Netflix (discovery patterns), Letterboxd (cinephile aesthetic), and Spotify (mood-based UX). The color system features mood-driven theming with dynamic accent colors that shift based on selected moods (happy/yellow, sad/blue, nostalgic/amber, etc.). Typography uses a combination of 'Libre Baskerville' for cinematic headers, 'Inter' for body text, and 'DM Sans' for UI elements.

**Key Components**:
- `MoodSelector`: Visual mood selection with icon-based buttons
- `AIMoodInterpreter`: Text input for natural language mood descriptions
- `MovieCard`: Rich movie display with poster, metadata, and streaming sources (clickable to open details)
- `MovieDetailModal`: Full movie details modal with cast, streaming platforms, and synopsis
- `ResultsGrid`: Responsive grid layout for search results with modal state management

### Backend Architecture

**Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM module system
- **Development Server**: Integrated Vite development server in middleware mode for HMR

**API Design**: RESTful endpoints with JSON request/response format
- `/api/health`: Health check endpoint
- `/api/interpret-mood`: AI-powered mood interpretation using Gemini
- `/api/search-movies`: Movie search with mood and filter parameters
- `/api/movie/:id/availability`: Streaming availability lookup
- `/api/movie/:id/credits`: Movie cast and crew information from TMDb

**Data Storage**: In-memory storage implementation with interface-based design (`IStorage`) allowing future migration to persistent database. Current implementation uses `MemStorage` with Maps for movie cache and feedback storage.

**Rationale**: The in-memory approach was chosen for rapid prototyping and testing. The storage interface provides abstraction for future database integration without requiring API changes.

### AI Integration

**Service**: Google Gemini AI (gemini-2.5-pro model)
- **Purpose**: Natural language processing to convert user mood descriptions into structured search parameters
- **Output Schema**: JSON-formatted mood interpretations with mood type, preferred genres, runtime preferences, era ranges, and confidence scores
- **Fallback**: System can operate with direct mood selection if AI interpretation is unavailable

**Design Decision**: Gemini was selected for its strong natural language understanding and JSON schema support, enabling reliable structured outputs for search parameter generation.

### Movie Data Sources

**TMDb (The Movie Database)**:
- Primary source for movie metadata (titles, descriptions, posters, ratings, genres)
- Genre mapping system converts natural language genres to TMDb genre IDs
- Focus on classic films with era filtering (default: 1970-2005)
- Multi-language support for Hindi, English, Spanish, Italian, and German films

**Watchmode API**:
- Provides streaming availability data across multiple platforms
- Returns platform names, types (subscription/rent/buy), and web URLs
- Asynchronous loading to avoid blocking search results

**Architecture Pattern**: Data fetching follows a two-tier approach - initial search results load quickly from TMDb, followed by progressive enhancement with streaming data from Watchmode.

### Data Validation

**Zod Schema Validation**: All API inputs and outputs use Zod schemas for type-safe validation
- `searchRequestSchema`: Validates search parameters
- `moodInterpretationSchema`: Validates AI interpretation results
- `movieSchema`: Ensures movie data consistency

## External Dependencies

### Third-Party APIs

1. **TMDb API** (`TMDB_API_KEY`)
   - Movie metadata, posters, ratings, genre information
   - Discovery and search endpoints for classic film filtering
   - Required for core movie search functionality

2. **Watchmode API** (`WATCHMODE_API_KEY`)
   - Streaming availability across platforms
   - Optional enhancement - app functions without it

3. **Google Gemini AI** (`GEMINI_API_KEY`)
   - Natural language mood interpretation
   - Falls back to manual mood selection if unavailable

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