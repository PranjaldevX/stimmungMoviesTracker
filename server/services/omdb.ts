/**
 * OMDb API Integration Service
 * Provides fallback data for classic movies, especially Bollywood and Hollywood films from 1950s-1990s
 */

import { Movie, TVSeries } from "@shared/schema";

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "http://www.omdbapi.com/";

interface OMDbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  Response: string;
}

interface OMDbSearchResult {
  Search?: Array<{
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
  }>;
  totalResults?: string;
  Response: string;
  Error?: string;
}

/**
 * Search movies by title in OMDb
 */
export async function searchOMDbMovies(
  query: string,
  year?: number,
  type: "movie" | "series" = "movie"
): Promise<string[]> {
  if (!OMDB_API_KEY) {
    console.warn("OMDb API key not configured");
    return [];
  }

  try {
    const params = new URLSearchParams({
      apikey: OMDB_API_KEY,
      s: query,
      type,
      ...(year && { y: year.toString() }),
    });

    const response = await fetch(`${OMDB_BASE_URL}?${params}`);
    const data: OMDbSearchResult = await response.json();

    if (data.Response === "True" && data.Search) {
      return data.Search.map((item) => item.imdbID);
    }

    return [];
  } catch (error) {
    console.error("OMDb search error:", error);
    return [];
  }
}

/**
 * Get detailed movie information from OMDb by IMDb ID
 */
export async function getOMDbMovieByIMDbId(
  imdbId: string
): Promise<Partial<Movie | TVSeries> | null> {
  if (!OMDB_API_KEY) {
    console.warn("OMDb API key not configured");
    return null;
  }

  try {
    const params = new URLSearchParams({
      apikey: OMDB_API_KEY,
      i: imdbId,
      plot: "full",
    });

    const response = await fetch(`${OMDB_BASE_URL}?${params}`);
    const data: OMDbMovie = await response.json();

    if (data.Response === "False") {
      return null;
    }

    // Parse runtime (e.g., "142 min" -> 142)
    const runtime = data.Runtime !== "N/A" 
      ? parseInt(data.Runtime.replace(/\D/g, "")) || null
      : null;

    // Parse genres
    const genres = data.Genre !== "N/A" 
      ? data.Genre.split(", ") 
      : [];

    // Parse ratings
    const rottenTomatoesRating = data.Ratings?.find(
      (r) => r.Source === "Rotten Tomatoes"
    )?.Value;

    // Parse cast
    const cast = data.Actors !== "N/A" 
      ? data.Actors.split(", ") 
      : [];

    // Parse writers
    const writers = data.Writer !== "N/A" 
      ? data.Writer.split(", ") 
      : [];

    const isMovie = data.Type === "movie";

    const baseData = {
      id: parseInt(imdbId.replace("tt", "")) || 0,
      title: data.Title,
      originalTitle: data.Title,
      overview: data.Plot !== "N/A" ? data.Plot : "",
      posterPath: data.Poster !== "N/A" ? data.Poster : null,
      backdropPath: null,
      voteAverage: data.imdbRating !== "N/A" ? parseFloat(data.imdbRating) : 0,
      voteCount: data.imdbVotes !== "N/A" 
        ? parseInt(data.imdbVotes.replace(/,/g, "")) 
        : 0,
      genres,
      originalLanguage: data.Language !== "N/A" 
        ? data.Language.split(", ")[0].toLowerCase() 
        : "en",
      spokenLanguages: data.Language !== "N/A" 
        ? data.Language.split(", ") 
        : [],
      imdbId: data.imdbID,
      apiSource: "OMDb" as const,
      cast,
      director: data.Director !== "N/A" ? data.Director : undefined,
      writers,
      awards: data.Awards !== "N/A" ? data.Awards : undefined,
      imdbRating: data.imdbRating !== "N/A" ? data.imdbRating : undefined,
      rottenTomatoesRating,
    };

    if (isMovie) {
      return {
        ...baseData,
        releaseDate: data.Released !== "N/A" ? data.Released : data.Year,
        runtime,
        contentType: "movie" as const,
      } as Partial<Movie>;
    } else {
      return {
        ...baseData,
        firstAirDate: data.Released !== "N/A" ? data.Released : data.Year,
        contentType: "tv" as const,
      } as Partial<TVSeries>;
    }
  } catch (error) {
    console.error("OMDb fetch error:", error);
    return null;
  }
}

/**
 * Search classic movies by genre and year range
 */
export async function searchClassicMovies(
  genres: string[],
  yearFrom?: number,
  yearTo?: number
): Promise<Partial<Movie>[]> {
  if (!OMDB_API_KEY) {
    console.warn("OMDb API key not configured");
    return [];
  }

  const results: Partial<Movie>[] = [];
  
  // Classic movie keywords based on genres
  const searchKeywords: Record<string, string[]> = {
    drama: ["godfather", "casablanca", "citizen kane"],
    romance: ["gone with the wind", "roman holiday", "breakfast at tiffanys"],
    action: ["die hard", "terminator", "rambo"],
    comedy: ["some like it hot", "it happened one night", "the graduate"],
  };

  try {
    for (const genre of genres) {
      const keywords = searchKeywords[genre.toLowerCase()] || [];
      
      for (const keyword of keywords) {
        const imdbIds = await searchOMDbMovies(
          keyword,
          yearFrom,
          "movie"
        );

        for (const imdbId of imdbIds.slice(0, 2)) {
          const movie = await getOMDbMovieByIMDbId(imdbId);
          if (movie && movie.contentType === "movie") {
            const releaseYear = movie.releaseDate 
              ? new Date(movie.releaseDate).getFullYear() 
              : 0;
            
            if (
              (!yearFrom || releaseYear >= yearFrom) &&
              (!yearTo || releaseYear <= yearTo)
            ) {
              results.push(movie as Partial<Movie>);
            }
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error("OMDb classic movies search error:", error);
    return [];
  }
}
