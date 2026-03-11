import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
          {/* Brand Section */}
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base leading-tight">KBT Avinyathon 2026</h3>
                <p className="text-xs text-secondary-foreground/60">Innovation Platform</p>
              </div>
            </div>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed max-w-xs mx-auto sm:mx-0">
              Transforming business challenges into breakthrough solutions through the power of collaborative innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-secondary-foreground/90">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Why Participate", to: "/#why-participate" },
                { label: "Process", to: "/#process" },
                { label: "Benefits", to: "/#benefits" },
                { label: "Resources", to: "/resources" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-secondary-foreground/70 hover:text-primary-foreground text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left">
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-secondary-foreground/90">Contact Us</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li>
                <a
                  href="https://kbtcoe.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground transition-colors duration-200 break-all"
                >
                  kbtcoe.org
                </a>
              </li>
              <li>Udoji Maratha Boarding Campus</li>
              <li>Gangapur Road, Nashik</li>
              <li>Maharashtra, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/15 mt-8 md:mt-10 pt-6 text-center">
          <p className="text-xs text-secondary-foreground/50">
            © 2026 KBT Avinyathon. All rights reserved.
          </p>
          <p className="text-xs text-secondary-foreground/40 mt-1">
            Organized by Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering, Nashik
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
