import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Why Participate", path: "/#why-participate" },
    { name: "Process", path: "/#process" },
    { name: "Problem Statements", path: "/problems" },
    { name: "Resources", path: "/resources" },
    { name: "Contact Us", path: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/" && !location.hash;
    if (path.includes("#")) {
      return location.pathname === "/" && location.hash === path.replace("/", "");
    }
    return location.pathname === path;
  };

  // Scroll to element with offset so user sees partial next section
  const scrollToElementWithOffset = (element: HTMLElement) => {
    const navbarHeight = 60;
    const viewportHeight = window.innerHeight;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    // Position element so user can see there's more content below (show ~70% of viewport)
    const offsetPosition = elementPosition - navbarHeight - (viewportHeight * 0.15);

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  };

  // Handle hash scrolling after navigation - only for hash links, not initial page load
  useEffect(() => {
    // Only scroll to hash if it was a navigation event (not initial load)
    if (location.hash && location.key !== "default") {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          scrollToElementWithOffset(element);
        }
      }, 100);
    }
  }, [location.hash, location.key]);

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    setIsOpen(false);

    // Handle Home link - scroll to top
    if (path === "/") {
      e.preventDefault();
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      // Use navigate to properly update React Router state and clear hash
      navigate("/", { replace: true });
      return;
    }

    if (path.includes("#")) {
      const id = path.split("#")[1];
      // If we're on the home page, prevent default and scroll
      if (location.pathname === "/") {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
          scrollToElementWithOffset(element);
          // Use navigate to properly update React Router state
          navigate(path, { replace: true });
        }
      }
      // If not on home page, let the Link navigate (useEffect will handle scroll)
    }
  };

  return (
    <nav className="bg-secondary sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-3">
          {/* Mobile menu button */}
          <button
            className="md:hidden absolute left-4 text-secondary-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(item.path, e)}
                className={`nav-link ${isActive(item.path) ? "nav-link-active" : ""
                  }`}
              >
                {item.name}
              </Link>
            ))}
            <Link to="/register">
              <Button className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Register Team
              </Button>
            </Link>
            <Link to="/submit-solution">
              <Button className="gradient-cta text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Submit Solution
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(item.path, e)}
                className={`block nav-link ${isActive(item.path) ? "nav-link-active" : ""
                  }`}
              >
                {item.name}
              </Link>
            ))}
            <Link to="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full gradient-primary text-primary-foreground mb-2">
                Register Team
              </Button>
            </Link>
            <Link to="/submit-solution" onClick={() => setIsOpen(false)}>
              <Button className="w-full gradient-cta text-primary-foreground">
                Submit Solution
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
