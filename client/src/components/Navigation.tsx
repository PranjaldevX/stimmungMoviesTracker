import { Film } from "lucide-react";
import { Link } from "wouter";

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            data-testid="link-home"
            className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-lg"
          >
            <Film className="w-6 h-6 text-primary" />
            <span className="font-serif text-2xl font-bold">Stimmung</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              data-testid="link-discover"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Discover
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
