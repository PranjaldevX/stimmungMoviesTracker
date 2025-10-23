import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MoodSelector } from "@/components/MoodSelector";
import { MoodFilter } from "@/components/MoodFilter";
import { GenreFilter } from "@/components/GenreFilter";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { AIMoodInterpreter } from "@/components/AIMoodInterpreter";
import { ResultsGrid } from "@/components/ResultsGrid";
import { 
  Mood, 
  SearchRequest, 
  SearchResponse, 
  StreamingSource, 
  eraOptions, 
  languages, 
  languageLabels, 
  ContentType,
  RegionalFocus 
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import heroImage from "@assets/generated_images/Vintage_cinema_hero_background_712d6a19.png";
import { Badge } from "@/components/ui/badge";
import { X, Search, Sparkles, SlidersHorizontal } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedEra, setSelectedEra] = useState<typeof eraOptions[number]>(eraOptions[0]); // Default to "All Time"
  const [regionalFocus, setRegionalFocus] = useState<RegionalFocus | undefined>();
  const [oldClassicsOnly, setOldClassicsOnly] = useState(false);
  const [contentType, setContentType] = useState<ContentType>("movie");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [searchData, setSearchData] = useState<SearchRequest | null>(null);
  const [streamingData, setStreamingData] = useState<Record<number, StreamingSource[]>>({});
  const [likedMovies, setLikedMovies] = useState<Set<number>>(new Set());
  const [dislikedMovies, setDislikedMovies] = useState<Set<number>>(new Set());
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const { toast } = useToast();

  // Search movies mutation
  const searchMutation = useMutation({
    mutationFn: async (request: SearchRequest) => {
      return apiRequest<SearchResponse>("POST", "/api/search-movies", request);
    },
    onSuccess: async (data) => {
      // Fetch streaming availability for all movies and TV series
      const allContent = [
        ...(data.movies || []),
        ...(data.tvSeries || []),
      ];
      
      const streamingPromises = allContent
        .filter((content) => content.imdbId)
        .map(async (content) => {
          try {
            const response = await fetch(`/api/movie/${content.id}/availability`);
            if (response.ok) {
              const result = await response.json();
              return { contentId: content.id, sources: result.sources };
            }
          } catch (error) {
            console.error(`Failed to fetch streaming for ${content.id}`, error);
          }
          return null;
        });

      const streamingResults = await Promise.all(streamingPromises);
      const newStreamingData: Record<number, StreamingSource[]> = {};
      
      streamingResults.forEach((result) => {
        if (result && result.sources.length > 0) {
          newStreamingData[result.contentId] = result.sources;
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
    const request: SearchRequest = { 
      text,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      yearFrom: oldClassicsOnly ? 1900 : selectedEra.from,
      yearTo: oldClassicsOnly ? 1990 : selectedEra.to,
      contentType,
      languages: selectedLanguages.length > 0 ? selectedLanguages as any[] : undefined,
      regionalFocus,
      oldClassicsOnly,
    };
    setSearchData(request);
    searchMutation.mutate(request);
  };

  const handleFilterSearch = async () => {
    const request: SearchRequest = { 
      mood: selectedMood,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      yearFrom: oldClassicsOnly ? 1900 : selectedEra.from,
      yearTo: oldClassicsOnly ? 1990 : selectedEra.to,
      contentType,
      languages: selectedLanguages.length > 0 ? selectedLanguages as any[] : undefined,
      regionalFocus,
      oldClassicsOnly,
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Cinema background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6">
            Discover Movies & Series
            <br />
            That Match Your Mood
          </h1>
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
            From Bollywood to Hollywood, Korean dramas to superhero sagas — endless
            entertainment for every feeling
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex-1">
        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8" data-testid="tabs-search-mode">
            <TabsTrigger value="quick" data-testid="tab-quick-mood">
              <Sparkles className="w-4 h-4 mr-2" />
              Quick Mood
            </TabsTrigger>
            <TabsTrigger value="ai" data-testid="tab-ai-interpreter">
              AI Mood Interpreter
            </TabsTrigger>
          </TabsList>

          {/* Quick Mood Tab */}
          <TabsContent value="quick" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Mood Selector */}
                    <MoodFilter
                      selectedMood={selectedMood}
                      onMoodChange={setSelectedMood}
                    />

                    <Separator />

                    {/* Genre Filter */}
                    <GenreFilter
                      selectedGenres={selectedGenres}
                      onGenresChange={setSelectedGenres}
                    />

                    <Separator />

                    {/* Content Type */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Content Type</label>
                      <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                        <SelectTrigger data-testid="select-content-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="movie" data-testid="option-content-movie">Movies</SelectItem>
                          <SelectItem value="tv" data-testid="option-content-tv">TV Series</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Language Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Languages</label>
                      <div className="flex flex-wrap gap-2">
                        {languages.slice(0, 8).map((lang) => (
                          <Badge
                            key={lang}
                            variant={selectedLanguages.includes(lang) ? "default" : "outline"}
                            className="cursor-pointer hover-elevate"
                            onClick={() => toggleLanguage(lang)}
                            data-testid={`badge-language-${lang}`}
                          >
                            {languageLabels[lang]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Filters (Collapsible) */}
                    <Collapsible open={advancedFiltersOpen} onOpenChange={setAdvancedFiltersOpen}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between"
                          data-testid="button-toggle-advanced-filters"
                        >
                          <span className="text-sm font-medium">Advanced Filters</span>
                          <SlidersHorizontal className="w-4 h-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4">
                        <AdvancedFilters
                          selectedEra={selectedEra}
                          onEraChange={setSelectedEra}
                          regionalFocus={regionalFocus}
                          onRegionalFocusChange={setRegionalFocus}
                          oldClassicsOnly={oldClassicsOnly}
                          onOldClassicsOnlyChange={setOldClassicsOnly}
                        />
                      </CollapsibleContent>
                    </Collapsible>

                    <Button
                      onClick={handleFilterSearch}
                      className="w-full"
                      size="lg"
                      data-testid="button-search"
                      disabled={searchMutation.isPending}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {searchMutation.isPending ? "Searching..." : "Search"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Results */}
              <div className="lg:col-span-2">
                {/* Quick Mood Selector */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Or select a mood quickly:</h3>
                  <MoodSelector
                    selectedMood={selectedMood}
                    onMoodSelect={handleMoodSelect}
                  />
                </div>

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
              </div>
            </div>
          </TabsContent>

          {/* AI Interpreter Tab */}
          <TabsContent value="ai" className="space-y-8">
            <div className="max-w-3xl mx-auto">
              <AIMoodInterpreter
                onSubmit={handleAISubmit}
                isProcessing={searchMutation.isPending}
              />
              
              {searchMutation.data?.interpretation && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Mood Interpretation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Detected Mood:</strong> {searchMutation.data.interpretation.mood}</p>
                      <p><strong>Recommended Genres:</strong> {searchMutation.data.interpretation.preferredGenres.join(", ")}</p>
                      <p><strong>Confidence:</strong> {(searchMutation.data.interpretation.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <ResultsGrid
              movies={allMovies}
              mood={searchMutation.data?.interpretation?.mood}
              isLoading={searchMutation.isPending}
              streamingData={streamingData}
              likedMovies={likedMovies}
              dislikedMovies={dislikedMovies}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
