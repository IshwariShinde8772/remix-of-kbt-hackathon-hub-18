import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let teamId: string;
    let youtubeLink: string;
    let description: string | null = null;
    let problemId: string | null = null;
    let solutionFile: File | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      teamId = formData.get("team_id") as string;
      youtubeLink = formData.get("youtube_link") as string;
      description = formData.get("description") as string | null;
      problemId = formData.get("problem_id") as string | null;
      solutionFile = formData.get("solution_file") as File | null;
    } else {
      const data = await req.json();
      teamId = data.team_id;
      youtubeLink = data.youtube_link;
      description = data.description || null;
      problemId = data.problem_id || null;
    }

    if (!teamId || !youtubeLink) {
      return new Response(
        JSON.stringify({ error: "team_id and youtube_link are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const primaryUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const primaryKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!primaryUrl || !primaryKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const primarySupabase = createClient(primaryUrl, primaryKey);

    // ── Check if Team ID exists first ──
    const { data: teamCheck } = await primarySupabase
      .from("team_registrations")
      .select("registration_id")
      .eq("registration_id", teamId)
      .maybeSingle();

    if (!teamCheck) {
      return new Response(
        JSON.stringify({ error: `Team ID "${teamId}" not found. Please register first.` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Upload PDF ──
    let solutionPdfUrl = "";
    if (solutionFile) {
      const fileName = `${teamId}-${Date.now()}.pdf`;
      const fileBuffer = await solutionFile.arrayBuffer();

      const { error: uploadError } = await primarySupabase.storage
        .from("solutions")
        .upload(fileName, fileBuffer, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Storage upload failed:", uploadError.message);
        return new Response(
          JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      solutionPdfUrl = fileName;
      console.log(`✅ PDF uploaded: ${fileName}`);
    }

    // ── Insert into team_solutions ──
    const insertData = {
      registration_id: teamId,
      solution_title: `Solution by ${teamId}`,
      solution_description: description?.trim() || "Solution submitted via Avinyathon portal",
      github_link: "N/A",
      video_link: youtubeLink.trim(),
      additional_notes: solutionPdfUrl ? `PDF: ${solutionPdfUrl}` : null,
      solution_pdf_url: solutionPdfUrl,
      status: "submitted",
    };

    const { data: primaryResult, error: primaryError } = await primarySupabase
      .from("team_solutions")
      .insert(insertData)
      .select("id")
      .maybeSingle();

    if (primaryError) {
      console.error("❌ DB insert error:", primaryError.message);
      return new Response(
        JSON.stringify({ error: primaryError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Solution saved: ${primaryResult?.id} for team ${teamId}`);

    return new Response(
      JSON.stringify({
        success: true,
        submission_id: primaryResult?.id,
        team_id: teamId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during submission" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
