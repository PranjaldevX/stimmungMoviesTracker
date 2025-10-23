import { Heart, ThumbsDown, Star, Clock, Tv } from "lucide-react";
import { Movie, TVSeries, Content, StreamingSource } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MovieCardProps {
  movie: Content;
  streamingSources?: StreamingSource[];
  onLike?: (movieId: number) => void;
  onDislike?: (movieId: number) => void;
  onClick?: (movie: Content) => void;
  isLiked?: boolean;
  isDisliked?: boolean;
}

export function MovieCard({
  movie,
  streamingSources,
  onLike,
  onDislike,
  onClick,
  isLiked = false,
  isDisliked = false,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : "/placeholder-poster.png";

  const isTVSeries = movie.contentType === "tv";
  const year = isTVSeries 
    ? (movie as TVSeries).firstAirDate ? new Date((movie as TVSeries).firstAirDate).getFullYear() : "N/A"
    : (movie as Movie).releaseDate ? new Date((movie as Movie).releaseDate).getFullYear() : "N/A";
  
  const runtime = isTVSeries
    ? (movie as TVSeries).numberOfSeasons ? `${(movie as TVSeries).numberOfSeasons} Season${(movie as TVSeries).numberOfSeasons! > 1 ? "s" : ""}` : ""
    : (movie as Movie).runtime ? `${(movie as Movie).runtime}min` : "";

  return (
    <div
      className="group relative aspect-[2/3] rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(movie)}
      data-testid={`card-movie-${movie.id}`}
    >
      <img
        src={posterUrl}
        alt={movie.title}
        className="w-full h-full object-cover"
      />
      
      {/* API Source Badge - Always visible */}
      {movie.apiSource && (
        <div className="absolute top-2 right-2 z-10">
          <Badge
            variant="outline"
            className="text-xs backdrop-blur-sm bg-background/80"
            data-testid={`badge-api-source-${movie.id}`}
          >
            {movie.apiSource}
          </Badge>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent",
          "transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-1">
            {isTVSeries && <Tv className="w-4 h-4 text-primary" />}
            <h3 className="text-xl font-bold text-white" data-testid={`text-title-${movie.id}`}>
              {movie.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <span data-testid={`text-year-${movie.id}`}>{year}</span>
            {runtime && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{runtime}</span>
                </div>
              </>
            )}
          </div>

          {movie.voteAverage > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-sm font-medium text-white">
                {movie.voteAverage.toFixed(1)}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genres.slice(0, 3).map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="text-xs rounded-full px-2 py-0.5"
              >
                {genre}
              </Badge>
            ))}
          </div>

          {movie.isDubbed && (
            <div className="mb-2">
              <Badge variant="outline" className="text-xs">
                Dubbed
              </Badge>
            </div>
          )}

          {streamingSources && streamingSources.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {streamingSources.slice(0, 3).map((source, idx) => (
                <Badge
                  key={idx}
                  className="text-xs rounded-full px-2.5 py-1 bg-accent"
                >
                  {source.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  data-testid={`button-like-${movie.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike?.(movie.id);
                  }}
                  className={cn(
                    "p-2 rounded-full transition-all hover-elevate",
                    isLiked ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Love it</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  data-testid={`button-dislike-${movie.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDislike?.(movie.id);
                  }}
                  className={cn(
                    "p-2 rounded-full transition-all hover-elevate",
                    isDisliked ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  <ThumbsDown className={cn("w-5 h-5", isDisliked && "fill-current")} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Not for me</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
