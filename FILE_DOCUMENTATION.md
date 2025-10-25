# Project File Documentation

## Overview
**Stimmung** is a mood-based movie and TV series recommendation application that uses AI to interpret user moods and find matching content from multiple sources (TMDb, OMDb, TVmaze, and Watchmode).

---

## Directory Structure

### `/client` - Frontend Application

#### `/client/src/components`
UI components built with React and Shadcn UI.

**Core Components:**
- **`AdvancedFilters.tsx`** - Collapsible advanced filtering options (time period, regional focus, old classics toggle)
- **`AIMoodInterpreter.tsx`** - Text area interface for users to describe their mood in natural language
- **`Footer.tsx`** - Application footer with links and branding
- **`GenreFilter.tsx`** - Multi-select genre filter with visual badges
- **`MoodFilter.tsx`** - Dropdown selector for mood selection (deprecated in new UI)
- **`MoodSelector.tsx`** - Grid-based mood selector with icons and visual indicators
- **`MovieCard.tsx`** - Individual movie/TV show card displaying poster, title, rating, genres, and streaming availability
- **`MovieDetailModal.tsx`** - Full-screen modal showing detailed information about a movie/TV show including cast, streaming sources, and metadata
- **`Navigation.tsx`** - Top navigation bar with search functionality
- **`ResultsGrid.tsx`** - Grid layout for displaying search results with loading and empty states

#### `/client/src/components/ui`
Reusable UI components from Shadcn UI (pre-built):
- `accordion.tsx`, `alert-dialog.tsx`, `aspect-ratio.tsx`, `avatar.tsx`
- `badge.tsx` - Styled pill/tag component
- `button.tsx` - Button component with variants
- `card.tsx` - Card container components
- `checkbox.tsx` - Checkbox input component
- `collapsible.tsx` - Expandable/collapsible content
- `dialog.tsx` - Modal dialog component
- `dropdown-menu.tsx`, `form.tsx`, `hover-card.tsx`
- `input.tsx` - Text input component
- `label.tsx` - Form label component
- `menubar.tsx`, `navigation-menu.tsx`, `popover.tsx`
- `progress.tsx`, `radio-group.tsx` - Radio button group
- `scroll-area.tsx` - Scrollable container
- `select.tsx` - Dropdown select component
- `separator.tsx` - Visual divider
- `slider.tsx` - Range slider component
- `switch.tsx`, `tabs.tsx`, `textarea.tsx`, `toast.tsx`, `toggle.tsx`, `tooltip.tsx`

#### `/client/src/pages`
Page components for routing:
- **`Home.tsx`** - Main landing page with mood-based search, filters sidebar, and results display
- **`Discover.tsx`** - Additional discovery features (if implemented)
- **`not-found.tsx`** - 404 error page

#### `/client/src/hooks`
Custom React hooks:
- **`use-mobile.tsx`** - Hook to detect mobile viewport
- **`use-toast.ts`** - Toast notification management

#### `/client/src/lib`
Utility libraries:
- **`queryClient.ts`** - TanStack Query configuration and API request wrapper
- **`utils.ts`** - Utility functions (className merging, etc.)

#### Root Client Files
- **`App.tsx`** - Main app component with routing setup
- **`main.tsx`** - React entry point
- **`index.css`** - Global styles and Tailwind CSS setup
- **`index.html`** - HTML template

---

### `/server` - Backend Application

#### `/server/config`
- **`api.ts`** - Centralized API configuration for Gemini, TMDb, OMDb, and Watchmode APIs

#### `/server/services`
API integration services:

- **`gemini.ts`** - Google Gemini AI integration for natural language mood interpretation
  - Function: `interpretMood(text: string)` - Converts user text to structured mood data
  
- **`tmdb.ts`** - The Movie Database (TMDb) API integration
  - Functions: `searchMoviesByMood()`, `searchTVSeriesByMood()`, `getMovieDetails()`, `getTVSeriesDetails()`
  - Primary source for modern movies and TV series data
  
- **`omdb.ts`** - Open Movie Database API integration
  - Functions: `searchOMDbMovies()`, `getOMDbMovieByIMDbId()`, `searchClassicMovies()`
  - Fallback source for classic films and IMDb data
  
- **`tvmaze.ts`** - TVmaze API integration
  - Functions: `searchTVMazeShows()`, `getTVMazeShow()`, `searchRegionalDramas()`
  - Source for regional TV dramas (Korean, Turkish, Pakistani, etc.)
  
- **`watchmode.ts`** - Watchmode API integration
  - Function: `getStreamingAvailability(imdbId: string)` - Fetches where content is available to stream
  
- **`multi-api.ts`** - Orchestration layer
  - Coordinates between TMDb, OMDb, and TVmaze to provide comprehensive results
  - Merges data from multiple sources with smart fallback logic

#### Root Server Files
- **`index.ts`** - Express server entry point, starts both backend and Vite dev server
- **`routes.ts`** - API route definitions:
  - `POST /api/search-movies` - Main search endpoint
  - `GET /api/movie/:id/availability` - Streaming availability
  - `GET /api/movie/:id/credits` - Cast and crew information
  - `POST /api/feedback` - User feedback (like/dislike)
- **`storage.ts`** - In-memory storage interface and implementation for caching movie data and feedback
- **`vite.ts`** - Vite middleware configuration for serving frontend

---

### `/shared`
Shared types and schemas between frontend and backend:

- **`schema.ts`** - Zod schemas and TypeScript types
  - Mood types: `Mood`, `moodConfig`
  - Content types: `Movie`, `TVSeries`, `Content`
  - API types: `SearchRequest`, `SearchResponse`, `MoodInterpretation`
  - Streaming: `StreamingSource`
  - Configuration: `eraOptions`, `languages`, `languageLabels`

---

### Root Files

#### Configuration Files
- **`package.json`** - Node.js dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`vite.config.ts`** - Vite bundler configuration with path aliases
- **`tailwind.config.ts`** - Tailwind CSS configuration with custom colors and animations
- **`postcss.config.js`** - PostCSS configuration for Tailwind
- **`components.json`** - Shadcn UI component configuration
- **`drizzle.config.ts`** - Drizzle ORM configuration (for potential database use)

#### Documentation
- **`replit.md`** - Project overview and architecture documentation
- **`design_guidelines.md`** - UI/UX design guidelines and color schemes

---

## Key Features

### 1. **AI Mood Interpretation**
- Uses Google Gemini AI (`gemini-2.5-pro`) to understand natural language descriptions
- Converts text like "feeling nostalgic" into structured search parameters
- Returns mood type, genres, runtime preferences, era, and language preferences

### 2. **Multi-API Integration**
- **TMDb**: Primary source for modern content, 500,000+ movies and TV shows
- **OMDb**: Fallback for classic films, IMDb ratings, and awards
- **TVmaze**: Regional dramas and niche web series
- **Watchmode**: Streaming availability across platforms (Netflix, Prime, Hulu, etc.)

### 3. **Smart Caching**
- 15-minute in-memory cache for search results
- Reduces redundant API calls and improves performance
- Cache includes hit/miss logging for monitoring

### 4. **Comprehensive Filtering**
- **Mood-based**: 14 different moods (Happy, Sad, Nostalgic, Adventurous, etc.)
- **Genre**: 18 genres including Drama, Action, Romance, etc.
- **Language**: 15 languages including Hindi, Tamil, Korean, Turkish, etc.
- **Era/Decade**: Slider from 1950s to 2020s
- **Content Type**: Movies or TV Series
- **Regional Focus**: Bollywood, Hollywood, Korean, Turkish, etc.

### 5. **Streaming Availability**
- Shows where content is available to watch
- Supports both US and India regions
- Displays streaming service names, types (subscription/rent/buy), and links

### 6. **User Feedback**
- Like/dislike functionality for personalized recommendations
- Stores feedback in memory for session-based learning

---

## Data Flow

1. **User Input** → Mood selection or text description
2. **Frontend** → Sends search request to backend
3. **Backend** → 
   - If text: Gemini AI interprets mood
   - Searches TMDb, OMDb, TVmaze based on filters
   - Merges results from multiple sources
4. **Streaming Data** → Fetches availability from Watchmode for each result
5. **Response** → Returns movies/TV shows with metadata and streaming info
6. **Frontend** → Displays results in grid with cards and modals

---

## API Keys Required

1. **GEMINI_API_KEY** - Google Gemini AI (https://aistudio.google.com/apikey)
2. **TMDB_API_KEY** - The Movie Database (https://www.themoviedb.org/settings/api)
3. **WATCHMODE_API_KEY** - Watchmode (https://api.watchmode.com/)
4. **OMDB_API_KEY** - OMDb (https://www.omdbapi.com/apikey.aspx)

All keys are stored in Replit Secrets and accessed via environment variables.

---

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Pre-built component library
- **TanStack Query** - Data fetching and caching
- **Wouter** - Lightweight routing
- **Zod** - Schema validation
- **Framer Motion** - Animations

### Backend
- **Express.js** - Web server
- **TypeScript** - Type safety
- **Axios** - HTTP client for API calls
- **Zod** - Request/response validation

### APIs & Services
- **Google Gemini AI** - Natural language processing
- **TMDb API** - Movie/TV data
- **OMDb API** - Additional movie metadata
- **TVmaze API** - TV series data
- **Watchmode API** - Streaming availability
