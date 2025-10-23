import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ResultsGrid } from "@/components/ResultsGrid";
import { Content, Genre } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const GOAT_GENRES = [
  "Action",
  "Drama", 
  "Comedy",
  "Thriller",
  "Romance",
  "Science Fiction"
] as const;

type GOATGenre = typeof GOAT_GENRES[number];

const REGIONAL_OPTIONS = [
  { value: "all", label: "All Regions" },
  { value: "indian", label: "Indian" },
  { value: "turkish", label: "Turkish" },
  { value: "pakistani", label: "Pakistani" },
  { value: "korean", label: "Korean" },
] as const;

export default function Discover() {
  const [selectedGenre, setSelectedGenre] = useState<GOATGenre>("Action");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [likedMovies, setLikedMovies] = useState<Set<number>>(new Set());
  const [dislikedMovies, setDislikedMovies] = useState<Set<number>>(new Set());

  // Fetch GOAT content for selected genre
  const { data: goatContent, isLoading } = useQuery<{ content: Content[]; streamingData: Record<number, any[]> }>({
    queryKey: [`/api/goat-content?genre=${selectedGenre}&region=${selectedRegion}`],
    enabled: true,
  });

  const handleLike = (movieId: number) => {
    setLikedMovies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
    setDislikedMovies((prev) => {
      const newSet = new Set(prev);
      newSet.delete(movieId);
      return newSet;
    });
  };

  const handleDislike = (movieId: number) => {
    setDislikedMovies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
    setLikedMovies((prev) => {
      const newSet = new Set(prev);
      newSet.delete(movieId);
      return newSet;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            GOAT Collection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the Greatest Of All Time movies and series across popular genres
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex-1">
        {/* Genre Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select a Genre</h2>
          <div className="flex flex-wrap gap-3">
            {GOAT_GENRES.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                onClick={() => setSelectedGenre(genre)}
                data-testid={`button-genre-${genre.toLowerCase()}`}
                className="min-w-[120px]"
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        {/* Regional Filter for Drama */}
        {selectedGenre === "Drama" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Regional Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Which drama/TV series do you want?
                </label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger data-testid="select-regional-drama">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONAL_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        data-testid={`option-region-${option.value}`}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              Top {selectedGenre} {selectedGenre === "Drama" && selectedRegion !== "all" ? `(${REGIONAL_OPTIONS.find(r => r.value === selectedRegion)?.label})` : ""}
            </h2>
            {goatContent?.content && (
              <Badge variant="outline">
                {goatContent.content.length} {goatContent.content.length === 1 ? 'title' : 'titles'}
              </Badge>
            )}
          </div>

          <ResultsGrid
            movies={goatContent?.content || []}
            isLoading={isLoading}
            streamingData={goatContent?.streamingData || {}}
            likedMovies={likedMovies}
            dislikedMovies={dislikedMovies}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
