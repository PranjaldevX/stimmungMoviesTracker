import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { interpretMood } from "./services/gemini";
import { searchMoviesByMood, getMovieDetails, getRecommendedMovies, getMovieCredits } from "./services/tmdb";
import { getStreamingAvailability } from "./services/watchmode";
import {
  searchRequestSchema,
  insertFeedbackSchema,
  SearchResponse,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Interpret mood using Gemini AI
  app.post("/api/interpret-mood", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const interpretation = await interpretMood(text);
      res.json(interpretation);
    } catch (error: any) {
      console.error("Error interpreting mood:", error);
      res.status(500).json({ error: error.message || "Failed to interpret mood" });
    }
  });

  // Search movies based on mood or filters
  app.post("/api/search-movies", async (req, res) => {
    try {
      const validatedData = searchRequestSchema.parse(req.body);
      let interpretation;

      // If text is provided, interpret it first
      if (validatedData.text) {
        interpretation = await interpretMood(validatedData.text);
      }

      // Determine genres to search
      let genres: string[] = [];
      if (interpretation) {
        genres = interpretation.preferredGenres;
      } else if (validatedData.mood) {
        // Map mood to genres
        const moodGenreMap: Record<string, string[]> = {
          happy: ["comedy", "family", "music"],
          sad: ["drama", "romance"],
          nostalgic: ["drama", "family", "romance"],
          adventurous: ["adventure", "action", "western"],
          romantic: ["romance", "drama"],
          intense: ["thriller", "crime", "mystery"],
          relaxed: ["comedy", "drama"],
          mysterious: ["mystery", "thriller", "crime"],
        };
        genres = moodGenreMap[validatedData.mood] || ["drama"];
      } else {
        genres = ["drama"]; // Default
      }

      // Search movies
      let movies = await searchMoviesByMood(genres, {
        languages: validatedData.languages,
        maxRuntime: validatedData.maxRuntime || interpretation?.maxRuntimeMin,
        minRuntime: interpretation?.minRuntimeMin,
        yearFrom: validatedData.yearFrom || interpretation?.era?.from,
        yearTo: validatedData.yearTo || interpretation?.era?.to,
      });

      // If no results found, return recommended movies instead
      if (movies.length === 0) {
        movies = await getRecommendedMovies();
      }

      // Cache movies and fetch streaming availability
      for (const movie of movies) {
        await storage.cacheMovie(movie.id, movie);
        
        // Fetch streaming availability if IMDb ID exists
        if (movie.imdbId) {
          const streamingSources = await getStreamingAvailability(movie.imdbId);
          if (streamingSources.length > 0) {
            await storage.cacheMovie(movie.id, movie, streamingSources);
          }
        }
      }

      const response: SearchResponse = {
        movies,
        interpretation,
        total: movies.length,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Error searching movies:", error);
      res.status(500).json({ error: error.message || "Failed to search movies" });
    }
  });

  // Get streaming availability for a specific movie
  app.get("/api/movie/:id/availability", async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      
      // Check cache first
      const cached = await storage.getCachedMovie(movieId);
      if (cached && cached.streamingSources) {
        return res.json({ sources: cached.streamingSources });
      }

      // Fetch from TMDb to get IMDb ID
      const movie = await getMovieDetails(movieId);
      if (!movie || !movie.imdbId) {
        return res.json({ sources: [] });
      }

      // Fetch streaming availability
      const sources = await getStreamingAvailability(movie.imdbId);
      
      // Update cache
      await storage.cacheMovie(movieId, movie, sources);

      res.json({ sources });
    } catch (error: any) {
      console.error("Error getting streaming availability:", error);
      res.status(500).json({ error: error.message || "Failed to get availability" });
    }
  });

  // Submit feedback (like/dislike)
  app.post("/api/feedback", async (req, res) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(validatedData);
      res.json(feedback);
    } catch (error: any) {
      console.error("Error creating feedback:", error);
      res.status(400).json({ error: error.message || "Failed to create feedback" });
    }
  });

  // Delete feedback
  app.delete("/api/feedback/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFeedback(id);
      
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Feedback not found" });
      }
    } catch (error: any) {
      console.error("Error deleting feedback:", error);
      res.status(500).json({ error: error.message || "Failed to delete feedback" });
    }
  });

  // Get liked movies
  app.get("/api/feedback/liked", async (req, res) => {
    try {
      const likedMovieIds = await storage.getLikedMovies();
      res.json({ movieIds: likedMovieIds });
    } catch (error: any) {
      console.error("Error getting liked movies:", error);
      res.status(500).json({ error: error.message || "Failed to get liked movies" });
    }
  });

  // Get movie credits (cast)
  app.get("/api/movie/:id/credits", async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const credits = await getMovieCredits(movieId);
      res.json({ cast: credits });
    } catch (error: any) {
      console.error("Error getting movie credits:", error);
      res.status(500).json({ error: error.message || "Failed to get credits" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
