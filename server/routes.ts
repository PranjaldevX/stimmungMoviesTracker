import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { interpretMood } from "./services/gemini";
import { 
  getMovieCredits,
  searchSuperheroContent 
} from "./services/tmdb";
import { searchContentMultiAPI, getEnrichedMovieDetails } from "./services/multi-api";
import { getStreamingAvailability } from "./services/watchmode";
import {
  searchRequestSchema,
  insertFeedbackSchema,
  SearchResponse,
  moodConfig,
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

  // Search movies/TV with multi-API support and enhanced filters
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
      const isSuperhero = validatedData.mood === "superhero" || interpretation?.mood === "superhero";
      
      if (validatedData.genres && validatedData.genres.length > 0) {
        // Use explicitly provided genres
        genres = validatedData.genres;
      } else if (interpretation) {
        // Use AI-interpreted genres
        genres = interpretation.preferredGenres;
      } else if (validatedData.mood) {
        // Map mood to genres using moodConfig
        const moodData = moodConfig[validatedData.mood];
        genres = moodData?.genres ? [...moodData.genres] : ["Drama"];
      } else {
        // Default to Drama
        genres = ["Drama"];
      }

      // Apply year filter for old classics
      let yearFrom = validatedData.yearFrom || interpretation?.era?.from;
      let yearTo = validatedData.yearTo || interpretation?.era?.to;
      
      if (validatedData.oldClassicsOnly) {
        yearFrom = yearFrom || 1900;
        yearTo = Math.min(yearTo || 1990, 1990);
      }

      const searchOptions = {
        genres,
        languages: validatedData.languages,
        maxRuntime: validatedData.maxRuntime || interpretation?.maxRuntimeMin,
        minRuntime: interpretation?.minRuntimeMin,
        yearFrom,
        yearTo,
        regionalFocus: validatedData.regionalFocus,
        oldClassicsOnly: validatedData.oldClassicsOnly,
      };

      let content: any[] = [];

      // Handle superhero-specific searches (still using TMDb for this)
      if (isSuperhero) {
        const contentType = validatedData.contentType || "movie";
        const superheroContent = await searchSuperheroContent({
          contentType,
          languages: searchOptions.languages,
          yearFrom: searchOptions.yearFrom,
          yearTo: searchOptions.yearTo,
        });
        
        content = superheroContent;
      } else {
        // Use multi-API search for comprehensive results
        content = await searchContentMultiAPI(
          searchOptions,
          validatedData.contentType
        );
      }

      // Separate movies and TV series
      const movies = content.filter(c => c.contentType === "movie");
      const tvSeries = content.filter(c => c.contentType === "tv");

      // Cache content and fetch streaming availability
      for (const item of content) {
        if (item.contentType === "movie") {
          await storage.cacheMovie(item.id, item);
          
          if (item.imdbId) {
            const streamingSources = await getStreamingAvailability(item.imdbId);
            if (streamingSources.length > 0) {
              await storage.cacheMovie(item.id, item, streamingSources);
            }
          }
        } else if (item.contentType === "tv") {
          await storage.cacheTVSeries(item.id, item);
          
          if (item.imdbId) {
            const streamingSources = await getStreamingAvailability(item.imdbId);
            if (streamingSources.length > 0) {
              await storage.cacheTVSeries(item.id, item, streamingSources);
            }
          }
        }
      }

      const response: SearchResponse = {
        movies,
        tvSeries,
        interpretation,
        total: content.length,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Error searching content:", error);
      res.status(500).json({ error: error.message || "Failed to search content" });
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

      // Fetch enriched movie details
      const movie = await getEnrichedMovieDetails(movieId);
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
