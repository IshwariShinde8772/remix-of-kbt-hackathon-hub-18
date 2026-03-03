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
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="color:#e94560;margin:0;font-size:28px;">🎉 Registration Confirmed!</h1>
      <p style="color:#ffffff;margin:10px 0 0;font-size:16px;">KBT Avinyathon 2026</p>
    </div>
    <div style="background:#f8f9fa;padding:30px;border-radius:0 0 12px 12px;border:1px solid #e0e0e0;border-top:none;">
      <p style="color:#333;font-size:16px;">Dear <strong>${data.leader_name}</strong>,</p>
      <p style="color:#333;font-size:15px;">Your team <strong>"${data.team_name}"</strong> has been successfully registered for <strong>KBT Avinyathon 2026</strong>!</p>
      
      <div style="background:#ffffff;border:2px solid #e94560;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
        <p style="color:#666;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Your Unique Team ID</p>
        <h2 style="color:#e94560;margin:0;font-size:32px;font-weight:bold;letter-spacing:2px;">${result.team_id}</h2>
      </div>

      <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:15px;border-radius:4px;margin:20px 0;">
        <p style="color:#856404;margin:0;font-size:14px;"><strong>⚠️ Important:</strong> Save this Team ID securely. You will need it to submit your solution.</p>
      </div>

      <h3 style="color:#1a1a2e;margin:25px 0 10px;">📋 Registration Summary</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Team Name</td><td style="padding:8px;border-bottom:1px solid #eee;color:#333;font-weight:bold;">${data.team_name}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">College</td><td style="padding:8px;border-bottom:1px solid #eee;color:#333;">${data.college_name}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Leader</td><td style="padding:8px;border-bottom:1px solid #eee;color:#333;">${data.leader_name}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Domain</td><td style="padding:8px;border-bottom:1px solid #eee;color:#333;">${data.selected_domain || "Not selected"}</td></tr>
      </table>

      <p style="color:#333;font-size:14px;margin-top:25px;">Best of luck! 🚀</p>
      <p style="color:#666;font-size:13px;margin-top:20px;">— Team KBT Avinyathon<br><a href="mailto:kbtavinyathon@gmail.com" style="color:#e94560;">kbtavinyathon@gmail.com</a></p>
    </div>
  </div>
</body>
</html>`;


        // Use Deno's smtp module with Gmail App Password
        const { SmtpClient } = await import("https://deno.land/x/smtp@v0.7.0/mod.ts");
        const client = new SmtpClient();

        await client.connectTLS({
          hostname: "smtp.gmail.com",
          port: 465,
          username: gmailUser,
          password: gmailAppPassword,
        });

        await client.send({
          from: gmailUser,
          to: data.leader_email,
          subject: `✅ Registration Confirmed – Team ID: ${result.team_id} | KBT Avinyathon 2026`,
          content: "Please view this email in an HTML-compatible mail client.",
          html: emailHtml,
        });

        await client.close();
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
