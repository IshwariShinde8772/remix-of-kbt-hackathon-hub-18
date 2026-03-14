// ── SHARED UTILITY FILE FOR EDGE FUNCTIONS ──
// This file handles dual-database sync, logging, and email sending

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";

// Database URLs
export const DB_LOVABLE = "https://wunqjksrgdppzcucwcyd.supabase.co";
export const DB_EXTERNAL = "https://lxawemydhhmqjahttrlb.supabase.co";

// Initialize both Supabase clients
export const getSupabaseClients = (lovableKey: string, externalKey: string) => {
  const lovable = createClient(DB_LOVABLE, lovableKey);
  const external = createClient(DB_EXTERNAL, externalKey);
  return { lovable, external };
};

// ── DUAL DATABASE SYNC ──
export const syncToDatabase = async (
  lovable: any,
  external: any,
  table: string,
  data: any
) => {
  try {
    // Insert to Lovable
    const { data: lovableResult, error: lovableError } = await lovable
      .from(table)
      .insert(data)
      .select("*")
      .single();

    if (lovableError) {
      console.error(`❌ Lovable insert error: ${lovableError.message}`);
      throw lovableError;
    }

    // Insert to External
    const { data: externalResult, error: externalError } = await external
      .from(table)
      .insert(data)
      .select("*")
      .single();

    if (externalError) {
      console.error(`⚠️ External insert warning (non-blocking): ${externalError.message}`);
      // Log but don't fail - one database is enough
    }

    return { success: true, data: lovableResult, external: !!externalResult };
  } catch (error: any) {
    console.error(`❌ Sync error: ${error.message}`);
    throw error;
  }
};

// ── ACTIVITY LOGGING ──
export const logActivity = async (lovable: any, external: any, activity: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: activity.action,
    team_id: activity.team_id,
    user_email: activity.user_email,
    details: activity.details || {},
    status: activity.status || "success",
  };

  try {
    // Log to Lovable
    await lovable.from("activity_logs").insert(logEntry).catch((e) => {
      console.error(`⚠️ Lovable log error: ${e.message}`);
    });

    // Log to External
    await external.from("activity_logs").insert(logEntry).catch((e) => {
      console.error(`⚠️ External log error: ${e.message}`);
    });

    console.log(`✅ Logged: ${activity.action} for ${activity.team_id}`);
  } catch (error: any) {
    console.error(`❌ Logging failed: ${error.message}`);
  }
};

// ── EMAIL SENDING ──
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  cc?: string[]
): Promise<boolean> => {
  const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
  const gmailUser = "kbtavinyathon@gmail.com";

  if (!gmailAppPassword) {
    console.error("❌ GMAIL_APP_PASSWORD not configured");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailAppPassword },
    });

    await transporter.sendMail({
      from: `"KBT Avinyathon 2026" <${gmailUser}>`,
      to,
      cc: cc || ["kbtavinyathon@gmail.com"],
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Email send failed: ${error.message}`);
    return false;
  }
};

// ── EMAIL TEMPLATES ──
export const emailTemplates = {
  registrationConfirmation: (teamId: string, teamName: string, leaderName: string, email: string, college: string, domain: string) => ({
    subject: `✅ Registration Confirmed – Team ID: ${teamId} | KBT Avinyathon 2026`,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
    .content { padding: 30px; }
    .team-id-box { background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .team-id-value { font-size: 32px; font-weight: 900; color: #1e3a8a; font-family: monospace; letter-spacing: 2px; }
    .details { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KBT AVINYATHON 2026</h1>
      <p style="margin: 8px 0 0;">State-Level Hackathon • KBTCOE Nashik</p>
    </div>
    <div class="content">
      <p style="font-size: 16px; font-weight: bold;">Congratulations, ${leaderName}! 🎉</p>
      <p>Your team <strong>"${teamName}"</strong> has been successfully registered!</p>
      
      <div class="team-id-box">
        <p style="margin: 0 0 8px; font-size: 12px; color: #2563eb; text-transform: uppercase; font-weight: bold;">Your Unique Team ID</p>
        <div class="team-id-value">${teamId}</div>
        <p style="margin: 8px 0 0; font-size: 11px; color: #f59e0b; font-weight: 600;">⚠️ Save this ID – required for solution submission</p>
      </div>

      <div class="details">
        <strong>Registration Details:</strong><br>
        Team: ${teamName}<br>
        College: ${college}<br>
        Domain: ${domain}<br>
        Email: ${email}
      </div>

      <p style="font-size: 14px; margin-top: 20px;">
        <strong>📌 Next Steps:</strong>
        <ol style="padding-left: 20px;">
          <li>Review problem statements</li>
          <li>Prepare your solution</li>
          <li>Submit before deadline using Team ID</li>
        </ol>
      </p>
    </div>
    <div class="footer">
      <p>© 2026 KBT College of Engineering<br><a href="mailto:kbtavinyathon@gmail.com" style="color: #2563eb; text-decoration: none;">kbtavinyathon@gmail.com</a></p>
    </div>
  </div>
</body>
</html>`,
  }),

  solutionSubmission: (teamId: string, teamName: string, fileName: string) => ({
    subject: `✅ Solution Submitted Successfully – Team ID: ${teamId}`,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #1e293b; padding: 25px; text-align: center; color: white; }
    .content { padding: 30px; }
    .success-box { background: #dcfce7; border: 1px solid #86efac; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">SUBMISSION CONFIRMED ✅</h1>
    </div>
    <div class="content">
      <p>Congratulations <strong>${teamName}</strong>,</p>
      <p>Your solution for <strong>KBT Avinyathon 2026</strong> has been successfully submitted!</p>
      
      <div class="success-box">
        <p style="margin: 0; font-size: 14px; color: #166534;">
          <strong>Team ID:</strong> ${teamId}<br>
          <strong>File:</strong> ${fileName}<br>
          <strong>Status:</strong> Received for Review
        </p>
      </div>

      <p style="font-size: 14px;">Our judges will review your submission shortly. Good luck! 🚀</p>
    </div>
    <div class="footer">
      <p>© 2026 KBT Avinyathon<br><a href="mailto:kbtavinyathon@gmail.com" style="color: #2563eb; text-decoration: none;">kbtavinyathon@gmail.com</a></p>
    </div>
  </div>
</body>
</html>`,
  }),
};
