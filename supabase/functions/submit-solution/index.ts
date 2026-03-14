import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DB_EXTERNAL = "https://lxawemydhhmqjahttrlb.supabase.co";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const contentType = req.headers.get("content-type") || "";

  try {
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const db = createClient(DB_EXTERNAL, supabaseKey);
    const regTable = "team_registrations";
    const subTable = "team_solutions";
    const teamIdCol = "team_id";

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION MODE: Check team exists
    // ═══════════════════════════════════════════════════════════════
    if (contentType.includes("application/json")) {
      let body;
      try {
        body = await req.json();
      } catch (e: any) {
        return new Response(
          JSON.stringify({ error: "Invalid JSON request" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (body.action === "validate") {
        const { team_id, college_name, institute_number } = body;

        if (!team_id) {
          return new Response(
            JSON.stringify({ error: "Team ID is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`🔍 Validating team: ${team_id}`);
        
        // Fetch details from team_registrations. Use 'id' as 'registration_id'
        const { data: team, error: findError } = await db
          .from(regTable)
          .select(`${teamIdCol}, id, team_name, leader_name, college_name, leader_email, problem_statement_title, problem_description, domain, company_name, mentor_name`)
          .eq(teamIdCol, team_id.trim())
          .ilike("college_name", `%${college_name?.trim() || ""}%`)
          .eq("institute_number", institute_number?.trim() || "")
          .single();

        if (findError || !team) {
          console.error(`❌ Team validation failed: ${findError?.message || "Team not found"}`);
          return new Response(
            JSON.stringify({ error: "Invalid Team ID or college details" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`✅ Team validated: ${team.team_name}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            team_name: team.team_name,
            leader_name: team.leader_name || "Leader",
            college_name: team.college_name || "College",
            problem_statement: team.problem_statement_title || "Problem Statement",
            problem_description: team.problem_description || "",
            domain: team.domain || "Unknown Domain",
            company_name: team.company_name || team.mentor_name || "N/A",
            registration_id: team.id // Note: using 'id' as the unique registration reference
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SUBMISSION MODE: Handle multipart form data
    // ═══════════════════════════════════════════════════════════════
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const teamId = formData.get("team_id") as string;
      const collegeName = formData.get("college_name") as string;
      const instituteNumber = formData.get("institute_number") as string;
      const solutionTitle = formData.get("solution_title") as string;
      const solutionDescription = formData.get("solution_description") as string;
      const youtubeLink = formData.get("youtube_link") as string;
      const pdfFile = formData.get("solution_file") as File;

      // Validate inputs
      const errors = [];
      if (!teamId) errors.push("Team ID");
      if (!solutionTitle) errors.push("Solution Title");
      if (!solutionDescription) errors.push("Solution Description");
      if (!youtubeLink) errors.push("YouTube link");
      if (!pdfFile) errors.push("Solution PDF");

      if (errors.length > 0) {
        return new Response(
          JSON.stringify({ error: `Missing required fields: ${errors.join(", ")}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Step 1: Verify team exists and get their primary 'id'
      const { data: teamData, error: teamError } = await db
        .from(regTable)
        .select(`id, team_name, leader_email, company_name, mentor_name`)
        .eq(teamIdCol, teamId)
        .ilike("college_name", `%${collegeName || ""}%`)
        .eq("institute_number", instituteNumber || "")
        .single();

      if (teamError || !teamData) {
        return new Response(
          JSON.stringify({ error: "Team verification failed. Invalid credentials." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Step 2: Upload PDF to storage
      const fileName = `${teamId}-${Date.now()}.pdf`;
      const fileBuffer = await pdfFile.arrayBuffer();

      const { error: uploadError } = await db.storage
        .from("solutions")
        .upload(fileName, fileBuffer, { contentType: "application/pdf" });

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      // Automatically use company_name (fallback to mentor_name) from registration
      const companyName = teamData.company_name || teamData.mentor_name;

      // Step 3: Create submission record
      const submissionData = {
        team_id: teamId,
        registration_id: teamData.id, // Linking via the primary id
        solution_title: solutionTitle,
        solution_description: solutionDescription,
        company_name: companyName || null,
        video_link: youtubeLink,
        solution_pdf_url: fileName,
        status: "submitted",
      };

      const { data: subData, error: subError } = await db
        .from(subTable)
        .insert([submissionData])
        .select("id")
        .single();

      if (subError) {
        throw new Error(`Submission record failed: ${subError.message}`);
      }

      // Step 4: Log activity
      await db.from("activity_logs").insert({
        timestamp: new Date().toISOString(),
        action: "solution_submission",
        team_id: teamId,
        user_email: teamData.leader_email,
        details: {
          team_name: teamData.team_name,
          solution_title: solutionTitle,
          file_name: fileName,
          video_link: youtubeLink,
        },
        status: "success",
      });

      // Step 5: Send confirmation email
      const sendSubmissionEmail = async () => {
        const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
        const gmailUser = "kbtavinyathon@gmail.com";

        if (!gmailAppPassword) return;

        try {
          const emailHtml = `<!DOCTYPE html>
<html>
<head><style>
  body { font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
  .header { background: #1e293b; padding: 30px; text-align: center; color: white; }
  .content { padding: 35px; }
  .detail-box { background: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 18px 0; }
  .footer { background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Solution Submitted</h1>
      <p>KBT Avinyathon 2026</p>
    </div>
    <div class="content">
      <p>Hello <strong>${teamData.team_name}</strong>,</p>
      <p>Your solution for <strong>"${solutionTitle}"</strong> has been successfully submitted!</p>
      <div class="detail-box">
        <p><strong>Team ID:</strong> ${teamId}</p>
        <p><strong>Status:</strong> Confirmed ✓</p>
      </div>
    </div>
    <div class="footer"><p>KBT College of Engineering, Nashik</p></div>
  </div>
</body>
</html>`;

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: gmailUser, pass: gmailAppPassword },
          });

          await transporter.sendMail({
            from: `"KBT Avinyathon 2026" <${gmailUser}>`,
            to: teamData.leader_email,
            subject: `✅ Solution Submitted - Team ID: ${teamId}`,
            html: emailHtml,
          });
        } catch (emailError) {
          console.error("Email error:", emailError);
        }
      };

      sendSubmissionEmail();

      return new Response(
        JSON.stringify({
          success: true,
          message: "Solution submitted successfully!",
          submission_id: subData.id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unsupported request format" }),
      { status: 415, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error(`❌ Submission error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message || "Submission failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
