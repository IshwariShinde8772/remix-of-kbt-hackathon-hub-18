import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Lock, CalendarClock, ArrowRight, Mail } from "lucide-react";

const RegisterTeam = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <Navbar />
      <main className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">

            {/* Lock Icon */}
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-red-100 border-4 border-red-200 flex items-center justify-center shadow-lg">
              <Lock className="w-12 h-12 text-red-600" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground mb-4 leading-tight">
              Team Registration is{" "}
              <span className="text-red-600">Closed</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
              The registration window for{" "}
              <span className="font-semibold text-foreground">KBT Avinyathon</span> has now ended.
              No new team registrations are being accepted at this time.
            </p>

            {/* Deadline Card */}
            <div className="bg-background border-2 border-red-200 rounded-2xl p-6 md:p-8 mb-8 shadow-md">
              <div className="flex items-center justify-center gap-3 mb-4 text-red-600">
                <CalendarClock className="w-7 h-7" />
                <h2 className="text-xl font-bold font-heading">Important Deadline</h2>
              </div>
              <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-100">
                <p className="text-sm text-red-700 font-medium mb-1 uppercase tracking-wider">
                  Solution Submission Last Date
                </p>
                <p className="text-3xl font-black text-red-600 font-heading">9 April 2026</p>
                <p className="text-xs text-red-500 mt-1 font-medium">
                  All registered teams must submit their solutions before this date.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                If your team is already registered, please use your{" "}
                <span className="font-semibold text-foreground">Team ID</span> to submit your
                solution before the deadline.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="gradient-cta text-primary-foreground h-12 px-8 font-bold text-sm uppercase tracking-wider rounded-xl shadow-md"
                onClick={() => navigate("/submit-solution")}
              >
                Submit Your Solution <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="h-12 px-8 font-semibold text-sm rounded-xl border-2"
                onClick={() => navigate("/contact")}
              >
                <Mail className="w-4 h-4 mr-2" /> Contact Us
              </Button>
            </div>

            {/* Footer note */}
            <p className="mt-10 text-xs text-muted-foreground">
              For any queries regarding your existing registration, please reach out via the Contact page.
            </p>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterTeam;
