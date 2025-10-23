import { eraOptions, regionalFocus, RegionalFocus } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Globe } from "lucide-react";

interface AdvancedFiltersProps {
  selectedEra: typeof eraOptions[number];
  onEraChange: (era: typeof eraOptions[number]) => void;
  regionalFocus?: RegionalFocus;
  onRegionalFocusChange: (focus: RegionalFocus | undefined) => void;
  oldClassicsOnly: boolean;
  onOldClassicsOnlyChange: (value: boolean) => void;
}

export function AdvancedFilters({
  selectedEra,
  onEraChange,
  regionalFocus: selectedRegionalFocus,
  onRegionalFocusChange,
  oldClassicsOnly,
  onOldClassicsOnlyChange,
}: AdvancedFiltersProps) {
  const handleEraSelect = (value: string) => {
    const era = eraOptions.find((e) => e.label === value);
    if (era) {
      onEraChange(era);
    }
  };

  const handleRegionalFocusSelect = (value: string) => {
    if (value === "none") {
      onRegionalFocusChange(undefined);
    } else {
      onRegionalFocusChange(value as RegionalFocus);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Time Period
        </label>
        <Select 
          onValueChange={handleEraSelect} 
          value={selectedEra.label}
        >
          <SelectTrigger data-testid="select-era" className="w-full">
            <SelectValue placeholder="Select time period..." />
          </SelectTrigger>
          <SelectContent>
            {eraOptions.map((era) => (
              <SelectItem 
                key={era.label} 
                value={era.label}
                data-testid={`option-era-${era.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {era.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          Regional Focus
        </label>
        <Select 
          onValueChange={handleRegionalFocusSelect} 
          value={selectedRegionalFocus || "none"}
        >
          <SelectTrigger data-testid="select-regional-focus" className="w-full">
            <SelectValue placeholder="Select region..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" data-testid="option-regional-none">
              No regional filter
            </SelectItem>
            {regionalFocus.map((region) => (
              <SelectItem 
                key={region} 
                value={region}
                data-testid={`option-regional-${region.toLowerCase()}`}
              >
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between space-x-2 pt-2 border-t">
        <Label 
          htmlFor="old-classics-toggle" 
          className="text-sm cursor-pointer"
          data-testid="label-old-classics"
        >
          Old Classics Only (Before 1990)
        </Label>
        <Switch
          id="old-classics-toggle"
          data-testid="switch-old-classics"
          checked={oldClassicsOnly}
          onCheckedChange={onOldClassicsOnlyChange}
        />
      </div>
    </div>
  );
}
