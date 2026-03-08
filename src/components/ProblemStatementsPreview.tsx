import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSearch, ArrowRight, Cpu, BarChart3, Palette, Wrench, Monitor, LayoutGrid } from "lucide-react";

const domains = [
  { name: "Automation", icon: Cpu, color: "from-blue-500 to-blue-600", bg: "bg-blue-50" },
  { name: "Banking / Sales", icon: BarChart3, color: "from-purple-500 to-purple-600", bg: "bg-purple-50" },
  { name: "Design", icon: Palette, color: "from-pink-500 to-pink-600", bg: "bg-pink-50" },
  { name: "Hardware", icon: Wrench, color: "from-green-500 to-green-600", bg: "bg-green-50" },
  { name: "Software", icon: Monitor, color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50" },
  { name: "Other", icon: LayoutGrid, color: "from-orange-500 to-orange-600", bg: "bg-orange-50" },
];

const ProblemStatementsPreview = () => {
  return (
    <section id="problem-statements" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 bg-background border border-border text-foreground px-4 py-2 rounded-full text-sm font-medium">
            <FileSearch className="w-4 h-4 text-primary" />
            Problem Statements
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-heading font-black mb-3 text-foreground">
            Explore Problem Statements
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Browse real-world challenges from leading industries and organizations. 
            Pick a problem that matches your skills and build an innovative solution.
          </p>
        </div>

        {/* Domain Cards - responsive grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-5 max-w-3xl mx-auto mb-10">
          {domains.map((domain) => (
            <div
              key={domain.name}
              className={`${domain.bg} rounded-2xl p-3 md:p-5 text-center transition-all duration-300 hover:scale-105 hover:shadow-md flex flex-col items-center justify-center aspect-square`}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${domain.color} flex items-center justify-center mb-2 md:mb-3 shadow-sm`}>
                <domain.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <p className="text-xs md:text-sm font-bold text-foreground leading-tight">{domain.name}</p>
            </div>
          ))}
        </div>

        {/* Description + CTA */}
        <div className="text-center max-w-xl mx-auto space-y-5">
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Each problem is submitted by an industry partner and reviewed before publishing. 
            Choose your domain, study the challenge, and register your team to start solving.
          </p>
          <Link to="/problems">
            <Button size="lg" className="gradient-primary text-primary-foreground font-bold px-8 py-6 text-base md:text-lg gap-2 mt-2">
              View All Problem Statements
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatementsPreview;
