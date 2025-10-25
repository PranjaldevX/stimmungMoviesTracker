import { Mail, Twitter, Instagram, Facebook, Youtube } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold">Stimmung</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover timeless classic films from Bollywood, Hollywood, and international cinema that match your mood.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-footer-browse-movies"
                >
                  Browse Movies
                </Link>
              </li>
              <li>
                <Link 
                  href="/?contentType=tv" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-footer-tv-series"
                >
                  TV Series
                </Link>
              </li>
              <li>
                <Link 
                  href="/?mood=nostalgic" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-footer-mood-explorer"
                >
                  Mood Explorer
                </Link>
              </li>
              <li>
                <Link 
                  href="/?decade=1950s" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-footer-classical-era"
                >
                  Classical Era
                </Link>
              </li>
              <li>
                <Link 
                  href="/?decade=2020s" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-footer-new-arrivals"
                >
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide">Support</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#help" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-footer-help-center"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contact@stimmung.com" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-footer-contact-us"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="#privacy" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-footer-privacy-policy"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#terms" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-footer-terms-of-service"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-footer-about-us"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect & Languages */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide">Connect With Us</h3>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com/stimmung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
                data-testid="link-footer-facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/stimmung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
                data-testid="link-footer-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com/stimmung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
                data-testid="link-footer-twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com/@stimmung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
                data-testid="link-footer-youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            <div className="pt-4">
              <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">Available In</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hindi • English • Korean • Turkish • Urdu • Tamil • Telugu • Malayalam • Kannada • Bengali • Marathi • Punjabi • Spanish • Italian • German
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Stimmung. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a 
                href="mailto:contact@stimmung.com" 
                className="hover:text-primary transition-colors"
                data-testid="link-footer-email"
              >
                contact@stimmung.com
              </a>
              <span>|</span>
              <span>Follow our journey</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
