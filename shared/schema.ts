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
] as const;

export type Mood = typeof moods[number];

// Language codes supported
export const languages = ["hi", "en", "es", "it", "de"] as const;
export type Language = typeof languages[number];

// Movie schema
export const movieSchema = z.object({
  id: z.number(),
  title: z.string(),
  originalTitle: z.string().optional(),
  overview: z.string(),
  posterPath: z.string().nullable(),
  backdropPath: z.string().nullable(),
  releaseDate: z.string(),
  voteAverage: z.number(),
  voteCount: z.number(),
  runtime: z.number().nullable(),
  genres: z.array(z.string()),
  originalLanguage: z.string(),
  spokenLanguages: z.array(z.string()).optional(),
  isDubbed: z.boolean().optional(),
  imdbId: z.string().optional().nullable(),
});

export type Movie = z.infer<typeof movieSchema>;

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

// Search request/response schemas
export const searchRequestSchema = z.object({
  mood: z.enum(moods).optional(),
  text: z.string().optional(),
  languages: z.array(z.enum(languages)).optional(),
  maxRuntime: z.number().optional(),
  yearFrom: z.number().optional(),
  yearTo: z.number().optional(),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;

export const searchResponseSchema = z.object({
  movies: z.array(movieSchema),
  interpretation: moodInterpretationSchema.optional(),
  total: z.number(),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;

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
} as const;
