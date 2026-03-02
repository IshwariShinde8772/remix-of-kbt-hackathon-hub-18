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
    // EXTERNAL SUPABASE (lxawemydhhmqjahttrlb) — table: team_registrations
    // ─────────────────────────────────────────────────────────────
    const externalUrl = "https://lxawemydhhmqjahttrlb.supabase.co";
    const externalKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY") ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXdlbXlkaGhtcWphaHR0cmxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk3MDcwMywiZXhwIjoyMDg0NTQ2NzAzfQ.8lpW26X2YtAtvvImtcGP7Iw_tcwMPBVTBIygbCBYatM";

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
