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
import { Search, Upload, Send, FileText, Youtube, CheckCircle2, AlertCircle, ArrowRight, X } from "lucide-react";
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
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">

            {/* ΓöÇΓöÇ SUCCESS STATE ΓöÇΓöÇ */}
            {submitted ? (
              <div className="bg-background rounded-2xl shadow-xl overflow-hidden">
                <div className="gradient-primary p-6 text-primary-foreground">
                  <h1 className="text-2xl font-heading font-bold">Submit Solution</h1>
                  <p className="text-sm opacity-80">KBT Avinyathon 2026</p>
                </div>
                <div className="p-8 text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-heading font-bold text-foreground">
                      🎉 Solution Submitted Successfully!
                    </h2>
                    <p className="text-muted-foreground">
                      Your solution has been received. Our team will review it shortly.
                    </p>
                  </div>

                  {/* Compact registration details notification */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left max-w-sm mx-auto space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-2">Submission Details</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <p className="text-green-600 text-xs">Team ID</p>
                        <p className="font-bold font-mono text-green-900">{submittedTeamId}</p>
                      </div>
                      <div>
                        <p className="text-green-600 text-xs">Institute ID</p>
                        <p className="font-bold font-mono text-green-900">{submittedInstituteId}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-green-600 text-xs">College Name</p>
                        <p className="font-semibold text-green-900 text-sm">{submittedCollege}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 pt-2 border-t border-green-200 mt-1">
                      <span className="text-green-500 text-base mt-0.5">✉️</span>
                      <p className="text-xs text-green-700">
                        A confirmation email has been sent to the team leader's registered email address.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      className="gradient-primary text-primary-foreground"
                      onClick={() => navigate("/problems")}
                    >
                      View Problem Statements
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/")}>
                      Back to Home
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* ΓöÇΓöÇ FORM STATE ΓöÇΓöÇ */
              <div className="bg-background rounded-2xl shadow-xl overflow-hidden">
                <div className="gradient-primary p-6 text-primary-foreground">
                  <h1 className="text-2xl font-heading font-bold">Submit Solution</h1>
                  <p className="text-sm opacity-80">Verify your team and upload solution</p>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Global Submission Notice */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Layout className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-sm uppercase">Mandatory Submission Format</h4>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Submit your <strong>PPT (as PDF)</strong> and a <strong>YouTube video</strong> explanation including your <strong>prototype</strong> demo.
                      </p>
                    </div>
                  </div>

                  {/* Step 1: Verify Team */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Step 1: Verify Your Team
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your Team ID, College Name, and Institute Number.
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 shadow-sm animate-pulse-subtle">
                      <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-amber-900 font-semibold text-sm">Action Required</p>
                        <p className="text-amber-800 text-sm leading-relaxed">
                          Please fill information as per the email sent to you. All details should be similar to the email sent as confirmation; especially <strong>College Name</strong> and <strong>Institute ID</strong> should be exactly the same.
                        </p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Team ID *</Label>
                        <Input
                          placeholder="KBT-XXXX"
                          value={teamIdInput}
                          onChange={(e) => setTeamIdInput(e.target.value.toUpperCase())}
                          disabled={!!verifiedTeam}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">College Name *</Label>
                        <Input
                          placeholder="As per registration"
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          disabled={!!verifiedTeam}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Institute ID *</Label>
                        <Input
                          placeholder="Institute ID"
                          value={instituteNumber}
                          onChange={(e) => setInstituteNumber(e.target.value)}
                          disabled={!!verifiedTeam}
                        />
                      </div>
                    </div>
                    
                    {!verifiedTeam ? (
                      <Button onClick={verifyTeam} disabled={isSearching} className="gradient-primary text-primary-foreground w-full sm:w-auto">
                        <Search className="w-4 h-4 mr-2" />
                        {isSearching ? "Verifying..." : "Verify Team"}
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-sm font-bold text-green-900">{verifiedTeam.team_name}</p>
                            <p className="text-xs text-green-700">Verified successfully</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { setVerifiedTeam(null); setHasSearched(false); }} className="text-muted-foreground h-8">
                          <X className="w-4 h-4 mr-1" /> Edit
                        </Button>
                      </div>
                    )}

                    {hasSearched && !verifiedTeam && !isSearching && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
                        <AlertCircle className="w-5 h-5" />
                        Verification failed. Please check your details or contact organizers.
                      </div>
                    )}
                  </div>

                  {/* Step 2: Submit Solution */}
                  {verifiedTeam && (
                    <div className="space-y-5 border-t border-border pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        Step 2: Submit Your Solution
                      </h3>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 shadow-sm">
                        <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-blue-900 font-semibold text-sm">Submission Requirements</p>
                          <p className="text-blue-800 text-sm leading-relaxed">
                            Please ensure you submit your <strong>PPT (in PDF format)</strong> and a <strong>YouTube video</strong> containing a detailed explanation of your solution and <strong>prototype</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Allocated Problem Statement</p>
                          <p className="text-base font-bold text-foreground leading-tight mt-1">{verifiedTeam.problem_statement}</p>
                          <p className="text-xs text-muted-foreground mt-2">Domain: {verifiedTeam.domain}</p>
                        </div>
                      </div>

                      {/* Company/Organization Name */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Company / Organization Name *</Label>
                        <Input
                          placeholder="Enter company or organization name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          The company or organization you are working with on this solution.
                        </p>
                      </div>

                      {/* YouTube Link */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                          <Youtube className="w-5 h-5 text-red-500" />
                          YouTube Demo Video Link *
                        </Label>
                        <Input
                          placeholder="https://youtube.com/watch?v=..."
                          value={youtubeLink}
                          onChange={(e) => setYoutubeLink(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          A short video (1ΓÇô2 minutes) explaining your solution ΓÇö mandatory.
                        </p>
                        {youtubeLink && !validateYoutubeLink(youtubeLink) && (
                          <p className="text-destructive text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Please enter a valid YouTube link
                          </p>
                        )}
                      </div>

                      {/* PDF Upload */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                          <FileText className="w-5 h-5 text-primary" />
                          Solution PDF *
                        </Label>
                        <div
                          className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
                          onClick={() => document.getElementById("solution-pdf-input")?.click()}
                        >
                          <input
                            id="solution-pdf-input"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          {solutionFile ? (
                            <div className="space-y-2">
                              <div className="w-14 h-14 bg-primary/10 rounded-xl mx-auto flex items-center justify-center">
                                <FileText className="w-7 h-7 text-primary" />
                              </div>
                              <p className="text-foreground font-semibold text-sm">{solutionFile.name}</p>
                              <p className="text-green-600 text-xs font-medium">Γ£ô {(solutionFile.size / 1024 / 1024).toFixed(1)} MB</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={(e) => { e.stopPropagation(); setSolutionFile(null); }}
                              >
                                <X className="w-4 h-4 mr-1" /> Remove file
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-14 h-14 bg-muted rounded-xl mx-auto flex items-center justify-center">
                                <Upload className="w-7 h-7 text-muted-foreground" />
                              </div>
                              <p className="text-foreground font-medium text-sm">Click to upload your solution PDF</p>
                              <p className="text-muted-foreground text-xs">PDF only ┬╖ max 50MB</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Optional Description */}
                      <div className="space-y-2">
                        <Label>Brief Description (optional)</Label>
                        <Textarea
                          placeholder="Briefly describe your solution approach..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <Button
                        className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-base min-h-[52px]"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                          </span>
                        ) : (
                          <><Send className="w-4 h-4 mr-2" /> Submit Solution</>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubmitSolution;
