import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSearch, ArrowRight, Cpu, BarChart3, Palette, Wrench, Monitor, LayoutGrid } from "lucide-react";

const domains = [
  { name: "Automation", icon: Cpu, color: "bg-blue-100 text-blue-700" },
  { name: "Banking/Sales/Marketing", icon: BarChart3, color: "bg-purple-100 text-purple-700" },
  { name: "Design", icon: Palette, color: "bg-pink-100 text-pink-700" },
  { name: "Hardware", icon: Wrench, color: "bg-green-100 text-green-700" },
  { name: "Software", icon: Monitor, color: "bg-indigo-100 text-indigo-700" },
  { name: "Other", icon: LayoutGrid, color: "bg-orange-100 text-orange-700" },
];

const ProblemStatementsPreview = () => {
  return (
    <section id="problem-statements" className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 bg-background border border-border text-foreground px-4 py-2 rounded-full text-sm font-medium">
            <FileSearch className="w-4 h-4 text-primary" />
            Problem Statements
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black mb-3 text-foreground">
            Explore Problem Statements
          </h2>
          <p className="text-muted-foreground text-lg">
            Browse real-world challenges from leading industries and organizations. Pick a problem that matches your skills and build an innovative solution.
          </p>
        </div>

        {/* Domain Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto mb-10">
          {domains.map((domain) => (
            <div
              key={domain.name}
              className={`${domain.color} rounded-xl p-4 text-center transition-transform hover:scale-105`}
            >
              <domain.icon className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-semibold">{domain.name}</p>
            </div>
          ))}
        </div>

        {/* Info + CTA */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground max-w-xl mx-auto">
            Problem statements span multiple domains including automation, software, hardware, design, and more. 
            Each problem is submitted by an industry partner and reviewed before publishing.
          </p>
          <Link to="/problems">
            <Button size="lg" className="gradient-primary text-primary-foreground font-bold px-8 py-6 text-lg gap-2">
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
