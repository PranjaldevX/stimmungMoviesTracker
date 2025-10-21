# Stimmung - Mood-Based Classic Movie Recommender

## Overview

Stimmung is a web application that helps users discover classic films from Bollywood, Hollywood, and international cinema based on their current mood. The app combines traditional filter-based search with AI-powered mood interpretation to provide personalized movie recommendations. Users can either select predefined mood tags or describe their feelings in natural language, which the AI interprets to find matching classic films. The application integrates with TMDb for movie data and Watchmode API for streaming availability information.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- `MovieCard`: Rich movie display with poster, metadata, and streaming sources
- `ResultsGrid`: Responsive grid layout for search results

### Backend Architecture

**Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM module system
- **Development Server**: Integrated Vite development server in middleware mode for HMR

**API Design**: RESTful endpoints with JSON request/response format
- `/api/health`: Health check endpoint
- `/api/interpret-mood`: AI-powered mood interpretation using Gemini
- `/api/search-movies`: Movie search with mood and filter parameters
- `/api/movie/:id/availability`: Streaming availability lookup

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