import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">About Stimmung</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover timeless classic films from Bollywood, Hollywood, and international cinema that match your mood.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Languages</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>🇮🇳 Hindi</li>
              <li>🇬🇧 English</li>
              <li>🇪🇸 Spanish</li>
              <li>🇮🇹 Italian</li>
              <li>🇩🇪 German</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Data provided by TMDb</p>
              <p className="text-xs">
                This product uses the TMDb API but is not endorsed or certified by TMDb.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Status</h3>
            <Badge variant="outline" className="text-xs">
              🔧 Testing Mode – Non-commercial
            </Badge>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              alt="TMDb Logo"
              className="h-4"
            />
            <span className="text-xs text-muted-foreground">
              Movie data and images provided by The Movie Database (TMDb)
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Stimmung. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
