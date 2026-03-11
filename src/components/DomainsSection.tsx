import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, CheckCircle2 } from "lucide-react";

const whySubmit = [
  "Your problem gets reviewed and approved before going live",
  "Student teams compete to solve your exact challenge",
  "Evaluate shortlisted solutions and select the best one",
  "Direct access to fresh engineering talent from SPPU-affiliated institute",
];

const DomainsSection = () => {
  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-secondary/5 border border-secondary/20 border-l-4 border-l-secondary rounded-2xl p-6 md:p-10 shadow-sm">

            {/* Icon + heading */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-lg md:text-xl font-heading font-bold text-foreground">
                Are You an Industry Partner?
              </h3>
            </div>

            <p className="text-muted-foreground text-sm md:text-base mb-6 leading-relaxed">
              Submit your real-world engineering challenge and let student innovators from across Maharashtra build solutions for you — at no cost.
            </p>

            {/* Short checklist */}
            <ul className="space-y-2.5 mb-7">
              {whySubmit.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <Link to="/submit-problem">
              <Button
                size="lg"
                className="gradient-cta text-primary-foreground font-semibold px-7 py-5 text-sm md:text-base rounded-xl hover:opacity-90 transition-opacity shadow-md gap-2"
              >
                Submit a Problem Statement
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DomainsSection;
