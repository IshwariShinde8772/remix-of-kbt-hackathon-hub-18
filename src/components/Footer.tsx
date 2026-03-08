import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {/* Brand Section */}
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base md:text-lg">KBT Avinyathon 2026</h3>
                <p className="text-xs md:text-sm text-secondary-foreground/70">Innovation Platform</p>
              </div>
            </div>
            <p className="text-secondary-foreground/80 text-xs md:text-sm leading-relaxed">
              Transforming business challenges into breakthrough solutions through the power of collaborative innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-heading font-bold text-base md:text-lg mb-3 md:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/#why-participate" className="text-secondary-foreground/80 hover:text-primary-foreground transition-colors">
                  Why Participate
                </Link>
              </li>
              <li>
                <Link to="/#process" className="text-secondary-foreground/80 hover:text-primary-foreground transition-colors">
                  Process
                </Link>
              </li>
              <li>
                <Link to="/#benefits" className="text-secondary-foreground/80 hover:text-primary-foreground transition-colors">
                  Benefits
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-secondary-foreground/80 hover:text-primary-foreground transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left">
            <h4 className="font-heading font-bold text-base md:text-lg mb-3 md:mb-4">Contact Us</h4>
            <ul className="space-y-2 text-xs md:text-sm text-secondary-foreground/80">
              <li>
                <a href="https://kbtcoe.org/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">
                  https://kbtcoe.org/
                </a>
              </li>
              <li>Udoji Maratha Boarding Campus</li>
              <li>Gangapur Road, Nashik</li>
              <li>Maharashtra, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-xs md:text-sm text-secondary-foreground/60">
          <p>© 2026 KBT Avinyathon. All rights reserved.</p>
          <p className="mt-1">Organized by Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering, Nashik</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
