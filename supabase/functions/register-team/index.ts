import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DB_LOVABLE = "https://wunqjksrgdppzcucwcyd.supabase.co";
const DB_EXTERNAL = "https://lxawemydhhmqjahttrlb.supabase.co";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const data = await req.json();
    const { reg_file_data, reg_file_name, reg_file_type } = data;

    // Get API keys from environment
    const lovableKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const externalKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!lovableKey || !externalKey) {
      throw new Error("Missing Supabase credentials");
    }

    // Initialize both database clients
    const lovable = createClient(DB_LOVABLE, lovableKey);
    const external = createClient(DB_EXTERNAL, externalKey);

    // Lovable uses: registered_teams, External uses: team_registrations
    const lovableTable = "registered_teams";
    const externalTable = "team_registrations";
    const idColumn = "team_id";

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Handle file upload (if provided)
    // ═══════════════════════════════════════════════════════════════
    let finalRegFormUrl = data.registration_form_url || null;
    
    if (reg_file_data && reg_file_name) {
      try {
        const decodedFileData = decode(reg_file_data);
        const fileName = `${data.college_name?.replace(/[^a-zA-Z0-9]/g, "_") || "college"}_${Date.now()}_${reg_file_name}`;
        const contentType = reg_file_type || "application/pdf";

        // Upload to Lovable storage
        const { error: uploadError } = await lovable.storage
          .from("solutions")
          .upload(`registrations/${fileName}`, decodedFileData, { contentType, upsert: false });

        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = lovable.storage
          .from("solutions")
          .getPublicUrl(`registrations/${fileName}`);

        finalRegFormUrl = publicUrl;
        console.log(`✅ File uploaded: ${fileName}`);
      } catch (fileErr: any) {
        console.error(`⚠️ File upload warning: ${fileErr.message}`);
        // Continue without file - it's not critical
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Check for duplicate registration in both databases
    // ═══════════════════════════════════════════════════════════════
    const { data: existingLov } = await lovable
      .from(lovableTable)
      .select(idColumn)
      .eq("institute_number", data.institute_number?.trim() || "")
      .ilike("college_name", data.college_name?.trim() || "")
      .limit(1);

    const { data: existingExt } = await external
      .from(externalTable)
      .select(idColumn)
      .eq("institute_number", data.institute_number?.trim() || "")
      .ilike("college_name", data.college_name?.trim() || "")
      .limit(1);

    if ((existingLov && existingLov.length > 0) || (existingExt && existingExt.length > 0)) {
      const existingId = existingLov && existingLov.length > 0 
        ? (existingLov[0] as any)[idColumn]
        : (existingExt[0] as any)[idColumn];
      return new Response(
        JSON.stringify({ error: `This team is already registered with ID: ${existingId}` }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Generate team ID
    // ═══════════════════════════════════════════════════════════════
    const { count } = await lovable
      .from(lovableTable)
      .select("*", { count: "exact", head: true });

    const nextNum = (count || 0) + 1;
    const generatedId = `KBT-${nextNum.toString().padStart(4, "0")}`;

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Prepare registration data
    // ═══════════════════════════════════════════════════════════════
    const membersArray = data.members || [];
    const registrationData = {
      team_name: data.team_name || "Unknown Team",
      college_name: data.college_name || "Unknown College",
      institute_number: data.institute_number || "000000",
      leader_name: data.leader_name || "Unknown",
      leader_email: data.leader_email || "unknown@email.com",
      leader_phone: data.leader_phone || "0000000000",
      approach_description: data.approach_description || data.problem_description || "No description",
      selected_domain: data.selected_domain || "Software",
      selected_problem_id: data.selected_problem_id || null,
      mentor_name: data.mentor_name || "N/A",
      mentor_email: data.mentor_email || "N/A",
      mentor_contact: data.mentor_contact || "N/A",
      registration_form_url: finalRegFormUrl,
      team_id: generatedId,
      member2_name: membersArray[0]?.name || null,
      member2_email: membersArray[0]?.email || null,
      member2_contact: membersArray[0]?.contact || null,
      member2_role: membersArray[0] ? "Member" : null,
      member3_name: membersArray[1]?.name || null,
      member3_email: membersArray[1]?.email || null,
      member3_contact: membersArray[1]?.contact || null,
      member3_role: membersArray[1] ? "Member" : null,
      member4_name: membersArray[2]?.name || null,
      member4_email: membersArray[2]?.email || null,
      member4_contact: membersArray[2]?.contact || null,
      member4_role: membersArray[2] ? "Member" : null,
      member5_name: membersArray[3]?.name || null,
      member5_email: membersArray[3]?.email || null,
      member5_contact: membersArray[3]?.contact || null,
      member5_role: membersArray[3] ? "Member" : null,
    };

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Save to BOTH databases
    // ═══════════════════════════════════════════════════════════════
    let lovableResult = null;
    let externalResult = null;

    // Insert to Lovable (primary)
    const { data: lovData, error: lovError } = await lovable
      .from(lovableTable)
      .insert(registrationData)
      .select(`team_name, ${idColumn}`)
      .single();

    if (lovError) {
      console.error(`❌ Lovable insert failed: ${lovError.message}`);
      throw new Error("Registration failed in primary database");
    }
    lovableResult = lovData;

    // Insert to External (secondary - non-blocking)
    const { data: extData, error: extError } = await external
      .from(externalTable)
      .insert(registrationData)
      .select(`team_name, ${idColumn}`)
      .single();

    if (extError) {
      // If it's a duplicate key error, it's not critical - team exists
      if (extError.code === "23505") {
        console.log(`ℹ️ Team already exists in external database (${generatedId})`);
      } else {
        console.error(`⚠️ External database sync warning: ${extError.message}`);
      }
    } else {
      externalResult = extData;
      console.log(`✅ Synced to external database`);
    }

    const teamId = generatedId;

    // ═══════════════════════════════════════════════════════════════
    // STEP 6: Log activity to both databases
    // ═══════════════════════════════════════════════════════════════
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: "registration",
      team_id: teamId,
      user_email: data.leader_email,
      details: {
        team_name: data.team_name,
        college_name: data.college_name,
        domain: data.selected_domain,
        members_count: membersArray.length,
      },
      status: "success",
    };

    // Log to Lovable
    await lovable.from("activity_logs").insert(logEntry).catch((e) => {
      console.error(`⚠️ Lovable log error: ${e.message}`);
    });

    // Log to External
    await external.from("activity_logs").insert(logEntry).catch((e) => {
      console.error(`⚠️ External log error: ${e.message}`);
    });

    console.log(`✅ Logged registration for team ${teamId}`);

    // ═══════════════════════════════════════════════════════════════
    // STEP 7: Send confirmation email (non-blocking)
    // ═══════════════════════════════════════════════════════════════
    const sendRegistrationEmail = async () => {
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
  .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white; }
  .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
  .header p { margin: 8px 0 0; font-size: 13px; opacity: 0.9; }
  .content { padding: 30px; }
  .team-id-box { background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
  .team-id-label { font-size: 12px; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; }
  .team-id-value { font-size: 32px; font-weight: 900; color: #1e3a8a; font-family: monospace; letter-spacing: 2px; margin: 10px 0; }
  .team-id-warning { font-size: 11px; color: #f59e0b; font-weight: 600; }
  .details { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6; }
  .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>KBT AVINYATHON 2026</h1>
      <p>State-Level Hackathon • KBTCOE Nashik</p>
    </div>
    <div class="content">
      <p style="font-size: 16px; font-weight: bold;">Congratulations, ${data.leader_name}! 🎉</p>
      <p>Your team <strong>"${data.team_name}"</strong> has been successfully registered!</p>
      
      <div class="team-id-box">
        <div class="team-id-label">Your Unique Team ID</div>
        <div class="team-id-value">${teamId}</div>
        <div class="team-id-warning">⚠️ Save this ID – required for solution submission</div>
      </div>

      <div class="details">
        <strong>Registration Summary:</strong><br>
        Team: ${data.team_name}<br>
        College: ${data.college_name}<br>
        Domain: ${data.selected_domain || "Software"}<br>
        Leader Email: ${data.leader_email}<br>
        Team Members: ${membersArray.length}
      </div>

      <p style="font-size: 14px;"><strong>📌 Next Steps:</strong></p>
      <ol style="padding-left: 20px; font-size: 14px;">
        <li>Review problem statements on our website</li>
        <li>Prepare your solution</li>
        <li>Submit before deadline using Team ID: <strong>${teamId}</strong></li>
      </ol>
    </div>
    <div class="footer">
      <p>© 2026 KBT College of Engineering • Nashik<br>
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
          to: data.leader_email,
          cc: ["kbtavinyathon@gmail.com", "deshmukh.tejaswini@kbtcoe.org"],
          subject: `✅ Registration Confirmed – Team ID: ${teamId}`,
          html: emailHtml,
        });

        console.log(`✅ Registration email sent to ${data.leader_email}`);
      } catch (emailError: any) {
        console.error(`⚠️ Email send failed: ${emailError.message}`);
      }
    };

    // Send email with timeout (don't block too long)
    try {
      // Try to send email with 5 second timeout
      await Promise.race([
        sendRegistrationEmail(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Email timeout")), 5000))
      ]);
    } catch (emailTimeoutError: any) {
      // Log but don't fail registration if email times out
      console.warn(`⚠️ Email send timeout or error: ${emailTimeoutError.message}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 8: Return success response
    // ═══════════════════════════════════════════════════════════════
    return new Response(
      JSON.stringify({
        success: true,
        message: "Registration successful!",
        team_id: teamId,
        synced_to: externalResult ? "both_databases" : "primary_database",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error(`❌ Registration error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message || "Registration failed. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
