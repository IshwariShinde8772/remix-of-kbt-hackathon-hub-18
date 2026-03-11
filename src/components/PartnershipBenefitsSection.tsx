import { Star, ClipboardCheck, Building2, Cpu, FileCheck2, HeartHandshake } from "lucide-react";

const benefits = [
  {
    icon: ClipboardCheck,
    title: "Dedicated Problem IDs for Every Team",
    description:
      "Each team receives a unique Problem ID and a personalised confirmation email, ensuring transparent tracking of your submission from registration to final evaluation.",
    accent: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    tag: "Transparency",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    icon: Building2,
    title: "Industry-Vetted Problem Statements",
    description:
      "Work on challenges screened and approved by real industrial partners — not textbook exercises. Your solution will be evaluated by the very organization that submitted the problem.",
    accent: "bg-indigo-50 border-indigo-100",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-700",
    tag: "Real Impact",
    tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    icon: Cpu,
    title: "Multi-Domain Participation",
    description:
      "Choose from Automation, Hardware, Software, Design, Banking & more. KBT Avinyathon is the only state-level hackathon in Nashik that spans 8+ technical domains simultaneously.",
    accent: "bg-violet-50 border-violet-100",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-700",
    tag: "8+ Domains",
    tagColor: "bg-violet-100 text-violet-700",
  },
  {
    icon: FileCheck2,
    title: "Dual-Stage Evaluation & Feedback",
    description:
      "All submitted solutions are evaluated by an expert panel, scored on innovation, feasibility, and real-world applicability.",
    accent: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    tag: "Structured Review",
    tagColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: HeartHandshake,
    title: "Industry-Sponsored Awards",
    description:
      "Prize money, trophies, and recognition are sponsored directly by participating industries — not generic certificates. Winners get acknowledged by the companies whose problems they solved.",
    accent: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    tag: "Industry Backed",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: Star,
    title: "KBTCOE Autonomous Institute Credential",
    description:
      "Participation at an event organized by an autonomous institute affiliated to SPPU carries added academic credibility, strengthening your portfolio for higher education and job applications.",
    accent: "bg-rose-50 border-rose-100",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
    tag: "Academic Value",
    tagColor: "bg-rose-100 text-rose-700",
  },
];

const PartnershipBenefitsSection = () => {
  return (
    <section id="benefits" className="py-14 md:py-20 bg-muted/40">
      <div className="container mx-auto px-4">

        {/* Badge */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 bg-background border border-border text-foreground px-4 py-2 rounded-full text-xs md:text-sm font-medium tracking-wide shadow-sm">
            <Star className="w-4 h-4 text-primary" />
            What's In It For You?
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black mb-3 text-foreground leading-tight">
            Exclusive Benefits of{" "}
            <span className="text-gradient">KBT Avinyathon</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg leading-relaxed">
            Beyond participation — here's what makes KBT Avinyathon uniquely valuable for your career and academic journey.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`group rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-background ${benefit.accent}`}
            >
              {/* Icon + Tag row */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${benefit.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <benefit.icon className={`w-5 h-5 ${benefit.iconColor}`} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${benefit.tagColor}`}>
                  {benefit.tag}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm md:text-base font-heading font-bold text-foreground leading-snug mb-2">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnershipBenefitsSection;
