import { useState, useEffect } from "react";
import { supabase, edgeFunctionsClient } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Upload, Send, FileText, Youtube, CheckCircle2, AlertCircle, ArrowRight, X, Layout, CalendarClock, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface TeamInfo {
  team_id: string;
  team_name: string;
  leader_name: string;
  selected_problem_id: string | null;
  selected_domain: string | null;
}

interface ProblemInfo {
  id: string;
  problem_title: string;
  domain: string;
}

const SubmitSolution = () => {
  const navigate = useNavigate();

  // Step 1: Identify team
  const [teamIdInput, setTeamIdInput] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [instituteNumber, setInstituteNumber] = useState("");
  const [verifiedTeam, setVerifiedTeam] = useState<{ team_name: string, problem_statement: string, domain: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Step 2: Submit solution
  const [companyName, setCompanyName] = useState("");
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTeamId, setSubmittedTeamId] = useState("");
  const [submittedCollege, setSubmittedCollege] = useState("");
  const [submittedInstituteId, setSubmittedInstituteId] = useState("");

  // Scroll to top whenever submitted changes to true
  useEffect(() => {
    if (submitted) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submitted]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const verifyTeam = async () => {
    if (!teamIdInput.trim() || !collegeName.trim() || !instituteNumber.trim()) {
      toast.error("Please fill all fields to verify your team");
      scrollToTop();
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setVerifiedTeam(null);

    try {
      console.log("≡ƒöì Verifying team with ID:", teamIdInput.trim());
      
      const { data: result, error: invokeError } = await edgeFunctionsClient.functions.invoke("submit-solution", {
        body: {
          action: "validate",
          team_id: teamIdInput.trim(),
          college_name: collegeName.trim(),
          institute_number: instituteNumber.trim()
        }
      });

      if (invokeError) {
        console.error("Γ¥î Verification error:", invokeError);
        throw new Error(invokeError.message || "Verification failed");
      }

      if (!result || result.error) {
        throw new Error(result?.error || "Invalid Team ID, College Name, or Institute Number.");
      }

      setVerifiedTeam(result);
      toast.success("Team verified successfully!");
    } catch (error: any) {
      console.error("Γ¥î Search error:", error);
      toast.error(error.message || "Team not found. Please check your details.");
      scrollToTop();
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are accepted");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File must be less than 50MB");
        return;
      }
      setSolutionFile(file);
    }
  };

  const validateYoutubeLink = (link: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/;
    return youtubeRegex.test(link);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double-click
    if (!verifiedTeam) { toast.error("Please verify your team first"); scrollToTop(); return; }
    if (!companyName.trim()) { toast.error("Company name is required"); scrollToTop(); return; }
    if (!youtubeLink.trim()) { toast.error("YouTube video link is required"); scrollToTop(); return; }
    if (!validateYoutubeLink(youtubeLink)) { toast.error("Please enter a valid YouTube link"); scrollToTop(); return; }
    if (!solutionFile) { toast.error("Please upload your solution PDF"); scrollToTop(); return; }

    setIsSubmitting(true);
    try {
      let solutionFileBase64 = null;
      if (solutionFile) {
        solutionFileBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]); // Remove prefix
          };
          reader.readAsDataURL(solutionFile);
        });
      }

      const { data: result, error: invokeError } = await edgeFunctionsClient.functions.invoke("submit-solution", {
        body: {
          team_id: teamIdInput.trim(),
          college_name: collegeName.trim(),
          institute_number: instituteNumber.trim(),
          company_name: companyName.trim(),
          youtube_link: youtubeLink.trim(),
          solution_title: verifiedTeam.problem_statement,
          solution_description: description.trim() || "",
          solution_file_base64: solutionFileBase64
        },
      });

      if (invokeError) {
        console.error("Γ¥î Submission error:", invokeError);
        throw new Error(invokeError.message || "Submission failed");
      }

      if (!result || result.error) {
        throw new Error(result?.error || "Submission failed. Please check your details.");
      }

      setSubmittedTeamId(teamIdInput.trim());
      setSubmittedCollege(collegeName.trim());
      setSubmittedInstituteId(instituteNumber.trim());
      setSubmitted(true);
      toast.success("Solution submitted successfully!");
    } catch (error: any) {
      toast.error("Submission failed", {
        description: error.message || "Please check your connection and try again.",
        duration: 6000,
      });
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <Navbar />
      <main className="flex-1 py-12 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-background rounded-3xl shadow-xl overflow-hidden border border-red-100 animate-in fade-in zoom-in duration-700">
            <div className="bg-red-600 p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30 animate-pulse">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-heading font-black uppercase tracking-tight">Submissions Closed</h1>
              <p className="opacity-90 mt-1 font-medium text-sm">KBT Avinyathon 2026</p>
            </div>
            <div className="p-8 text-center space-y-6">
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-800 uppercase">Deadline Reached</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  The solution submission portal is now officially closed. The deadline was <strong>10 April 2026, 10:00 AM</strong>.
                </p>
                <p className="text-slate-500 text-xs italic font-medium">
                  Note: Any submissions after the deadline will not be considered.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="gradient-primary text-white px-8 py-3 rounded-xl font-bold uppercase shadow-lg active:scale-95 transition-all w-full sm:w-auto" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
                <Button variant="outline" className="px-8 py-3 rounded-xl font-bold uppercase border-2 hover:bg-slate-50 w-full sm:w-auto" onClick={() => navigate("/problems")}>
                  View Problem Statements
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubmitSolution;
