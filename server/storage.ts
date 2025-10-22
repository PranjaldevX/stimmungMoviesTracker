import { Movie, MovieCache, TVSeries, TVCache, Feedback, InsertFeedback, StreamingSource } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Movie cache operations
  getCachedMovie(movieId: number): Promise<MovieCache | undefined>;
  cacheMovie(movieId: number, movieData: Movie, streamingSources?: StreamingSource[]): Promise<MovieCache>;
  
  // TV series cache operations
  getCachedTVSeries(tvId: number): Promise<TVCache | undefined>;
  cacheTVSeries(tvId: number, tvData: TVSeries, streamingSources?: StreamingSource[]): Promise<TVCache>;
  
  // Feedback operations
  getFeedback(id: string): Promise<Feedback | undefined>;
  getFeedbackByMovieId(movieId: number): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  deleteFeedback(id: string): Promise<boolean>;
  
  // Get all liked movies
  getLikedMovies(): Promise<number[]>;
}

export class MemStorage implements IStorage {
  private movieCache: Map<number, MovieCache>;
  private tvCache: Map<number, TVCache>;
  private feedback: Map<string, Feedback>;

  constructor() {
    this.movieCache = new Map();
    this.tvCache = new Map();
    this.feedback = new Map();
  }

  async getCachedMovie(movieId: number): Promise<MovieCache | undefined> {
    return this.movieCache.get(movieId);
  }

  async cacheMovie(
    movieId: number,
    movieData: Movie,
    streamingSources?: StreamingSource[]
  ): Promise<MovieCache> {
    const cache: MovieCache = {
      id: randomUUID(),
      movieId,
      movieData,
      streamingSources,
      cachedAt: new Date().toISOString(),
    };
    this.movieCache.set(movieId, cache);
    return cache;
  }

  async getCachedTVSeries(tvId: number): Promise<TVCache | undefined> {
    return this.tvCache.get(tvId);
  }

  async cacheTVSeries(
    tvId: number,
    tvData: TVSeries,
    streamingSources?: StreamingSource[]
  ): Promise<TVCache> {
    const cache: TVCache = {
      id: randomUUID(),
      tvId,
      tvData,
      streamingSources,
      cachedAt: new Date().toISOString(),
    };
    this.tvCache.set(tvId, cache);
    return cache;
  }

  async getFeedback(id: string): Promise<Feedback | undefined> {
    return this.feedback.get(id);
  }

  async getFeedbackByMovieId(movieId: number): Promise<Feedback[]> {
    return Array.from(this.feedback.values()).filter(
      (f) => f.movieId === movieId
    );
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedback: Feedback = {
      ...insertFeedback,
      id,
      timestamp: new Date().toISOString(),
    };
    this.feedback.set(id, feedback);
    return feedback;
  }

  async deleteFeedback(id: string): Promise<boolean> {
    return this.feedback.delete(id);
  }

  async getLikedMovies(): Promise<number[]> {
    return Array.from(this.feedback.values())
      .filter((f) => f.liked)
      .map((f) => f.movieId);
  }
}

export const storage = new MemStorage();
