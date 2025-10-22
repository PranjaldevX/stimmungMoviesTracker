/**
 * Centralized API Configuration
 * 
 * This file makes it easy to swap between different API services.
 * To upgrade to a premium model or switch providers, simply update
 * the configuration in this file.
 */

// ============================================================
// GEMINI AI CONFIGURATION
// ============================================================
// To switch to a different Gemini model, change the model name below
// Options: "gemini-2.5-flash" (faster), "gemini-2.5-pro" (better quality)
export const GEMINI_CONFIG = {
  model: "gemini-2.5-pro" as const,
  apiKey: process.env.GEMINI_API_KEY || "",
};

// ============================================================
// TMDB CONFIGURATION
// ============================================================
export const TMDB_CONFIG = {
  apiKey: process.env.TMDB_API_KEY || "",
  baseUrl: "https://api.themoviedb.org/3" as const,
};

// ============================================================
// WATCHMODE CONFIGURATION
// ============================================================
export const WATCHMODE_CONFIG = {
  apiKey: process.env.WATCHMODE_API_KEY || "",
  baseUrl: "https://api.watchmode.com/v1" as const,
};

// ============================================================
// DEFAULT SEARCH PARAMETERS
// ============================================================
export const DEFAULT_SEARCH_CONFIG = {
  // Default era for classic films
  defaultYearFrom: 1970,
  defaultYearTo: 2005,
  
  // Minimum vote requirements for quality
  minVoteAverage: 7.0,
  minVoteCount: 500,
  
  // Languages to search (in order of priority)
  defaultLanguages: ["hi", "en", "es", "it", "de"],
  
  // Maximum results to return
  maxResults: 20,
};

// ============================================================
// RECOMMENDED MOVIES (Fallback when no results found)
// ============================================================
// These are curated classic films shown when search returns no results
export const RECOMMENDED_MOVIE_IDS = [
  238,    // The Godfather (1972)
  240,    // The Godfather Part II (1974)
  424,    // Schindler's List (1993)
] as const;
