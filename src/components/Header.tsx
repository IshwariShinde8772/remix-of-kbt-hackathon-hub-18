import { Link } from "react-router-dom";
import kbtcoeLogo from "@/assets/kbtcoe-logo.png";
import avinyathonLogo from "@/assets/avinyathon-logo.png";

const Header = () => {
  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-3 md:px-4 py-2.5 md:py-3">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* KBTCOE Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={kbtcoeLogo}
              alt="KBTCOE Logo"
              className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto object-contain"
            />
          </Link>

          {/* College Name - Center */}
          <div className="flex-1 text-center min-w-0">
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground italic font-medium truncate">
              Maratha Vidya Prasarak Samaj's
            </p>
            <h1 className="text-[11px] sm:text-sm md:text-xl lg:text-2xl font-heading font-bold text-secondary leading-tight">
              Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering
            </h1>
            <p className="hidden sm:block text-[10px] md:text-xs lg:text-sm text-secondary/80 font-medium mt-0.5">
              Udoji Maratha Boarding Campus, Near Pumping Station, Gangapur Road, Nashik
            </p>
            <p className="hidden sm:block text-[10px] md:text-xs lg:text-sm text-destructive font-semibold italic mt-0.5">
              An Autonomous Institute Permanently affiliated to Savitribai Phule Pune University
            </p>
          </div>

          {/* Avinyathon Logo - Right */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={avinyathonLogo}
              alt="KBT Avinyathon 2026 Logo"
              className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto object-contain"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
