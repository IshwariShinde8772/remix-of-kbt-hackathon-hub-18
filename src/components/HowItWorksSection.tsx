import { Rocket, ArrowRight, ArrowDown, ArrowLeft } from "lucide-react";

const steps = [
  { number: 1, title: "Industry Problem Statement", description: "Industries submit their real-world problem statements through our registration portal.", date: "15 FEB 2026", done: true },
  { number: 2, title: "Screening & Shortlisting", description: "Problem statements are checked for clarity, completeness, and required structure.", date: "28 FEB 2026", done: true },
  { number: 3, title: "Intimation to Industry", description: "Shortlisted problem statement details are communicated to participating industries.", date: "5 MAR 2026", done: true },
  { number: 4, title: "Open to Students", description: "KBT Avinyathon 2026 opens for student participation with all selected problem statements. Students can also submit their innovative solutions — this panel is now open for students!", date: "10 MAR 2026" },
  { number: 5, title: "Last Date of Registration", description: "Final deadline for student teams to register for the hackathon.", date: "24 MAR 2026" },
  { number: 6, title: "Solution Submission", description: "Student teams develop and submit their innovative solutions for the challenges.", date: "5 APR 2026" },
  { number: 7, title: "Scrutiny of Solutions", description: "Expert panel screens and evaluates the best solutions from all submissions.", date: "9 APR 2026" },
  { number: 8, title: "Final Evaluation", description: "Shortlisted solutions are presented to industry experts for final evaluation.", date: "11 APR 2026" },
  { number: 9, title: "Winner Announcement", description: "Winners are announced and prizes are distributed during the valedictory ceremony.", date: "11 APR 2026" },
];

type Highlight = "primary" | "green" | "done" | undefined;

/* ─────────────────────────────────────────────
   STEP CARD  (used by all layouts)
───────────────────────────────────────────── */
const StepCard = ({ step, highlight }: { step: typeof steps[0]; highlight?: Highlight }) => {
  const borderClass =
    highlight === "done"
      ? "border-muted-foreground/40 border-2 opacity-70"
      : highlight === "green"
      ? "border-success border-2"
      : highlight === "primary"
      ? "border-primary border-2 border-dashed"
      : "border-border border";

  const badgeBg = highlight === "done" ? "bg-muted-foreground" : highlight === "green" ? "bg-success" : "gradient-primary";

  const dateBg =
    highlight === "done"
      ? "bg-muted-foreground/10 text-muted-foreground line-through"
      : highlight === "green"
      ? "bg-success/10 text-success"
      : "bg-primary/10 text-primary";

  return (
    <div
      className={`bg-background rounded-2xl p-4 md:p-5 lg:p-6 shadow-sm ${borderClass} hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center text-center`}
    >
      <div
        className={`w-11 h-11 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-base md:text-xl lg:text-2xl mb-3 ${badgeBg} shadow-md flex-shrink-0`}
      >
        {step.number}
      </div>
      <h3 className="text-sm md:text-base lg:text-lg font-heading font-bold text-foreground leading-snug mb-2">
        {step.title}
      </h3>
      <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-3 flex-1">
        {step.description}
      </p>
      <span className={`inline-block text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full tracking-wide uppercase ${dateBg}`}>
        {step.date}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ARROW HELPERS  (desktop snake layout)
───────────────────────────────────────────── */
const HorizontalArrow = ({ direction = "right" }: { direction?: "right" | "left" }) => (
  <div className="hidden lg:flex items-center justify-center">
    {direction === "right" ? (
      <ArrowRight className="w-6 h-6 text-primary/60" strokeWidth={2.5} />
    ) : (
      <ArrowLeft className="w-6 h-6 text-primary/60" strokeWidth={2.5} />
    )}
  </div>
);

const VerticalArrow = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col items-center py-2 lg:py-4 ${className}`}>
    <div className="w-0.5 h-6 lg:h-10 bg-primary/40 rounded-full" />
    <ArrowDown className="w-5 h-5 lg:w-6 lg:h-6 text-primary/60 -mt-1" strokeWidth={2.5} />
  </div>
);

/* ─────────────────────────────────────────────
   MOBILE / TABLET  – vertical timeline card
───────────────────────────────────────────── */
const TimelineStep = ({ step, highlight, isLast }: { step: typeof steps[0]; highlight?: Highlight; isLast?: boolean }) => {
  const badgeBg = highlight === "done" ? "bg-muted-foreground" : highlight === "green" ? "bg-success" : "gradient-primary";
  const dateBg = highlight === "done" ? "bg-muted-foreground/10 text-muted-foreground line-through" : highlight === "green" ? "bg-success/10 text-success" : "bg-primary/10 text-primary";
  const borderClass =
    highlight === "green"
      ? "border-success border-2"
      : highlight === "primary"
      ? "border-primary border-2 border-dashed"
      : "border-border border";

  return (
    <div className="flex gap-4 items-start">
      {/* Left spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg ${badgeBg} shadow-md`}>
          {step.number}
        </div>
        {!isLast && (
          <div className="flex flex-col items-center mt-1">
            <div className="w-0.5 flex-1 min-h-[2rem] bg-primary/30 rounded-full" />
            <ArrowDown className="w-4 h-4 text-primary/50 -mt-1" strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Card */}
      <div className={`bg-background rounded-2xl p-4 shadow-sm ${borderClass} flex-1 mb-3`}>
        <h3 className="text-sm sm:text-base font-heading font-bold text-foreground leading-snug mb-1">
          {step.title}
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-2">
          {step.description}
        </p>
        <span className={`inline-block text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full tracking-wide uppercase ${dateBg}`}>
          {step.date}
        </span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN SECTION
───────────────────────────────────────────── */
const HowItWorksSection = () => {
  const row1 = steps.slice(0, 3);            // 1, 2, 3
  const row2 = [steps[5], steps[4], steps[3]]; // 6, 5, 4  (snake reversal)
  const row3 = steps.slice(6, 9);            // 7, 8, 9

  // Highlight map for timeline views
  const highlights: Record<number, Highlight> = {
    1: "done",
    2: "done",
    3: "done",
    5: "primary",
    9: "green",
  };

  return (
    <section id="process" className="py-12 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">

        {/* Badge */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 bg-background border border-border text-foreground px-4 py-2 rounded-full text-xs md:text-sm font-medium tracking-wide">
            <Rocket className="w-4 h-4 text-primary" />
            Process Flow
          </span>
        </div>

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black mb-3 text-foreground leading-tight">
            KBT-AVINYATHON 2026 Process Flow
          </h2>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg leading-relaxed">
            From problem statement submission to winner announcement
          </p>
        </div>

        {/* ════════════════════════════════════════
            MOBILE  (<md)  – vertical timeline
        ════════════════════════════════════════ */}
        <div className="block md:hidden max-w-md mx-auto">
          {steps.map((step, idx) => (
            <TimelineStep
              key={step.number}
              step={step}
              highlight={highlights[step.number]}
              isLast={idx === steps.length - 1}
            />
          ))}
        </div>

        {/* ════════════════════════════════════════
            TABLET  (md → lg)  – 2-col timeline
        ════════════════════════════════════════ */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-x-6 gap-y-0 max-w-2xl mx-auto">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex flex-col">
              <TimelineStep
                step={step}
                highlight={highlights[step.number]}
                isLast={false}
              />
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════
            DESKTOP  (≥lg)  – snake 3-col grid
        ════════════════════════════════════════ */}
        <div className="hidden lg:block max-w-5xl mx-auto">

          {/* Row 1: 1 → 2 → 3 */}
          <div className="grid grid-cols-3 gap-4 items-stretch">
            <StepCard step={row1[0]} />
            <div className="relative">
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <HorizontalArrow direction="right" />
              </div>
              <StepCard step={row1[1]} />
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10">
                <HorizontalArrow direction="right" />
              </div>
            </div>
            <StepCard step={row1[2]} />
          </div>

          {/* Down arrow from col-3 */}
          <div className="grid grid-cols-3 gap-4">
            <div />
            <div />
            <VerticalArrow />
          </div>

          {/* Row 2: 6 ← 5 ← 4 */}
          <div className="grid grid-cols-3 gap-4 items-stretch">
            <StepCard step={row2[0]} />
            <div className="relative">
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <HorizontalArrow direction="left" />
              </div>
              <StepCard step={row2[1]} highlight="primary" />
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10">
                <HorizontalArrow direction="left" />
              </div>
            </div>
            <StepCard step={row2[2]} />
          </div>

          {/* Down arrow from col-1 */}
          <div className="grid grid-cols-3 gap-4">
            <VerticalArrow />
            <div />
            <div />
          </div>

          {/* Row 3: 7 → 8 → 9 */}
          <div className="grid grid-cols-3 gap-4 items-stretch">
            <StepCard step={row3[0]} />
            <div className="relative">
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <HorizontalArrow direction="right" />
              </div>
              <StepCard step={row3[1]} />
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10">
                <HorizontalArrow direction="right" />
              </div>
            </div>
            <StepCard step={row3[2]} highlight="green" />
          </div>

        </div>
        {/* end desktop */}

      </div>
    </section>
  );
};

export default HowItWorksSection;
