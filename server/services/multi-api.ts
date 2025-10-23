/**
 * Multi-API Integration Service
 * Coordinates between TMDb, OMDb, and TVmaze to provide comprehensive movie/TV data
 * with fallback logic and result merging
 */

import { Movie, TVSeries, Content } from "@shared/schema";
import {
  searchMoviesByMood,
  searchTVSeriesByMood,
  getMovieDetails,
  getTVSeriesDetails,
} from "./tmdb";
import {
  searchOMDbMovies,
  getOMDbMovieByIMDbId,
  searchClassicMovies,
} from "./omdb";
import {
  searchTVMazeByGenre,
  searchRegionalDramas,
  searchTVMazeShows,
  convertTVMazeToTVSeries,
} from "./tvmaze";

export interface SearchOptions {
  genres: string[];
  languages?: string[];
  maxRuntime?: number;
  minRuntime?: number;
  yearFrom?: number;
  yearTo?: number;
  regionalFocus?: string;
  oldClassicsOnly?: boolean;
}

/**
 * Merge data from multiple sources, preferring more complete information
 */
function mergeMovieData(
  tmdbData: Partial<Movie>,
  omdbData?: Partial<Movie>
): Movie {
  return {
    ...tmdbData,
    // Prefer TMDb IDs and core data
    id: tmdbData.id!,
    title: tmdbData.title!,
    contentType: "movie" as const,
    releaseDate: tmdbData.releaseDate || omdbData?.releaseDate || "",
    runtime: tmdbData.runtime ?? omdbData?.runtime ?? null,
    overview: tmdbData.overview || omdbData?.overview || "",
    posterPath: tmdbData.posterPath ?? omdbData?.posterPath ?? null,
    backdropPath: tmdbData.backdropPath ?? null,
    voteAverage: tmdbData.voteAverage || omdbData?.voteAverage || 0,
    voteCount: tmdbData.voteCount || omdbData?.voteCount || 0,
    genres: tmdbData.genres || omdbData?.genres || [],
    originalLanguage: tmdbData.originalLanguage || omdbData?.originalLanguage || "en",
    spokenLanguages: tmdbData.spokenLanguages || omdbData?.spokenLanguages,
    imdbId: tmdbData.imdbId || omdbData?.imdbId,
    // Prefer OMDb for these fields (more detailed)
    cast: omdbData?.cast || tmdbData.cast,
    director: omdbData?.director || tmdbData.director,
    writers: omdbData?.writers || tmdbData.writers,
    awards: omdbData?.awards || tmdbData.awards,
    imdbRating: omdbData?.imdbRating || tmdbData.imdbRating,
    rottenTomatoesRating: omdbData?.rottenTomatoesRating || tmdbData.rottenTomatoesRating,
    // Track API source
    apiSource: omdbData ? "OMDb" : "TMDb",
  } as Movie;
}

/**
 * Merge TV series data from multiple sources
 */
function mergeTVSeriesData(
  tmdbData: Partial<TVSeries>,
  tvmazeData?: Partial<TVSeries>
): TVSeries {
  return {
    ...tmdbData,
    id: tmdbData.id!,
    title: tmdbData.title!,
    contentType: "tv" as const,
    firstAirDate: tmdbData.firstAirDate || tvmazeData?.firstAirDate || "",
    overview: tmdbData.overview || tvmazeData?.overview || "",
    posterPath: tmdbData.posterPath ?? tvmazeData?.posterPath ?? null,
    backdropPath: tmdbData.backdropPath ?? null,
    voteAverage: tmdbData.voteAverage || tvmazeData?.voteAverage || 0,
    voteCount: tmdbData.voteCount || tvmazeData?.voteCount || 0,
    genres: tmdbData.genres || tvmazeData?.genres || [],
    originalLanguage: tmdbData.originalLanguage || tvmazeData?.originalLanguage || "en",
    spokenLanguages: tmdbData.spokenLanguages || tvmazeData?.spokenLanguages,
    imdbId: tmdbData.imdbId || tvmazeData?.imdbId,
    numberOfSeasons: tmdbData.numberOfSeasons || tvmazeData?.numberOfSeasons,
    numberOfEpisodes: tmdbData.numberOfEpisodes || tvmazeData?.numberOfEpisodes,
    status: tmdbData.status || tvmazeData?.status,
    network: tmdbData.network || tvmazeData?.network,
    cast: tvmazeData?.cast || tmdbData.cast,
    apiSource: tvmazeData ? "TVmaze" : "TMDb",
  } as TVSeries;
}

/**
 * Enhanced movie search with multi-API fallback
 */
export async function searchMoviesMultiAPI(
  options: SearchOptions
): Promise<Movie[]> {
  const results: Movie[] = [];
  
  try {
    // 1. Try TMDb first (primary source)
    console.log("Searching TMDb for movies...");
    const tmdbMovies = await searchMoviesByMood(options.genres, {
      languages: options.languages,
      yearFrom: options.yearFrom,
      yearTo: options.yearTo,
    });

    // Add TMDb results
    results.push(...tmdbMovies);

    // 2. If looking for old classics or limited TMDb results, try OMDb
    if (
      options.oldClassicsOnly || 
      (options.yearTo && options.yearTo < 2000) ||
      results.length < 5
    ) {
      console.log("Searching OMDb for classic movies...");
      const omdbMovies = await searchClassicMovies(
        options.genres,
        options.yearFrom,
        options.yearTo
      );

      // Enrich OMDb results or add them if new
      for (const omdbMovie of omdbMovies) {
        const existingIndex = results.findIndex(
          (m) => m.imdbId && m.imdbId === omdbMovie.imdbId
        );

        if (existingIndex >= 0) {
          // Merge with existing TMDb data
          results[existingIndex] = mergeMovieData(
            results[existingIndex],
            omdbMovie as Partial<Movie>
          );
        } else if (omdbMovie.id) {
          // Add new movie from OMDb
          results.push(omdbMovie as Movie);
        }
      }
    }

    // 3. Regional focus enhancements
    if (options.regionalFocus && options.regionalFocus !== "Global") {
      console.log(`Applying regional focus: ${options.regionalFocus}...`);
      // Filter results by region or apply region-specific searches
      // This could be expanded with region-specific APIs in the future
    }

    // Remove duplicates and limit results
    const uniqueResults = Array.from(
      new Map(results.map((m) => [m.id, m])).values()
    );

    return uniqueResults.slice(0, 20);
  } catch (error) {
    console.error("Multi-API movie search error:", error);
    return results;
  }
}

/**
 * Enhanced TV series search with multi-API fallback
 */
export async function searchTVSeriesMultiAPI(
  options: SearchOptions
): Promise<TVSeries[]> {
  const results: TVSeries[] = [];

  try {
    // 1. Try TMDb first
    console.log("Searching TMDb for TV series...");
    const tmdbSeries = await searchTVSeriesByMood(options.genres, {
      languages: options.languages,
      yearFrom: options.yearFrom,
      yearTo: options.yearTo,
    });

    results.push(...tmdbSeries);

    // 2. For regional content, try TVmaze
    if (
      options.regionalFocus &&
      ["Turkish", "Pakistani", "Korean"].includes(options.regionalFocus)
    ) {
      console.log(`Searching TVmaze for ${options.regionalFocus} dramas...`);
      const regionalSeries = await searchRegionalDramas(
        options.regionalFocus,
        options.genres
      );

      for (const tvmazeSeries of regionalSeries) {
        const existingIndex = results.findIndex(
          (s) => s.imdbId && s.imdbId === tvmazeSeries.imdbId
        );

        if (existingIndex >= 0) {
          // Merge with existing TMDb data
          results[existingIndex] = mergeTVSeriesData(
            results[existingIndex],
            tvmazeSeries as Partial<TVSeries>
          );
        } else if (tvmazeSeries.id) {
          // Add new series from TVmaze
          results.push(tvmazeSeries as TVSeries);
        }
      }
    }

    // 3. If still need more results, search TVmaze by genre
    if (results.length < 5) {
      console.log("Searching TVmaze for additional TV series...");
      const tvmazeSeries = await searchTVMazeByGenre(
        options.genres,
        options.yearFrom,
        options.yearTo
      );

      for (const series of tvmazeSeries) {
        if (series.id && !results.some((s) => s.id === series.id)) {
          results.push(series as TVSeries);
        }
      }
    }

    // Remove duplicates and limit results
    const uniqueResults = Array.from(
      new Map(results.map((s) => [s.id, s])).values()
    );

    return uniqueResults.slice(0, 20);
  } catch (error) {
    console.error("Multi-API TV series search error:", error);
    return results;
  }
}

/**
 * Get enriched movie details from multiple sources
 */
export async function getEnrichedMovieDetails(
  movieId: number,
  imdbId?: string
): Promise<Movie | null> {
  try {
    // Get TMDb data first
    const tmdbMovie = await getMovieDetails(movieId);
    if (!tmdbMovie) return null;

    // Try to get additional data from OMDb if we have an IMDb ID
    const movieImdbId = imdbId || tmdbMovie.imdbId;
    if (movieImdbId) {
      const omdbMovie = await getOMDbMovieByIMDbId(movieImdbId);
      if (omdbMovie && omdbMovie.contentType === "movie") {
        return mergeMovieData(tmdbMovie, omdbMovie as Partial<Movie>);
      }
    }

    return tmdbMovie;
  } catch (error) {
    console.error("Error getting enriched movie details:", error);
    return null;
  }
}

/**
 * Get enriched TV series details from multiple sources
 */
export async function getEnrichedTVSeriesDetails(
  seriesId: number,
  imdbId?: string
): Promise<TVSeries | null> {
  try {
    // Get TMDb data first
    const tmdbSeries = await getTVSeriesDetails(seriesId);
    if (!tmdbSeries) return null;

    // TVmaze integration could be added here if needed
    // For now, return TMDb data
    return tmdbSeries;
  } catch (error) {
    console.error("Error getting enriched TV series details:", error);
    return null;
  }
}

/**
 * Search across all content types with caching
 */
const searchCache = new Map<string, { data: Content[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

export async function searchContentMultiAPI(
  options: SearchOptions,
  contentType?: "movie" | "tv"
): Promise<Content[]> {
  // Generate cache key
  const cacheKey = JSON.stringify({ options, contentType });
  const cached = searchCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("Returning cached results");
    return cached.data;
  }

  const results: Content[] = [];

  if (!contentType || contentType === "movie") {
    const movies = await searchMoviesMultiAPI(options);
    results.push(...movies);
  }

  if (!contentType || contentType === "tv") {
    const series = await searchTVSeriesMultiAPI(options);
    results.push(...series);
  }

  // Cache results
  searchCache.set(cacheKey, { data: results, timestamp: Date.now() });

  return results;
}
