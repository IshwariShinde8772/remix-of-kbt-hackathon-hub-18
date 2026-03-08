import { Link } from "react-router-dom";
import kbtcoeLogo from "@/assets/kbtcoe-logo.png";
import avinyathonLogo from "@/assets/avinyathon-logo.png";

const Header = () => {
  return (
    <header className="bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="container mx-auto px-3 md:px-4 py-2 md:py-3">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* KBTCOE Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={kbtcoeLogo}
              alt="KBTCOE Logo"
              className="h-12 sm:h-16 md:h-24 w-auto object-contain"
            />
          </Link>

          {/* College Name - Center */}
          <div className="flex-1 text-center min-w-0">
            <p className="text-[10px] sm:text-xs md:text-base text-gray-600 italic font-medium truncate">
              Maratha Vidya Prasarak Samaj's
            </p>
            <h1 className="text-[11px] sm:text-sm md:text-2xl lg:text-3xl font-bold text-[#1a4789] leading-tight">
              Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering
            </h1>
            <p className="hidden sm:block text-xs md:text-sm text-[#1a4789] font-medium mt-1">
              Udoji Maratha Boarding Campus, Near Pumping Station, Gangapur Road, Nashik
            </p>
            <p className="hidden sm:block text-xs md:text-sm text-[#c41e3a] font-semibold italic">
              An Autonomous Institute Permanently affiliated to Savitribai Phule Pune University
            </p>
          </div>

          {/* Avinyathon Logo - Right */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={avinyathonLogo}
              alt="KBT Avinyathon 2026 Logo"
              className="h-12 sm:h-16 md:h-24 w-auto object-contain"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
