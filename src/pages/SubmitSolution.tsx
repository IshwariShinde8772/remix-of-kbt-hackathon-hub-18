import { useState, useEffect } from "react";
import { supabase, edgeFunctionsClient } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, Upload, Send, FileText, Youtube, CheckCircle2, AlertCircle, ArrowRight, X, Layout, BookOpen, Building2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SubmitSolution = () => {
  const navigate = useNavigate();

  // Step 1: Identify team
  const [teamIdInput, setTeamIdInput] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [instituteNumber, setInstituteNumber] = useState("");
  const [verifiedTeam, setVerifiedTeam] = useState<{ 
    team_name: string,
    leader_name: string,
    college_name: string,
    problem_statement: string, 
    problem_description: string,
    domain: string,
    company_name: string,
    registration_id?: string
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Step 2: Submit solution
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTeamId, setSubmittedTeamId] = useState("");

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
      console.log("🔍 Verifying team with ID:", teamIdInput.trim());
      
      const { data: result, error: invokeError } = await edgeFunctionsClient.functions.invoke("submit-solution", {
        body: {
          action: "validate",
          team_id: teamIdInput.trim(),
          college_name: collegeName.trim(),
          institute_number: instituteNumber.trim()
        }
      });

      if (invokeError) {
        console.error("❌ Verification error:", invokeError);
        throw new Error(invokeError.message || "Verification failed");
      }

      if (!result || result.error) {
        throw new Error(result?.error || "Invalid Team ID, College Name, or Institute Number.");
      }

      setVerifiedTeam(result);
      toast.success("Team verified successfully!");
    } catch (error: any) {
      console.error("❌ Search error:", error);
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
    if (!verifiedTeam) { 
      toast.error("Please verify your team first"); 
      scrollToTop(); 
      return; 
    }
    if (!youtubeLink.trim()) { 
      toast.error("YouTube video link is required"); 
      scrollToTop(); 
      return; 
    }
    if (!validateYoutubeLink(youtubeLink)) { 
      toast.error("Please enter a valid YouTube link"); 
      scrollToTop(); 
      return; 
    }
    if (!solutionFile) { 
      toast.error("Please upload your solution PDF"); 
      scrollToTop(); 
      return; 
    }
    if (!description.trim()) {
      toast.error("Brief solution description is required");
      scrollToTop();
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("team_id", teamIdInput.trim());
      formData.set("college_name", collegeName.trim());
      formData.set("institute_number", instituteNumber.trim());
      formData.set("solution_title", verifiedTeam.problem_statement);
      formData.set("youtube_link", youtubeLink.trim());
      formData.set("solution_description", description.trim());
      formData.append("solution_file", solutionFile);

      const { data: result, error: invokeError } = await edgeFunctionsClient.functions.invoke("submit-solution", {
        body: formData,
      });

      if (invokeError) {
        console.error("❌ Submission error:", invokeError);
        throw new Error(invokeError.message || "Submission failed");
      }

      if (!result || result.error) {
        throw new Error(result?.error || "Submission failed. Please check your details.");
      }

      setSubmittedTeamId(teamIdInput.trim());
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
            
            {submitted ? (
              /* Success Card - Styled like RegisterTeam success dialog / card */
              <div className="bg-background rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="gradient-primary p-6 md:p-8 text-primary-foreground text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tight">Solution Submitted!</h1>
                  <p className="text-white/80 mt-1 text-sm md:text-base">KBT Avinyathon 2026 Confirmation</p>
                </div>
                <div className="p-6 md:p-12 text-center space-y-6 md:space-y-8">
                  <div className="space-y-3 md:space-y-4">
                    <h2 className="text-lg md:text-xl font-heading font-bold text-foreground uppercase">
                      Submission Successful
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                      Your solution for <span className="text-primary font-bold">"{verifiedTeam?.problem_statement}"</span> has been successfully logged. 
                      A confirmation email has been sent to your team leader.
                    </p>
                  </div>
                  
                  <div className="inline-block px-6 md:px-10 py-4 md:py-5 bg-muted rounded-xl border border-border">
                    <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">TEAM ID</p>
                    <p className="text-2xl md:text-3xl font-mono font-bold text-primary">{submittedTeamId}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-2 md:pt-4">
                    <Button 
                      className="gradient-primary text-white h-12 px-8 rounded-xl font-bold uppercase w-full sm:w-auto"
                      onClick={() => navigate("/")}
                    >
                      Return Home
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12 px-8 rounded-xl font-bold uppercase border-2 w-full sm:w-auto" 
                      onClick={() => navigate("/problems")}
                    >
                      Explore Problems
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Main Form Card */
              <div className="bg-background rounded-2xl shadow-xl overflow-hidden">
                {/* Header - Identical to RegisterTeam */}
                <div className="gradient-primary p-6 text-primary-foreground">
                  <div className="flex items-center gap-3">
                    <Send className="w-8 h-8" />
                    <div>
                      <p className="text-sm opacity-80">Solution Submission Portal</p>
                      <h2 className="text-xl font-heading font-bold uppercase">Submit Your Solution</h2>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-10">
                  {/* Step 1 Section: Verification */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-primary">
                      <Shield className="w-6 h-6" />
                      <h3 className="text-lg font-heading font-bold uppercase tracking-tight">Step 1: Verify Identity</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Team ID *</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="KBT-XXXX"
                            className="pl-10 h-11 font-mono uppercase"
                            value={teamIdInput}
                            onChange={(e) => setTeamIdInput(e.target.value.toUpperCase())}
                            disabled={!!verifiedTeam}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>College Name *</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Full College Name"
                            className="pl-10 h-11"
                            value={collegeName}
                            onChange={(e) => setCollegeName(e.target.value)}
                            disabled={!!verifiedTeam}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Institute ID *</Label>
                        <div className="relative">
                          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Number Only"
                            className="pl-10 h-11"
                            value={instituteNumber}
                            onChange={(e) => setInstituteNumber(e.target.value)}
                            disabled={!!verifiedTeam}
                          />
                        </div>
                      </div>
                    </div>

                    {!verifiedTeam ? (
                      <Button 
                        onClick={verifyTeam} 
                        disabled={isSearching} 
                        className="gradient-primary text-white h-12 px-10 rounded-xl font-bold uppercase tracking-wider"
                      >
                        {isSearching ? (
                          <><span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" /> Verifying...</>
                        ) : (
                          <><Search className="w-5 h-5 mr-3" /> Verify Details</>
                        )}
                      </Button>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 bg-green-50 border border-green-100 rounded-xl animate-in slide-in-from-left-4 gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white shadow-sm border border-green-200 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                          </div>
                          <div>
                            <p className="font-heading font-bold text-green-950 uppercase leading-none mb-1 text-sm md:text-base">{verifiedTeam.team_name}</p>
                            <p className="text-[10px] md:text-xs text-green-700 font-medium opacity-80 uppercase tracking-widest">
                              Identity Verified Successully
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setVerifiedTeam(null); setHasSearched(false); }} 
                          className="text-muted-foreground hover:text-red-500 hover:bg-red-50 font-bold uppercase text-[10px] h-8 px-3 ml-auto sm:ml-0"
                        >
                          <X className="w-4 h-4 mr-2" /> Change
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Step 2 Section: Submission */}
                  {verifiedTeam && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-6 pt-6 border-t border-border">
                      <div className="flex items-center gap-3 text-primary">
                        <Upload className="w-6 h-6" />
                        <h3 className="text-lg font-heading font-bold uppercase tracking-tight">Step 2: Solution Materials</h3>
                      </div>

                      {/* Problem Info Card - Styled similar to Problem Selection details in RegisterTeam */}
                      <div className="bg-muted/50 border border-border rounded-xl p-6 md:p-8 space-y-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1.5 leading-none">ALLOCATED PROBLEM STATEMENT</p>
                            <h4 className="text-xl font-heading font-bold text-foreground leading-tight uppercase">{verifiedTeam.problem_statement}</h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase">
                                {verifiedTeam.domain}
                              </span>
                              <span className="inline-block px-3 py-1 rounded-full bg-muted-foreground/10 text-muted-foreground text-[10px] font-bold uppercase border border-border">
                                {verifiedTeam.company_name}
                              </span>
                            </div>
                          </div>

                          {verifiedTeam.problem_description && (
                            <div className="bg-white/60 rounded-lg p-4 border border-border text-sm italic text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {verifiedTeam.problem_description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-6">


                        {/* YouTube URL */}
                        <div className="space-y-2">
                          <Label>YouTube Demo Video Link *</Label>
                          <div className="relative">
                            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="https://youtu.be/..."
                              className="pl-10 h-11"
                              value={youtubeLink}
                              onChange={(e) => setYoutubeLink(e.target.value)}
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground italic ml-1">Mandatory technical walkthrough (1-2 minutes).</p>
                        </div>

                        {/* File Upload - Matching styling from RegisterTeam Step 4 */}
                        <div className="space-y-2">
                          <Label>Technical Proposal / Solution PDF *</Label>
                          <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                              solutionFile 
                                ? 'bg-primary/5 border-primary/40' 
                                : 'bg-muted/10 border-border hover:border-primary/40 hover:bg-muted/30'
                            }`}
                            onClick={() => document.getElementById("solution-pdf-input")?.click()}
                          >
                            <input
                              id="solution-pdf-input"
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            {solutionFile ? (
                              <div className="space-y-3">
                                <div className="w-12 h-12 bg-white rounded-lg mx-auto flex items-center justify-center shadow-sm border border-border">
                                  <FileText className="w-7 h-7 text-primary" />
                                </div>
                                <p className="text-foreground font-bold text-sm">{solutionFile.name}</p>
                                <p className="text-green-600 text-[10px] font-bold uppercase tracking-widest">READY ({(solutionFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600 h-8 px-4 font-bold text-[10px] uppercase"
                                  onClick={(e) => { e.stopPropagation(); setSolutionFile(null); }}
                                >
                                  Remove selection
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                                <div className="space-y-1">
                                  <p className="text-foreground font-bold italic">Click here to upload research PDF</p>
                                  <p className="text-[10px] text-muted-foreground uppercase font-medium">MAX 50MB • PDF ONLY</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Technical Description */}
                        <div className="space-y-2">
                          <Label>Brief Technical Summary *</Label>
                          <Textarea
                            placeholder="Explain your approach, core algorithm, and technology stack..."
                            className="min-h-[120px] bg-white border border-border focus:border-primary transition-all rounded-xl p-4 text-sm leading-relaxed"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>

                        <Button
                          className="w-full gradient-primary text-white font-bold h-14 text-lg rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-all uppercase tracking-widest mt-4"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-3">
                              <span className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                              Transmitting...
                            </span>
                          ) : (
                            <><Send className="w-5 h-5 mr-3" /> Confirm & Submit Solution</>
                          )}
                        </Button>
                      </div>
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
