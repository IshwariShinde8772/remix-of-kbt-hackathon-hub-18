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
    const data = await req.json();

    // ─────────────────────────────────────────────────────────────
    // PRIMARY SUPABASE (Lovable) — table: registered_teams
    // ─────────────────────────────────────────────────────────────
    const primaryUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const primaryKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    console.log("PRIMARY SUPABASE_URL:", primaryUrl);
    console.log("PRIMARY SERVICE_ROLE_KEY set:", primaryKey ? "yes" : "no");

    if (!primaryUrl || !primaryKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error: missing primary database credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const primarySupabase = createClient(primaryUrl, primaryKey);

    // Build insert payload for Primary DB
    const insertData: Record<string, unknown> = {
      team_name: data.team_name,
      college_name: data.college_name,
      institute_number: data.institute_number,
      leader_name: data.leader_name,
      leader_email: data.leader_email,
      leader_phone: data.leader_phone,
      selected_problem_id: data.selected_problem_id || null,
      selected_domain: data.selected_domain || null,
      approach_description: data.approach_description || null,
      mentor_name: data.mentor_name,
      mentor_email: data.mentor_email,
      mentor_contact: data.mentor_contact,
      registration_form_url: data.registration_form_url || null, // New field
    };

    // Add team members details to Primary DB
    const members = data.members || [];
    if (members[0]) {
      insertData.member2_name = members[0].name;
      insertData.member2_email = members[0].email;
      insertData.member2_contact = members[0].contact || null; // Changed from role
    }
    if (members[1]) {
      insertData.member3_name = members[1].name;
      insertData.member3_email = members[1].email;
      insertData.member3_contact = members[1].contact || null; // Changed from role
    }
    if (members[2]) {
      insertData.member4_name = members[2].name;
      insertData.member4_email = members[2].email;
      insertData.member4_contact = members[2].contact || null; // Changed from role
    }

    // ✅ Insert into PRIMARY DB (Lovable Supabase) → registered_teams
    const { data: result, error: primaryError } = await primarySupabase
      .from("registered_teams")
      .insert(insertData)
      .select("team_id, team_name")
      .single();

    if (primaryError) {
      console.error("Primary DB insert error:", primaryError);
      return new Response(JSON.stringify({ error: primaryError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`✅ PRIMARY DB saved: ${result.team_id} - ${result.team_name}`);

    // ─────────────────────────────────────────────────────────────
    // SEND CONFIRMATION EMAIL via Gmail SMTP (App Password)
    // ─────────────────────────────────────────────────────────────
    const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    const gmailUser = "kbtavinyathon@gmail.com";

    if (gmailAppPassword) {
      try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed - KBT Avinyathon 2026</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f7;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;shadow:0 4px 10px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:40px 30px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:1px;font-weight:800;">KBT AVINYATHON 2026</h1>
              <p style="color:#94a3b8;margin:10px 0 0;font-size:14px;text-transform:uppercase;letter-spacing:2px;">State-Level Hackathon • KBTCOE Nashik</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px 35px;">
              <h2 style="color:#0f172a;margin:0 0 20px;font-size:22px;">Congratulations, ${data.leader_name}!</h2>
              <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 25px;">
                Your team <strong style="color:#0f172a;">"${data.team_name}"</strong> has been successfully registered for <strong>KBT Avinyathon 2026</strong>. We are thrilled to see your innovative approach to solving real-world industrial challenges!
              </p>
              
              <!-- Unique ID Box -->
              <div style="background-color:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;padding:25px;margin:30px 0;text-align:center;">
                <p style="color:#64748b;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Your Unique Team ID</p>
                <h2 style="color:#2563eb;margin:0;font-size:36px;font-weight:800;letter-spacing:4px;">${result.team_id}</h2>
                <p style="color:#ef4444;margin:12px 0 0;font-size:12px;font-weight:600;">⚠️ PLEASE SAVE THIS ID. It is required for solution submission.</p>
              </div>

              <h3 style="color:#0f172a;margin:35px 0 15px;font-size:18px;border-bottom:1px solid #e2e8f0;padding-bottom:10px;">📋 Registration Details</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:14px;">
                <tr><td width="40%" style="padding:10px 0;color:#64748b;">Organization / College</td><td style="padding:10px 0;color:#0f172a;font-weight:600;">${data.college_name}</td></tr>
                <tr><td style="padding:10px 0;color:#64748b;">Selected Domain</td><td style="padding:10px 0;color:#0f172a;font-weight:600;">${data.selected_domain || "Not selected"}</td></tr>
                <tr><td style="padding:10px 0;color:#64748b;">Leader Email</td><td style="padding:10px 0;color:#0f172a;font-weight:600;">${data.leader_email}</td></tr>
              </table>

              <!-- Next Steps -->
              <div style="margin-top:40px;padding:20px;background-color:#eff6ff;border-radius:8px;">
                <h4 style="color:#1d4ed8;margin:0 0 10px;font-size:15px;text-transform:uppercase;">🚀 What's Next?</h4>
                <ul style="color:#1e3a8a;margin:0;padding-left:20px;font-size:14px;line-height:1.7;">
                  <li>Visit the <strong>Problem Statements</strong> page to review your challenges.</li>
                  <li>Prepare your proposal and prototype as per the rules.</li>
                  <li>Stay tuned for updates on the final event schedule.</li>
                </ul>
              </div>

              <p style="color:#475569;font-size:15px;line-height:1.6;margin:40px 0 0;">
                Best of luck with your hackathon journey! If you have any questions, feel free to reach out to our team.
              </p>
              
              <p style="color:#0f172a;font-size:15px;margin:30px 0 0;">
                Warm Regards,<br>
                <strong style="color:#2563eb;">Team KBT Avinyathon</strong><br>
                <span style="font-size:13px;color:#64748b;">KBTCOE Nashik</span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8;margin:0;font-size:13px;">
                © 2026 KBT College of Engineering. All rights reserved.<br>
                Nashik, Maharashtra, India
              </p>
              <div style="margin-top:15px;">
                <a href="mailto:kbtavinyathon@gmail.com" style="color:#2563eb;text-decoration:none;font-size:13px;font-weight:bold;">kbtavinyathon@gmail.com</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;


        // Use nodemailer via Deno npm compatibility
        const nodemailer = (await import("npm:nodemailer@6")).default;

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: gmailUser,
            pass: gmailAppPassword,
          },
        });

        await transporter.sendMail({
          from: `"KBT Avinyathon 2026" <${gmailUser}>`,
          to: data.leader_email,
          subject: `✅ Registration Confirmed – Team ID: ${result.team_id} | KBT Avinyathon 2026`,
          text: "Please view this email in an HTML-compatible mail client.",
          html: emailHtml,
        });

        console.log(`✅ Email sent to ${data.leader_email} via Gmail SMTP`);

      } catch (emailErr) {
        console.error("❌ Email send error (non-blocking):", emailErr);
      }
    } else {
      console.error("❌ GMAIL_APP_PASSWORD not set, skipping confirmation email");
    }

    // ─────────────────────────────────────────────────────────────
    // EXTERNAL SUPABASE (lxawemydhhmqjahttrlb) — table: team_registrations
    // ─────────────────────────────────────────────────────────────
    const externalUrl = "https://lxawemydhhmqjahttrlb.supabase.co";
    const externalKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY");

    if (!externalKey) {
      console.error("❌ External DB sync failed: EXTERNAL_SUPABASE_SERVICE_ROLE_KEY not set");
    } else {
      try {
        const externalSupabase = createClient(externalUrl, externalKey);

        // Build members array for external DB (JSON array)
        const membersArray = members.map((m: any) => ({
          name: m.name,
          email: m.email,
          contact: m.contact || null, // Changed from role
        }));

        // Map to external table's column names
        const extInsertData = {
          registration_id: result.team_id,
          team_name: data.team_name,
          college_name: data.college_name,
          institute_number: data.institute_number,
          leader_name: data.leader_name,
          leader_email: data.leader_email,
          leader_contact: data.leader_phone,
          members: membersArray,
          domain: data.selected_domain || null,
          problem_statement_id: data.selected_problem_id || null,
          problem_statement_uuid: data.selected_problem_id || null,
          problem_statement_title: data.problem_title || "N/A",
          problem_description: data.approach_description || "N/A",
          mentor_name: data.mentor_name,
          mentor_email: data.mentor_email,
          mentor_contact: data.mentor_contact,
          registration_form_url: data.registration_form_url || null,
          status: "registered",
        };

        const { error: extError } = await externalSupabase
          .from("team_registrations")
          .insert(extInsertData);

        if (extError) {
          console.error("❌ External DB error:", extError.message);
        } else {
          console.log(`✅ EXTERNAL DB saved: ${result.team_id}`);
        }
      } catch (extErr) {
        console.error("❌ External DB sync failed (non-blocking):", extErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, team_id: result.team_id, team_name: result.team_name }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during registration" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
