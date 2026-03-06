import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [leaderName, setLeaderName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [instituteNumber, setInstituteNumber] = useState("");
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Step 2: Submit solution
  const [problemInfo, setProblemInfo] = useState<ProblemInfo | null>(null);
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

  const searchTeams = async () => {
    if (!leaderName.trim() || !collegeName.trim() || !instituteNumber.trim()) {
      toast.error("Please fill all fields to search your team");
      scrollToTop();
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    const { data, error } = await supabase
      .from("registered_teams")
      .select("team_id, team_name, leader_name, selected_problem_id, selected_domain")
      .ilike("leader_name", `%${leaderName.trim()}%`)
      .ilike("college_name", `%${collegeName.trim()}%`)
      .ilike("institute_number", `%${instituteNumber.trim()}%`);

    if (error) {
      toast.error("Search failed", { description: error.message });
      scrollToTop();
    } else {
      setTeams((data || []) as TeamInfo[]);
      if (!data || data.length === 0) {
        toast.error("No teams found matching your details");
        scrollToTop();
      }
    }
    setIsSearching(false);
  };

  const selectTeam = async (teamId: string) => {
    setSelectedTeamId(teamId);
    setProblemInfo(null);
    const team = teams.find((t) => t.team_id === teamId);

    if (team?.selected_problem_id) {
      const { data } = await supabase
        .from("problem_statements")
        .select("id, problem_title, domain")
        .eq("id", team.selected_problem_id)
        .maybeSingle();
      if (data) setProblemInfo(data as ProblemInfo);
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
    if (!selectedTeamId) { toast.error("Please select your team"); scrollToTop(); return; }
    if (!youtubeLink.trim()) { toast.error("YouTube video link is required"); scrollToTop(); return; }
    if (!validateYoutubeLink(youtubeLink)) { toast.error("Please enter a valid YouTube link"); scrollToTop(); return; }
    if (!solutionFile) { toast.error("Please upload your solution PDF"); scrollToTop(); return; }

    setIsSubmitting(true);
    try {
      // Build FormData to send file + metadata to edge function
      const formData = new FormData();
      formData.append("team_id", selectedTeamId);
      formData.append("youtube_link", youtubeLink.trim());
      formData.append("description", description.trim() || "");
      formData.append("problem_id", problemInfo?.id || "");
      formData.append("solution_file", solutionFile);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/submit-solution`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      setSubmittedTeamId(selectedTeamId);
      setSubmitted(true);
      // scroll happens via useEffect
    } catch (error: any) {
      toast.error("Submission failed", { description: error.message });
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTeam = teams.find((t) => t.team_id === selectedTeamId);

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">

            {/* ── SUCCESS STATE ── */}
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
                  <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-1 text-left max-w-sm mx-auto">
                    <p className="text-muted-foreground">Team ID</p>
                    <p className="font-bold font-mono text-lg text-primary">{submittedTeamId}</p>
                    <p className="text-xs text-muted-foreground mt-1">Please keep this ID for future reference.</p>
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
              /* ── FORM STATE ── */
              <div className="bg-background rounded-2xl shadow-xl overflow-hidden">
                <div className="gradient-primary p-6 text-primary-foreground">
                  <h1 className="text-2xl font-heading font-bold">Submit Solution</h1>
                  <p className="text-sm opacity-80">Upload your team's YouTube demo link and solution PDF</p>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Step 1: Find Team */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Search className="w-5 h-5 text-primary" />
                      Step 1: Find Your Team
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enter the details you used during registration.
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Leader Name *</Label>
                        <Input
                          placeholder="Full name"
                          value={leaderName}
                          onChange={(e) => setLeaderName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && searchTeams()}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">College Name *</Label>
                        <Input
                          placeholder="College name"
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && searchTeams()}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Institute Number *</Label>
                        <Input
                          placeholder="e.g. 123456"
                          value={instituteNumber}
                          onChange={(e) => setInstituteNumber(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && searchTeams()}
                        />
                      </div>
                    </div>
                    <Button onClick={searchTeams} disabled={isSearching} className="gradient-primary text-primary-foreground">
                      <Search className="w-4 h-4 mr-2" />
                      {isSearching ? "Searching..." : "Search Teams"}
                    </Button>

                    {hasSearched && teams.length > 0 && (
                      <div className="space-y-2">
                        <Label>Select your team:</Label>
                        <Select value={selectedTeamId} onValueChange={selectTeam}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map((t) => (
                              <SelectItem key={t.team_id} value={t.team_id}>
                                {t.team_id} — {t.team_name} (Leader: {t.leader_name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {hasSearched && teams.length === 0 && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
                        <AlertCircle className="w-5 h-5" />
                        No registered teams found. Please check your details or register first.
                      </div>
                    )}
                  </div>

                  {/* Step 2: Submit Solution */}
                  {selectedTeamId && (
                    <div className="space-y-5 border-t border-border pt-6">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        Step 2: Submit Your Solution
                      </h3>

                      {selectedTeam && (
                        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
                          <p>Team ID: <span className="font-bold font-mono text-primary">{selectedTeam.team_id}</span></p>
                          <p>Team: <span className="font-bold">{selectedTeam.team_name}</span></p>
                          {problemInfo && (
                            <p>Problem: <span className="font-bold">{problemInfo.problem_title}</span>
                              {problemInfo.domain && (
                                <Badge className="ml-2 text-xs" variant="secondary">{problemInfo.domain}</Badge>
                              )}
                            </p>
                          )}
                        </div>
                      )}

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
                          A short video (1–2 minutes) explaining your solution — mandatory.
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
                              <p className="text-green-600 text-xs font-medium">✓ {(solutionFile.size / 1024 / 1024).toFixed(1)} MB</p>
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
                              <p className="text-muted-foreground text-xs">PDF only · max 50MB</p>
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
                        className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-base"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : (
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
