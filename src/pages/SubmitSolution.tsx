import { useState } from "react";
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
import { Search, Upload, Send, FileText, Youtube, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  const searchTeams = async () => {
    if (!leaderName.trim() || !collegeName.trim() || !instituteNumber.trim()) {
      toast.error("Please fill all fields to search your team");
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
      toast.error("Search failed");
    } else {
      setTeams((data || []) as TeamInfo[]);
      if (!data || data.length === 0) {
        toast.error("No teams found matching your details");
      }
    }
    setIsSearching(false);
  };

  const selectTeam = async (teamId: string) => {
    setSelectedTeamId(teamId);
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
    if (!selectedTeamId) { toast.error("Please select your team"); return; }
    if (!solutionFile) { toast.error("Please upload your solution PDF"); return; }
    if (!youtubeLink.trim()) { toast.error("YouTube video link is required"); return; }
    if (!validateYoutubeLink(youtubeLink)) { toast.error("Please enter a valid YouTube link"); return; }

    setIsSubmitting(true);
    try {
      // Upload PDF
      const fileName = `${selectedTeamId}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("solutions")
        .upload(fileName, solutionFile, { contentType: "application/pdf" });

      if (uploadError) throw new Error("Failed to upload solution file");

      // Insert submission
      const { error: insertError } = await supabase
        .from("submissions")
        .insert({
          team_id: selectedTeamId,
          problem_id: problemInfo?.id || null,
          solution_pdf_url: fileName,
          youtube_link: youtubeLink.trim(),
          description: description.trim() || null,
          status: "pending",
        });

      if (insertError) throw new Error(insertError.message);

      setSubmitted(true);
      toast.success("Solution submitted successfully!");
    } catch (error: any) {
      toast.error("Submission failed", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <Navbar />
        <main className="py-16">
          <div className="container mx-auto px-4 text-center max-w-lg">
            <div className="bg-background rounded-2xl shadow-xl p-8">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-heading font-bold mb-2">Solution Submitted!</h2>
              <p className="text-muted-foreground mb-4">
                Your solution for team <span className="font-bold">{selectedTeamId}</span> has been successfully submitted.
              </p>
              <Button className="gradient-primary text-primary-foreground" onClick={() => window.location.href = "/problems"}>
                Back to Problem Statements
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedTeam = teams.find((t) => t.team_id === selectedTeamId);

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-background rounded-2xl shadow-xl overflow-hidden">
              <div className="gradient-primary p-6 text-primary-foreground">
                <h1 className="text-2xl font-heading font-bold">Submit Solution</h1>
                <p className="text-sm opacity-80">Upload your team's solution for the selected problem statement</p>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {/* Step 1: Find Team */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    Step 1: Find Your Team
                  </h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Leader Name</Label>
                      <Input placeholder="Full name" value={leaderName} onChange={(e) => setLeaderName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">College Name</Label>
                      <Input placeholder="College name" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Institute Number</Label>
                      <Input placeholder="Institute number" value={instituteNumber} onChange={(e) => setInstituteNumber(e.target.value)} />
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
                  <div className="space-y-4 border-t border-border pt-6">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Upload className="w-5 h-5 text-primary" />
                      Step 2: Submit Your Solution
                    </h3>

                    {selectedTeam && (
                      <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
                        <p>Team: <span className="font-bold">{selectedTeam.team_id} — {selectedTeam.team_name}</span></p>
                        {problemInfo && (
                          <p>Problem: <span className="font-bold">{problemInfo.problem_title}</span>
                            <Badge className="ml-2 text-xs" variant="secondary">{problemInfo.domain}</Badge>
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Solution PDF *
                      </Label>
                      <Input type="file" accept=".pdf" onChange={handleFileChange} />
                      {solutionFile && (
                        <p className="text-sm text-green-600">✓ {solutionFile.name} ({(solutionFile.size / 1024 / 1024).toFixed(1)} MB)</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Youtube className="w-4 h-4" /> YouTube Video Link * (1-2 minutes)
                      </Label>
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={youtubeLink}
                        onChange={(e) => setYoutubeLink(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">A short video explaining your solution (mandatory)</p>
                    </div>

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
                      className="w-full gradient-primary text-primary-foreground"
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubmitSolution;
