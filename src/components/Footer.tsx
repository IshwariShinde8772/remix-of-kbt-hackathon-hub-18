import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg">KBT Avinyathon 2026</h3>
                <p className="text-sm text-secondary-foreground/70">Innovation Platform</p>
              </div>
            </div>
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              Transforming business challenges into breakthrough solutions through the power of collaborative innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
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
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
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

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm text-secondary-foreground/60">
          <p>© 2026 KBT Avinyathon. All rights reserved.</p>
          <p className="mt-1">Organized by Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering, Nashik</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
