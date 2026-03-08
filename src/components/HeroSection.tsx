import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import hackathonHero from "@/assets/hackathon-hero.jpg";

const HeroSection = () => {
  return (
    <section className="gradient-hero-bg py-6">
      {/* Event Title Banner - Animated with Background */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex justify-center">
          <div className="relative inline-block group">
            {/* Animated background glow - pulsing */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl blur-2xl opacity-50 animate-pulse-glow scale-110" />
            
            {/* Secondary glow layer for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-secondary rounded-2xl blur-xl opacity-30 animate-pulse-glow-delayed scale-105" />
            
            {/* Main title container */}
            <div className="relative bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl px-6 md:px-12 py-5 md:py-6 shadow-2xl overflow-hidden border border-white/20">
              {/* Shimmer animation overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              
              {/* Moving gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 animate-gradient-shift opacity-50" />
              
              {/* Sparkle effects */}
              <div className="absolute top-2 left-8 w-2 h-2 bg-white rounded-full animate-sparkle opacity-70" />
              <div className="absolute bottom-3 right-12 w-1.5 h-1.5 bg-white rounded-full animate-sparkle-delayed opacity-60" />
              <div className="absolute top-4 right-20 w-1 h-1 bg-white rounded-full animate-sparkle opacity-50" />
              
              {/* Title text with gradient color */}
              <h2 className="relative text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-heading font-black tracking-wide whitespace-nowrap animate-text-glow bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent drop-shadow-lg">
                KBT AVINYATHON 2026
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fade-in text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black leading-tight text-center lg:text-left">
              <span className="text-foreground">Transform Your</span>
              <br />
              <span className="text-gradient">Technological</span>
              <br />
              <span className="text-gradient">Challenges</span>
              <br />
              <span className="text-foreground">Into Solutions</span>
            </h1>

            <p className="text-foreground text-lg">
              <strong>KBTCOE</strong> is organizing a{" "}
              <strong>State-Level KBT-AVINYATHON in April 2026</strong> designed to bring
              together innovative young minds to solve real-world industry problems.
            </p>

            <div className="space-y-2">
              <p className="font-semibold text-foreground">The event aims to:</p>
              <ol className="space-y-1 text-foreground">
                <li>1. Encourage application of technical knowledge</li>
                <li>2. Promote creativity and problem-solving</li>
                <li>3. Connect students with industrial challenges</li>
                <li>4. Build a strong industry–academia ecosystem</li>
              </ol>
            </div>

            <p className="text-muted-foreground">
              Connect with brilliant innovators ready to tackle your problems.
              Get breakthrough solutions in just few hours.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/problems">
                <Button size="lg" className="gradient-cta text-primary-foreground font-semibold px-8 py-6 text-lg rounded-xl hover:opacity-90 transition-opacity">
                  View Problem Statements
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg rounded-xl border-2 border-foreground text-foreground hover:bg-muted"
                onClick={() => {
                  const element = document.getElementById("process");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Learn How It Works
              </Button>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative animate-slide-in-right">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={hackathonHero}
                alt="Students collaborating at hackathon"
                className="w-full h-auto object-cover"
              />
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 glass-card rounded-xl px-4 py-3 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-success" />
                <span className="font-medium text-foreground">Rapid Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
