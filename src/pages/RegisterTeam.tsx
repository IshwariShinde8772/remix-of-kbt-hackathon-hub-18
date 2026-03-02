import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";

// External Supabase client (your own DB: lxawemydhhmqjahttrlb)
const externalSupabase = createClient(
  import.meta.env.VITE_EXTERNAL_SUPABASE_URL,
  import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY
);
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Shield, Users, FileText, GraduationCap,
  Plus, Trash2, Mail, Phone, Hash, Building2, User, Copy
} from "lucide-react";

interface ProblemStatement {
  id: string;
  company_name: string;
  problem_title: string;
  problem_description: string;
  domain: string;
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
  const [approachDescription, setApproachDescription] = useState("");

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
        .select("id, company_name, problem_title, problem_description, domain")
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

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!teamName.trim()) { toast.error("Team name is required"); return false; }
      if (!collegeName.trim()) { toast.error("College name is required"); return false; }
      if (!instituteNumber.trim()) { toast.error("Institute number is required"); return false; }
      if (!leaderName.trim()) { toast.error("Leader name is required"); return false; }
      if (!leaderEmail.trim() || !/\S+@\S+\.\S+/.test(leaderEmail)) { toast.error("Valid leader email is required"); return false; }
      if (!leaderPhone.trim() || leaderPhone.length < 10) { toast.error("Valid contact number is required"); return false; }
      return true;
    }
    if (step === 2) {
      for (let i = 0; i < members.length; i++) {
        if (!members[i].name.trim()) { toast.error(`Member ${i + 1} name is required`); return false; }
        if (!members[i].email.trim() || !/\S+@\S+\.\S+/.test(members[i].email)) { toast.error(`Valid email required for member ${i + 1}`); return false; }
        if (!members[i].contact.trim() || members[i].contact.length < 10) { toast.error(`Valid contact required for member ${i + 1}`); return false; }
      }
      return true;
    }
    if (step === 3) {
      if (!selectedDomain) { toast.error("Please select a domain"); return false; }
      if (!selectedProblemId) { toast.error("Please select a problem statement"); return false; }
      if (!approachDescription.trim()) { toast.error("Please describe your approach"); return false; }
      return true;
    }
    if (step === 4) {
      if (!mentorName.trim()) { toast.error("Mentor name is required"); return false; }
      if (!mentorEmail.trim() || !/\S+@\S+\.\S+/.test(mentorEmail)) { toast.error("Valid mentor email is required"); return false; }
      if (!mentorContact.trim() || mentorContact.length < 10) { toast.error("Valid mentor contact is required"); return false; }
      if (!regFormFile && !regFormUrl) { toast.error("Please upload the registration form"); return false; }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);

    try {
      let primaryFormUrl = regFormUrl;
      let externalFormUrl = regFormUrl;

      // Enable dual upload to storage
      if (regFormFile) {
        const fileExt = regFormFile.name.split('.').pop();
        const fileName = `${teamName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
        const filePath = fileName;

        // 1. Upload to PRIMARY Supabase
        const { error: primaryUploadError } = await supabase.storage
          .from('registration-forms')
          .upload(filePath, regFormFile);

        if (primaryUploadError) {
          console.error("Primary upload error:", primaryUploadError);
          throw new Error("Primary file upload failed: " + primaryUploadError.message);
        }

        const { data: { publicUrl: primaryPublicUrl } } = supabase.storage
          .from('registration-forms')
          .getPublicUrl(filePath);
        primaryFormUrl = primaryPublicUrl;

        // 2. Upload to EXTERNAL Supabase
        try {
          const { error: externalUploadError } = await externalSupabase.storage
            .from('registration-forms')
            .upload(filePath, regFormFile);

          if (externalUploadError) {
            console.error("External upload error:", externalUploadError);
            // Non-blocking: registration continues if external upload fails but primary succeeds
          } else {
            const { data: { publicUrl: externalPublicUrl } } = externalSupabase.storage
              .from('registration-forms')
              .getPublicUrl(filePath);
            externalFormUrl = externalPublicUrl;
            console.log("✅ External storage synced");
          }
        } catch (extStorageErr) {
          console.error("External storage error (non-blocking):", extStorageErr);
        }
      }

      // 3. Invoke Edge Function (Primary Registration)
      const { data: result, error } = await supabase.functions.invoke("register-team", {
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
          approach_description: approachDescription,
          mentor_name: mentorName,
          mentor_email: mentorEmail,
          mentor_contact: mentorContact,
          registration_form_url: primaryFormUrl || regFormUrl,
        },
      });

      if (error) throw new Error(error.message || "Registration failed");
      if (result?.error) throw new Error(result.error);

      // 4. Sync to External Database
      const selectedProblem = problems.find((p) => p.id === selectedProblemId);
      externalSupabase
        .from("team_registrations")
        .insert({
          registration_id: result.team_id,
          team_name: teamName,
          college_name: collegeName,
          institute_number: instituteNumber,
          leader_name: leaderName,
          leader_email: leaderEmail,
          leader_contact: leaderPhone,
          members: members.map((m) => ({ name: m.name, email: m.email, contact: m.contact })),
          domain: selectedDomain || "N/A",
          problem_statement_id: selectedProblem?.id || "N/A",
          problem_statement_uuid: selectedProblem?.id || null,
          problem_statement_title: selectedProblem?.problem_title || "N/A",
          problem_description: selectedProblem?.problem_description || "N/A",
          mentor_name: mentorName,
          mentor_email: mentorEmail,
          mentor_contact: mentorContact,
          registration_form_url: externalFormUrl || primaryFormUrl || regFormUrl, // Prioritize external link for external DB
          status: "registered",
        })
        .then(({ error: extErr }) => {
          if (extErr) console.error("External DB sync error:", extErr.message);
          else console.log("✅ External DB synced:", result.team_id);
        });

      setSuccessData({ teamId: result.team_id, email: leaderEmail });
    } catch (error: any) {
      toast.error("Registration failed", { description: error.message });
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
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep >= step.id ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                        {currentStep > step.id ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                        Step {step.id} of 4
                      </span>
                      <span className={`text-sm font-semibold ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 rounded ${currentStep > step.id ? "gradient-primary" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
              </div>
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
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="e.g. KBT-2024" value={instituteNumber} onChange={(e) => setInstituteNumber(e.target.value)} />
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-center gap-2 mb-4 text-primary">
                        <Shield className="w-5 h-5" />
                        <h3 className="font-semibold">Team Leader Details</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Leader Name *</Label>
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

                    <div className="space-y-2">
                      <Label>Your Approach / Description *</Label>
                      <Textarea
                        placeholder="Briefly describe your team's approach to solve this problem..."
                        value={approachDescription}
                        onChange={(e) => setApproachDescription(e.target.value)}
                        rows={4}
                      />
                    </div>
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
                        <h3 className="font-semibold uppercase tracking-wider">Team Authorization Form</h3>
                      </div>

                      <div className="bg-muted p-4 rounded-xl border border-dashed border-primary/30 text-center">
                        <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-foreground font-semibold mb-2">Upload Signed Team Registration Form</p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Download the template from <a href="/resources" target="_blank" className="text-primary hover:underline">Resources</a>, get it signed by your college head, and upload a photo/PDF here.
                        </p>

                        <div className="flex flex-col items-center gap-3">
                          <Input
                            type="file"
                            accept=".pdf,image/*"
                            className="max-w-xs"
                            onChange={(e) => setRegFormFile(e.target.files?.[0] || null)}
                          />
                          <p className="text-xs text-muted-foreground">OR</p>
                          <Input
                            placeholder="Enter Google Drive link or other URL"
                            className="max-w-xs"
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
                      className="gradient-primary text-primary-foreground"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : (
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
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <DialogTitle className="text-2xl font-heading">Registration Successful! 🎉</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Your team has been registered. Use the Team ID below to submit your solution.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-4 bg-muted rounded-xl border border-border">
            <p className="text-sm text-muted-foreground mb-1">Your Team ID</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-heading font-bold text-primary tracking-wider">
                {successData?.teamId}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(successData?.teamId || "");
                  toast.success("Team ID copied!");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              A confirmation has been sent to <span className="font-semibold">{successData?.email}</span>
            </p>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button className="gradient-primary text-primary-foreground px-8" onClick={() => { setSuccessData(null); navigate("/"); }}>
              Go to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default RegisterTeam;
