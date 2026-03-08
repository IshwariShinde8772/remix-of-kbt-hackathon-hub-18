import { Trophy, Medal, GraduationCap, Briefcase, FileText, Users } from "lucide-react";

const benefits = [
  { icon: Trophy, title: "Exciting Prizes & Awards", description: "Win cash prizes, trophies, and special awards for outstanding solutions and innovative ideas." },
  { icon: Medal, title: "Certificates & Recognition", description: "Receive participation and winner certificates that strengthen your academic and professional profile." },
  { icon: GraduationCap, title: "Mentorship from Experts", description: "Get guidance from industry mentors and judges throughout the hackathon to refine your solutions." },
  { icon: Briefcase, title: "Internship & Job Opportunities", description: "Impress sponsors and industry partners to unlock internships, PPOs, and career opportunities." },
  { icon: FileText, title: "Real Problem Solving Experience", description: "Work on actual industry problem statements and build solutions that can make a real-world impact." },
  { icon: Users, title: "Networking & Exposure", description: "Connect with students from different colleges, industry professionals, and potential employers." },
];

const PartnershipBenefitsSection = () => {
  return (
    <section id="benefits" className="py-10 md:py-20 gradient-benefits">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-heading font-black mb-3 md:mb-4 text-primary-foreground">
            What's In It For You?
          </h2>
          <p className="text-primary-foreground/80 text-sm md:text-lg">
            Participate, innovate, and take home more than just experience
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-card group hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm md:text-lg font-heading font-bold mb-1 md:mb-2 text-primary-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-primary-foreground/80 text-xs md:text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnershipBenefitsSection;
