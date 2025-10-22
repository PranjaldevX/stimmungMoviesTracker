import { useState } from "react";
import { Movie, StreamingSource, Mood } from "@shared/schema";
import { MovieCard } from "./MovieCard";
import { MovieDetailModal } from "./MovieDetailModal";
import { Loader2, Film } from "lucide-react";

interface ResultsGridProps {
  movies: Movie[];
  mood?: Mood;
  isLoading?: boolean;
  streamingData?: Record<number, StreamingSource[]>;
  likedMovies?: Set<number>;
  dislikedMovies?: Set<number>;
  onLike?: (movieId: number) => void;
  onDislike?: (movieId: number) => void;
}

export function ResultsGrid({
  movies,
  mood,
  isLoading = false,
  streamingData = {},
  likedMovies = new Set(),
  dislikedMovies = new Set(),
  onLike,
  onDislike,
}: ResultsGridProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24" data-testid="loading-results">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Finding perfect classics for you...</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24" data-testid="empty-results">
        <Film className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No movies found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Try selecting a different mood or describing your feelings in the AI interpreter.
        </p>
      </div>
    );
  }

  return (
    <section className="w-full py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-2" data-testid="text-results-header">
            {mood ? `Perfect ${mood.charAt(0).toUpperCase() + mood.slice(1)} Classics` : "Classic Films"}
          </h2>
          <p className="text-muted-foreground">
            We found {movies.length} timeless {movies.length === 1 ? "film" : "films"} for you
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              streamingSources={streamingData[movie.id]}
              onLike={onLike}
              onDislike={onDislike}
              onClick={setSelectedMovie}
              isLiked={likedMovies.has(movie.id)}
              isDisliked={dislikedMovies.has(movie.id)}
            />
          ))}
        </div>
      </div>

      <MovieDetailModal
        movie={selectedMovie}
        streamingSources={selectedMovie ? streamingData[selectedMovie.id] : []}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </section>
  );
}
