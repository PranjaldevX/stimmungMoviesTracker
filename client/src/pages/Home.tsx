import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GenreFilter } from "@/components/GenreFilter";
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
  RegionalFocus,
  moodConfig 
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import heroImage from "@assets/generated_images/Vintage_cinema_hero_background_712d6a19.png";
import { Badge } from "@/components/ui/badge";
import { X, Search, SlidersHorizontal, Smile, CloudRain, Clock, Compass, Heart, Zap, Coffee, Sun, Film, Star, AlertCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const moodIcons = {
  Smile, CloudRain, Clock, Compass, Heart, Zap, Coffee, Search, Sun, Film, Star, AlertCircle,
};

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedDecade, setSelectedDecade] = useState<number[]>([0]);
  const [contentType, setContentType] = useState<ContentType>("movie");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [streamingData, setStreamingData] = useState<Record<number, StreamingSource[]>>({});
  const [likedMovies, setLikedMovies] = useState<Set<number>>(new Set());
  const [dislikedMovies, setDislikedMovies] = useState<Set<number>>(new Set());
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const { toast } = useToast();

  const decadeOptions = [
    { label: "1950s", value: 0, from: 1950, to: 1960 },
    { label: "1960s", value: 1, from: 1960, to: 1970 },
    { label: "1970s", value: 2, from: 1970, to: 1980 },
    { label: "1980s", value: 3, from: 1980, to: 1990 },
    { label: "1990s", value: 4, from: 1990, to: 2000 },
    { label: "2000s", value: 5, from: 2000, to: 2010 },
    { label: "2010s", value: 6, from: 2010, to: 2020 },
    { label: "2020s", value: 7, from: 2020, to: 2030 },
  ];

  const searchMutation = useMutation({
    mutationFn: async (request: SearchRequest) => {
      return apiRequest<SearchResponse>("POST", "/api/search-movies", request);
    },
    onSuccess: async (data) => {
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
        if (result && result.sources && result.sources.length > 0) {
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

  const feedbackMutation = useMutation({
    mutationFn: async ({ movieId, liked }: { movieId: number; liked: boolean }) => {
      return apiRequest("POST", "/api/feedback", { movieId, liked });
    },
    onError: (error: any) => {
      toast({
        title: "Feedback Failed",
        description: error.message || "Failed to save feedback.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = async () => {
    const selectedDecadeData = decadeOptions[selectedDecade[0]];
    const request: SearchRequest = { 
      mood: selectedMood,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      yearFrom: selectedDecadeData.from,
      yearTo: selectedDecadeData.to,
      contentType,
      languages: selectedLanguages.length > 0 ? selectedLanguages as any[] : undefined,
    };
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

  const handleResetFilters = () => {
    setSelectedMood(undefined);
    setSelectedGenres([]);
    setSelectedDecade([0]);
    setContentType("movie");
    setSelectedLanguages([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

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

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Mood Selection</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(moodConfig).map(([mood, config]) => {
                      const Icon = moodIcons[config.icon as keyof typeof moodIcons];
                      const isSelected = selectedMood === mood;
                      
                      return (
                        <button
                          key={mood}
                          data-testid={`button-mood-${mood}`}
                          onClick={() => setSelectedMood(isSelected ? undefined : mood as Mood)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200",
                            "hover:shadow-md",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium text-center leading-tight">
                            {config.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <label className="text-sm font-medium">Content Type</label>
                  <RadioGroup value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="movie" id="radio-movie" data-testid="radio-content-movie" />
                      <Label htmlFor="radio-movie" className="cursor-pointer">Movies</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tv" id="radio-tv" data-testid="radio-content-tv" />
                      <Label htmlFor="radio-tv" className="cursor-pointer">TV Series</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Language</label>
                    {selectedLanguages.length > 0 && (
                      <button
                        onClick={() => setSelectedLanguages([])}
                        className="text-xs text-muted-foreground hover:text-foreground"
                        data-testid="button-clear-languages"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                    {languages.map((lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-${lang}`}
                          checked={selectedLanguages.includes(lang)}
                          onCheckedChange={() => toggleLanguage(lang)}
                          data-testid={`checkbox-language-${lang}`}
                        />
                        <Label
                          htmlFor={`lang-${lang}`}
                          className="text-sm cursor-pointer"
                        >
                          {languageLabels[lang]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <GenreFilter
                  selectedGenres={selectedGenres}
                  onGenresChange={setSelectedGenres}
                />

                <Separator />

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Era / Decade: {decadeOptions[selectedDecade[0]].label}
                  </label>
                  <Slider
                    value={selectedDecade}
                    onValueChange={setSelectedDecade}
                    max={7}
                    min={0}
                    step={1}
                    className="w-full"
                    data-testid="slider-decade"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1950s</span>
                    <span>2020s</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    onClick={handleSearch}
                    className="w-full"
                    size="lg"
                    data-testid="button-search"
                    disabled={searchMutation.isPending}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {searchMutation.isPending ? "Searching..." : "Search"}
                  </Button>
                  <Button
                    onClick={handleResetFilters}
                    variant="outline"
                    className="w-full"
                    data-testid="button-reset-filters"
                  >
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
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
      </div>

      <Footer />
    </div>
  );
}
