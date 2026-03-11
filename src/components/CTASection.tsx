import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-14 md:py-20 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-primary/5 to-transparent rounded-r-full" />
      <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/5 to-transparent rounded-l-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black mb-4 text-foreground leading-tight">
            Ready to Find Innovative Solutions?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg mb-8 leading-relaxed">
            Join leading companies leveraging KBT-AVINYATHON to drive innovation and solve complex challenges.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4">
            <Link to="/problems" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gradient-cta text-primary-foreground font-semibold px-8 py-6 text-base md:text-lg rounded-xl hover:opacity-90 transition-opacity shadow-lg">
                View Problem Statements
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-base md:text-lg rounded-xl border-2 border-foreground/20 text-foreground hover:bg-muted transition-colors">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
