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
import { Search, Upload, Send, FileText, Youtube, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

// team_registrations schema (external DB)
interface TeamInfo {
  registration_id: string;
  team_name: string;
  leader_name: string;
  problem_statement_uuid: string | null;
  problem_statement_title: string | null;
  domain: string | null;
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

  const searchTeams = async () => {
    if (!leaderName.trim() || !collegeName.trim() || !instituteNumber.trim()) {
      toast.error("Please fill all fields to search your team");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // Query team_registrations table (external DB schema)
    const { data, error } = await supabase
      .from("team_registrations")
      .select("registration_id, team_name, leader_name, problem_statement_uuid, problem_statement_title, domain")
      .ilike("leader_name", `%${leaderName.trim()}%`)
      .ilike("college_name", `%${collegeName.trim()}%`)
      .ilike("institute_number", `%${instituteNumber.trim()}%`);

    if (error) {
      toast.error("Search failed", { description: error.message });
    } else {
      setTeams((data || []) as TeamInfo[]);
      if (!data || data.length === 0) {
        toast.error("No teams found matching your details");
      }
    }
    setIsSearching(false);
  };

  const selectTeam = async (regId: string) => {
    setSelectedTeamId(regId);
    setProblemInfo(null);
    const team = teams.find((t) => t.registration_id === regId);

    if (team?.problem_statement_title) {
      setProblemInfo({
        id: team.problem_statement_uuid || "",
        problem_title: team.problem_statement_title,
        domain: team.domain || "",
      });
    } else if (team?.problem_statement_uuid) {
      const { data } = await supabase
        .from("problem_statements")
        .select("id, problem_title, domain")
        .eq("id", team.problem_statement_uuid)
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
    if (!selectedTeamId) { toast.error("Please select your team"); return; }
    if (!youtubeLink.trim()) { toast.error("YouTube video link is required"); return; }
    if (!validateYoutubeLink(youtubeLink)) { toast.error("Please enter a valid YouTube link (youtube.com or youtu.be)"); return; }
    if (!solutionFile) { toast.error("Please upload your solution PDF"); return; }

    setIsSubmitting(true);
    try {
      // Upload PDF to 'solutions' bucket
      const fileName = `${selectedTeamId}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("solutions")
        .upload(fileName, solutionFile, { contentType: "application/pdf" });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Insert into team_solutions (external DB schema)
      const { error: insertError } = await supabase
        .from("team_solutions")
        .insert({
          registration_id: selectedTeamId,
          solution_description: description.trim() || null,
          video_link: youtubeLink.trim(),
          solution_pdf_url: fileName,
          status: "submitted",
        });

      if (insertError) throw new Error(insertError.message);

      setSubmittedTeamId(selectedTeamId);
      setSubmitted(true);
      // scroll happens via useEffect
    } catch (error: any) {
      toast.error("Submission failed", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTeam = teams.find((t) => t.registration_id === selectedTeamId);

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">

            {/* ── SUCCESS STATE (inline, navbar stays visible) ── */}
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
                    <p className="text-muted-foreground">Team Registration ID</p>
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
                          placeholder="e.g. KBTCOE"
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
                              <SelectItem key={t.registration_id} value={t.registration_id}>
                                {t.registration_id} — {t.team_name} (Leader: {t.leader_name})
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
                          <p>Team ID: <span className="font-bold font-mono text-primary">{selectedTeam.registration_id}</span></p>
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

                      {/* YouTube Link — FIRST */}
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

                      {/* PDF Upload — SECOND */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                          <FileText className="w-5 h-5 text-primary" />
                          Solution PDF *
                        </Label>
                        <div
                          className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
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
                              <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary" />
                              </div>
                              <p className="text-foreground font-medium text-sm">{solutionFile.name}</p>
                              <p className="text-green-600 text-xs">✓ {(solutionFile.size / 1024 / 1024).toFixed(1)} MB · Click to change</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                              <p className="text-muted-foreground text-sm">Click to upload your solution PDF</p>
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
