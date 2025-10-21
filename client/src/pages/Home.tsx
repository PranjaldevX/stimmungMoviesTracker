import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MoodSelector } from "@/components/MoodSelector";
import { AIMoodInterpreter } from "@/components/AIMoodInterpreter";
import { ResultsGrid } from "@/components/ResultsGrid";
import { Mood, Movie, StreamingSource } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import heroImage from "@assets/generated_images/Vintage_cinema_hero_background_712d6a19.png";

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [searchText, setSearchText] = useState<string>("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingData] = useState<Record<number, StreamingSource[]>>({});
  const [likedMovies, setLikedMovies] = useState<Set<number>>(new Set());
  const [dislikedMovies, setDislikedMovies] = useState<Set<number>>(new Set());

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
  };

  const handleAISubmit = async (text: string) => {
    setSearchText(text);
    setIsProcessing(true);
    // Will be connected to backend in Phase 3
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  const handleQuickSearch = async () => {
    if (!selectedMood) return;
    setIsLoading(true);
    // Will be connected to backend in Phase 3
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleLike = (movieId: number) => {
    setLikedMovies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
        dislikedMovies.delete(movieId);
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
        likedMovies.delete(movieId);
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
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center py-16 md:py-24 lg:py-32">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-4" data-testid="text-hero-title">
            Discover Classic Films{" "}
            <span className="relative">
              That Match Your Mood
              <span className="absolute bottom-0 left-0 w-full h-1 bg-primary" />
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            From Bollywood gems to Hollywood legends — timeless cinema for every feeling
          </p>

          <Tabs defaultValue="mood" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="mood" data-testid="tab-mood-selector">
                Quick Mood
              </TabsTrigger>
              <TabsTrigger value="ai" data-testid="tab-ai-interpreter">
                Describe Feeling
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mood" className="space-y-6">
              <MoodSelector
                selectedMood={selectedMood}
                onMoodSelect={handleMoodSelect}
              />
              
              <Button
                data-testid="button-find-movies"
                onClick={handleQuickSearch}
                disabled={!selectedMood || isLoading}
                size="lg"
                className="rounded-full px-8 py-6 text-lg shadow-lg"
              >
                Find My Movies
              </Button>
            </TabsContent>

            <TabsContent value="ai">
              <AIMoodInterpreter
                onSubmit={handleAISubmit}
                isProcessing={isProcessing}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Results Section */}
      <ResultsGrid
        movies={movies}
        mood={selectedMood}
        isLoading={isLoading}
        streamingData={streamingData}
        likedMovies={likedMovies}
        dislikedMovies={dislikedMovies}
        onLike={handleLike}
        onDislike={handleDislike}
      />

      <Footer />
    </div>
  );
}
