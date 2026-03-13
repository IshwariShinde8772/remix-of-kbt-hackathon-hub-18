import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json();
    const { reg_file_data, reg_file_name, reg_file_type } = data;

    const primaryUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const primaryKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!primaryUrl || !primaryKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error: missing credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LovableUrl = "https://wunqjksrgdppzcucwcyd.supabase.co";
    const ExternalUrl = "https://lxawemydhhmqjahttrlb.supabase.co";

    const isExternal = primaryUrl.includes("lxawemydhhmqjahttrlb");
    const primaryTable = isExternal ? "team_registrations" : "registered_teams";
    const idColumn = isExternal ? "registration_id" : "team_id";

    const supabase = createClient(primaryUrl, primaryKey);

    // Handle file upload if provided
    let finalRegFormUrl = data.registration_form_url || null;
    let decodedFileData: Uint8Array | null = null;

    if (reg_file_data && reg_file_name) {
      decodedFileData = decode(reg_file_data);
      const { error: uploadError } = await supabase.storage
        .from('registration-forms')
        .upload(reg_file_name, decodedFileData, {
          contentType: reg_file_type || 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error("Primary storage upload error:", uploadError);
      } else {
        finalRegFormUrl = reg_file_name; // Store just the filename/path
      }
    }

    const members = data.members || [];
    const membersArray = members.map((m: any) => ({
      name: m.name,
      email: m.email,
      contact: m.contact || null,
    }));

    // Duplicate check
    const { data: existing } = await supabase
      .from(primaryTable)
      .select(idColumn)
      .ilike("leader_email", data.leader_email?.trim() || "")
      .ilike("college_name", data.college_name?.trim() || "")
      .limit(1);

    if (existing && existing.length > 0) {
      const existingId = (existing[0] as any)[idColumn];
      return new Response(
        JSON.stringify({ error: `This team is already registered with ID: ${existingId}` }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { count } = await supabase
      .from(primaryTable)
      .select("*", { count: "exact", head: true });

    const nextNum = (count || 0) + 1;
    const generatedId = `KBT-${nextNum.toString().padStart(4, "0")}`;

    // Build the correct insert payload per-schema
    let insertPayload: Record<string, any>;

    if (isExternal) {
      insertPayload = {
        team_name: data.team_name || "Unknown Team",
        college_name: data.college_name || "Unknown College",
        institute_number: data.institute_number || "000000",
        leader_name: data.leader_name || "Unknown",
        leader_email: data.leader_email || "unknown@email.com",
        leader_contact: data.leader_phone || "0000000000",
        members: membersArray,
        domain: data.selected_domain || "Software",
        problem_statement_id: data.selected_problem_id || null,
        problem_statement_uuid: data.selected_problem_id || null,
        problem_statement_title: data.problem_title || "General Participation",
        problem_description: data.approach_description || data.problem_description || "No description provided",
        mentor_name: data.mentor_name || "N/A",
        mentor_email: data.mentor_email || "N/A",
        mentor_contact: data.mentor_contact || "N/A",
        registration_form_url: finalRegFormUrl,
        registration_id: generatedId,
        status: "registered",
      };
    } else {
      insertPayload = {
        team_name: data.team_name || "Unknown Team",
        college_name: data.college_name || "Unknown College",
        institute_number: data.institute_number || "000000",
        leader_name: data.leader_name || "Unknown",
        leader_email: data.leader_email || "unknown@email.com",
        leader_phone: data.leader_phone || "0000000000",
        approach_description: data.approach_description || data.problem_description || "No description provided",
        selected_domain: data.selected_domain || "Software",
        selected_problem_id: data.selected_problem_id || null,
        mentor_name: data.mentor_name || "N/A",
        mentor_email: data.mentor_email || "N/A",
        mentor_contact: data.mentor_contact || "N/A",
        registration_form_url: finalRegFormUrl,
        team_id: generatedId,
        // Map members to flat columns for Lovable
        member2_name: membersArray[0]?.name || null,
        member2_email: membersArray[0]?.email || null,
        member2_role: "Member",
        member3_name: membersArray[1]?.name || null,
        member3_email: membersArray[1]?.email || null,
        member3_role: "Member",
        member4_name: membersArray[2]?.name || null,
        member4_email: membersArray[2]?.email || null,
        member4_role: "Member",
        member5_name: membersArray[3]?.name || null,
        member5_email: membersArray[3]?.email || null,
        member5_role: "Member",
      };
    }

    const { data: result, error: insertError } = await supabase
      .from(primaryTable)
      .insert(insertPayload)
      .select(`team_name, ${idColumn}`)
      .maybeSingle();

    if (insertError) {
      console.error("Insert error details:", insertError); // Log details to server for admin
      return new Response(JSON.stringify({ error: "Registration failed. Please try again later." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!result) {
      console.error("Registration failed: no record returned.");
      return new Response(JSON.stringify({ error: "Registration failed. Please try again later." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const teamId = (result as any)[idColumn] || generatedId;
    const teamResName = result.team_name;
    console.log(`✅ Registered: ${teamId} — ${teamResName} (table: ${primaryTable})`);

    // Start background processes
    const backgroundWork = async () => {
      const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
      const gmailUser = "kbtavinyathon@gmail.com";

      if (!gmailAppPassword) {
        console.error("❌ Skipping email: GMAIL_APP_PASSWORD environment variable is not set.");
        return;
      }

      console.log(`📧 Attempting to send email to leader: ${data.leader_email}`);

      try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background-color: #1e293b; color: #ffffff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase; }
    .header p { margin: 5px 0 0; font-size: 10px; opacity: 0.8; letter-spacing: 1px; }
    .content { padding: 25px; }
    .welcome { font-size: 18px; font-weight: bold; color: #1e293b; margin-bottom: 15px; }
    .team-id-box { background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center; }
    .team-id-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .team-id-value { font-size: 24px; font-weight: 800; color: #2563eb; margin: 8px 0; letter-spacing: 1px; }
    .team-id-warning { font-size: 10px; color: #f59e0b; font-weight: 600; margin-top: 5px; }
    .details-section { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
    .details-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #1e293b; }
    .detail-row { display: block; margin-bottom: 6px; font-size: 12px; }
    .detail-label { display: inline-block; width: 120px; color: #64748b; font-weight: 500; }
    .detail-value { display: inline-block; font-weight: bold; color: #1e293b; }
    .next-steps { background-color: #eff6ff; border-radius: 12px; padding: 15px; margin-top: 25px; }
    .next-steps-title { color: #1e40af; font-weight: bold; margin-bottom: 8px; font-size: 14px; }
    .next-steps ul { margin: 0; padding-left: 18px; font-size: 13px; color: #1e3a8a; }
    .next-steps li { margin-bottom: 6px; }
    .footer { padding: 25px; background-color: #ffffff; font-size: 13px; color: #64748b; }
    .footer-bottom { border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KBT AVINYATHON 2026</h1>
      <p>STATE-LEVEL HACKATHON • KBTCOE NASHIK</p>
    </div>
    <div class="content">
      <div class="welcome">Congratulations, ${data.leader_name}!</div>
      <p>Your team <strong>"${data.team_name}"</strong> has been successfully registered for <strong>KBT Avinyathon 2026</strong>. We are thrilled to have you!</p>
      
      <div class="team-id-box">
        <div class="team-id-label">YOUR UNIQUE TEAM ID</div>
        <div class="team-id-value">${teamId}</div>
        <div class="team-id-warning">⚠️ SAVE THIS ID — required for solution submission.</div>
      </div>

      <div class="details-section">
        <div class="details-title">📋 Registration Summary</div>
        <div class="detail-row">
          <div class="detail-label">Team ID</div>
          <div class="detail-value" style="color: #2563eb;">${teamId}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Leader Name</div>
          <div class="detail-value">${data.leader_name}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">College</div>
          <div class="detail-value">${data.college_name}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Institute ID</div>
          <div class="detail-value">${data.institute_number}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Domain</div>
          <div class="detail-value">${data.selected_domain || "Software"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Email</div>
          <div class="detail-value">${data.leader_email}</div>
        </div>
      </div>

      <div class="next-steps">
        <div class="next-steps-title">🚀 WHAT'S NEXT?</div>
        <ul>
          <li>Review your problem statement on the <strong>Problem Statements</strong> page.</li>
          <li>Prepare your prototype/solution as per the Rules & Guidelines.</li>
          <li>Submit your solution before the deadline using your Team ID.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <p>Warm Regards,<br>
      <strong>Team KBT Avinyathon</strong><br>
      KBTCOE Nashik</p>
      
      <div class="footer-bottom">
        <p>© 2026 KBT College of Engineering. All rights reserved.<br>Nashik, Maharashtra, India</p>
        <p><a href="mailto:kbtavinyathon@gmail.com" style="color: #2563eb; text-decoration: none;">kbtavinyathon@gmail.com</a></p>
      </div>
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
          to: data.leader_email,
          cc: [
            "kbtavinyathon@gmail.com",
            "deshmukh.tejaswini@kbtcoe.org",
            "kbt.hackathon@kbtcoe.org"
          ],
          subject: `Registration Confirmed – Team ID: ${teamId}`,
          html: emailHtml,
        });

        console.log(`✅ Email successfully sent to ${data.leader_email} and CC list`);
      } catch (e) {
        console.error("❌ Email sending failed:", e);
      }

      const externalKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY");
      if (externalKey) {
        try {
          const otherUrl = isExternal ? LovableUrl : ExternalUrl;
          const otherTable = isExternal ? "registered_teams" : "team_registrations";
          const otherClient = createClient(otherUrl, externalKey);

          // ── 1. Upload file to other storage ──
          if (decodedFileData && reg_file_name) {
            await otherClient.storage
              .from('registration-forms')
              .upload(reg_file_name, decodedFileData, {
                contentType: reg_file_type || 'application/pdf',
                upsert: true,
              });
          }

          // ── 2. Sync DB record ──
          const syncPayload = isExternal
            ? { 
                team_name: data.team_name, 
                college_name: data.college_name, 
                leader_name: data.leader_name, 
                leader_email: data.leader_email, 
                leader_phone: data.leader_phone || "0000000000", 
                institute_number: data.institute_number || "000000", 
                mentor_name: data.mentor_name || "N/A", 
                mentor_email: data.mentor_email || "N/A", 
                mentor_contact: data.mentor_contact || "N/A", 
                team_id: teamId, 
                approach_description: data.approach_description || "No description provided", 
                selected_domain: data.selected_domain || "Software",
                selected_problem_id: data.selected_problem_id || null,
                registration_form_url: finalRegFormUrl,
                // Sync flat members to Lovable
                member2_name: membersArray[0]?.name || null,
                member2_email: membersArray[0]?.email || null,
                member2_role: "Member",
                member3_name: membersArray[1]?.name || null,
                member3_email: membersArray[1]?.email || null,
                member3_role: "Member",
                member4_name: membersArray[2]?.name || null,
                member4_email: membersArray[2]?.email || null,
                member4_role: "Member",
                member5_name: membersArray[3]?.name || null,
                member5_email: membersArray[3]?.email || null,
                member5_role: "Member",
              }
            : { 
                team_name: data.team_name, 
                college_name: data.college_name, 
                leader_name: data.leader_name, 
                leader_email: data.leader_email, 
                leader_contact: data.leader_phone || "0000000000", 
                institute_number: data.institute_number || "000000", 
                mentor_name: data.mentor_name || "N/A", 
                mentor_email: data.mentor_email || "N/A", 
                mentor_contact: data.mentor_contact || "N/A", 
                registration_id: teamId, 
                problem_description: data.approach_description || "No description provided", 
                domain: data.selected_domain || "Software", 
                status: "registered", 
                registration_form_url: finalRegFormUrl,
                members: membersArray,
                problem_statement_id: data.selected_problem_id || null,
                problem_statement_uuid: data.selected_problem_id || null,
                problem_statement_title: data.problem_title || "General Participation"
              };

          const { error: syncError } = await otherClient.from(otherTable).insert(syncPayload);
          if (syncError) console.error(`❌ Dual sync error (${otherTable}):`, syncError.message);
          else console.log(`✅ Dual sync saved to ${otherTable}`);
        } catch (e) {
          console.error("❌ Dual sync exception:", e);
        }
      }
    };

    // Use EdgeRuntime.waitUntil to ensure background tasks complete after returning response
    if ((globalThis as any).EdgeRuntime) {
      (globalThis as any).EdgeRuntime.waitUntil(backgroundWork());
    } else {
      await backgroundWork();
    }

    return new Response(
      JSON.stringify({ success: true, team_id: teamId, team_name: teamResName }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Registration failed. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
