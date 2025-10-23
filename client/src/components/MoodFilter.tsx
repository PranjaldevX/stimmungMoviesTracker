import { Mood, moodConfig } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Smile, CloudRain, Clock, Compass, Heart, Zap, Coffee, Search, Sun, Film, Star, AlertCircle } from "lucide-react";

const moodIcons = {
  Smile,
  CloudRain,
  Clock,
  Compass,
  Heart,
  Zap,
  Coffee,
  Search,
  Sun,
  Film,
  Star,
  AlertCircle,
};

interface MoodFilterProps {
  selectedMood?: Mood;
  onMoodChange: (mood: Mood | undefined) => void;
}

export function MoodFilter({ selectedMood, onMoodChange }: MoodFilterProps) {
  const handleMoodSelect = (value: string) => {
    if (value === "none") {
      onMoodChange(undefined);
    } else {
      onMoodChange(value as Mood);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium flex items-center gap-2">
        <Smile className="w-4 h-4 text-muted-foreground" />
        Select Mood
      </label>

      <Select 
        onValueChange={handleMoodSelect} 
        value={selectedMood || "none"}
      >
        <SelectTrigger data-testid="select-mood" className="w-full">
          <SelectValue placeholder="Choose your mood..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none" data-testid="option-mood-none">
            No mood filter
          </SelectItem>
          {Object.entries(moodConfig).map(([mood, config]) => {
            const Icon = moodIcons[config.icon as keyof typeof moodIcons];
            return (
              <SelectItem 
                key={mood} 
                value={mood}
                data-testid={`option-mood-${mood}`}
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{config.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {selectedMood && (
        <div className="text-xs text-muted-foreground">
          Recommended genres: {moodConfig[selectedMood].genres.join(", ")}
        </div>
      )}
    </div>
  );
}
