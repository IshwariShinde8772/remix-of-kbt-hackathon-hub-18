import { Rocket, ArrowRight, ArrowDown } from "lucide-react";

const steps = [
  { number: 1, title: "Industry Problem Statement", description: "Industries submit their real-world problem statements through our registration portal.", date: "15 FEB 2026" },
  { number: 2, title: "Screening & Shortlisting", description: "Problem statements are checked for clarity, completeness, and required structure.", date: "28 FEB 2026" },
  { number: 3, title: "Intimation to Industry", description: "Shortlisted problem statement details are communicated to participating industries.", date: "5 MAR 2026" },
  { number: 4, title: "Open to Students", description: "KBT Avinyathon 2026 opens for student participation with all selected problem statements.", date: "10 MAR 2026" },
  { number: 5, title: "Last Date of Registration", description: "Final deadline for student teams to register for the hackathon.", date: "24 MAR 2026" },
  { number: 6, title: "Solution Submission", description: "Student teams develop and submit their innovative solutions for the challenges.", date: "5 APR 2026" },
  { number: 7, title: "Scrutiny of Solutions", description: "Expert panel screens and evaluates the best solutions from all submissions.", date: "9 APR 2026" },
  { number: 8, title: "Final Evaluation", description: "Shortlisted solutions are presented to industry experts for final evaluation.", date: "11 APR 2026" },
  { number: 9, title: "Winner Announcement", description: "Winners are announced and prizes are distributed during the valedictory ceremony.", date: "11 APR 2026" },
];

const StepCard = ({ step, highlight }: { step: typeof steps[0]; highlight?: "primary" | "green" }) => (
  <div
    className={`bg-background rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg border-2 ${
      highlight === "green" ? "border-green-500" : highlight === "primary" ? "border-primary" : "border-border"
    } hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center`}
  >
    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-sm md:text-xl mb-2 md:mb-4 ${highlight === "green" ? "bg-green-500" : ""}`} style={highlight !== "green" ? { background: "var(--gradient-primary)" } : {}}>
      {step.number}
    </div>
    <h3 className="text-xs sm:text-sm md:text-base font-heading font-bold text-center mb-1 md:mb-2 text-foreground leading-tight">
      {step.title}
    </h3>
    <p className="text-muted-foreground text-center text-[10px] md:text-xs mb-2 md:mb-4 flex-1 hidden sm:block">
      {step.description}
    </p>
    <span className={`inline-block text-[10px] md:text-xs font-semibold px-2 md:px-4 py-1 md:py-1.5 rounded-full ${
      highlight === "green" ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"
    }`}>
      {step.date}
    </span>
  </div>
);

const VerticalConnector = () => (
  <div className="flex justify-center my-2 md:my-4">
    <div className="flex flex-col items-center">
      <div className="w-1 h-4 md:h-6 bg-primary rounded-full"></div>
      <ArrowDown className="w-4 h-4 md:w-6 md:h-6 text-primary -mt-1" strokeWidth={3} />
    </div>
  </div>
);

const HowItWorksSection = () => {
  const row1 = steps.slice(0, 3);
  const row2 = [steps[5], steps[4], steps[3]];
  const row3 = steps.slice(6, 9);

  return (
    <section id="process" className="py-8 md:py-12 bg-muted/30">
      <div className="container mx-auto px-3 md:px-4">
        {/* Badge */}
        <div className="text-center mb-6 md:mb-8">
          <span className="inline-flex items-center gap-2 bg-background border border-border text-foreground px-4 py-2 rounded-full text-sm font-medium">
            <Rocket className="w-4 h-4 text-primary" />
            Process Flow
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-black mb-3 md:mb-4 text-foreground">
            KBT-AVINYATHON 2026 Process Flow
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg">
            From problem statement submission to winner announcement
          </p>
        </div>

        {/* Process Flow Timeline */}
        <div className="max-w-5xl mx-auto">
          {/* Row 1: Steps 1 → 2 → 3 */}
          <div className="grid grid-cols-3 gap-2 md:gap-10">
            {row1.map((step, index) => (
              <div key={step.number} className="relative">
                <StepCard step={step} />
                {index < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 items-center justify-center" style={{ right: '-32px', width: '24px' }}>
                    <ArrowRight className="w-6 h-6 text-primary" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Connector Row 1 → Row 2 */}
          <div className="hidden md:flex justify-end pr-[calc(16.67%-12px)] my-3">
            <div className="flex flex-col items-center">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <ArrowDown className="w-6 h-6 text-primary -mt-1" strokeWidth={3} />
            </div>
          </div>
          <VerticalConnector />

          {/* Row 2: Steps 6 ← 5 ← 4 */}
          <div className="grid grid-cols-3 gap-2 md:gap-10">
            {row2.map((step, index) => (
              <div key={step.number} className="relative">
                <StepCard step={step} highlight={step.number === 5 ? "primary" : undefined} />
                {index > 0 && (
                  <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 items-center justify-center" style={{ left: '-32px', width: '24px' }}>
                    <ArrowRight className="w-6 h-6 text-primary rotate-180" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Connector Row 2 → Row 3 */}
          <div className="hidden md:flex justify-start pl-[calc(16.67%-12px)] my-3">
            <div className="flex flex-col items-center">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <ArrowDown className="w-6 h-6 text-primary -mt-1" strokeWidth={3} />
            </div>
          </div>
          <VerticalConnector />

          {/* Row 3: Steps 7 → 8 → 9 */}
          <div className="grid grid-cols-3 gap-2 md:gap-10">
            {row3.map((step, index) => (
              <div key={step.number} className="relative">
                <StepCard step={step} highlight={step.number === 9 ? "green" : undefined} />
                {index < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 items-center justify-center" style={{ right: '-32px', width: '24px' }}>
                    <ArrowRight className="w-6 h-6 text-primary" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
