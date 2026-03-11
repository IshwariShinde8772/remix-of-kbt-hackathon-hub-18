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
    <section className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-background border-l-4 border-primary rounded-2xl p-6 md:p-12 shadow-lg">
            <p className="text-sm md:text-base lg:text-lg text-foreground mb-6 text-center leading-relaxed">
              We invite your esteemed organization to contribute{" "}
              <em className="font-semibold">industry-oriented problem statements</em>{" "}
              from domains such as:
            </p>

            <div className="grid grid-cols-2 gap-2.5 md:gap-4 mb-8">
              {domains.map((domain, index) => (
                <div key={index} className="text-center font-semibold text-foreground text-sm md:text-base py-2 rounded-lg bg-muted/50">
                  {domain}
                </div>
              ))}
            </div>

            <p className="text-muted-foreground text-center text-xs md:text-sm lg:text-base mb-8 leading-relaxed">
              Any technology-driven improvement area. Your participation will help students gain exposure to
              real-world challenges while delivering innovative and practical solutions to industry.
            </p>

            <div className="text-center">
              <Link to="/problems">
                <Button size="lg" className="gradient-cta text-primary-foreground font-semibold px-8 py-6 text-sm md:text-lg rounded-xl hover:opacity-90 transition-opacity shadow-lg">
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
