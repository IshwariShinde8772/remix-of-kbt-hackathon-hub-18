import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const data = await req.json();
    const { reg_file_data, reg_file_name, reg_file_type } = data;

    const LovableUrl = "https://wunqjksrgdppzcucwcyd.supabase.co";
    // Using the EXTERNAL key which in this context corresponds to the Lovable key
    let LovableKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("EXTERNAL_SUPABASE_ANON_KEY") || "";
    
    // Fallback if someone didn't set EXTERNAL keys, but they set SUPABASE_URL to lovable
    if (Deno.env.get("SUPABASE_URL")?.includes("wunqjksrgdppzcucwcyd")) {
        LovableKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || LovableKey;
    }

    if (!LovableKey) {
      console.error("❌ Missing Lovable Supabase key in environment variables");
      throw new Error("Server configuration error");
    }

    const supabase = createClient(LovableUrl, LovableKey);

    const primaryTable = "registered_teams";
    const idColumn = "team_id";

    // Handle file upload if provided
    let finalRegFormUrl = data.registration_form_url || null;
    let decodedFileData: Uint8Array | null = null;

    if (reg_file_data && reg_file_name) {
      try {
        decodedFileData = decode(reg_file_data);
      } catch (err) {
        throw new Error("Invalid file data encoding");
      }
    }

    if (decodedFileData && reg_file_name) {
      const fileName = `${data.college_name?.replace(/[^a-zA-Z0-9]/g, "_") || "college"}_${Date.now()}_${reg_file_name}`;
      const contentType = reg_file_type || "application/pdf";

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("solutions")
        .upload(`registrations/${fileName}`, decodedFileData, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload registration form: ${uploadError.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from("solutions")
        .getPublicUrl(`registrations/${fileName}`);

      finalRegFormUrl = publicUrl;
    }

    const { data: existing } = await supabase
      .from(primaryTable)
      .select(idColumn)
      .eq("institute_number", data.institute_number?.trim() || "")
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

    const membersArray = data.members || [];
    
    // Always build the Lovable insert payload format
    const insertPayload = {
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

    const { data: result, error: insertError } = await supabase
      .from(primaryTable)
      .insert(insertPayload)
      .select(`team_name, ${idColumn}`)
      .maybeSingle();

    if (insertError) {
      console.error("Insert error details:", insertError);
      return new Response(JSON.stringify({ error: "Registration failed. Please try again later." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!result) {
      return new Response(JSON.stringify({ error: "Registration failed. Please try again later." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const teamId = (result as any)[idColumn] || generatedId;

    // Start background processes (Email ONLY)
    const backgroundWork = async () => {
      const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
      const gmailUser = "kbtavinyathon@gmail.com";

      if (!gmailAppPassword) {
        console.error("❌ Skipping email: GMAIL_APP_PASSWORD environment variable is not set.");
        return;
      }

      try {
        const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #334155; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 25px; text-align: center; color: white; border-bottom: 4px solid #f59e0b; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; }
    .header p { margin: 5px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 30px; }
    .welcome { font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 10px; }
    .team-id-box { background: linear-gradient(to right, #eff6ff, #dbeafe); border: 1px solid #bfdbfe; border-radius: 12px; padding: 15px; text-align: center; margin: 25px 0; }
    .team-id-label { font-size: 12px; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; }
    .team-id-value { font-size: 28px; font-weight: 900; color: #1e3a8a; margin: 5px 0; font-family: monospace; letter-spacing: 2px; }
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

      } catch (emailError) {
        console.error("❌ Email sending failed:", emailError);
      }
    };

    if ((globalThis as any).EdgeRuntime) {
      (globalThis as any).EdgeRuntime.waitUntil(backgroundWork());
    } else {
      backgroundWork();
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Registration successful!",
        team_id: teamId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Registration error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
