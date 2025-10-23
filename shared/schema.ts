import { z } from "zod";

// Mood types for the application (Enhanced with new moods)
export const moods = [
  "happy",
  "sad",
  "nostalgic",
  "adventurous",
  "romantic",
  "intense",
  "relaxed",
  "mysterious",
  "superhero",
  "feelGood",
  "emotional",
  "classicRetro",
  "inspirational",
  "suspenseful",
] as const;

export type Mood = typeof moods[number];

// Genre types
export const genres = [
  "Action",
  "Drama",
  "Romance",
  "Thriller",
  "Historical",
  "Biopic",
  "Family",
  "Comedy",
  "Crime",
  "Mystery",
  "Adventure",
  "Science Fiction",
  "Fantasy",
  "Horror",
  "War",
  "Western",
  "Music",
  "Animation",
  "Documentary",
] as const;

export type Genre = typeof genres[number];

// API Source types
export const apiSources = ["TMDb", "OMDb", "TVmaze"] as const;
export type APISource = typeof apiSources[number];

// Regional focus options
export const regionalFocus = [
  "Global",
  "Indian",
  "Turkish",
  "Pakistani",
  "Korean",
  "Hollywood",
  "Bollywood",
] as const;
export type RegionalFocus = typeof regionalFocus[number];

// Language codes supported (expanded for regional Indian languages and Asian dramas)
export const languages = [
  "hi", // Hindi
  "ta", // Tamil
  "te", // Telugu
  "ml", // Malayalam
  "kn", // Kannada
  "bn", // Bengali
  "mr", // Marathi
  "pa", // Punjabi
  "en", // English
  "ko", // Korean
  "tr", // Turkish
  "ur", // Urdu (for Pakistani content)
  "es", // Spanish
  "it", // Italian
  "de", // German
] as const;
export type Language = typeof languages[number];

// Content types
export const contentTypes = ["movie", "tv"] as const;
export type ContentType = typeof contentTypes[number];

// Base content schema (shared between movies and TV series) - Enhanced with multi-API fields
export const baseContentSchema = z.object({
  id: z.number(),
  title: z.string(),
  originalTitle: z.string().optional(),
  overview: z.string(),
  posterPath: z.string().nullable(),
  backdropPath: z.string().nullable(),
  voteAverage: z.number(),
  voteCount: z.number(),
  genres: z.array(z.string()),
  originalLanguage: z.string(),
  spokenLanguages: z.array(z.string()).optional(),
  isDubbed: z.boolean().optional(),
  imdbId: z.string().optional().nullable(),
  contentType: z.enum(contentTypes),
  // Multi-API fields
  apiSource: z.enum(apiSources).optional(),
  cast: z.array(z.string()).optional(),
  director: z.string().optional(),
  writers: z.array(z.string()).optional(),
  awards: z.string().optional(),
  imdbRating: z.string().optional(),
  rottenTomatoesRating: z.string().optional(),
  streamingLink: z.string().optional(),
});

// Movie schema
export const movieSchema = baseContentSchema.extend({
  releaseDate: z.string(),
  runtime: z.number().nullable(),
  contentType: z.literal("movie"),
});

export type Movie = z.infer<typeof movieSchema>;

// TV Series schema
export const tvSeriesSchema = baseContentSchema.extend({
  firstAirDate: z.string(),
  numberOfSeasons: z.number().optional(),
  numberOfEpisodes: z.number().optional(),
  episodeRuntime: z.array(z.number()).optional(),
  contentType: z.literal("tv"),
  status: z.string().optional(),
  network: z.string().optional(),
});

export type TVSeries = z.infer<typeof tvSeriesSchema>;

// Combined content type
export const contentSchema = z.union([movieSchema, tvSeriesSchema]);
export type Content = Movie | TVSeries;

// Mood interpretation result
export const moodInterpretationSchema = z.object({
  mood: z.enum(moods),
  preferredGenres: z.array(z.string()),
  maxRuntimeMin: z.number().optional(),
  minRuntimeMin: z.number().optional(),
  era: z.object({
    from: z.number(),
    to: z.number(),
  }).optional(),
  languagePreference: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export type MoodInterpretation = z.infer<typeof moodInterpretationSchema>;

// Streaming availability
export const streamingSourceSchema = z.object({
  name: z.string(),
  type: z.string(), // subscription, rent, buy, free
  webUrl: z.string().optional(),
  iosUrl: z.string().optional(),
  androidUrl: z.string().optional(),
});

export type StreamingSource = z.infer<typeof streamingSourceSchema>;

// Feedback schema
export const feedbackSchema = z.object({
  id: z.string(),
  movieId: z.number(),
  userId: z.string().optional(),
  liked: z.boolean(),
  timestamp: z.string(),
});

export const insertFeedbackSchema = feedbackSchema.omit({ id: true, timestamp: true });

export type Feedback = z.infer<typeof feedbackSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

// Movie cache schema (for in-memory storage)
export const movieCacheSchema = z.object({
  id: z.string(),
  movieId: z.number(),
  movieData: movieSchema,
  streamingSources: z.array(streamingSourceSchema).optional(),
  cachedAt: z.string(),
});

export type MovieCache = z.infer<typeof movieCacheSchema>;

// TV Series cache schema
export const tvCacheSchema = z.object({
  id: z.string(),
  tvId: z.number(),
  tvData: tvSeriesSchema,
  streamingSources: z.array(streamingSourceSchema).optional(),
  cachedAt: z.string(),
});

export type TVCache = z.infer<typeof tvCacheSchema>;

// Era options for filtering classic films
export const eraOptions = [
  { label: "All Time", from: 1900, to: 2025 },
  { label: "1950s", from: 1950, to: 1960 },
  { label: "1960s", from: 1960, to: 1970 },
  { label: "1970s", from: 1970, to: 1980 },
  { label: "1980s", from: 1980, to: 1990 },
  { label: "Old Classics (Before 1990)", from: 1900, to: 1990 },
  { label: "1990s", from: 1990, to: 2000 },
  { label: "2000s", from: 2000, to: 2010 },
  { label: "2010s", from: 2010, to: 2020 },
  { label: "2020s", from: 2020, to: 2025 },
] as const;

export type EraOption = typeof eraOptions[number];

// Search request/response schemas (Enhanced)
export const searchRequestSchema = z.object({
  mood: z.enum(moods).optional(),
  text: z.string().optional(),
  languages: z.array(z.enum(languages)).optional(),
  maxRuntime: z.number().optional(),
  yearFrom: z.number().optional(),
  yearTo: z.number().optional(),
  contentType: z.enum(contentTypes).optional(),
  genres: z.array(z.string()).optional(),
  regionalFocus: z.enum(regionalFocus).optional(),
  oldClassicsOnly: z.boolean().optional(),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;

export const searchResponseSchema = z.object({
  movies: z.array(movieSchema),
  tvSeries: z.array(tvSeriesSchema).optional(),
  content: z.array(contentSchema).optional(),
  interpretation: moodInterpretationSchema.optional(),
  total: z.number(),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;

// Language labels for UI
export const languageLabels: Record<Language, string> = {
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  kn: "Kannada",
  bn: "Bengali",
  mr: "Marathi",
  pa: "Punjabi",
  en: "English",
  ko: "Korean",
  tr: "Turkish",
  ur: "Urdu",
  es: "Spanish",
  it: "Italian",
  de: "German",
};

// Mood configuration with colors and icons (Enhanced)
export const moodConfig = {
  happy: {
    label: "Happy",
    color: "50 90% 60%",
    icon: "Smile",
    genres: ["Comedy", "Family", "Music"],
  },
  sad: {
    label: "Sad",
    color: "215 50% 50%",
    icon: "CloudRain",
    genres: ["Drama", "Romance"],
  },
  nostalgic: {
    label: "Nostalgic",
    color: "25 70% 55%",
    icon: "Clock",
    genres: ["Drama", "Family", "Romance"],
  },
  adventurous: {
    label: "Adventurous",
    color: "165 60% 48%",
    icon: "Compass",
    genres: ["Adventure", "Action", "Western"],
  },
  romantic: {
    label: "Romantic",
    color: "330 65% 60%",
    icon: "Heart",
    genres: ["Romance", "Drama"],
  },
  intense: {
    label: "Intense",
    color: "5 80% 52%",
    icon: "Zap",
    genres: ["Thriller", "Crime", "Mystery"],
  },
  relaxed: {
    label: "Relaxed",
    color: "165 60% 48%",
    icon: "Coffee",
    genres: ["Comedy", "Drama", "Family"],
  },
  mysterious: {
    label: "Mysterious",
    color: "265 50% 45%",
    icon: "Search",
    genres: ["Mystery", "Thriller", "Crime"],
  },
  superhero: {
    label: "Superhero",
    color: "220 70% 50%",
    icon: "Zap",
    genres: ["Action", "Adventure", "Science Fiction", "Fantasy"],
  },
  feelGood: {
    label: "Feel-Good",
    color: "160 70% 55%",
    icon: "Sun",
    genres: ["Comedy", "Family", "Romance"],
  },
  emotional: {
    label: "Emotional",
    color: "200 60% 50%",
    icon: "Heart",
    genres: ["Drama", "Romance", "Biopic"],
  },
  classicRetro: {
    label: "Classic Retro",
    color: "35 75% 55%",
    icon: "Film",
    genres: ["Drama", "Romance", "Western"],
  },
  inspirational: {
    label: "Inspirational",
    color: "45 80% 60%",
    icon: "Star",
    genres: ["Biopic", "Drama", "Family"],
  },
  suspenseful: {
    label: "Suspenseful",
    color: "350 70% 50%",
    icon: "AlertCircle",
    genres: ["Thriller", "Mystery", "Horror"],
  },
} as const;
