import { Mail, Twitter, Instagram, Facebook } from "lucide-react";

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
              <li>🇰🇷 Korean</li>
              <li>🇹🇷 Turkish</li>
              <li>🇵🇰 Urdu</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:contact@stimmung.com" className="hover:text-primary transition-colors">
                contact@stimmung.com
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a 
                href="https://twitter.com/stimmung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/stimmung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com/stimmung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
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
