/// <reference types="deno" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// Allowed file types and max size
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const RESOURCE_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const RESOURCE_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();

    const limit = rateLimits.get(ip);
    if (limit && limit.resetAt > now && limit.count >= RATE_LIMIT_MAX) {
      return new Response(JSON.stringify({ error: "Too many submissions" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (limit && limit.resetAt > now) { limit.count++; }
    else { rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS }); }

    const data = await req.json();
    if (data.honeypot && data.honeypot.trim() !== "") {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Database (External)
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Handle file upload if provided
    let paymentProofUrl: string | null = null;

    if (data.payment_proof_base64 && data.payment_proof_filename && data.payment_proof_type) {
      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(data.payment_proof_type)) {
        return new Response(JSON.stringify({ error: "Invalid file type. Allowed: JPG, PNG, WebP, PDF" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Decode base64 and validate size
      const decodedData = decode(data.payment_proof_base64);
      if (decodedData.length > MAX_FILE_SIZE) {
        return new Response(JSON.stringify({ error: "File too large. Maximum size is 5MB" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Generate secure filename
      const fileExt = data.payment_proof_filename.split('.').pop()?.toLowerCase() || 'bin';
      const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(fileExt) ? fileExt : 'bin';
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

      // Upload to storage bucket using service role
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, decodedData, {
          contentType: data.payment_proof_type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Primary storage upload error:", uploadError);
        return new Response(JSON.stringify({ error: "Failed to upload payment proof" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Store the path (not a public URL - admins will use signed URLs to access)
      paymentProofUrl = fileName;
    }

    // Handle resource file upload if provided
    let resourceFileUrl: string | null = null;
    if (data.resource_file_base64 && data.resource_file_filename && data.resource_file_type) {
      if (!RESOURCE_ALLOWED_MIME_TYPES.includes(data.resource_file_type)) {
        return new Response(JSON.stringify({ error: "Invalid resource file type. Allowed: JPG, PNG, WebP, PDF" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const resourceFileData = decode(data.resource_file_base64);
      if (resourceFileData.length > RESOURCE_MAX_FILE_SIZE) {
        return new Response(JSON.stringify({ error: "Resource file too large. Maximum size is 100MB" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const resFileExt = data.resource_file_filename.split('.').pop()?.toLowerCase() || 'bin';
      const safeResExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(resFileExt) ? resFileExt : 'bin';
      const resourceFileName = `${Date.now()}-${crypto.randomUUID()}.${safeResExt}`;

      const { error: resUploadError } = await supabase.storage
        .from('problem-resources')
        .upload(resourceFileName, resourceFileData, {
          contentType: data.resource_file_type,
          upsert: false,
        });

      if (resUploadError) {
        console.error("Resource file upload error:", resUploadError);
        return new Response(JSON.stringify({ error: "Failed to upload resource file" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      resourceFileUrl = resourceFileName;
    }

    if (data.type === "sponsorship") {
      const insertData = {
        company_name: data.company_name,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        company_website: data.company_website || null,
        sponsorship_type: data.sponsorship_type,
        sponsorship_amount: data.sponsorship_amount || null,
        additional_notes: data.additional_notes || null,
        payment_proof_url: paymentProofUrl,
        transaction_id: data.transaction_id || null,
        status: "pending",
      };

      const { error } = await supabase.from("sponsorships").insert(insertData);
      if (error) {
        console.error("Database insert error:", error);
        return new Response(JSON.stringify({ error: "Failed to submit" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      console.log("Sponsorship saved to database successfully");
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const insertData = {
      company_name: data.company_name,
      contact_person: data.contact_person,
      email: data.email,
      phone: data.phone,
      company_website: data.company_website || null,
      source_of_info: data.source_of_info || null,
      source_of_info_detail: data.source_of_info_detail || null,
      problem_title: data.problem_title,
      problem_description: data.problem_description,
      domain: data.domain,
      targeted_audience: data.targeted_audience,
      expected_outcome: data.expected_outcome,
      resources_provided: data.resources_provided || null,
      payment_proof_url: paymentProofUrl,
      resource_file_url: resourceFileUrl,
      transaction_id: data.transaction_id || null,
      status: "pending",
    };

    const { error } = await supabase.from("problem_statements").insert(insertData);
    if (error) {
      console.error("Database insert error:", error);
      return new Response(JSON.stringify({ error: "Failed to submit" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("Problem statement saved to database successfully");
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("❌ Submit problem error:", error);
    return new Response(JSON.stringify({ error: "Submission failed. Please try again later." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});