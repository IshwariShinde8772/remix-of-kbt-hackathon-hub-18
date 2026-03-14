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
import { Search, Upload, Send, FileText, Youtube, CheckCircle2, AlertCircle, ArrowRight, X, Layout, BookOpen, Building2 } from "lucide-react";
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
    registration_id?: string
  } | null>(null);
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
      if (companyName) formData.set("company_name", companyName);

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
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      <Navbar />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">

            {/* Success State */}
            {submitted ? (
              <div className="bg-background rounded-2xl shadow-xl overflow-hidden border border-border animate-in fade-in zoom-in duration-500">
                <div className="bg-[#1e3a8a] p-10 text-white text-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">Solution Submitted!</h1>
                  <p className="text-blue-100/70 mt-3 text-lg font-medium">KBT Avinyathon 2026 Submission Confirmed</p>
                </div>
                <div className="p-12 text-center space-y-10">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
                      Successfully Received
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto">
                      Your solution for <span className="text-primary font-black uppercase">"{verifiedTeam?.problem_statement}"</span> has been received and logged.
                    </p>
                  </div>
                  
                  <div className="inline-block px-10 py-6 bg-muted/40 rounded-3xl border-2 border-border/50">
                    <p className="text-xs uppercase tracking-[0.3em] font-black text-muted-foreground mb-2">Team ID</p>
                    <p className="text-4xl font-black font-mono text-primary tracking-wider">{submittedTeamId}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <Button 
                      className="bg-[#1e3a8a] hover:bg-[#1a3174] text-white h-14 px-10 rounded-2xl font-black uppercase tracking-wider"
                      onClick={() => navigate("/")}
                    >
                      Return Home
                    </Button>
                    <Button variant="outline" className="h-14 px-10 rounded-2xl font-black uppercase tracking-wider border-2" onClick={() => navigate("/problems")}>
                      Explore More
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Form Page */
              <div className="bg-background rounded-3xl shadow-2xl overflow-hidden border border-border">
                <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] p-12 text-white items-center flex justify-between">
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Submit Solution</h1>
                    <p className="text-blue-100/80 text-lg font-medium tracking-tight italic">Bring your innovation to global reality</p>
                  </div>
                  <div className="hidden md:block w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
                    <Send className="w-10 h-10 text-white/50" />
                  </div>
                </div>

                <div className="p-10 md:p-14 space-y-12">
                  {/* Step 1: Verification Flow */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-sm border border-indigo-100">1</div>
                      <h3 className="text-2xl font-black tracking-tight uppercase">Verify Identity</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6 pt-2">
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Team ID</Label>
                        <Input
                          placeholder="KBT-XXXX"
                          className="h-14 font-mono text-lg uppercase bg-muted/30 border-2 focus:border-indigo-400 focus:bg-white transition-all rounded-2xl px-6"
                          value={teamIdInput}
                          onChange={(e) => setTeamIdInput(e.target.value.toUpperCase())}
                          disabled={!!verifiedTeam}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">College Name</Label>
                        <Input
                          placeholder="College Name"
                          className="h-14 bg-muted/30 border-2 focus:border-indigo-400 focus:bg-white transition-all rounded-2xl px-6 font-bold"
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          disabled={!!verifiedTeam}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Institute ID</Label>
                        <Input
                          placeholder="ID Number"
                          className="h-14 bg-muted/30 border-2 focus:border-indigo-400 focus:bg-white transition-all rounded-2xl px-6 font-bold"
                          value={instituteNumber}
                          onChange={(e) => setInstituteNumber(e.target.value)}
                          disabled={!!verifiedTeam}
                        />
                      </div>
                    </div>
                    
                    {!verifiedTeam ? (
                      <Button 
                        onClick={verifyTeam} 
                        disabled={isSearching} 
                        className="bg-[#1e3a8a] hover:bg-[#1a3174] text-white h-14 px-12 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] w-full md:w-auto"
                      >
                        {isSearching ? (
                          <><span className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin mr-3" /> Verifying...</>
                        ) : (
                          <><Search className="w-5 h-5 mr-3" /> Verify Team Details</>
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between p-7 bg-green-50/50 border-2 border-green-200 rounded-3xl animate-in fade-in slide-in-from-left-6">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-green-200 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-9 h-9 text-green-500" />
                          </div>
                          <div>
                            <p className="text-xl font-black text-green-950 uppercase tracking-tighter leading-none mb-1.5">{verifiedTeam.team_name}</p>
                            <p className="text-xs text-green-700 font-bold opacity-80 uppercase tracking-widest">
                              Verified Successfully
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { setVerifiedTeam(null); setHasSearched(false); }} className="text-muted-foreground hover:text-red-500 hover:bg-red-50 h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]">
                          <X className="w-4 h-4 mr-2" /> Edit
                        </Button>
                      </div>
                    )}

                    {hasSearched && !verifiedTeam && !isSearching && (
                      <div className="flex items-center gap-5 p-7 bg-red-50/70 border-2 border-red-200 rounded-3xl text-red-700 animate-in shake-200">
                        <AlertCircle className="w-7 h-7" />
                        <p className="font-black uppercase tracking-tight text-sm">Team Identity verification failed. Check credentials.</p>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Submission Materials */}
                  {verifiedTeam && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-top-10 duration-1000 pt-4">
                      
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 font-black text-2xl shadow-sm border border-violet-100">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-[11px] text-violet-600 font-black uppercase tracking-[0.25em] mb-0.5">Ready for Submission</h3>
                          <h3 className="text-2xl font-black tracking-tight uppercase">Step 2: Submit Your Solution</h3>
                        </div>
                      </div>

                      <div className="grid gap-10">
                        {/* Problem Details Display - Matching Screenshot */}
                        <div className="bg-muted/50 border-2 border-muted rounded-3xl p-10 space-y-8 relative overflow-hidden group">
                          <div className="space-y-6 relative z-10">
                            <div>
                              <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.25em] mb-2 leading-none">ALLOCATED PROBLEM STATEMENT</p>
                              <h4 className="text-2xl font-black text-foreground leading-tight tracking-tight">{verifiedTeam.problem_statement}</h4>
                              <p className="text-sm font-bold text-muted-foreground mt-2 italic flex items-center gap-2">
                                Domain: <span className="text-foreground not-italic">{verifiedTeam.domain}</span>
                              </p>
                            </div>

                            {/* Optional: Add problem description if available */}
                            {verifiedTeam.problem_description && (
                              <div className="bg-white/80 rounded-2xl p-6 border border-border shadow-sm">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-3 leading-none opacity-60">Problem Requirements</p>
                                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap italic">
                                  {verifiedTeam.problem_description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Company Name */}
                        <div className="space-y-4">
                          <Label className="text-sm font-black text-foreground flex items-center gap-2">
                            Company / Organization Name *
                          </Label>
                          <Input
                            placeholder="Enter Name"
                            className="h-16 bg-white border-2 border-muted focus:border-violet-500/40 transition-all rounded-2xl px-8 text-lg"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                          />
                          <p className="text-[11px] text-muted-foreground font-medium ml-2 opacity-80">
                            The company or organization you are working with on this solution.
                          </p>
                        </div>

                        {/* YouTube URL */}
                        <div className="space-y-4">
                          <Label className="flex items-center gap-3 text-sm font-black text-foreground">
                            <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
                             <Youtube className="w-4 h-4 text-red-500" />
                            </span>
                            YouTube Demo Video Link *
                          </Label>
                          <Input
                            placeholder="https://youtu.be/..."
                            className="h-16 bg-white border-2 border-muted focus:border-red-500/30 transition-all rounded-2xl px-8 text-lg"
                            value={youtubeLink}
                            onChange={(e) => setYoutubeLink(e.target.value)}
                          />
                          <p className="text-[11px] text-muted-foreground font-medium ml-2 opacity-80">
                            A short video (1-2 minutes) explaining your solution — mandatory.
                          </p>
                          {youtubeLink && !validateYoutubeLink(youtubeLink) && (
                            <p className="text-red-500 text-xs font-black flex items-center gap-2 px-2 mt-1">
                              <X className="w-4 h-4" /> Invalid YouTube link format
                            </p>
                          )}
                        </div>

                        {/* File Upload */}
                        <div className="space-y-4">
                          <Label className="flex items-center gap-3 text-sm font-black text-foreground">
                            <span className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center border border-violet-100">
                              <FileText className="w-4 h-4 text-violet-500" />
                            </span>
                            Solution PDF *
                          </Label>
                          <div
                            className={`border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
                              solutionFile 
                                ? 'bg-indigo-50/20 border-violet-400/40 ring-8 ring-indigo-500/5' 
                                : 'bg-muted/10 border-muted focus-within:border-violet-400 group hover:border-violet-400/40 hover:bg-violet-50/30'
                            }`}
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
                              <div className="space-y-5 animate-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-xl border border-violet-100">
                                  <FileText className="w-12 h-12 text-violet-500" />
                                </div>
                                <div>
                                  <p className="text-foreground font-black text-xl tracking-tight leading-none mb-2">{solutionFile.name}</p>
                                  <p className="text-violet-600 text-[10px] font-black uppercase tracking-[0.3em]">✓ Ready for Transmission</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-10 px-8 rounded-2xl font-black uppercase tracking-widest text-[9px]"
                                  onClick={(e) => { e.stopPropagation(); setSolutionFile(null); }}
                                >
                                  Reset file selection
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-5 py-4">
                                <div className="w-24 h-24 bg-white shadow-inner rounded-3xl mx-auto flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform duration-500 overflow-hidden relative">
                                   <div className="absolute inset-0 bg-violet-50 opacity-50" />
                                   <FileText className="w-12 h-12 text-violet-300 relative z-10" />
                                </div>
                                <div className="space-y-2">
                                  <p className="text-foreground font-black text-xl tracking-tight">Technical Research & Solution PDF</p>
                                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em]">DOCUMENTS ONLY • MAX 50MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Technical Approach */}
                        <div className="space-y-4 pt-4">
                          <Label className="text-sm font-black text-foreground ml-1 uppercase tracking-widest leading-none">Brief Technical Description</Label>
                          <Textarea
                            placeholder="Explain your approach, libraries used, and how it solves the problem..."
                            className="min-h-[160px] resize-none bg-white border-2 border-muted focus:border-violet-500/40 transition-all rounded-3xl p-8 text-lg font-medium leading-relaxed shadow-sm"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>

                        <Button
                          className="w-full bg-[#1e3a8a] hover:bg-[#1a3174] text-white font-black h-20 text-2xl rounded-3xl shadow-2xl shadow-blue-900/40 active:scale-[0.98] transition-all group mt-8 uppercase tracking-widest"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-5">
                              <span className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                              Transmitting Data...
                            </span>
                          ) : (
                            <><Send className="w-8 h-8 mr-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" /> Confirm & Post Solution</>
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
