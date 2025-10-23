import { Smile, CloudRain, Clock, Compass, Heart, Zap, Coffee, Search, Sun, Film, Star, AlertCircle } from "lucide-react";
import { Mood, moodConfig } from "@shared/schema";
import { cn } from "@/lib/utils";

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

interface MoodSelectorProps {
  selectedMood?: Mood;
  onMoodSelect: (mood: Mood) => void;
}

export function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {Object.entries(moodConfig).map(([mood, config]) => {
        const Icon = moodIcons[config.icon as keyof typeof moodIcons];
        const isSelected = selectedMood === mood;
        
        return (
          <button
            key={mood}
            data-testid={`button-mood-${mood}`}
            onClick={() => onMoodSelect(mood as Mood)}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-full border-2 transition-all duration-300",
              "backdrop-blur-sm hover-elevate active-elevate-2",
              isSelected
                ? "border-current shadow-lg"
                : "border-border"
            )}
            style={
              isSelected
                ? {
                    borderColor: `hsl(${config.color})`,
                    backgroundColor: `hsl(${config.color} / 0.1)`,
                    boxShadow: `0 0 20px hsl(${config.color} / 0.3)`,
                  }
                : undefined
            }
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
