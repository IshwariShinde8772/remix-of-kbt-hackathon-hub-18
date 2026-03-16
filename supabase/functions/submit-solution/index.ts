import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DB_EXTERNAL = "https://lxawemydhhmqjahttrlb.supabase.co";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  console.log(`🚀 Function started: submit-solution | Method: ${req.method}`);

  try {
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseKey) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    }

    const db = createClient(DB_EXTERNAL, supabaseKey);
    const regTable = "team_registrations";
    const subTable = "team_solutions";
    const teamIdCol = "team_id";

    // 1. Get request body
    const body = await req.json();
    const { action, team_id, college_name, institute_number } = body;

    // ═══════════════════════════════════════════════════════════════
    // MODE: VALIDATE (JSON)
    // ═══════════════════════════════════════════════════════════════
    if (action === "validate") {
      if (!team_id) {
        return new Response(
          JSON.stringify({ error: "Team ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`🔍 Validating team: ${team_id}`);
      const { data: team, error: findError } = await db
        .from(regTable)
        .select(`${teamIdCol}, id, team_name, leader_name, college_name, leader_email, problem_statement_title, problem_description, domain, company_name, mentor_name`)
        .eq(teamIdCol, team_id.trim())
        .ilike("college_name", `%${college_name?.trim() || ""}%`)
        .eq("institute_number", institute_number?.trim() || "")
        .single();

      if (findError || !team) {
        console.error(`❌ Validation failed: ${findError?.message || "Team not found"}`);
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
          registration_id: team.id
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // MODE: SUBMIT (JSON + Base64)
    // ═══════════════════════════════════════════════════════════════
    console.log("📤 Processing solution submission...");
    const { solution_title, solution_description, youtube_link, solution_file_base64 } = body;

    if (!team_id || !solution_title || !solution_file_base64) {
      console.warn("⚠️ Validation failed: Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields for submission" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Verify team
    console.log(`🔍 Verifying team ${team_id} for final submission...`);
    const { data: teamData, error: teamError } = await db
      .from(regTable)
      .select(`id, team_name, leader_email, company_name, mentor_name`)
      .eq(teamIdCol, team_id)
      .ilike("college_name", `%${college_name || ""}%`)
      .eq("institute_number", institute_number || "")
      .single();

    if (teamError || !teamData) {
      console.error(`❌ Team verification failed: ${teamError?.message}`);
      return new Response(
        JSON.stringify({ error: "Team verification failed. Invalid credentials." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Decode and Upload PDF
    const fileName = `${team_id}-${Date.now()}.pdf`;
    console.log(`📂 Decoding and uploading solution PDF: ${fileName}`);
    
    try {
      const decodedFile = decode(solution_file_base64);
      const { error: uploadError } = await db.storage
        .from("solutions")
        .upload(fileName, decodedFile, { contentType: "application/pdf" });

      if (uploadError) {
        console.error(`❌ PDF upload failed: ${uploadError.message}`);
        throw new Error(`File upload failed: ${uploadError.message}`);
      }
      console.log(`✅ PDF uploaded successfully`);
    } catch (decodeErr: any) {
      console.error(`❌ Error decoding/uploading file: ${decodeErr.message}`);
      throw new Error("Invalid file data received");
    }

    // Step 3: Insert record
    const companyName = teamData.company_name || teamData.mentor_name;
    console.log(`💾 Saving submission record...`);
    const submissionData = {
      team_id,
      registration_id: teamData.id,
      solution_title,
      solution_description,
      company_name: companyName || null,
      video_link: youtube_link,
      solution_pdf_url: fileName,
      status: "submitted",
    };

    const { data: subData, error: subError } = await db
      .from(subTable)
      .insert([submissionData])
      .select("id")
      .single();

    if (subError) {
      console.error(`❌ Database insert failed: ${subError.message}`);
      throw new Error(`Submission record failed: ${subError.message}`);
    }
    console.log(`✅ Record created: ${subData.id}`);

    // Step 4: Log activity
    console.log(`📜 Logging activity...`);
    await db.from("activity_logs").insert({
      timestamp: new Date().toISOString(),
      action: "solution_submission",
      team_id,
      user_email: teamData.leader_email,
      details: {
        team_name: teamData.team_name,
        solution_title,
        file_name: fileName,
      },
      status: "success",
    });

    // Step 5: Send confirmation email
    const sendSubmissionEmail = async () => {
      console.log("📧 Starting email send...");
      const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
      const gmailUser = "kbtavinyathon@gmail.com";

      if (!gmailAppPassword) {
        console.warn("⚠️ GMAIL_APP_PASSWORD missing - skipping email");
        return;
      }

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
      <p>Your solution for <strong>"${solution_title}"</strong> has been successfully submitted!</p>
      <div class="detail-box">
        <p><strong>Team ID:</strong> ${team_id}</p>
        <p><strong>Status:</strong> Confirmed ✓</p>
      </div>
    </div>
    <div class="footer">
      <p>KBTCOE Engineering College, Nashik<br>
      <a href="mailto:kbtavinyathon@gmail.com" style="color: #2563eb; text-decoration: none;">kbtavinyathon@gmail.com</a></p>
    </div>
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
          subject: `✅ Solution Submitted - Team ID: ${team_id}`,
          html: emailHtml,
        });
        console.log(`✅ Email sent to ${teamData.leader_email}`);
      } catch (err: any) {
        console.error("❌ Email error:", err.message);
      }
    };

    // Race email with timeout
    try {
      await Promise.race([
        sendSubmissionEmail(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Email timeout")), 5000))
      ]);
    } catch (e: any) {
      console.warn(`🕒 Email task finished with: ${e.message}`);
    }

    console.log(`🏁 All steps completed for ${team_id}`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Solution submitted successfully!",
        submission_id: subData.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error(`❌ Final Error in submit-solution: ${error.message}`);
    return new Response(
      JSON.stringify({ error: "Submission failed. Please check your connection and try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
