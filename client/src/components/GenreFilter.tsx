import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { genres, Genre } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GenreFilterProps {
  selectedGenres: string[];
  onGenresChange: (genres: string[]) => void;
}

export function GenreFilter({ selectedGenres, onGenresChange }: GenreFilterProps) {
  const handleGenreSelect = (genre: string) => {
    if (!selectedGenres.includes(genre)) {
      onGenresChange([...selectedGenres, genre]);
    }
  };

  const handleGenreRemove = (genre: string) => {
    onGenresChange(selectedGenres.filter((g) => g !== genre));
  };

  const handleClearAll = () => {
    onGenresChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <label className="text-sm font-medium">Filter by Genre</label>
        </div>
        {selectedGenres.length > 0 && (
          <button
            onClick={handleClearAll}
            data-testid="button-clear-genres"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <Select onValueChange={handleGenreSelect} value="">
        <SelectTrigger data-testid="select-genre" className="w-full">
          <SelectValue placeholder="Select genres..." />
        </SelectTrigger>
        <SelectContent>
          {genres
            .filter((genre) => !selectedGenres.includes(genre))
            .map((genre) => (
              <SelectItem key={genre} value={genre} data-testid={`option-genre-${genre.toLowerCase().replace(/\s+/g, "-")}`}>
                {genre}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGenres.map((genre) => (
            <Badge
              key={genre}
              variant="secondary"
              className="gap-1 pr-1"
              data-testid={`badge-genre-${genre.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {genre}
              <button
                onClick={() => handleGenreRemove(genre)}
                data-testid={`button-remove-genre-${genre.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover-elevate active-elevate-2 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
