import { useState, useEffect } from "react";
import { Movie, StreamingSource } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Calendar, Globe, ExternalLink, Loader2 } from "lucide-react";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

interface MovieDetailModalProps {
  movie: Movie | null;
  streamingSources?: StreamingSource[];
  isOpen: boolean;
  onClose: () => void;
}

export function MovieDetailModal({
  movie,
  streamingSources = [],
  isOpen,
  onClose,
}: MovieDetailModalProps) {
  const [cast, setCast] = useState<CastMember[]>([]);
  const [isLoadingCast, setIsLoadingCast] = useState(false);
  const [castError, setCastError] = useState(false);

  useEffect(() => {
    if (movie && isOpen) {
      setCast([]);
      setCastError(false);
      setIsLoadingCast(true);
      fetch(`/api/movie/${movie.id}/credits`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch cast");
          return res.json();
        })
        .then((data) => {
          setCast(data.cast || []);
        })
        .catch((error) => {
          console.error("Error fetching cast:", error);
          setCastError(true);
        })
        .finally(() => {
          setIsLoadingCast(false);
        });
    } else {
      setCast([]);
      setCastError(false);
    }
  }, [movie, isOpen]);

  if (!movie) return null;

  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : "/placeholder-poster.png";

  const backdropUrl = movie.backdropPath
    ? `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null;

  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "N/A";
  const runtime = movie.runtime ? `${movie.runtime}min` : "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0" data-testid="modal-movie-detail">
        <ScrollArea className="max-h-[90vh]">
          {backdropUrl && (
            <div className="relative w-full h-64 md:h-80">
              <img
                src={backdropUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
          )}

          <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-32 h-48 object-cover rounded-lg shadow-lg"
                  data-testid="img-poster"
                />
                <div className="flex-1">
                  <DialogTitle className="text-3xl font-bold mb-2" data-testid="text-title">
                    {movie.title}
                  </DialogTitle>
                  {movie.originalTitle && movie.originalTitle !== movie.title && (
                    <p className="text-muted-foreground mb-3">
                      Original: {movie.originalTitle}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span data-testid="text-year">{year}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span data-testid="text-runtime">{runtime}</span>
                    </div>
                    {movie.voteAverage > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="font-medium" data-testid="text-rating">
                          {movie.voteAverage.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span className="uppercase">{movie.originalLanguage}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <Badge key={genre} variant="secondary" data-testid={`badge-genre-${genre}`}>
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-overview">
                  {movie.overview}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Cast</h3>
                {isLoadingCast ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : castError ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Failed to load cast information</p>
                  </div>
                ) : cast.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {cast.map((member) => (
                      <div key={member.id} className="text-center" data-testid={`cast-member-${member.id}`}>
                        <div className="w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden bg-muted">
                          {member.profilePath ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${member.profilePath}`}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Globe className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <p className="font-medium text-sm" data-testid={`text-actor-${member.id}`}>
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.character}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No cast information available</p>
                )}
              </div>

              {streamingSources.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Where to Watch</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {streamingSources.map((source, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="justify-between h-auto py-3"
                          asChild
                          data-testid={`button-streaming-${source.name}`}
                        >
                          <a
                            href={source.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="text-left">
                              <p className="font-medium">{source.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {source.type}
                              </p>
                            </div>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
