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

  const scrollToElementWithOffset = (element: HTMLElement) => {
    const navbarHeight = 60;
    const viewportHeight = window.innerHeight;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - navbarHeight - (viewportHeight * 0.15);
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  useEffect(() => {
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    setIsOpen(false);

    if (path === "/") {
      e.preventDefault();
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      navigate("/", { replace: true });
      return;
    }

    if (path.includes("#")) {
      const id = path.split("#")[1];
      if (location.pathname === "/") {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
          scrollToElementWithOffset(element);
          navigate(path, { replace: true });
        }
      }
    }
  };

  return (
    <nav className="bg-secondary sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-3">
          {/* Mobile menu button */}
          <button
            className="md:hidden absolute left-4 text-secondary-foreground p-1"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
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
                className={`nav-link ${isActive(item.path) ? "nav-link-active" : ""}`}
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

          {/* Mobile: Show title */}
          <span className="md:hidden text-secondary-foreground font-heading font-bold text-sm">
            KBT Avinyathon
          </span>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-secondary-foreground/20 pt-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(item.path, e)}
                className={`block nav-link text-sm ${isActive(item.path) ? "nav-link-active" : ""}`}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2 space-y-2">
              <Link to="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full gradient-primary text-primary-foreground text-sm">
                  Register Team
                </Button>
              </Link>
              <Link to="/submit-solution" onClick={() => setIsOpen(false)}>
                <Button className="w-full gradient-cta text-primary-foreground text-sm">
                  Submit Solution
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
