import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();

    const teamId = formData.get("team_id") as string;
    const youtubeLink = formData.get("youtube_link") as string;
    const description = formData.get("description") as string | null;
    const problemId = formData.get("problem_id") as string | null;
    const solutionFile = formData.get("solution_file") as File | null;

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

    // ── Upload PDF to primary storage ──
    let solutionPdfUrl = "";
    let fileBuffer: ArrayBuffer | null = null;

    if (solutionFile) {
      const fileName = `${teamId}-${Date.now()}.pdf`;
      fileBuffer = await solutionFile.arrayBuffer();

      const { error: uploadError } = await primarySupabase.storage
        .from("solutions")
        .upload(fileName, fileBuffer, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Primary storage upload failed:", uploadError.message);
        return new Response(
          JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      solutionPdfUrl = fileName;
      console.log(`✅ PDF uploaded to primary storage: ${fileName}`);
    }

    // ── Insert into primary submissions table ──
    const insertData = {
      team_id: teamId,
      youtube_link: youtubeLink.trim(),
      solution_pdf_url: solutionPdfUrl,
      description: description?.trim() || null,
      problem_id: problemId || null,
      status: "pending",
    };

    const { data: primaryResult, error: primaryError } = await primarySupabase
      .from("submissions")
      .insert(insertData)
      .select("id, team_id")
      .maybeSingle();

    if (primaryError) {
      console.error("❌ Primary DB insert error:", primaryError.message);
      return new Response(
        JSON.stringify({ error: primaryError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Primary DB saved: submission ${primaryResult?.id} for team ${teamId}`);

    // ── Dual Sync to External Database ──
    const LovableUrl = "https://wunqjksrgdppzcucwcyd.supabase.co";
    const ExternalUrl = "https://lxawemydhhmqjahttrlb.supabase.co";
    const otherUrl = (primaryUrl === ExternalUrl) ? LovableUrl : ExternalUrl;
    const externalKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY");

    if (externalKey) {
      try {
        const otherSupabase = createClient(otherUrl, externalKey);

        // Upload PDF to external storage
        if (fileBuffer && solutionPdfUrl) {
          const { error: extUploadError } = await otherSupabase.storage
            .from("solutions")
            .upload(solutionPdfUrl, fileBuffer, {
              contentType: "application/pdf",
              upsert: false,
            });

          if (extUploadError) {
            console.error("❌ External storage upload failed (non-blocking):", extUploadError.message);
          } else {
            console.log(`✅ PDF synced to external storage: ${solutionPdfUrl}`);
          }
        }

        // Try inserting into external submissions / team_solutions table
        // Try "submissions" first, fallback to "team_solutions"
        const { error: extInsertError } = await otherSupabase
          .from("submissions")
          .insert(insertData);

        if (extInsertError) {
          console.error(`❌ External sync (submissions) failed: ${extInsertError.message}`);

          // Fallback: try team_solutions table
          const { error: fallbackError } = await otherSupabase
            .from("team_solutions")
            .insert({
              team_id: teamId,
              youtube_link: youtubeLink.trim(),
              solution_pdf_url: solutionPdfUrl,
              description: description?.trim() || null,
              problem_statement_id: problemId || null,
              status: "pending",
            });

          if (fallbackError) {
            console.error(`❌ External sync (team_solutions) also failed: ${fallbackError.message}`);
          } else {
            console.log(`✅ External DB synced (team_solutions)`);
          }
        } else {
          console.log(`✅ External DB synced (submissions)`);
        }
      } catch (syncErr) {
        console.error("❌ External sync failed (non-blocking):", syncErr);
      }
    } else {
      console.log("⚠️ EXTERNAL_SUPABASE_SERVICE_ROLE_KEY not set, skipping external sync");
    }

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
