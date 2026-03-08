import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Curves */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-primary/10 to-transparent rounded-r-full" />
      <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/10 to-transparent rounded-l-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-6 text-foreground">
            Ready to Find Innovative Solutions?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join leading companies leveraging KBT-AVINYATHON to drive innovation and solve complex challenges.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/problems">
              <Button size="lg" className="gradient-cta text-primary-foreground font-semibold px-8 py-6 text-lg rounded-xl hover:opacity-90 transition-opacity">
                View Problem Statements
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl border-2 border-foreground text-foreground hover:bg-muted">
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
