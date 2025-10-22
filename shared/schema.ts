import { z } from "zod";

// Mood types for the application
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
] as const;

export type Mood = typeof moods[number];

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

// Base content schema (shared between movies and TV series)
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
  { label: "1950s", from: 1950, to: 1960 },
  { label: "1960s", from: 1960, to: 1970 },
  { label: "1970s", from: 1970, to: 1980 },
  { label: "1980s", from: 1980, to: 1990 },
  { label: "1990s", from: 1990, to: 2000 },
  { label: "2000s", from: 2000, to: 2010 },
  { label: "2010s", from: 2010, to: 2020 },
  { label: "2020s", from: 2020, to: 2025 },
  { label: "All Classics", from: 1950, to: 2025 },
] as const;

export type EraOption = typeof eraOptions[number];

// Search request/response schemas
export const searchRequestSchema = z.object({
  mood: z.enum(moods).optional(),
  text: z.string().optional(),
  languages: z.array(z.enum(languages)).optional(),
  maxRuntime: z.number().optional(),
  yearFrom: z.number().optional(),
  yearTo: z.number().optional(),
  contentType: z.enum(contentTypes).optional(),
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

// Mood configuration with colors and icons
export const moodConfig = {
  happy: {
    label: "Happy",
    color: "50 90% 60%",
    icon: "Smile",
    genres: ["comedy", "family", "music"],
  },
  sad: {
    label: "Sad",
    color: "215 50% 50%",
    icon: "CloudRain",
    genres: ["drama", "romance"],
  },
  nostalgic: {
    label: "Nostalgic",
    color: "25 70% 55%",
    icon: "Clock",
    genres: ["drama", "family", "romance"],
  },
  adventurous: {
    label: "Adventurous",
    color: "165 60% 48%",
    icon: "Compass",
    genres: ["adventure", "action", "western"],
  },
  romantic: {
    label: "Romantic",
    color: "330 65% 60%",
    icon: "Heart",
    genres: ["romance", "drama"],
  },
  intense: {
    label: "Intense",
    color: "5 80% 52%",
    icon: "Zap",
    genres: ["thriller", "crime", "mystery"],
  },
  relaxed: {
    label: "Relaxed",
    color: "165 60% 48%",
    icon: "Coffee",
    genres: ["comedy", "drama", "family"],
  },
  mysterious: {
    label: "Mysterious",
    color: "265 50% 45%",
    icon: "Search",
    genres: ["mystery", "thriller", "crime"],
  },
  superhero: {
    label: "Superhero",
    color: "220 70% 50%",
    icon: "Zap",
    genres: ["action", "adventure", "science fiction", "fantasy"],
  },
} as const;
