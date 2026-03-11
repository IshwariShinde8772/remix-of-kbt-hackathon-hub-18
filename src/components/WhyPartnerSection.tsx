import { Lightbulb, Code, BookOpen, Building2, Users, Sparkles, Globe, Briefcase, Trophy, Award } from "lucide-react";

const benefits = [
  {
    icon: Lightbulb,
    title: "Solve Real-World Problems",
    description: "Get an opportunity to work on real industry and societal problems and develop practical solutions.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Code,
    title: "Enhance Technical Skills",
    description: "Improve programming, problem-solving, design thinking, and innovation skills through hands-on challenges.",
    iconBg: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    icon: BookOpen,
    title: "Hands-on Learning",
    description: "Apply classroom knowledge to real projects, gaining practical experience beyond textbooks.",
    iconBg: "bg-success-bg",
    iconColor: "text-success",
  },
  {
    icon: Building2,
    title: "Industry Exposure",
    description: "Interact with industry experts, mentors, and judges to understand current industry expectations.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Users,
    title: "Teamwork & Collaboration",
    description: "Work in teams, improving communication, leadership, and collaboration skills.",
    iconBg: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    icon: Sparkles,
    title: "Innovation & Creativity",
    description: "Explore new ideas, technologies, and innovative approaches to solve problems.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Globe,
    title: "Networking Opportunities",
    description: "Connect with students from different colleges, mentors, and industry professionals.",
    iconBg: "bg-success-bg",
    iconColor: "text-success",
  },
  {
    icon: Briefcase,
    title: "Career Opportunities",
    description: "Good ideas may attract internships, job offers, or startup opportunities.",
    iconBg: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    icon: Trophy,
    title: "Confidence Building",
    description: "Presenting solutions and competing at a technical event builds confidence and presentation skills.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Award,
    title: "Recognition & Awards",
    description: "Earn certificates, prizes, and recognition that strengthen your academic and professional profile.",
    iconBg: "bg-success-bg",
    iconColor: "text-success",
  },
];

const WhyPartnerSection = () => {
  return (
    <section id="why-participate" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Badge */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-xs md:text-sm font-medium tracking-wide">
            <Lightbulb className="w-4 h-4" />
            Why Participate
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black mb-3 text-foreground leading-tight">
            Why Participate in Avinyathon?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg leading-relaxed">
            Avinyathon offers students a unique platform to learn, innovate, and grow through real-world problem solving.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="feature-card group text-center">
              <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl ${benefit.iconBg} flex items-center justify-center mb-3 mx-auto`}>
                <benefit.icon className={`w-5 h-5 md:w-6 md:h-6 ${benefit.iconColor}`} />
              </div>
              <h3 className="text-xs md:text-sm lg:text-base font-heading font-bold mb-1.5 text-foreground leading-snug">
                {benefit.title}
              </h3>
              <p className="text-[11px] md:text-xs lg:text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyPartnerSection;
