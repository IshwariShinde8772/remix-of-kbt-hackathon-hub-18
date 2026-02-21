import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, Send, CheckCircle2, Building2, FileText, CreditCard, Upload, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const problemSchema = z.object({
  domain: z.string().min(1, "Please select a domain"),
  problemTitle: z.string().min(5, "Problem title must be at least 5 characters").max(200),
  problemDescription: z.string().min(20, "Problem description must be at least 20 characters").max(2000),
  targetedAudience: z.string().min(10, "Targeted audience must be at least 10 characters").max(500),
  expectedOutcome: z.string().min(20, "Expected outcome must be at least 20 characters").max(1000),
  resources: z.string().max(1000).optional(),
});

const problemStatementSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100),
  contactName: z.string().min(2, "Contact name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address").max(255),
  phone: z.string().min(10, "Please enter a valid phone number").max(15),
  sourceOfInfo: z.string().min(1, "Please select a source of information"),
  sourceOfInfoDetail: z.string().max(200).optional(),
  companyWebsite: z.string().url("Please enter a valid URL").max(255).optional().or(z.literal("")),
  problems: z.array(problemSchema).min(1, "At least one problem statement is required"),
  transactionId: z.string().min(5, "Please enter a valid transaction ID").max(100),
});

type ProblemStatementForm = z.infer<typeof problemStatementSchema>;

const domains = [
  "Software",
  "Hardware",
  "Automation",
  "Graphics",
  "Design",
  "Maintenance",
  "Banking/Sales/Marketing",
  "Other",
];

const steps = [
  { id: 1, title: "Company Details", icon: Building2 },
  { id: 2, title: "Problem Statement", icon: FileText },
  { id: 3, title: "Payment", icon: CreditCard },
];

const sourceOfInfoOptions = [
  { value: "faculty", label: "Faculty", requiresDetail: true, detailPlaceholder: "Enter faculty name" },
  { value: "website", label: "Website", requiresDetail: false },
  { value: "social_media", label: "Social Media", requiresDetail: false },
  { value: "other", label: "Other", requiresDetail: true, detailPlaceholder: "Where did you hear about this?" },
];

const SubmitProblem = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resourceFiles, setResourceFiles] = useState<Record<number, File | null>>({});
  const [resourcePreviews, setResourcePreviews] = useState<Record<number, string | null>>({});
  const honeypotRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resourceFileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const formContainerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    control,
    formState: { errors },
  } = useForm<ProblemStatementForm>({
    resolver: zodResolver(problemStatementSchema),
    defaultValues: {
      problems: [
        {
          domain: "",
          problemTitle: "",
          problemDescription: "",
          targetedAudience: "",
          expectedOutcome: "",
          resources: "",
        }
      ],
      transactionId: "",
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "problems",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Please upload a JPG, PNG, WebP, or PDF file.",
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please upload a file smaller than 5MB.",
        });
        return;
      }
      setPaymentProofFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPaymentProofPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPaymentProofPreview(null);
      }
    }
  };

  const scrollToPageTop = () => {
    // Scroll to the very top of the page smoothly so user sees navbar/header
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToFirstError = () => {
    // Find the first error element and scroll to it
    setTimeout(() => {
      const firstErrorElement = document.querySelector('.text-destructive');
      if (firstErrorElement) {
        const elementRect = firstErrorElement.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        // Scroll to position with offset for navbar visibility
        window.scrollTo({
          top: absoluteElementTop - 120,
          behavior: 'smooth'
        });
      }
    }, 10);
  };

  const validateStep = async (step: number): Promise<boolean> => {
    if (step === 1) {
      const result = await trigger(["companyName", "contactName", "email", "phone", "sourceOfInfo", "companyWebsite"]);
      if (!result) {
        scrollToFirstError();
      }
      return result;
    } else if (step === 2) {
      const result = await trigger(["problems"]);
      if (!result) {
        scrollToFirstError();
      }
      return result;
    } else if (step === 3) {
      const result = await trigger(["transactionId"]);
      if (!result) {
        scrollToFirstError();
      }
      return result;
    }
    return true;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
      // Use setTimeout to ensure state update happens before scroll
      setTimeout(() => scrollToPageTop(), 50);
    }
  };

  const prevStep = () => {
    if (currentStep === 1) {
      // From Company Details, navigate to home page
      navigate("/");
    } else {
      // Go to previous step and scroll to top smoothly
      setCurrentStep(currentStep - 1);
      setTimeout(() => scrollToPageTop(), 50);
    }
  };

  const addProblemStatement = () => {
    append({
      domain: "",
      problemTitle: "",
      problemDescription: "",
      targetedAudience: "",
      expectedOutcome: "",
      resources: "",
    });
  };

  const removeProblemStatement = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      // Clean up resource file state for removed index
      setResourceFiles(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      setResourcePreviews(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }
  };

  const handleResourceFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", { description: "Please upload a JPG, PNG, WebP, or PDF file." });
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File too large", { description: "Please upload a file smaller than 100MB." });
        return;
      }
      setResourceFiles(prev => ({ ...prev, [index]: file }));
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setResourcePreviews(prev => ({ ...prev, [index]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      } else {
        setResourcePreviews(prev => ({ ...prev, [index]: null }));
      }
    }
  };

  const removeResourceFile = (index: number) => {
    setResourceFiles(prev => ({ ...prev, [index]: null }));
    setResourcePreviews(prev => ({ ...prev, [index]: null }));
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const onSubmit = async (data: ProblemStatementForm) => {
    if (!paymentProofFile) {
      toast.error("Payment proof required", {
        description: "Please upload a screenshot or PDF of your payment.",
      });
      return;
    }

    if (!data.transactionId || data.transactionId.trim().length < 5) {
      toast.error("Transaction ID required", {
        description: "Please enter a valid transaction ID.",
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);
    
    try {
      // Convert file to base64 for secure server-side upload
      const paymentProofBase64 = await fileToBase64(paymentProofFile);

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      // Submit each problem statement (edge function handles file upload securely)
      for (let i = 0; i < data.problems.length; i++) {
        const problem = data.problems[i];
        
        // Convert resource file to base64 if present
        let resourceFileBase64: string | undefined;
        let resourceFileName: string | undefined;
        let resourceFileType: string | undefined;
        const resourceFile = resourceFiles[i];
        if (resourceFile) {
          resourceFileBase64 = await fileToBase64(resourceFile);
          resourceFileName = resourceFile.name;
          resourceFileType = resourceFile.type;
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/submit-problem`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_name: data.companyName,
            contact_person: data.contactName,
            email: data.email,
            phone: data.phone,
            company_website: data.companyWebsite || undefined,
            source_of_info: data.sourceOfInfo || undefined,
            source_of_info_detail: data.sourceOfInfoDetail || undefined,
            problem_title: problem.problemTitle,
            problem_description: problem.problemDescription,
            domain: problem.domain,
            targeted_audience: problem.targetedAudience,
            expected_outcome: problem.expectedOutcome,
            resources_provided: problem.resources || undefined,
            transaction_id: data.transactionId,
            payment_proof_base64: paymentProofBase64,
            payment_proof_filename: paymentProofFile.name,
            payment_proof_type: paymentProofFile.type,
            resource_file_base64: resourceFileBase64,
            resource_file_filename: resourceFileName,
            resource_file_type: resourceFileType,
            honeypot: honeypotRef.current?.value || "",
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 429) {
            toast.error("Too many submissions", {
              description: "Please wait before submitting another problem statement.",
            });
            return;
          }
          throw new Error(result.error || "Submission failed");
        }
      }

      toast.success("Problem statement(s) submitted successfully!", {
        description: `${data.problems.length} problem statement(s) submitted. We will review and get back to you soon.`,
      });
      // Navigate to home page and scroll to top immediately
      navigate("/", { replace: true });
      // Ensure scroll to top after navigation
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error submitting:", error);
      }
      toast.error("Failed to submit", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <Navbar />

      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              className="mb-4 transition-all duration-300 hover:scale-105"
              onClick={prevStep}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? "Back to Home" : "Previous Step"}
            </Button>

            {/* Step Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        currentStep >= step.id 
                          ? 'gradient-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {currentStep > step.id ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <step.icon className="w-6 h-6" />
                        )}
                      </div>
                      <span className={`text-sm mt-2 font-medium ${
                        currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 rounded ${
                        currentStep > step.id ? 'gradient-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Card */}
            <div ref={formContainerRef} className="bg-background rounded-2xl shadow-xl p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-heading font-black mb-2 text-foreground">
                {steps[currentStep - 1].title}
              </h1>
              <p className="text-muted-foreground mb-6 text-sm">
                {currentStep === 1 && "Enter your company and contact information."}
                {currentStep === 2 && "Describe your industry problem statement(s). You can add multiple problems."}
                {currentStep === 3 && "Complete your payment and upload proof."}
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Step 1: Company Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          placeholder="Enter company name"
                          {...register("companyName")}
                        />
                        {errors.companyName && (
                          <p className="text-destructive text-sm">{errors.companyName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Person *</Label>
                        <Input
                          id="contactName"
                          placeholder="Enter contact name"
                          {...register("contactName")}
                        />
                        {errors.contactName && (
                          <p className="text-destructive text-sm">{errors.contactName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          {...register("email")}
                        />
                        {errors.email && (
                          <p className="text-destructive text-sm">{errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          placeholder="Enter phone number"
                          {...register("phone")}
                        />
                        {errors.phone && (
                          <p className="text-destructive text-sm">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Source of Information */}
                    <div className="space-y-2">
                      <Label>Source of Information *</Label>
                      <Select 
                        value={watch("sourceOfInfo")} 
                        onValueChange={(value) => {
                          setValue("sourceOfInfo", value);
                          // Clear detail when source changes
                          setValue("sourceOfInfoDetail", "");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="How did you hear about us?" />
                        </SelectTrigger>
                        <SelectContent>
                          {sourceOfInfoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.sourceOfInfo && (
                        <p className="text-destructive text-sm">{errors.sourceOfInfo.message}</p>
                      )}
                    </div>

                    {/* Conditional Detail Field for Faculty or Other */}
                    {(watch("sourceOfInfo") === "faculty" || watch("sourceOfInfo") === "other") && (
                      <div className="space-y-2">
                        <Label htmlFor="sourceOfInfoDetail">
                          {watch("sourceOfInfo") === "faculty" ? "Faculty Name *" : "Please Specify *"}
                        </Label>
                        <Input
                          id="sourceOfInfoDetail"
                          placeholder={
                            sourceOfInfoOptions.find(o => o.value === watch("sourceOfInfo"))?.detailPlaceholder || ""
                          }
                          {...register("sourceOfInfoDetail")}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Company Website (Optional)</Label>
                      <Input
                        id="companyWebsite"
                        type="url"
                        placeholder="https://www.yourcompany.com"
                        {...register("companyWebsite")}
                      />
                      {errors.companyWebsite && (
                        <p className="text-destructive text-sm">{errors.companyWebsite.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Problem Statements */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {fields.map((field, index) => (
                      <div key={field.id} className="border border-border rounded-xl p-6 relative">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-heading font-bold text-lg text-foreground">
                            Problem Statement {index + 1}
                          </h3>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProblemStatement(index)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Problem Domain *</Label>
                            <Select 
                              value={watch(`problems.${index}.domain`)} 
                              onValueChange={(value) => setValue(`problems.${index}.domain`, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a domain" />
                              </SelectTrigger>
                              <SelectContent>
                                {domains.map((domain) => (
                                  <SelectItem key={domain} value={domain}>
                                    {domain}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.problems?.[index]?.domain && (
                              <p className="text-destructive text-sm">{errors.problems[index].domain?.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Problem Title *</Label>
                            <Input
                              placeholder="Enter a concise title for your problem"
                              {...register(`problems.${index}.problemTitle`)}
                            />
                            {errors.problems?.[index]?.problemTitle && (
                              <p className="text-destructive text-sm">{errors.problems[index].problemTitle?.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Problem Description *</Label>
                            <Textarea
                              placeholder="Describe your problem in detail. Include current challenges, pain points, and any relevant context."
                              rows={4}
                              {...register(`problems.${index}.problemDescription`)}
                            />
                            {errors.problems?.[index]?.problemDescription && (
                              <p className="text-destructive text-sm">{errors.problems[index].problemDescription?.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Targeted Audience / Users *</Label>
                            <Textarea
                              placeholder="Who are the intended users or beneficiaries of this solution?"
                              rows={2}
                              {...register(`problems.${index}.targetedAudience`)}
                            />
                            {errors.problems?.[index]?.targetedAudience && (
                              <p className="text-destructive text-sm">{errors.problems[index].targetedAudience?.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Expected Outcome *</Label>
                            <Textarea
                              placeholder="What kind of solution are you looking for? What would success look like?"
                              rows={3}
                              {...register(`problems.${index}.expectedOutcome`)}
                            />
                            {errors.problems?.[index]?.expectedOutcome && (
                              <p className="text-destructive text-sm">{errors.problems[index].expectedOutcome?.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Available Resources (Optional)</Label>
                            <Textarea
                              placeholder="List any data, APIs, documentation, or other resources you can provide."
                              rows={2}
                              {...register(`problems.${index}.resources`)}
                            />
                          </div>

                          {/* Resource File Upload (Optional) */}
                          <div className="space-y-2">
                            <Label>Upload Resource File (Optional)</Label>
                            <p className="text-muted-foreground text-xs">
                              Upload an image or PDF related to this problem statement (max 100MB).
                            </p>
                            <div 
                              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                              onClick={() => resourceFileInputRefs.current[index]?.click()}
                            >
                              <input
                                type="file"
                                ref={(el) => { resourceFileInputRefs.current[index] = el; }}
                                onChange={(e) => handleResourceFileChange(index, e)}
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                className="hidden"
                              />
                              {resourceFiles[index] ? (
                                <div className="space-y-2">
                                  {resourcePreviews[index] ? (
                                    <img src={resourcePreviews[index]!} alt="Resource preview" className="max-h-28 mx-auto rounded-lg" />
                                  ) : (
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                                      <FileText className="w-6 h-6 text-primary" />
                                    </div>
                                  )}
                                  <p className="text-foreground text-sm font-medium">{resourceFiles[index]!.name}</p>
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-muted-foreground text-xs">Click to change</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive text-xs h-6 px-2"
                                      onClick={(e) => { e.stopPropagation(); removeResourceFile(index); }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                                  <p className="text-muted-foreground text-sm">Click to upload</p>
                                  <p className="text-muted-foreground text-xs">JPG, PNG, WebP, or PDF (max 100MB)</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add More Problem Statement Button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addProblemStatement}
                      className="w-full border-dashed border-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Problem Statement
                    </Button>
                  </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Payment Summary */}
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
                      <h3 className="text-xl font-heading font-bold mb-2 text-foreground">
                        Payment Summary
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        Registration Fee: <span className="font-semibold text-foreground">₹5,000</span> for one or multiple problem statements
                      </p>
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <p className="text-2xl font-heading font-bold text-primary text-center">
                          Total: ₹5,000
                        </p>
                        <p className="text-muted-foreground text-sm text-center mt-1">
                          Registration Fee
                        </p>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-muted/50 rounded-xl p-6">
                      <h3 className="text-lg font-heading font-bold mb-4 text-foreground flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Bank Transfer Details
                      </h3>
                      <div className="bg-background rounded-lg p-5 border border-border space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Account Number</p>
                            <p className="font-semibold text-foreground font-mono">99907771230011</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Customer Name</p>
                            <p className="font-semibold text-foreground text-sm">PRIN MVPS KBGT COLLEGE OF ENGINEERING</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">IFSC Code</p>
                            <p className="font-semibold text-foreground font-mono">HDFC0001241</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Branch Name</p>
                            <p className="font-semibold text-foreground">PRODUCTIVITY HOUSE</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Branch Code</p>
                            <p className="font-semibold text-foreground font-mono">1241</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Type of Account</p>
                            <p className="font-semibold text-foreground">145 - SAVINGS ACCOUNT - TRUST</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transaction ID */}
                    <div className="space-y-2">
                      <Label htmlFor="transactionId">Transaction ID *</Label>
                      <Input
                        id="transactionId"
                        placeholder="Enter your transaction ID / UTR number"
                        {...register("transactionId")}
                      />
                      {errors.transactionId && (
                        <p className="text-destructive text-sm">{errors.transactionId.message}</p>
                      )}
                    </div>

                    {/* Upload Payment Proof */}
                    <div className="space-y-4">
                      <Label>Upload Payment Proof *</Label>
                      <p className="text-muted-foreground text-sm">
                        After payment, upload a screenshot or PDF of your payment confirmation.
                      </p>
                      
                      <div 
                        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                        />
                        
                        {paymentProofFile ? (
                          <div className="space-y-3">
                            {paymentProofPreview ? (
                              <img 
                                src={paymentProofPreview} 
                                alt="Payment proof preview" 
                                className="max-h-40 mx-auto rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                                <FileText className="w-8 h-8 text-primary" />
                              </div>
                            )}
                            <p className="text-foreground font-medium">{paymentProofFile.name}</p>
                            <p className="text-muted-foreground text-sm">Click to change file</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                            <p className="text-muted-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-muted-foreground text-sm">
                              JPG, PNG, WebP, or PDF (max 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Honeypot field - hidden from users, bots fill it */}
                <input
                  type="text"
                  name="website_url"
                  ref={honeypotRef}
                  tabIndex={-1}
                  autoComplete="off"
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    opacity: 0,
                    height: 0,
                    width: 0,
                    overflow: "hidden",
                  }}
                  aria-hidden="true"
                />

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="transition-all duration-300 hover:scale-105"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {currentStep === 1 ? "Back to Home" : "Previous"}
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="gradient-cta text-primary-foreground transition-all duration-300 hover:scale-105"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="gradient-cta text-primary-foreground font-semibold px-8 transition-all duration-300 hover:scale-105"
                      disabled={isSubmitting || isUploading}
                    >
                      {isSubmitting || isUploading ? (
                        "Submitting..."
                      ) : (
                        <>
                          Submit
                          <Send className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubmitProblem;
