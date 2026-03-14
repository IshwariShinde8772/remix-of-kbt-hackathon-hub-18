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
    // Get API key from environment
    const externalKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!externalKey) {
      throw new Error("Missing Supabase credentials");
    }

    // Initialize database client
    const db = createClient(DB_EXTERNAL, externalKey);

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

        // Check in database
        const { data: team, error: findError } = await db
          .from(regTable)
          .select(`${teamIdCol}, team_name, leader_email`)
          .eq(teamIdCol, team_id.trim())
          .ilike("college_name", `%${college_name?.trim() || ""}%`)
          .eq("institute_number", institute_number?.trim() || "")
          .single();

        if (findError || !team) {
          return new Response(
            JSON.stringify({ error: "Invalid Team ID or college details" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, team_name: team.team_name }),
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
      const youtubeLink = formData.get("youtube_link") as string;
      const description = formData.get("description") as string;
      const pdfFile = formData.get("solution_file") as File;

      // Validate inputs
      const errors = [];
      if (!teamId) errors.push("Team ID");
      if (!youtubeLink) errors.push("YouTube link");
      if (!pdfFile) errors.push("Solution PDF");

      if (errors.length > 0) {
        return new Response(
          JSON.stringify({ error: `Missing required fields: ${errors.join(", ")}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ───────────────────────────────────────────────────────────────
      // Step 1: Verify team exists and get their details
      // ───────────────────────────────────────────────────────────────
      const { data: teamData, error: teamError } = await db
        .from(regTable)
        .select(`${teamIdCol}, team_name, leader_email`)
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

      // ───────────────────────────────────────────────────────────────
      // Step 2: Upload PDF to storage
      // ───────────────────────────────────────────────────────────────
      const fileName = `${teamId}-${Date.now()}.pdf`;
      const fileBuffer = await pdfFile.arrayBuffer();

      const { error: uploadError } = await db.storage
        .from("solutions")
        .upload(fileName, fileBuffer, { contentType: "application/pdf" });

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      console.log(`✅ PDF uploaded: ${fileName}`);

      // ───────────────────────────────────────────────────────────────
      // Step 3: Create submission record
      // ───────────────────────────────────────────────────────────────
      const submissionData = {
        team_id: teamId,
        youtube_link: youtubeLink,
        description: description || "No description provided",
        solution_pdf_url: fileName,
        status: "pending",
        submitted_at: new Date().toISOString(),
      };

      // Insert to database
      const { data: subData, error: subError } = await db
        .from(subTable)
        .insert(submissionData)
        .select("id")
        .single();

      if (subError) {
        throw new Error(`Submission insert failed: ${subError.message}`);
      }

      // Insert to External (non-blocking)
      const { data: extSubData, error: extSubError } = await external
        .from(externalSubTable)
        .insert(submissionData)
        .select("id")
        .single();

      // Note: If dual-sync needed in future, add secondary here
      console.log(`✅ Submission recorded`);

      // ───────────────────────────────────────────────────────────────
      // Step 4: Log activity
      // ───────────────────────────────────────────────────────────────
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: "solution_submission",
        team_id: teamId,
        user_email: teamData.leader_email,
        details: {
          team_name: teamData.team_name,
          file_name: fileName,
          youtube_link: youtubeLink,
        },
        status: "success",
      };

      // Log activity
      const { error: logError } = await db
        .from("activity_logs")
        .insert(logEntry);
      
      if (logError) {
        console.error(`⚠️ Log error: ${logError.message}`);
      }

      console.log(`✅ Logged submission for team ${teamId}`);

      // ───────────────────────────────────────────────────────────────
      // Step 5: Send confirmation email (non-blocking)
      // ───────────────────────────────────────────────────────────────
      const sendSubmissionEmail = async () => {
        console.log("📧 Starting submission email send process...");
        const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
        const gmailUser = "kbtavinyathon@gmail.com";

        if (!gmailAppPassword) {
          console.error("⚠️ GMAIL_APP_PASSWORD not set - skipping email");
          return;
        }

        try {
          const emailHtml = `<!DOCTYPE html>
<html>
<head><style>
  body { font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
  .header { background: #1e293b; padding: 25px; text-align: center; color: white; }
  .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
  .content { padding: 30px; }
  .success-box { background: #dcfce7; border: 1px solid #86efac; padding: 15px; border-radius: 8px; margin: 20px 0; }
  .success-box p { margin: 5px 0; font-size: 14px; color: #166534; }
  .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ SUBMISSION CONFIRMED</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px;">Congratulations <strong>${teamData.team_name}</strong>!</p>
      <p>Your solution for <strong>KBT Avinyathon 2026</strong> has been successfully received.</p>
      
      <div class="success-box">
        <p><strong>Team ID:</strong> ${teamId}</p>
        <p><strong>File Name:</strong> ${fileName}</p>
        <p><strong>YouTube Link:</strong> <a href="${youtubeLink}" style="color: #166534; text-decoration: underline;">${youtubeLink}</a></p>
        <p><strong>Status:</strong> Under Review 📋</p>
      </div>

      <p>Our judges will evaluate your submission shortly. Best of luck! 🚀</p>
    </div>
    <div class="footer">
      <p>© 2026 KBT Avinyathon • KBTCOE Nashik<br>
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
            cc: ["kbtavinyathon@gmail.com"],
            subject: `✅ Solution Submitted Successfully – Team ID: ${teamId}`,
            html: emailHtml,
          });

          console.log(`✅ Submission email sent to ${teamData.leader_email}`);
        } catch (emailError: any) {
          console.error(`❌ Email send failed | Error: ${emailError.message} | Code: ${emailError.code || 'unknown'}`);
          console.error(`Email error details: ${JSON.stringify(emailError)}`);
          throw emailError;
        }
      };

      // Send email with timeout (don't block too long)
      try {
        // Try to send email with 5 second timeout
        await Promise.race([
          sendSubmissionEmail(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Email timeout")), 5000))
        ]);
      } catch (emailTimeoutError: any) {
        // Log but don't fail submission if email times out
        console.warn(`⚠️ Email send timeout or error: ${emailTimeoutError.message}`);
      }

      // ───────────────────────────────────────────────────────────────
      // Step 6: Return success response
      // ───────────────────────────────────────────────────────────────
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
      JSON.stringify({ error: error.message || "Submission failed. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
