import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    const navbarHeight = 64;
    const viewportHeight = window.innerHeight;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - navbarHeight - (viewportHeight * 0.1);
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  useEffect(() => {
    if (location.hash && location.key !== "default") {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) scrollToElementWithOffset(element);
      }, 100);
    }
  }, [location.hash, location.key]);

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
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-secondary/95 backdrop-blur-md shadow-lg" : "bg-secondary"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Mobile menu button */}
          <button
            className="md:hidden text-secondary-foreground/90 hover:text-secondary-foreground p-2 rounded-lg hover:bg-secondary-foreground/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(item.path, e)}
                className={`relative px-3 lg:px-4 py-2 rounded-lg text-[13px] lg:text-sm font-medium tracking-wide transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-primary/90 text-primary-foreground shadow-sm"
                    : "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/register">
              <Button size="sm" className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                Register Team
              </Button>
            </Link>
            <Link to="/submit-solution">
              <Button size="sm" className="gradient-cta text-primary-foreground px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                Submit Solution
              </Button>
            </Link>
          </div>

          {/* Mobile: Show title */}
          <span className="md:hidden text-secondary-foreground font-heading font-bold text-sm tracking-wide">
            KBT Avinyathon
          </span>

          {/* Spacer for mobile layout balance */}
          <div className="md:hidden w-10" />
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="pb-4 space-y-0.5 border-t border-secondary-foreground/15 pt-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(item.path, e)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-primary/90 text-primary-foreground"
                    : "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
                }`}
              >
                {item.name}
                <ChevronRight className="w-4 h-4 opacity-40" />
              </Link>
            ))}
            <div className="pt-3 px-1 grid grid-cols-2 gap-2">
              <Link to="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full gradient-primary text-primary-foreground text-sm py-2.5 rounded-lg shadow-sm">
                  Register Team
                </Button>
              </Link>
              <Link to="/submit-solution" onClick={() => setIsOpen(false)}>
                <Button className="w-full gradient-cta text-primary-foreground text-sm py-2.5 rounded-lg shadow-sm">
                  Submit Solution
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
