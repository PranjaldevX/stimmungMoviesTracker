import { useState } from "react";
import { Content, StreamingSource, Mood } from "@shared/schema";
import { MovieCard } from "./MovieCard";
import { MovieDetailModal } from "./MovieDetailModal";
import { Loader2, Film, Sparkles, RotateCcw, TrendingUp, Lightbulb, Calendar, Globe, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface ResultsGridProps {
  movies: Content[];
  mood?: Mood;
  isLoading?: boolean;
  streamingData?: Record<number, StreamingSource[]>;
  likedMovies?: Set<number>;
  dislikedMovies?: Set<number>;
  onLike?: (movieId: number) => void;
  onDislike?: (movieId: number) => void;
  hasSearched?: boolean;
  onResetFilters?: () => void;
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
  hasSearched = false,
  onResetFilters,
}: ResultsGridProps) {
  const [selectedMovie, setSelectedMovie] = useState<Content | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24" data-testid="loading-results">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Finding perfect matches for you...</p>
      </div>
    );
  }

  // DEFAULT LANDING STATE - When no search has been performed
  if (!hasSearched && movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16" data-testid="empty-landing">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl opacity-50" />
            <Film className="w-20 h-20 text-primary mx-auto relative" />
          </div>
          
          <div className="space-y-3">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Discover Your Perfect Movie Match
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Select a mood or use filters to find films tailored to your feelings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer bg-card/50">
              <CardContent className="pt-6 pb-6 text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Choose Your Mood</h3>
                <p className="text-sm text-muted-foreground">
                  Select from 14 different moods to find content that matches your current feelings
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer bg-card/50">
              <CardContent className="pt-6 pb-6 text-center">
                <Search className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Use the Search Bar</h3>
                <p className="text-sm text-muted-foreground">
                  Try: "Korean romance drama" or "90s action movies" 
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // FILTERED EMPTY STATE - When search returns no results
  if (hasSearched && movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16" data-testid="empty-filtered">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-3xl opacity-50" />
              <Film className="w-16 h-16 text-muted-foreground mx-auto relative opacity-50" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              No movies match your current selection
            </h2>
            <p className="text-muted-foreground">
              Try these adjustments to find your perfect film:
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4 text-center">
                <Film className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">Broaden genres</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4 text-center">
                <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">Try different mood</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4 text-center">
                <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">Explore eras</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4 text-center">
                <Globe className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">Adjust languages</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="default" 
              size="lg"
              onClick={onResetFilters}
              data-testid="button-reset-filters-empty"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All Filters
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              data-testid="button-popular-classics"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Popular Classics
            </Button>
          </div>

          <div className="pt-6 border-t border-border">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lightbulb className="w-4 h-4" />
                <span className="font-medium">Can't find what you're looking for?</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Use the search bar to describe your mood: <br />
                <span className="italic text-xs">"I want something lighthearted from the 70s" or "Classic romance with drama"</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full py-8">
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-2" data-testid="text-results-header">
            {mood ? `${mood.charAt(0).toUpperCase() + mood.slice(1)} Recommendations` : "Your Results"}
          </h2>
          <p className="text-muted-foreground">
            Found {movies.length} {movies.length === 1 ? "match" : "matches"} for you
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
