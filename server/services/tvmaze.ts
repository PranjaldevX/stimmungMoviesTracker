/**
 * TVmaze API Integration Service
 * Provides data for regional TV dramas (Turkish, Pakistani, Korean, etc.)
 */

import { TVSeries } from "@shared/schema";

const TVMAZE_BASE_URL = "https://api.tvmaze.com";

interface TVMazeShow {
  id: number;
  name: string;
  type: string;
  language: string;
  genres: string[];
  status: string;
  runtime: number | null;
  averageRuntime: number | null;
  premiered: string;
  ended: string | null;
  officialSite: string | null;
  rating: { average: number | null };
  weight: number;
  network: { name: string; country: { name: string; code: string } } | null;
  webChannel: { name: string } | null;
  externals: { tvrage: number | null; thetvdb: number | null; imdb: string | null };
  image: { medium: string; original: string } | null;
  summary: string | null;
  _links: { self: { href: string } };
}

interface TVMazeCastMember {
  person: {
    id: number;
    name: string;
    image: { medium: string; original: string } | null;
  };
  character: {
    id: number;
    name: string;
  };
}

/**
 * Search TV shows by query
 */
export async function searchTVMazeShows(query: string): Promise<TVMazeShow[]> {
  try {
    const response = await fetch(
      `${TVMAZE_BASE_URL}/search/shows?q=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      console.error("TVmaze search failed:", response.statusText);
      return [];
    }

    const data: Array<{ score: number; show: TVMazeShow }> = await response.json();
    return data.map((item) => item.show);
  } catch (error) {
    console.error("TVmaze search error:", error);
    return [];
  }
}

/**
 * Get show details by ID
 */
export async function getTVMazeShow(showId: number): Promise<TVMazeShow | null> {
  try {
    const response = await fetch(`${TVMAZE_BASE_URL}/shows/${showId}`);
    
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("TVmaze show fetch error:", error);
    return null;
  }
}

/**
 * Get cast for a show
 */
export async function getTVMazeCast(showId: number): Promise<string[]> {
  try {
    const response = await fetch(`${TVMAZE_BASE_URL}/shows/${showId}/cast`);
    
    if (!response.ok) {
      return [];
    }

    const cast: TVMazeCastMember[] = await response.json();
    return cast.slice(0, 10).map((member) => member.person.name);
  } catch (error) {
    console.error("TVmaze cast fetch error:", error);
    return [];
  }
}

/**
 * Convert TVmaze show to our TVSeries schema
 */
export async function convertTVMazeToTVSeries(
  show: TVMazeShow
): Promise<Partial<TVSeries>> {
  // Get cast information
  const cast = await getTVMazeCast(show.id);

  // Remove HTML tags from summary
  const cleanSummary = show.summary
    ? show.summary.replace(/<[^>]*>/g, "")
    : "";

  // Map language code
  const languageMap: Record<string, string> = {
    English: "en",
    Turkish: "tr",
    Urdu: "ur",
    Korean: "ko",
    Hindi: "hi",
    Spanish: "es",
    German: "de",
    Italian: "it",
  };

  const languageCode = languageMap[show.language] || "en";

  return {
    id: show.id,
    title: show.name,
    originalTitle: show.name,
    overview: cleanSummary,
    posterPath: show.image?.original || show.image?.medium || null,
    backdropPath: show.image?.original || null,
    voteAverage: show.rating.average || 0,
    voteCount: show.weight || 0,
    genres: show.genres || [],
    originalLanguage: languageCode,
    spokenLanguages: [show.language],
    imdbId: show.externals.imdb || undefined,
    contentType: "tv" as const,
    firstAirDate: show.premiered || "",
    status: show.status,
    network: show.network?.name || show.webChannel?.name || undefined,
    apiSource: "TVmaze" as const,
    cast,
  };
}

/**
 * Search regional dramas by language/country
 */
export async function searchRegionalDramas(
  region: string,
  genres?: string[]
): Promise<Partial<TVSeries>[]> {
  const searchQueries: Record<string, string[]> = {
    Turkish: ["turkish drama", "dizi", "ask"],
    Pakistani: ["pakistani drama", "urdu"],
    Korean: ["korean drama", "kdrama"],
    Indian: ["indian drama", "hindi serial"],
  };

  const queries = searchQueries[region] || [region.toLowerCase()];
  const results: Partial<TVSeries>[] = [];

  try {
    for (const query of queries) {
      const shows = await searchTVMazeShows(query);
      
      for (const show of shows.slice(0, 5)) {
        const series = await convertTVMazeToTVSeries(show);
        
        // Filter by genres if provided
        if (genres && genres.length > 0) {
          const hasMatchingGenre = genres.some((genre) =>
            series.genres?.some(
              (g) => g.toLowerCase() === genre.toLowerCase()
            )
          );
          if (!hasMatchingGenre) continue;
        }

        results.push(series);
      }
    }

    return results;
  } catch (error) {
    console.error("TVmaze regional dramas search error:", error);
    return [];
  }
}

/**
 * Search TV shows by genre
 */
export async function searchTVMazeByGenre(
  genres: string[],
  yearFrom?: number,
  yearTo?: number
): Promise<Partial<TVSeries>[]> {
  const results: Partial<TVSeries>[] = [];

  try {
    // Use genre keywords for better results
    const genreKeywords: Record<string, string> = {
      drama: "drama",
      romance: "romance",
      thriller: "thriller",
      mystery: "mystery",
      crime: "crime",
      comedy: "comedy",
      action: "action",
    };

    for (const genre of genres) {
      const keyword = genreKeywords[genre.toLowerCase()] || genre;
      const shows = await searchTVMazeShows(keyword);

      for (const show of shows.slice(0, 8)) {
        const series = await convertTVMazeToTVSeries(show);
        
        // Filter by year range
        if (series.firstAirDate) {
          const year = new Date(series.firstAirDate).getFullYear();
          if (
            (yearFrom && year < yearFrom) ||
            (yearTo && year > yearTo)
          ) {
            continue;
          }
        }

        results.push(series);
      }
    }

    return results;
  } catch (error) {
    console.error("TVmaze genre search error:", error);
    return [];
  }
}
