import { Film, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navigation() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link 
            href="/" 
            data-testid="link-home"
            className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-lg"
          >
            <Film className="w-6 h-6 text-primary" />
            <span className="font-serif text-2xl font-bold">Stimmung</span>
          </Link>

          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                type="text"
                placeholder="Search movies, series, actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                data-testid="input-search"
              />
              <Button 
                type="submit" 
                size="icon"
                variant="default"
                data-testid="button-search-submit"
              >
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/discover" 
              data-testid="link-discover"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              Discover
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
