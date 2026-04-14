import React from "react";
import { Download, Award, Heart, CheckCircle, Trophy, Star, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Result = () => {
  return (
    <div className="min-h-screen font-sans bg-muted/30 selection:bg-primary/20">
      <Header />
      <Navbar />
      
      <main className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          {/* Header Section - Smaller Gaps */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-heading font-black text-[10px] md:text-xs mb-4 uppercase tracking-widest animate-fade-in">
              <Trophy className="w-3.5 h-3.5" />
              <span>Avinyathon 2026 Results</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-heading font-black tracking-tight mb-3 animate-fade-in text-foreground uppercase">
              Scrutiny <span className="text-gradient">Results</span>
            </h1>
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base font-sans animate-fade-in leading-relaxed">
              Explore the names of innovation pioneers who have successfully cleared the initial evaluation stage. 
              Find your team and prepare for the final challenges.
            </p>
          </div>

          {/* PDF Download Section - Reduced Margin */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="relative overflow-hidden rounded-2xl bg-secondary p-8 md:p-10 text-center text-secondary-foreground shadow-xl border border-secondary-foreground/10 group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[80px] -mr-24 -mt-24" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
                  <Download className="w-7 h-7 text-white animate-bounce-slow" />
                </div>
                
                <h2 className="text-xl md:text-3xl font-heading font-black mb-3 text-white uppercase tracking-tight">
                  Download Selection List
                </h2>
                <p className="text-white/70 text-xs md:text-sm font-sans mb-6 max-w-md mx-auto">
                  Get the complete PDF document listing all the teams qualified for the next stage of the hackathon.
                </p>
                
                <div className="flex flex-col items-center gap-3">
                  <a href="/final_list.pdf" download="final_list.pdf" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto gradient-primary text-primary-foreground px-8 py-6 rounded-xl text-base font-heading font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      GET PDF RESULTS
                    </Button>
                  </a>
                  <span className="text-white/40 text-[10px] font-mono flex items-center gap-1.5">
                     <ArrowDownCircle className="w-3 h-3" /> OFFICIAL DOCUMENT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Congratulations & Motivation Section - Tighter Layout */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Congratulations Message */}
              <div className="bg-background p-6 md:p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-success-bg rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-success" />
                  </div>
                  <h3 className="text-lg md:text-xl font-heading font-black text-foreground">To Selected Teams</h3>
                </div>
                
                <p className="text-muted-foreground font-sans leading-relaxed text-xs md:text-sm mb-5">
                  Congratulations on this remarkable achievement! Your hard work has paid off. Start refining your prototypes and project files for the final evaluation campus visit.
                </p>
                
                <div className="flex items-center gap-2 text-success font-heading font-bold text-[10px] uppercase tracking-widest bg-success-bg px-3 py-1.5 rounded-full border border-success/10 w-fit">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Next stage ready
                </div>
              </div>

              {/* Motivation Message */}
              <div className="bg-background p-6 md:p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Heart className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-heading font-black text-foreground">To All Innovators</h3>
                </div>
                
                <p className="text-muted-foreground font-sans leading-relaxed text-xs md:text-sm mb-5">
                  Every participation is a learning curve. If you didn't see your name today, don't let it dampen your spirit. Your participation itself shows you are a creator and a problem solver.
                </p>
                
                <div className="flex items-center gap-2 text-blue-600 font-heading font-bold text-[10px] uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 w-fit">
                  <Trophy className="w-3.5 h-3.5" />
                  Innovative spirit
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Result;
