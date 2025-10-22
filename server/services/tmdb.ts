import axios from "axios";
import { Movie, TVSeries, Content } from "@shared/schema";
import { TMDB_CONFIG, DEFAULT_SEARCH_CONFIG, RECOMMENDED_MOVIE_IDS } from "../config/api";

// Centralized API configuration - to upgrade to premium or switch providers,
// update the configuration in server/config/api.ts
const TMDB_API_KEY = TMDB_CONFIG.apiKey;
const TMDB_BASE_URL = TMDB_CONFIG.baseUrl;

// TMDb genre IDs mapping
const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  comedy: 35,
  crime: 80,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  "science fiction": 878,
  "sci-fi": 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

// Superhero keywords for filtering
const SUPERHERO_KEYWORDS = [
  9715,  // superhero
  155477, // marvel cinematic universe  
  180547, // dc extended universe
];

const GENRE_ID_TO_NAME: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

interface TMDbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
}

interface TMDbMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  genres: Array<{ id: number; name: string }>;
  original_language: string;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  imdb_id: string | null;
}

interface TMDbTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
}

interface TMDbTVDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  genres: Array<{ id: number; name: string }>;
  original_language: string;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  external_ids?: { imdb_id: string | null };
}

export async function searchMoviesByMood(
  genres: string[],
  options: {
    languages?: string[];
    maxRuntime?: number;
    minRuntime?: number;
    yearFrom?: number;
    yearTo?: number;
  } = {}
): Promise<Movie[]> {
  const {
    languages = DEFAULT_SEARCH_CONFIG.defaultLanguages,
    maxRuntime,
    minRuntime,
    yearFrom = DEFAULT_SEARCH_CONFIG.defaultYearFrom,
    yearTo = DEFAULT_SEARCH_CONFIG.defaultYearTo,
  } = options;

  const genreIds = genres
    .map((g) => GENRE_MAP[g.toLowerCase()])
    .filter(Boolean)
    .join(",");

  const allMovies: Movie[] = [];
  const seenIds = new Set<number>();

  // Search for each language
  for (const lang of languages) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          with_genres: genreIds,
          with_original_language: lang,
          "primary_release_date.gte": `${yearFrom}-01-01`,
          "primary_release_date.lte": `${yearTo}-12-31`,
          "vote_average.gte": DEFAULT_SEARCH_CONFIG.minVoteAverage,
          "vote_count.gte": DEFAULT_SEARCH_CONFIG.minVoteCount,
          sort_by: "vote_average.desc",
          page: 1,
        },
      });

      const movies = response.data.results as TMDbMovie[];

      for (const tmdbMovie of movies) {
        if (seenIds.has(tmdbMovie.id)) continue;
        seenIds.add(tmdbMovie.id);

        // Get detailed info for runtime
        const movie = await getMovieDetails(tmdbMovie.id);
        if (!movie) continue;

        // Filter by runtime if specified
        if (maxRuntime && movie.runtime && movie.runtime > maxRuntime) {
          continue;
        }
        if (minRuntime && movie.runtime && movie.runtime < minRuntime) {
          continue;
        }

        // Add isDubbed flag
        const movieWithDubFlag: Movie = {
          ...movie,
          isDubbed: movie.originalLanguage !== lang,
        };

        allMovies.push(movieWithDubFlag);
      }
    } catch (error) {
      console.error(`Error searching TMDb for language ${lang}:`, error);
    }
  }

  // Sort by vote average and limit results
  return allMovies
    .sort((a, b) => b.voteAverage - a.voteAverage)
    .slice(0, DEFAULT_SEARCH_CONFIG.maxResults);
}

// Get recommended movies (used when no search results found)
export async function getRecommendedMovies(): Promise<Movie[]> {
  const movies: Movie[] = [];
  
  for (const movieId of RECOMMENDED_MOVIE_IDS) {
    const movie = await getMovieDetails(movieId);
    if (movie) {
      movies.push(movie);
    }
  }
  
  return movies;
}

export async function getMovieDetails(movieId: number): Promise<Movie | null> {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: "external_ids",
      },
    });

    const details = response.data as TMDbMovieDetails;

    return {
      id: details.id,
      title: details.title,
      originalTitle: details.original_title,
      overview: details.overview,
      posterPath: details.poster_path,
      backdropPath: details.backdrop_path,
      releaseDate: details.release_date,
      voteAverage: details.vote_average,
      voteCount: details.vote_count,
      runtime: details.runtime,
      genres: details.genres?.map((g) => g.name) || [],
      originalLanguage: details.original_language,
      spokenLanguages: details.spoken_languages?.map((sl) => sl.iso_639_1) || [],
      imdbId: details.imdb_id,
      contentType: "movie" as const,
    };
  } catch (error) {
    console.error(`Error getting movie details for ${movieId}:`, error);
    return null;
  }
}

export async function getMovieCredits(movieId: number) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    const cast = response.data.cast || [];
    return cast.slice(0, 10).map((member: any) => ({
      id: member.id,
      name: member.name,
      character: member.character,
      profilePath: member.profile_path,
    }));
  } catch (error) {
    console.error(`Error getting movie credits for ${movieId}:`, error);
    return [];
  }
}

// Search TV series by mood/genre
export async function searchTVSeriesByMood(
  genres: string[],
  options: {
    languages?: string[];
    yearFrom?: number;
    yearTo?: number;
  } = {}
): Promise<TVSeries[]> {
  const {
    languages = DEFAULT_SEARCH_CONFIG.defaultLanguages,
    yearFrom = DEFAULT_SEARCH_CONFIG.defaultYearFrom,
    yearTo = DEFAULT_SEARCH_CONFIG.defaultYearTo,
  } = options;

  const genreIds = genres
    .map((g) => GENRE_MAP[g.toLowerCase()])
    .filter(Boolean)
    .join(",");

  const allSeries: TVSeries[] = [];
  const seenIds = new Set<number>();

  for (const lang of languages) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/discover/tv`, {
        params: {
          api_key: TMDB_API_KEY,
          with_genres: genreIds,
          with_original_language: lang,
          "first_air_date.gte": `${yearFrom}-01-01`,
          "first_air_date.lte": `${yearTo}-12-31`,
          "vote_average.gte": DEFAULT_SEARCH_CONFIG.minVoteAverage,
          "vote_count.gte": DEFAULT_SEARCH_CONFIG.minVoteCount,
          sort_by: "vote_average.desc",
          page: 1,
        },
      });

      const shows = response.data.results as TMDbTVShow[];

      for (const tmdbShow of shows) {
        if (seenIds.has(tmdbShow.id)) continue;
        seenIds.add(tmdbShow.id);

        const series = await getTVSeriesDetails(tmdbShow.id);
        if (!series) continue;

        const seriesWithDubFlag: TVSeries = {
          ...series,
          isDubbed: series.originalLanguage !== lang,
        };

        allSeries.push(seriesWithDubFlag);
      }
    } catch (error) {
      console.error(`Error searching TMDb TV for language ${lang}:`, error);
    }
  }

  return allSeries
    .sort((a, b) => b.voteAverage - a.voteAverage)
    .slice(0, DEFAULT_SEARCH_CONFIG.maxResults);
}

// Get TV series details
export async function getTVSeriesDetails(tvId: number): Promise<TVSeries | null> {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/${tvId}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: "external_ids",
      },
    });

    const details = response.data as TMDbTVDetails;

    return {
      id: details.id,
      title: details.name,
      originalTitle: details.original_name,
      overview: details.overview,
      posterPath: details.poster_path,
      backdropPath: details.backdrop_path,
      firstAirDate: details.first_air_date,
      voteAverage: details.vote_average,
      voteCount: details.vote_count,
      numberOfSeasons: details.number_of_seasons,
      numberOfEpisodes: details.number_of_episodes,
      episodeRuntime: details.episode_run_time,
      genres: details.genres?.map((g) => g.name) || [],
      originalLanguage: details.original_language,
      spokenLanguages: details.spoken_languages?.map((sl) => sl.iso_639_1) || [],
      imdbId: details.external_ids?.imdb_id || null,
      contentType: "tv" as const,
    };
  } catch (error) {
    console.error(`Error getting TV series details for ${tvId}:`, error);
    return null;
  }
}

// Search superhero movies specifically
export async function searchSuperheroContent(
  options: {
    contentType?: "movie" | "tv";
    languages?: string[];
    yearFrom?: number;
    yearTo?: number;
  } = {}
): Promise<Content[]> {
  const {
    contentType = "movie",
    languages = DEFAULT_SEARCH_CONFIG.defaultLanguages,
    yearFrom = DEFAULT_SEARCH_CONFIG.defaultYearFrom,
    yearTo = DEFAULT_SEARCH_CONFIG.defaultYearTo,
  } = options;

  const allContent: Content[] = [];
  const seenIds = new Set<number>();

  for (const lang of languages) {
    try {
      const endpoint = contentType === "movie" ? "discover/movie" : "discover/tv";
      const dateField = contentType === "movie" ? "primary_release_date" : "first_air_date";

      const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, {
        params: {
          api_key: TMDB_API_KEY,
          with_keywords: SUPERHERO_KEYWORDS.join("|"),
          with_original_language: lang,
          [`${dateField}.gte`]: `${yearFrom}-01-01`,
          [`${dateField}.lte`]: `${yearTo}-12-31`,
          "vote_average.gte": DEFAULT_SEARCH_CONFIG.minVoteAverage,
          sort_by: "popularity.desc",
          page: 1,
        },
      });

      const results = response.data.results;

      for (const item of results) {
        if (seenIds.has(item.id)) continue;
        seenIds.add(item.id);

        let content: Content | null = null;
        
        if (contentType === "movie") {
          content = await getMovieDetails(item.id);
        } else {
          content = await getTVSeriesDetails(item.id);
        }

        if (content) {
          allContent.push({
            ...content,
            isDubbed: content.originalLanguage !== lang,
          });
        }
      }
    } catch (error) {
      console.error(`Error searching superhero content for ${lang}:`, error);
    }
  }

  return allContent
    .sort((a, b) => b.voteAverage - a.voteAverage)
    .slice(0, DEFAULT_SEARCH_CONFIG.maxResults);
}
