import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, edgeFunctionsClient } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Shield, Users, FileText, GraduationCap,
  Plus, Trash2, Mail, Phone, Hash, Building2, User, Copy, Upload
} from "lucide-react";

interface ProblemStatement {
  id: string;
  company_name: string;
  problem_title: string;
  problem_description: string;
  domain: string;
  expected_outcome: string | null;
  targeted_audience: string | null;
  resources_provided: string | null;
  resource_file_url: string | null;
}

interface TeamMember {
  name: string;
  email: string;
  contact: string;
}

const DOMAIN_PREFIXES: Record<string, string> = {
  "Automation": "AT", "Banking/Sales/Marketing": "BA", "Design": "DE",
  "Hardware": "HA", "Other": "OT", "Software": "SO", "Graphics": "GR", "Maintenance": "MA",
};

const steps = [
  { id: 1, title: "Team Info", icon: Shield },
  { id: 2, title: "Members", icon: Users },
  { id: 3, title: "Problem Selection", icon: FileText },
  { id: 4, title: "Mentor", icon: GraduationCap },
];

const RegisterTeam = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [successData, setSuccessData] = useState<{ teamId: string; email: string } | null>(null);
  // Step 1: Team Info
  const [teamName, setTeamName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [instituteNumber, setInstituteNumber] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");

  // Step 2: Members
  const [members, setMembers] = useState<TeamMember[]>([]);

  // Step 3: Problem Selection
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedProblemId, setSelectedProblemId] = useState("");

  // Step 4: Mentor & Attachment
  const [mentorName, setMentorName] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [mentorContact, setMentorContact] = useState("");
  const [regFormFile, setRegFormFile] = useState<File | null>(null);
  const [regFormUrl, setRegFormUrl] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      const { data } = await supabase
        .from("problem_statements")
        .select("*")
        .eq("status", "approved")
        .order("domain")
        .order("created_at");
      if (data) setProblems(data as ProblemStatement[]);
    };
    fetchProblems();
  }, []);

  const problemsWithIds = useMemo(() => {
    const counters: Record<string, number> = {};
    return problems.map((p) => {
      const prefix = DOMAIN_PREFIXES[p.domain] || "XX";
      counters[p.domain] = (counters[p.domain] || 0) + 1;
      return { ...p, displayId: `${prefix}-${counters[p.domain]}` };
    });
  }, [problems]);

  const domains = [...new Set(problems.map((p) => p.domain))].sort();
  const filteredProblems = selectedDomain
    ? problemsWithIds.filter((p) => p.domain === selectedDomain)
    : [];

  const selectedProblem = problemsWithIds.find((p) => p.id === selectedProblemId);

  const addMember = () => {
    if (members.length < 4) {
      setMembers([...members, { name: "", email: "", contact: "" }]);
    }
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateStep = (step: number): boolean => {
    const showError = (msg: string) => {
      toast.error(msg);
      scrollToTop();
      return false;
    };
    if (step === 1) {
      if (!teamName.trim()) return showError("Team name is required");
      if (!collegeName.trim()) return showError("College name is required");
      if (!instituteNumber.trim()) return showError("Institute number is required");
      if (!leaderName.trim()) return showError("Leader name is required");
      if (!leaderEmail.trim() || !/\S+@\S+\.\S+/.test(leaderEmail)) return showError("Valid leader email is required");
      if (!leaderPhone.trim() || leaderPhone.length < 10) return showError("Valid contact number is required");
      return true;
    }
    if (step === 2) {
      for (let i = 0; i < members.length; i++) {
        if (!members[i].name.trim()) return showError(`Member ${i + 1} name is required`);
        if (!members[i].email.trim() || !/\S+@\S+\.\S+/.test(members[i].email)) return showError(`Valid email required for member ${i + 1}`);
        if (!members[i].contact.trim() || members[i].contact.length < 10) return showError(`Valid contact required for member ${i + 1}`);
      }
      return true;
    }
    if (step === 3) {
      if (!selectedDomain) return showError("Please select a domain");
      if (!selectedProblemId) return showError("Please select a problem statement");
      return true;
    }
    if (step === 4) {
      if (!mentorName.trim()) return showError("Mentor name is required");
      if (!mentorEmail.trim() || !/\S+@\S+\.\S+/.test(mentorEmail)) return showError("Valid mentor email is required");
      if (!mentorContact.trim() || mentorContact.length < 10) return showError("Valid mentor contact is required");
      if (!regFormFile && !regFormUrl) return showError("Team Authorization Form is required");
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      scrollToTop();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    if (isSubmitting) return; // Prevent double-click
    setIsSubmitting(true);

    try {
      // Schema awareness
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isExternal = supabaseUrl.includes("lxawemydhhmqjahttrlb");
      const regTable = isExternal ? "team_registrations" : "registered_teams";
      const idColumn = isExternal ? "registration_id" : "team_id";

      // Check for duplicate registration (same leader email + college)
      const { data: existingTeams }: { data: any[] | null } = await supabase
        .from(regTable as any)
        .select(idColumn)
        .ilike("leader_email", leaderEmail.trim())
        .ilike("college_name", collegeName.trim());

      if (existingTeams && existingTeams.length > 0) {
        const teamId = (existingTeams[0] as any)[idColumn];
        toast.error("A team with this leader email from this college is already registered", {
          description: `Existing Team ID: ${teamId}`,
          duration: 8000,
        });
        setIsSubmitting(false);
        return;
      }

      let regFileData = null;
      let regFileName = null;
      let regFileType = null;

      if (regFormFile) {
        regFileName = `${teamName.replace(/\s+/g, '_')}_${Date.now()}.${regFormFile.name.split('.').pop()}`;
        regFileType = regFormFile.type;

        // Convert file to Base64
        regFileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]); // Remove the data:xxx base64 prefix
          };
          reader.readAsDataURL(regFormFile);
        });
      }

      // Invoke Edge Function with retry
      let result = null;
      let lastError = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        const { data, error } = await edgeFunctionsClient.functions.invoke("register-team", {
          body: {
            team_name: teamName,
            college_name: collegeName,
            institute_number: instituteNumber,
            leader_name: leaderName,
            leader_email: leaderEmail,
            leader_phone: leaderPhone,
            members,
            selected_problem_id: selectedProblemId,
            selected_domain: selectedDomain,
            problem_statement_title: selectedProblem?.problem_title || "",
            problem_description: selectedProblem?.problem_description || "",
            company_name: selectedProblem?.company_name || "",
            approach_description: selectedProblem?.problem_description || "", // Keep for legacy if needed
            mentor_name: mentorName,
            mentor_email: mentorEmail,
            mentor_contact: mentorContact,
            registration_form_url: regFormUrl, // This could be a static link
            reg_file_data: regFileData,
            reg_file_name: regFileName,
            reg_file_type: regFileType,
          },
        });

        if (!error && data && !data.error) {
          result = data;
          break;
        }
        lastError = error?.message || data?.error || "Registration failed";
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 1500)); // Wait before retry
        }
      }

      if (!result) throw new Error(lastError || "Registration failed after retries. Please try again.");

      setSuccessData({ teamId: result.team_id, email: leaderEmail });
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.message || "Please check your connection and try again.",
        duration: 6000,
      });
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
            {/* Step Indicator */}
            <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex items-center justify-between min-w-[500px] md:min-w-0 px-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center relative z-10">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${currentStep >= step.id ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
                        }`}>
                        {currentStep > step.id ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <step.icon className="w-5 h-5 md:w-6 md:h-6" />}
                      </div>
                      <div className="absolute top-12 md:top-14 flex flex-col items-center w-max">
                        <span className={`hidden md:block text-[10px] uppercase tracking-tighter font-bold ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}>
                          Step {step.id}
                        </span>
                        <span className={`text-[10px] md:text-sm font-bold uppercase tracking-tight whitespace-nowrap ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.title}
                        </span>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 md:h-1 mx-2 md:mx-4 rounded-full self-center mb-5 md:mb-6 ${currentStep > step.id ? "gradient-primary" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
              </div>
              {/* Spacer for the absolute labels */}
              <div className="h-10 md:h-12" />
            </div>

            {/* Form Card */}
            <div className="bg-background rounded-2xl shadow-xl overflow-hidden">
              {/* Step Header */}
              <div className="gradient-primary p-6 text-primary-foreground">
                <div className="flex items-center gap-3">
                  {(() => { const Icon = steps[currentStep - 1].icon; return <Icon className="w-8 h-8" />; })()}
                  <div>
                    <p className="text-sm opacity-80">Step {currentStep} of 4</p>
                    <h2 className="text-xl font-heading font-bold">{steps[currentStep - 1].title}</h2>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {/* Step 1: Team Info */}
                {currentStep === 1 && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Team Name *</Label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="e.g. CodeStorm" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>College Name *</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="e.g. KBT College of Engineering" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Institute Number *</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="12345"
                          value={instituteNumber}
                          onChange={(e) => setInstituteNumber(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-center gap-2 mb-4 text-primary">
                        <Shield className="w-5 h-5" />
                        <h3 className="font-semibold">Team Leader Details</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Leader Full Name *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Full name" value={leaderName} onChange={(e) => setLeaderName(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Leader Email *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" type="email" placeholder="leader@college.edu" value={leaderEmail} onChange={(e) => setLeaderEmail(e.target.value)} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label>Contact Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="10-digit mobile number" value={leaderPhone} onChange={(e) => setLeaderPhone(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Members */}
                {currentStep === 2 && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Team Members</h3>
                        <p className="text-sm text-muted-foreground">Add up to 4 members (excluding leader)</p>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary">
                        {members.length} / 4 added
                      </Badge>
                    </div>

                    {members.length === 0 ? (
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground font-medium">No members added yet.</p>
                        <p className="text-sm text-muted-foreground">You can participate solo or add up to 4 members.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {members.map((member, index) => (
                          <div key={index} className="border border-border rounded-xl p-4 relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 text-destructive"
                              onClick={() => removeMember(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <p className="text-sm font-semibold mb-3">Member {index + 1}</p>
                            <div className="grid md:grid-cols-3 gap-3">
                              <Input placeholder="Full name" value={member.name} onChange={(e) => updateMember(index, "name", e.target.value)} />
                              <Input placeholder="Email" type="email" value={member.email} onChange={(e) => updateMember(index, "email", e.target.value)} />
                              <Input placeholder="Contact Number" value={member.contact} onChange={(e) => updateMember(index, "contact", e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {members.length < 4 && (
                      <button
                        type="button"
                        onClick={addMember}
                        className="w-full border-2 border-dashed border-primary/40 rounded-xl p-4 text-primary font-medium flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                      >
                        <Plus className="w-5 h-5" /> Add Member
                      </button>
                    )}
                  </>
                )}

                {/* Step 3: Problem Selection */}
                {currentStep === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label>Select Domain *</Label>
                      <Select value={selectedDomain} onValueChange={(v) => { setSelectedDomain(v); setSelectedProblemId(""); }}>
                        <SelectTrigger><SelectValue placeholder="Choose a domain" /></SelectTrigger>
                        <SelectContent>
                          {domains.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {!selectedDomain && (
                      <p className="text-center text-primary text-sm">Please select a domain first to see problem statements.</p>
                    )}

                    {selectedDomain && filteredProblems.length > 0 && (
                      <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded-xl p-2">
                        {filteredProblems.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedProblemId(p.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedProblemId === p.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50"
                              }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs font-mono">{p.displayId}</Badge>
                              <Badge variant="secondary" className="text-xs">{p.domain}</Badge>
                            </div>
                            <p className="font-semibold text-sm">{p.problem_title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.problem_description}</p>
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedProblem && (
                      <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 text-primary">
                          <FileText className="w-5 h-5" />
                          <h3 className="font-bold uppercase tracking-wider text-sm">Selected Problem Details</h3>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Title</p>
                            <p className="text-sm font-bold text-foreground">{selectedProblem.problem_title}</p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Detailed Description</p>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selectedProblem.problem_description}</p>
                          </div>

                          {selectedProblem.expected_outcome && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Expected Outcome</p>
                              <p className="text-sm text-foreground">{selectedProblem.expected_outcome}</p>
                            </div>
                          )}

                          {selectedProblem.targeted_audience && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Targeted Audience</p>
                              <p className="text-sm text-foreground">{selectedProblem.targeted_audience}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Step 4: Mentor */}
                {currentStep === 4 && (
                  <>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                      <p className="text-sm"><span className="font-semibold text-primary">Note:</span> Provide details of the college professor or faculty mentor who will guide your team.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mentor Name *</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="Prof. / Dr. Name" value={mentorName} onChange={(e) => setMentorName(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Mentor Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input className="pl-10" type="email" placeholder="mentor@college.edu" value={mentorEmail} onChange={(e) => setMentorEmail(e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Mentor Contact *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="10-digit mobile number" value={mentorContact} onChange={(e) => setMentorContact(e.target.value)} />
                      </div>
                    </div>

                    {/* Step 4: Attachment */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center gap-2 mb-4 text-primary font-bold">
                        <Plus className="w-5 h-5" />
                        <h3 className="font-semibold uppercase tracking-wider">Team Authorization Form *</h3>
                      </div>

                      <div className="bg-muted p-4 rounded-xl border border-dashed border-primary/30 text-center">
                        <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-foreground font-semibold mb-2">Upload Signed Team Registration Form *</p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Download the template from <a href="/resources" target="_blank" className="text-primary hover:underline">Resources</a>, get it signed by your college head, and upload a photo/PDF here.
                        </p>

                        <div className="flex flex-col items-center gap-4">
                          <div
                            className="w-full sm:max-w-md border-2 border-dashed border-primary/30 rounded-xl p-6 md:p-8 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all text-center"
                            onClick={() => document.getElementById("reg-form-input")?.click()}
                          >
                            <input
                              id="reg-form-input"
                              type="file"
                              accept=".pdf,image/*"
                              className="hidden"
                              onChange={(e) => setRegFormFile(e.target.files?.[0] || null)}
                            />
                            {regFormFile ? (
                              <div className="space-y-2">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                </div>
                                <p className="text-foreground font-semibold text-sm break-all px-2">{regFormFile.name}</p>
                                <p className="text-green-600 text-xs font-bold uppercase tracking-wider">✓ {(regFormFile.size / 1024 / 1024).toFixed(1)} MB</p>
                                <button
                                  type="button"
                                  className="text-destructive text-xs font-bold uppercase hover:underline mt-2"
                                  onClick={(e) => { e.stopPropagation(); setRegFormFile(null); }}
                                >
                                  Remove file
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                                <p className="text-sm font-bold text-foreground">Click to choose file</p>
                                <p className="text-[10px] uppercase text-muted-foreground font-medium">PDF or Image • max 10MB</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 w-full sm:max-w-md px-4">
                            <div className="h-px flex-1 bg-border" />
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">OR</p>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                          <Input
                            placeholder="Enter Google Drive link or other URL"
                            className="w-full sm:max-w-md h-11"
                            value={regFormUrl}
                            onChange={(e) => setRegFormUrl(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Registration Summary */}
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Registration Summary</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <p>Team: <span className="font-bold">{teamName}</span></p>
                        <p>College: <span className="font-bold">{collegeName}</span></p>
                        <p>Leader: <span className="font-bold">{leaderName}</span></p>
                        <p>Members: <span className="font-bold">{members.length} member(s)</span></p>
                        <p>Domain: <span className="font-bold">{selectedDomain}</span></p>
                        <p>Problem: <span className="font-bold">{selectedProblem ? `${selectedProblem.displayId} – ${selectedProblem.problem_title}` : "None"}</span></p>
                      </div>
                    </div>
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  {currentStep < 4 ? (
                    <Button className="gradient-primary text-primary-foreground" onClick={nextStep}>
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      className="gradient-primary text-primary-foreground min-w-[200px]"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Registering...
                        </span>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Submit Registration</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={!!successData} onOpenChange={(open) => { if (!open) { setSuccessData(null); navigate("/"); } }}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto p-4 sm:p-6">
          <div className="flex flex-col items-center text-center w-full gap-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full gradient-primary flex items-center justify-center mb-2 sm:mb-4 shrink-0">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold leading-tight">Registration Successful! 🎉</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 leading-relaxed px-2">
              Your team has been registered. Use the Team ID below to submit your solution.
            </p>

            <div className="w-full my-4 md:my-6 p-4 md:p-6 bg-muted rounded-xl border border-border">
              <p className="text-xs md:text-sm text-muted-foreground mb-2 font-medium">Your Unique Team ID</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl md:text-3xl font-heading font-black text-primary tracking-[0.2em]">
                  {successData?.teamId}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-2"
                  onClick={() => {
                    navigator.clipboard.writeText(successData?.teamId || "");
                    toast.success("Team ID copied!");
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-4 leading-relaxed font-medium">
                Save this ID. A confirmation has been sent to:<br />
                <span className="text-foreground font-bold break-all">{successData?.email}</span>
              </p>
            </div>

            <Button className="gradient-primary text-primary-foreground h-12 px-10 w-full font-bold uppercase tracking-wider" onClick={() => { setSuccessData(null); navigate("/"); }}>
              Return to Website
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default RegisterTeam;
