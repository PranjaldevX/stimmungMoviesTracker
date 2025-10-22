import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MoodSelector } from "@/components/MoodSelector";
import { AIMoodInterpreter } from "@/components/AIMoodInterpreter";
import { ResultsGrid } from "@/components/ResultsGrid";
import { Mood, SearchRequest, SearchResponse, StreamingSource, eraOptions, languages, languageLabels, ContentType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import heroImage from "@assets/generated_images/Vintage_cinema_hero_background_712d6a19.png";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [selectedEra, setSelectedEra] = useState<typeof eraOptions[number]>(eraOptions[8]); // Default to "All Classics"
  const [contentType, setContentType] = useState<ContentType>("movie");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [searchData, setSearchData] = useState<SearchRequest | null>(null);
  const [streamingData, setStreamingData] = useState<Record<number, StreamingSource[]>>({});
  const [likedMovies, setLikedMovies] = useState<Set<number>>(new Set());
  const [dislikedMovies, setDislikedMovies] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Search movies mutation
  const searchMutation = useMutation({
    mutationFn: async (request: SearchRequest) => {
      return apiRequest<SearchResponse>("POST", "/api/search-movies", request);
    },
    onSuccess: async (data) => {
      // Fetch streaming availability for all movies
      const streamingPromises = data.movies
        .filter((m) => m.imdbId)
        .map(async (movie) => {
          try {
            const response = await fetch(`/api/movie/${movie.id}/availability`);
            if (response.ok) {
              const data = await response.json();
              return { movieId: movie.id, sources: data.sources };
            }
          } catch (error) {
            console.error(`Failed to fetch streaming for ${movie.id}`, error);
          }
          return null;
        });

      const streamingResults = await Promise.all(streamingPromises);
      const newStreamingData: Record<number, StreamingSource[]> = {};
      
      streamingResults.forEach((result) => {
        if (result && result.sources.length > 0) {
          newStreamingData[result.movieId] = result.sources;
        }
      });

      setStreamingData(newStreamingData);
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search movies. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Feedback mutations
  const feedbackMutation = useMutation({
    mutationFn: async ({ movieId, liked }: { movieId: number; liked: boolean }) => {
      return apiRequest("POST", "/api/feedback", {
        movieId,
        liked,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Feedback Failed",
        description: error.message || "Failed to save feedback.",
        variant: "destructive",
      });
    },
  });

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
  };

  const handleAISubmit = async (text: string) => {
    const request: SearchRequest = { text };
    setSearchData(request);
    searchMutation.mutate(request);
  };

  const handleQuickSearch = async () => {
    if (!selectedMood) return;
    const request: SearchRequest = { 
      mood: selectedMood,
      yearFrom: selectedEra.from,
      yearTo: selectedEra.to,
      contentType: contentType,
      languages: selectedLanguages.length > 0 ? selectedLanguages as any[] : undefined,
    };
    setSearchData(request);
    searchMutation.mutate(request);
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const allMovies: any[] = [
    ...(searchMutation.data?.movies || []),
    ...(searchMutation.data?.tvSeries || []),
  ];

  const handleLike = (movieId: number) => {
    const wasLiked = likedMovies.has(movieId);
    
    setLikedMovies((prev) => {
      const newSet = new Set(prev);
      if (wasLiked) {
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

    if (!wasLiked) {
      feedbackMutation.mutate({ movieId, liked: true });
    }
  };

  const handleDislike = (movieId: number) => {
    const wasDisliked = dislikedMovies.has(movieId);
    
    setDislikedMovies((prev) => {
      const newSet = new Set(prev);
      if (wasDisliked) {
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

    if (!wasDisliked) {
      feedbackMutation.mutate({ movieId, liked: false });
    }
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
            Discover Movies & Series{" "}
            <span className="relative inline-block">
              That Match Your Mood
              <span className="absolute bottom-0 left-0 w-full h-1 bg-primary" />
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            From Bollywood to Hollywood, Korean dramas to superhero sagas — endless entertainment for every feeling
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
              {/* Content Type Toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-full bg-muted p-1">
                  <button
                    data-testid="button-content-type-movie"
                    onClick={() => setContentType("movie")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      contentType === "movie"
                        ? "bg-background shadow-md"
                        : "text-muted-foreground hover-elevate"
                    }`}
                  >
                    Movies
                  </button>
                  <button
                    data-testid="button-content-type-tv"
                    onClick={() => setContentType("tv")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      contentType === "tv"
                        ? "bg-background shadow-md"
                        : "text-muted-foreground hover-elevate"
                    }`}
                  >
                    TV Series
                  </button>
                </div>
              </div>

              <MoodSelector
                selectedMood={selectedMood}
                onMoodSelect={handleMoodSelect}
              />
              
              <div className="flex flex-col items-center gap-4">
                {/* Language Filter */}
                <div className="w-full max-w-2xl">
                  <label className="block text-sm font-medium mb-3 text-center">
                    Languages (optional)
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      { code: "hi", label: "Hindi" },
                      { code: "ta", label: "Tamil" },
                      { code: "te", label: "Telugu" },
                      { code: "ml", label: "Malayalam" },
                      { code: "kn", label: "Kannada" },
                      { code: "bn", label: "Bengali" },
                      { code: "mr", label: "Marathi" },
                      { code: "pa", label: "Punjabi" },
                      { code: "en", label: "English" },
                      { code: "ko", label: "Korean" },
                      { code: "tr", label: "Turkish" },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        data-testid={`button-lang-${lang.code}`}
                        onClick={() => toggleLanguage(lang.code)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedLanguages.includes(lang.code)
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted text-muted-foreground hover-elevate"
                        }`}
                      >
                        {lang.label}
                        {selectedLanguages.includes(lang.code) && (
                          <X className="inline w-3 h-3 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedLanguages.length > 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      {selectedLanguages.length} language{selectedLanguages.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>

                <div className="w-full max-w-xs">
                  <label className="block text-sm font-medium mb-2 text-center">
                    Era
                  </label>
                  <Select
                    value={selectedEra.label}
                    onValueChange={(value) => {
                      const era = eraOptions.find(e => e.label === value);
                      if (era) setSelectedEra(era);
                    }}
                  >
                    <SelectTrigger data-testid="select-era" className="w-full">
                      <SelectValue placeholder="Select an era" />
                    </SelectTrigger>
                    <SelectContent>
                      {eraOptions.map((era) => (
                        <SelectItem key={era.label} value={era.label}>
                          {era.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  data-testid="button-find-movies"
                  onClick={handleQuickSearch}
                  disabled={!selectedMood || searchMutation.isPending}
                  size="lg"
                  className="rounded-full px-8 py-6 text-lg shadow-lg"
                >
                  {searchMutation.isPending ? "Searching..." : `Find My ${contentType === "movie" ? "Movies" : "Series"}`}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="ai">
              <AIMoodInterpreter
                onSubmit={handleAISubmit}
                isProcessing={searchMutation.isPending}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Results Section */}
      <ResultsGrid
        movies={allMovies}
        mood={selectedMood}
        isLoading={searchMutation.isPending}
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
