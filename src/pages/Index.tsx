import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyPartnerSection from "@/components/WhyPartnerSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ProblemStatementsPreview from "@/components/ProblemStatementsPreview";

import TrackRecordSection from "@/components/TrackRecordSection";
import PartnershipBenefitsSection from "@/components/PartnershipBenefitsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      <main>
        <HeroSection />
        <WhyPartnerSection />
        <HowItWorksSection />
        <ProblemStatementsPreview />

        <TrackRecordSection />
        <PartnershipBenefitsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
