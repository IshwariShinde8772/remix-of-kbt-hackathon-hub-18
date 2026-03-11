import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSearch, ArrowRight, Cpu, BarChart3, Palette, Wrench, Monitor, LayoutGrid } from "lucide-react";

const domains = [
  { name: "Automation", icon: Cpu, bg: "bg-accent" },
  { name: "Banking / Sales", icon: BarChart3, bg: "bg-accent" },
  { name: "Design", icon: Palette, bg: "bg-accent" },
  { name: "Hardware", icon: Wrench, bg: "bg-accent" },
  { name: "Software", icon: Monitor, bg: "bg-accent" },
  { name: "Other", icon: LayoutGrid, bg: "bg-accent" },
];

const ProblemStatementsPreview = () => {
  return (
    <section id="problem-statements" className="py-12 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Badge */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 bg-background border border-border text-foreground px-4 py-2 rounded-full text-xs md:text-sm font-medium tracking-wide">
            <FileSearch className="w-4 h-4 text-primary" />
            Problem Statements
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black mb-3 text-foreground leading-tight">
            Explore Problem Statements
          </h2>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg leading-relaxed">
            Browse real-world challenges from leading industries and organizations.
            Pick a problem that matches your skills and build an innovative solution.
          </p>
        </div>

        {/* Domain Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-5 max-w-3xl mx-auto mb-10 md:mb-12">
          {domains.map((domain) => (
            <div
              key={domain.name}
              className={`${domain.bg} rounded-xl md:rounded-2xl p-4 md:p-5 text-center transition-all duration-300 hover:scale-105 hover:shadow-md flex flex-col items-center justify-center aspect-square`}
            >
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center mb-2 md:mb-3 shadow-sm">
                <domain.icon className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <p className="text-[11px] md:text-sm font-bold text-foreground leading-tight">{domain.name}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center max-w-xl mx-auto space-y-5">
          <p className="text-muted-foreground text-xs md:text-sm lg:text-base leading-relaxed">
            Each problem is submitted by an industry partner and reviewed before publishing.
            Choose your domain, study the challenge, and register your team to start solving.
          </p>
          <Link to="/problems">
            <Button size="lg" className="gradient-primary text-primary-foreground font-bold px-8 py-6 text-sm md:text-lg gap-2 mt-2 rounded-xl shadow-lg">
              View All Problem Statements
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatementsPreview;
