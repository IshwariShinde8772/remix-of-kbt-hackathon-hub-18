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
    // EMAIL NOTIFICATION (Resend)
    // ─────────────────────────────────────────────────────────────
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("❌ Email notification failed: RESEND_API_KEY not set");
    } else {
      try {
        const membersList = members.map((m: any, i: number) =>
          `<li><strong>Member ${i + 2}:</strong> ${m.name} (${m.email})</li>`
        ).join('');

        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #6366f1; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Registration Successful! 🎉</h1>
              <p style="margin: 8px 0 0; opacity: 0.9;">Team ${data.team_name}</p>
            </div>
            <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
              <p>Hello <strong>${data.leader_name}</strong>,</p>
              <p>Congratulations! Your team has been successfully registered for the <strong>KBT Hackathon</strong>.</p>
              
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Your Team ID</p>
                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 2px;">${result.team_id}</p>
                <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">Use this ID to submit your solutions and track your progress.</p>
              </div>

              <h3>Registration Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 8px;"><strong>Domain:</strong> ${data.selected_domain}</li>
                <li style="margin-bottom: 8px;"><strong>Problem Title:</strong> ${data.problem_statement_title || (result.team_name + " Selected Problem")}</li>
                <li style="margin-bottom: 8px;"><strong>College:</strong> ${data.college_name}</li>
                <li style="margin-bottom: 8px;"><strong>Mentor:</strong> ${data.mentor_name} (${data.mentor_email})</li>
              </ul>

              <h3>Team Composition:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 8px;"><strong>Leader:</strong> ${data.leader_name} (${data.leader_email})</li>
                ${membersList}
              </ul>

              <p style="margin-top: 24px;">If you have any questions, feel free to contact us at <strong>kbt.hackathon@kbtcoe.org</strong>.</p>
              
              <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
                <p>© 2024 KBT COE Hackathon. All rights reserved.</p>
              </div>
            </div>
          </div>
        `;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "KBT Hackathon <onboarding@resend.dev>", // Default Resend domain until verified
            to: [data.leader_email],
            reply_to: "kbt.hackathon@kbtcoe.org",
            subject: `Registration Successful - Team ${data.team_name} [${result.team_id}]`,
            html: emailHtml,
          }),
        });

        const emailResult = await res.json();
        if (res.ok) {
          console.log(`✅ Confirmation email sent to ${data.leader_email}: ${emailResult.id}`);
        } else {
          console.error("❌ Email sending failed:", emailResult);
        }
      } catch (emailErr) {
        console.error("❌ Email sending error:", emailErr);
      }
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
          mentor_name: data.mentor_name,
          mentor_email: data.mentor_email,
          mentor_contact: data.mentor_contact,
          registration_form_url: data.registration_form_url || null, // New field
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
