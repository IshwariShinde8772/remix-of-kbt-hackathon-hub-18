import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
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

  try {
    const data = await req.json();
    console.log(`📥 Received registration request for: ${data.team_name || "New Team"}`);
    const { reg_file_data, reg_file_name, reg_file_type } = data;

    // Get API key from environment
    // When running on External, SUPABASE_SERVICE_ROLE_KEY = External's key
    const externalKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    console.log(`🔑 API Key - External: ${externalKey ? "✅" : "❌"}`);

    if (!externalKey) {
      throw new Error("Missing Supabase credentials");
    }

    // Initialize database client (using External as primary)
    const db = createClient(DB_EXTERNAL, externalKey);

    // Lovable uses: registered_teams, External uses: team_registrations
    const tablePrefix = "team_"; // External table naming
    const table = "team_registrations";
    const idColumn = "team_id";

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Handle file upload (if provided)
    // ═══════════════════════════════════════════════════════════════
    // Trim URL and other inputs if provided
    let rawRegFormUrl = (data.registration_form_url || "").trim();
    let finalRegFormUrl = rawRegFormUrl || null;

    console.log(`📂 Initial Registration Form URL: ${finalRegFormUrl || "none"}`);

    if (reg_file_data && reg_file_name) {
      try {
        console.log(`📂 Processing file upload: ${reg_file_name} (${reg_file_type})`);
        const decodedFileData = decode(reg_file_data);
        const fileName = `${data.college_name?.replace(/[^a-zA-Z0-9]/g, "_") || "college"}_${Date.now()}_${reg_file_name}`;
        const contentType = reg_file_type || "application/pdf";

        console.log(`📂 Target Bucket: registration-forms | FileName: ${fileName}`);

        // Upload to storage
        const { data: uploadData, error: uploadError } = await db.storage
          .from("registration-forms")
          .upload(fileName, decodedFileData, { contentType, upsert: true });

        if (uploadError) {
          console.error(`❌ Storage upload error:`, JSON.stringify(uploadError));
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        console.log(`✅ File uploaded successfully:`, JSON.stringify(uploadData));

        const { data: { publicUrl } } = db.storage
          .from("registration-forms")
          .getPublicUrl(fileName);

        finalRegFormUrl = publicUrl;
        console.log(`✅ Public URL generated: ${finalRegFormUrl}`);
      } catch (fileErr: any) {
        console.error(`⚠️ File upload error: ${fileErr.message}`);
        // Fallback to the link provided (if any)
        if (!finalRegFormUrl && rawRegFormUrl) {
           finalRegFormUrl = rawRegFormUrl;
        } else if (!finalRegFormUrl) {
          // If no fallback and file upload failed, this is a fatal error for the registration
          throw new Error(`Registration failed: Could not process authorization form and no alternate link was provided.`);
        }
      }
    } else {
      console.log(`ℹ️ No file data provided, using URL: ${finalRegFormUrl || "none"}`);
    }

    // MANDATORY URL CHECK
    if (!finalRegFormUrl) {
      console.error(`❌ Registration rejected: Missing registration_form_url`);
      throw new Error("Team Authorization Form is mandatory. Please upload a file or provide a valid link.");
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Check for mandatory fields and trim data
    // ═══════════════════════════════════════════════════════════════
    const team_name = (data.team_name || "").trim();
    const college_name = (data.college_name || "").trim();
    const leader_email = (data.leader_email || "").trim();
    const leader_name = (data.leader_name || "").trim();
    const leader_contact = (data.leader_contact || data.leader_phone || "").trim();
    const domain = (data.domain || data.selected_domain || "").trim();
    const problem_statement_id = (data.problem_statement_id || data.selected_problem_id || "").trim();

    if (!team_name || !college_name || !leader_email || !leader_name || !domain || !problem_statement_id) {
       console.error(`❌ Missing mandatory fields:`, { team_name, college_name, leader_email, domain });
       throw new Error("Missing mandatory registration information. Please fill all required fields.");
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Check for duplicate registration
    // ═══════════════════════════════════════════════════════════════
    const { data: existing } = await db
      .from(table)
      .select(idColumn)
      .eq("institute_number", data.institute_number?.trim() || "")
      .ilike("college_name", college_name)
      .limit(1);

    if (existing && existing.length > 0) {
      const existingId = (existing[0] as any)[idColumn];
      return new Response(
        JSON.stringify({ error: `This team is already registered with ID: ${existingId}` }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Generate team ID (find highest existing ID and increment)
    // ═══════════════════════════════════════════════════════════════
    let generatedId = `KBT-0001`;

    // Query for highest existing team_id
    const { data: existingIds, error: idError } = await db
      .from(table)
      .select(idColumn)
      .order(idColumn, { ascending: false })
      .limit(1);

    if (!idError && existingIds && existingIds.length > 0) {
      const highestId = (existingIds[0] as any)[idColumn];
      // Extract number from KBT-XXXX format
      const match = highestId?.match(/KBT-(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1]) + 1;
        generatedId = `KBT-${nextNum.toString().padStart(4, "0")}`;
      }
    } else if (idError) {
      console.warn(`⚠️ Warning querying existing IDs: ${idError.message}`);
      // Use timestamp-based fallback ID if query fails
      generatedId = `KBT-${Date.now().toString().slice(-4)}`;
    }

    console.log(`📝 Generated Team ID: ${generatedId}`);

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Prepare registration data (matching actual table schema)
    // ═══════════════════════════════════════════════════════════════
    const membersArray = data.members || [];
    
    // Ensure company_name column exists
    try {
      await db.rpc("execute_sql", { sql_query: `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS company_name TEXT;` });
    } catch (e) {
      console.warn("⚠️ Could not add company_name column via RPC, it might already exist or RPC is missing");
    }

    // Build members JSON for the members JSONB column
    const membersJson = membersArray.map((member: any) => ({
      name: (member.name || "").trim(),
      email: (member.email || "").trim(),
      contact: (member.contact || "").trim(),
    }));

    const registrationData: any = {
      team_name: team_name,
      college_name: college_name,
      institute_number: data.institute_number?.trim() || "000000",
      leader_name: leader_name,
      leader_email: leader_email,
      leader_contact: leader_contact,
      domain: domain,
      problem_statement_id: problem_statement_id,
      problem_statement_uuid: data.problem_statement_uuid || null,
      problem_statement_title: data.problem_statement_title || "Unknown Problem",
      problem_description: data.problem_description || "No description",
      company_name: data.company_name || "N/A",
      mentor_name: data.mentor_name?.trim() || "N/A",
      mentor_email: data.mentor_email?.trim() || "N/A",
      mentor_contact: data.mentor_contact?.trim() || "N/A",
      registration_form_url: finalRegFormUrl,
      registration_id: generatedId,
      team_id: generatedId,
      members: membersJson,
      city: data.city || null,
      state: data.state || null,
      member_contacts: membersArray.map((m: any) => (m.contact || "").trim()),
      status: "registered",
    };

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Save to database (with retry logic for duplicate IDs)
    // ═══════════════════════════════════════════════════════════════
    let finalTeamId = generatedId;
    let insertAttempt = 0;
    let dbResult = null;

    // Retry up to 3 times if we get duplicate key errors
    while (insertAttempt < 3) {
      insertAttempt++;
      registrationData.team_id = finalTeamId;
      registrationData.registration_id = finalTeamId;

      console.log(`📍 Attempting insert #${insertAttempt} with team_id: ${finalTeamId}`);
      console.log(`📦 Table: ${table}`);
      console.log(`📦 Number of fields: ${Object.keys(registrationData).length}`);

      // Insert to database
      const { data: insertData, error: err } = await db
        .from(table)
        .insert([registrationData])
        .select(`team_name, ${idColumn}`)
        .single();

      if (!err) {
        // Success!
        dbResult = insertData;
        console.log(`✅ Successfully inserted with team_id: ${finalTeamId}`);
        console.log(`✅ Inserted data:`, JSON.stringify(insertData));
        break;
      } else if (err.code === "23505" && insertAttempt < 3) {
        // Duplicate key - try next ID
        console.warn(`⚠️ Duplicate key error (code 23505), trying next ID...`);
        const match = finalTeamId.match(/KBT-(\d+)/);
        if (match) {
          const nextNum = parseInt(match[1]) + 1;
          finalTeamId = `KBT-${nextNum.toString().padStart(4, "0")}`;
          console.log(`⚠️ Retrying with new ID: ${finalTeamId}`);
          continue;
        }
      }

      // Other error - don't retry, throw immediately
      console.error(`❌ Insert failed (attempt ${insertAttempt}): ${err.message}`);
      console.error(`❌ Error code: ${err.code}`);
      console.error(`❌ Error hint: ${err.hint}`);
      console.error(`❌ Full error details:`);
      console.error(JSON.stringify(err, null, 2));
      throw new Error(`Database insert error: ${err.message} (Code: ${err.code})`);
    }

    const teamId = finalTeamId;

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

    // Log activity
    const { error: logError } = await db
      .from("activity_logs")
      .insert(logEntry);

    if (logError) {
      console.error(`⚠️ Log error: ${logError.message}`);
    }

    console.log(`✅ Logged registration for team ${teamId}`);
    
    // ═══════════════════════════════════════════════════════════════
    // STEP 6.5: Increment problem statement count
    // ═══════════════════════════════════════════════════════════════
    try {
      if (problem_statement_id) {
        console.log(`📈 Incrementing count for problem: ${problem_statement_id}`);
        // Use RPC or direct update with arithmetic
        // Since we are in the edge function with service role, we can do this easily
        await db.rpc("increment_problem_count", { prob_id: problem_statement_id });
        
        // Fallback if RPC doesn't exist: Direct update (less atomic but works)
        /*
        const { data: prob } = await db.from('problem_statements').select('selected_by_count').eq('id', problem_statement_id).single();
        await db.from('problem_statements').update({ selected_by_count: (prob?.selected_by_count || 0) + 1 }).eq('id', problem_statement_id);
        */
      }
    } catch (countErr: any) {
      console.warn(`⚠️ Could not increment problem count: ${countErr.message}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 7: Send confirmation email (non-blocking)
    // ═══════════════════════════════════════════════════════════════
    const sendRegistrationEmail = async () => {
      console.log("📧 Starting email send process...");
      const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
      const gmailUser = "kbtavinyathon@gmail.com";

      console.log(`📧 Gmail config: user=${gmailUser}, hasPassword=${!!gmailAppPassword}`);

      if (!gmailAppPassword) {
        console.error("⚠️ GMAIL_APP_PASSWORD not set - skipping email");
        return;
      }

      try {
        console.log(`📧 Sending email to: ${data.leader_email}`);
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
        Institute ID: ${data.institute_number || "N/A"}<br>
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
      <p>KBTCOE Engineering College, Nashik<br>
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
        console.error(`❌ Email send failed | Error: ${emailError.message} | Code: ${emailError.code || 'unknown'}`);
        console.error(`Email error details: ${JSON.stringify(emailError)}`);
        throw emailError;
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
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error(`❌ Registration error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: "Registration failed. Please check your connection and try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
