import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
            <h3 className="font-semibold mb-4">Status</h3>
            <Badge variant="outline" className="text-xs">
              🔧 Testing Mode – Non-commercial
            </Badge>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Stimmung. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
