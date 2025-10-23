# Stimmung - Mood-Based Movie & Series Tracker

## Overview

Stimmung is a web application designed for discovering movies and TV series globally, based on a user's current mood. It supports a wide array of content including regional Indian cinema (Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, Marathi, Punjabi), international web series (Korean, Turkish, English), and a dedicated category for superhero content (Marvel, DC). The application allows users to seamlessly switch between movies and TV series, filter by multiple languages, and see streaming availability across various platforms (Netflix, Prime, Hotstar, Zee5, etc.). Stimmung differentiates itself by combining traditional filter-based search with AI-powered mood interpretation, enabling personalized recommendations either through predefined mood tags or natural language descriptions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript and Vite, utilizing wouter for routing, TanStack Query for state management, and Radix UI primitives with shadcn/ui for UI components. Styling is managed with Tailwind CSS.
**Design Philosophy**: Inspired by Netflix, Letterboxd, and Spotify, Stimmung features a mood-driven color system with dynamic accent colors and a sophisticated typography scheme (`Libre Baskerville`, `Inter`, `DM Sans`).
**Key Components**: Includes `MoodSelector` (with "Energized" for superhero content), `AIMoodInterpreter`, `MovieCard` (displaying TV series icons, season counts, dubbed badges), `MovieDetailModal` (with cast and streaming info), `ResultsGrid`, `Navigation`, and a simplified `Footer`.

### Backend Architecture

**Framework**: Express.js with TypeScript, running on Node.js with an ESM module system. It integrates a Vite development server for HMR.
**API Design**: RESTful endpoints handle health checks, AI mood interpretation, content search (movies/TV series with mood, language, content type filters), streaming availability lookup, and cast/crew information.
**Data Storage**: Currently uses in-memory storage (`MemStorage`) with an `IStorage` interface, designed for future migration to a persistent database like PostgreSQL with Drizzle ORM.

### AI Integration

**Service**: Google Gemini AI (gemini-2.5-pro model) is used for natural language processing, converting user mood descriptions into structured search parameters. It supports language-aware queries (e.g., "Hindi dubbed Korean drama") and outputs JSON-formatted interpretations including mood type, genres, runtime, era, and language preferences.

### Movie Data Sources

**Multi-API Integration Layer**: Intelligently combines data from three sources:
1. **TMDb (The Movie Database)**: Primary source for modern movies/TV series, metadata, genres, and credit information. Supports multi-language and region-specific content discovery.
2. **OMDb (Open Movie Database)**: Fallback for classic films (pre-1980s) and additional metadata including IMDb ratings and awards.
3. **TVmaze**: Supplementary source for regional TV dramas (Korean, Turkish, etc.) and niche web series.

**Caching Strategy**: 15-minute in-memory cache for search results to reduce redundant API calls. Cache includes hit/miss logging and utility functions for monitoring (`getCacheStats`) and manual invalidation (`clearSearchCache`).

### Data Validation

Zod schema validation is employed across all API inputs and outputs for type safety, including `searchRequestSchema`, `moodInterpretationSchema`, `movieSchema`, `tvSeriesSchema`, and a `contentSchema` union type with a `contentType` discriminator.

### Content Categories

**Moods**: Happy, Sad, Nostalgic, Adventurous, Romantic, Energized (new for superhero content), Relaxed, Curious.
**Superhero Content**: The "Energized" mood specifically targets superhero content from Marvel, DC, and other franchises using keyword filtering.

## External Dependencies

### Third-Party APIs

1.  **TMDb API**: For movie and TV series metadata, discovery, and credit information.
2.  **OMDb API**: For classic films and IMDb data enrichment.
3.  **TVmaze API**: For regional TV dramas and web series.
4.  **Google Gemini AI**: For natural language mood interpretation.

### Database

**Current**: In-memory storage.
**Planned**: PostgreSQL with Drizzle ORM (configuration present, but not yet implemented for persistent storage).

### UI Framework

**Radix UI**: Used for headless, accessible UI primitives, styled with Tailwind CSS via shadcn/ui patterns.

### Build Tools

-   **Vite**: For fast development and optimized production builds.
-   **TypeScript**: For type safety.
-   **PostCSS**: For CSS processing.
-   **esbuild**: For backend bundling.