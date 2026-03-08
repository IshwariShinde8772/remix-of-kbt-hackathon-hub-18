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
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
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
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
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
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    icon: Globe,
    title: "Networking Opportunities",
    description: "Connect with students from different colleges, mentors, and industry professionals.",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    icon: Briefcase,
    title: "Career Opportunities",
    description: "Good ideas may attract internships, job offers, or startup opportunities.",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    icon: Trophy,
    title: "Confidence Building",
    description: "Presenting solutions and competing at a technical event builds confidence and presentation skills.",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    icon: Award,
    title: "Recognition & Awards",
    description: "Earn certificates, prizes, and recognition that strengthen your academic and professional profile.",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

const WhyPartnerSection = () => {
  return (
    <section id="why-participate" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Badge */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
            <Lightbulb className="w-4 h-4" />
            Why Participate
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-4 text-foreground">
            Why Participate in Avinyathon?
          </h2>
          <p className="text-muted-foreground text-lg">
            Avinyathon offers students a unique platform to learn, innovate, and grow through real-world problem solving.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="feature-card group"
            >
              <div className={`w-12 h-12 rounded-xl ${benefit.iconBg} flex items-center justify-center mb-4`}>
                <benefit.icon className={`w-6 h-6 ${benefit.iconColor}`} />
              </div>
              <h3 className="text-lg font-heading font-bold mb-2 text-foreground">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground">
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
