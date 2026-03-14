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

        console.log(`🔍 Validating team: ${team_id}`);
        
        // Check in database and fetch problem statement details and registration_id
        const { data: team, error: findError } = await db
          .from(regTable)
          .select(`${teamIdCol}, team_name, leader_email, problem_statement_title, domain, registration_id`)
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
            problem_statement: team.problem_statement_title || "Problem Statement",
            domain: team.domain || "Unknown Domain",
            registration_id: team.registration_id
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

      // ───────────────────────────────────────────────────────────────
      // Step 1: Verify team exists and get their details
      // ───────────────────────────────────────────────────────────────
      console.log(`📍 Verifying team for solution submission: ${teamId}`);
      const { data: teamData, error: teamError } = await db
        .from(regTable)
        .select(`${teamIdCol}, team_name, leader_email, registration_id`)
        .eq(teamIdCol, teamId)
        .ilike("college_name", `%${collegeName || ""}%`)
        .eq("institute_number", instituteNumber || "")
        .single();

      if (teamError || !teamData) {
        console.error(`❌ Team verification failed: ${teamError?.message || "Not found"}`);
        return new Response(
          JSON.stringify({ error: "Team verification failed. Invalid credentials." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log(`✅ Team verified: ${teamData.team_name}`);

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
        registration_id: teamData.registration_id,
        solution_title: solutionTitle,
        solution_description: solutionDescription,
        video_link: youtubeLink,
        solution_pdf_url: fileName,
        status: "submitted",
      };

      // Insert to database
      console.log(`📝 Inserting solution to team_solutions table`);
      console.log(`📦 Registration ID: ${teamData.registration_id}`);
      console.log(`📦 Solution Title: ${solutionTitle}`);
      
      const { data: subData, error: subError } = await db
        .from(subTable)
        .insert([submissionData])
        .select("id")
        .single();

      if (subError) {
        console.error(`❌ Submission insert error: ${subError.message}`);
        console.error(`❌ Error code: ${subError.code}`);
        console.error(`❌ Error hint: ${subError.hint}`);
        console.error(`❌ Full error: ${JSON.stringify(subError)}`);
        throw new Error(`Submission insert failed: ${subError.message}`);
      }

      console.log(`✅ Submission recorded with ID: ${subData.id}`);

      // ───────────────────────────────────────────────────────────────
      // Step 4: Log activity
      // ───────────────────────────────────────────────────────────────
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: "solution_submission",
        team_id: teamId,
        registration_id: teamData.registration_id,
        user_email: teamData.leader_email,
        details: {
          team_name: teamData.team_name,
          solution_title: solutionTitle,
          file_name: fileName,
          video_link: youtubeLink,
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
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; text-align: center; color: white; }
  .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
  .header p { margin: 5px 0 0 0; font-size: 13px; opacity: 0.9; }
  .content { padding: 35px; }
  .greeting { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 15px; }
  .message { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
  .detail-box { background: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 18px 0; }
  .detail-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 13px; }
  .detail-label { color: #64748b; font-weight: 600; }
  .detail-value { color: #1e293b; font-weight: 500; }
  .success-banner { background: #dcfce7; border: 1px solid #86efac; padding: 12px; border-radius: 6px; text-align: center; margin: 18px 0; }
  .success-banner p { margin: 0; font-size: 14px; color: #166534; font-weight: 600; }
  .next-steps { margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  .next-steps h3 { font-size: 14px; font-weight: 600; color: #1e293b; margin: 0 0 12px 0; }
  .next-steps ul { margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8; }
  .footer { background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0; }
  .footer p { margin: 5px 0; font-size: 12px; color: #64748b; }
  .footer-link { color: #2563eb; text-decoration: none; font-weight: 500; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Solution Submitted Successfully!</h1>
      <p>KBT Avinyathon 2026 • KBTCOE Nashik</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${teamData.team_name},</div>
      
      <div class="message">
        Thank you for submitting your innovative solution to KBT Avinyathon 2026! We're thrilled to receive your contribution and appreciate your hard work and dedication.
      </div>
      
      <div class="success-banner">
        <p>🎯 Your submission has been recorded and is now under evaluation</p>
      </div>
      
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Team ID:</span>
          <span class="detail-value">${teamId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Team Name:</span>
          <span class="detail-value">${teamData.team_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Submission Status:</span>
          <span class="detail-value" style="color: #16a34a; font-weight: 700;">✓ Confirmed</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">PDF Submission:</span>
          <span class="detail-value">${fileName}</span>
        </div>
      </div>
      
      <div class="next-steps">
        <h3>📋 What Happens Next?</h3>
        <ul>
          <li><strong>Evaluation:</strong> Our expert judges will review your solution during the next 5-7 days</li>
          <li><strong>Feedback:</strong> You'll receive detailed feedback on your submission via email</li>
          <li><strong>Shortlisting:</strong> Selected teams will be invited to the final presentation round</li>
          <li><strong>Next Steps:</strong> Final round details will be shared with shortlisted teams</li>
        </ul>
      </div>
      
      <div class="message" style="margin-top: 20px; font-size: 13px;">
        If you have any questions or need to update your submission, please reach out to our support team. We're here to help!
      </div>
    </div>
    
    <div class="footer">
      <p><strong>KBT Avinyathon 2026</strong></p>
      <p>KBTCOE Engineering College, Nashik</p>
      <p>
        <a href="mailto:kbtavinyathon@gmail.com" class="footer-link">kbtavinyathon@gmail.com</a> 
        | 📱 Contact: +91-XXXXXXXXXX
      </p>
      <p style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px; color: #94a3b8; font-size: 11px;">
        © 2026 KBT Avinyathon. All rights reserved. | <a href="#" class="footer-link">Privacy Policy</a>
      </p>
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
