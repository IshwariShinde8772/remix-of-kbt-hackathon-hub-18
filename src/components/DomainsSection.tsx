import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const domains = [
  "Software",
  "Hardware",
  "Automation",
  "Graphics",
  "Design",
  "Maintenance",
  "Banking/Sales/Marketing",
  "Other",
];

const DomainsSection = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-background border-l-4 border-primary rounded-xl md:rounded-2xl p-5 md:p-12 shadow-lg">
            <p className="text-sm md:text-lg text-foreground mb-4 md:mb-6 text-center">
              We invite your esteemed organization to contribute{" "}
              <em className="font-semibold">industry-oriented problem statements</em>{" "}
              from domains such as:
            </p>

            <div className="grid grid-cols-2 gap-2 md:gap-4 mb-6 md:mb-8">
              {domains.map((domain, index) => (
                <div key={index} className="text-center font-semibold text-foreground text-sm md:text-base py-1.5 md:py-2">
                  {domain}
                </div>
              ))}
            </div>

            <p className="text-muted-foreground text-center text-xs md:text-base mb-6 md:mb-8">
              Any technology-driven improvement area. Your participation will help students gain exposure to
              real-world challenges while delivering innovative and practical solutions to industry.
            </p>

            <div className="text-center">
              <Link to="/problems">
                <Button size="lg" className="gradient-cta text-primary-foreground font-semibold px-6 md:px-8 py-5 md:py-6 text-sm md:text-lg rounded-xl hover:opacity-90 transition-opacity">
                  Start Your Innovation Journey
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DomainsSection;
