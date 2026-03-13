import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  console.log(`🚀 Request: ${req.method} ${req.url}`);
  const contentType = req.headers.get("content-type") || "";
  console.log(`📝 Content-Type: ${contentType}`);

  try {
    const primaryUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const primaryKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!primaryUrl || !primaryKey) {
      console.error("❌ Missing Supabase environment variables");
      throw new Error("Server configuration error: missing credentials");
    }

    const supabase = createClient(primaryUrl, primaryKey);
    const isExternal = primaryUrl.includes("lxawemydhhmqjahttrlb");
    const primaryRegTable = isExternal ? "team_registrations" : "registered_teams";
    const primarySolTable = isExternal ? "team_solutions" : "submissions";
    const regIdCol = isExternal ? "registration_id" : "team_id";
    const probTitleCol = isExternal ? "problem_statement_title" : "selected_problem_id";

    // ── 2. Handle JSON Requests (Validation) ──
    if (contentType.includes("application/json")) {
      let body;
      const rawBody = await req.text();
      console.log(`📥 Received JSON body (len: ${rawBody.length}): "${rawBody.substring(0, 100)}..."`);
      
      try {
        body = JSON.parse(rawBody);
      } catch (e: any) {
        console.error("❌ Malformed JSON received. Error:", e.message);
        console.error("❌ Full raw body for debugging:", rawBody);
        return new Response(JSON.stringify({ 
          error: "Invalid request data format.",
          details: e.message 
        }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      const { team_id, college_name, institute_number, action } = body;

      if (action === "validate") {
        if (!team_id) throw new Error("Team ID is required for validation");

        console.log("🔍 Searching for team with:", {
          table: primaryRegTable,
          idCol: regIdCol,
          idVal: team_id.trim(),
          collegeVal: college_name?.trim(),
          instVal: institute_number?.trim()
        });

        const { data: team, error: findError } = await supabase
          .from(primaryRegTable)
          .select(`${regIdCol}, team_name, college_name, institute_number, leader_email, ${probTitleCol}`)
          .eq(regIdCol, team_id.trim())
          .ilike("college_name", `%${college_name?.trim() || ""}%`)
          .eq("institute_number", institute_number?.trim() || "")
          .maybeSingle();

        if (findError) {
          console.error("❌ Database query error:", findError);
          return new Response(JSON.stringify({ error: "Database error during verification." }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        if (!team) {
          console.log("❌ Team verification failed. No match found for:", team_id);
          return new Response(JSON.stringify({ error: "Invalid Team ID, College Name, or Institute Number." }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        console.log("✅ Team found:", team);

        let problemStatement = (team as any)[probTitleCol] || "General Problem";
        // If it's the internal project and we have an ID, fetch the title
        if (!isExternal && team.selected_problem_id) {
          const { data: prob } = await supabase.from("problem_statements").select("problem_title").eq("id", team.selected_problem_id).maybeSingle();
          if (prob) problemStatement = prob.problem_title;
        }

        console.log("✅ Team verified successfully");
        return new Response(JSON.stringify({ 
          success: true, 
          team_name: team.team_name,
          problem_statement: problemStatement
        }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ── 3. Handle Multipart Requests (Submission) ──
    if (contentType.includes("multipart/form-data")) {
      console.log("📤 Parsing multipart form data...");
      const formData = await req.formData();
      
      const teamId = formData.get("team_id") as string;
      const college = formData.get("college_name") as string;
      const instId = formData.get("institute_number") as string;
      const youtubeLink = formData.get("youtube_link") as string;
      const description = formData.get("description") as string;
      const pdfFile = formData.get("solution_file") as File;

      console.log("📦 Received fields:", { teamId, youtubeLink, hasFile: !!pdfFile });

      if (!teamId || !youtubeLink || !pdfFile) {
        console.error("❌ Rejected: Missing fields", { teamId, youtubeLink, hasFile: !!pdfFile });
        return new Response(JSON.stringify({ 
          error: "Team ID, YouTube video link, and solution PDF are all required for submission." 
        }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // ── Step A: Secondary Verification ──
      const { data: teamCheck } = await supabase
        .from(primaryRegTable)
        .select(`${regIdCol}, team_name, leader_email`)
        .eq(regIdCol, teamId)
        .ilike("college_name", `%${college || ""}%`)
        .eq("institute_number", instId || "")
        .maybeSingle();

      if (!teamCheck) {
        return new Response(JSON.stringify({ error: "Authentication failed. Details do not match registration." }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // ── Step B: Storage Upload ──
      const fileName = `${teamId}-${Date.now()}.pdf`;
      const fileBuffer = await pdfFile.arrayBuffer();

      console.log(`📤 Uploading file: ${fileName}`);
      const { error: uploadError } = await supabase.storage.from("solutions").upload(fileName, fileBuffer, { contentType: "application/pdf" });
      if (uploadError) {
        console.error("❌ Storage error:", uploadError);
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // ── Step C: Database Insert ──
      const insertData = isExternal ? {
        registration_id: teamId, 
        solution_title: `Solution by ${teamId}`, 
        solution_description: description || "N/A", 
        github_link: "N/A", 
        video_link: youtubeLink, 
        solution_pdf_url: fileName, 
        status: "submitted"
      } : {
        team_id: teamId, 
        description: description || "N/A", 
        youtube_link: youtubeLink, 
        solution_pdf_url: fileName, 
        status: "pending"
      };

      console.log(`📝 Inserting into ${primarySolTable}`);
      const { data: result, error: insertError } = await supabase.from(primarySolTable).insert(insertData).select("id").single();
      if (insertError) {
        console.error("❌ Insert error:", insertError);
        throw insertError;
      }

      // ── Step D: Background Work (Dual Sync & Email) ──
      const dualSyncAndEmail = async () => {
        try {
          const extKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("EXTERNAL_SUPABASE_ANON_KEY");
          const gmailPass = Deno.env.get("GMAIL_APP_PASSWORD");
          const gmailUser = "kbtavinyathon@gmail.com";

          if (extKey) {
            const otherUrl = isExternal ? "https://wunqjksrgdppzcucwcyd.supabase.co" : "https://lxawemydhhmqjahttrlb.supabase.co";
            const otherClient = createClient(otherUrl, extKey);
            
            await otherClient.storage.from("solutions").upload(fileName, fileBuffer, { contentType: "application/pdf" });
            
            const otherTable = isExternal ? "submissions" : "team_solutions";
            const syncData = isExternal ? {
              team_id: teamId, description: description || "N/A", youtube_link: youtubeLink, solution_pdf_url: fileName, status: "pending"
            } : {
              registration_id: teamId, solution_title: `Solution by ${teamId}`, solution_description: description || "N/A", github_link: "N/A", video_link: youtubeLink, solution_pdf_url: fileName, status: "submitted"
            };
            await otherClient.from(otherTable).insert(syncData);
          }

          if (gmailPass && teamCheck.leader_email) {
            const transporter = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: gmailUser, pass: gmailPass } });
            await transporter.sendMail({
              from: `"KBT Avinyathon 2026" <${gmailUser}>`,
              to: teamCheck.leader_email,
              subject: `Solution Submitted Successfully – Team: ${teamCheck.team_name}`,
              html: `<div style="font-family: sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background: #1e293b; color: white; padding: 20px; text-align: center;"><h2>SUBMISSION CONFIRMED</h2></div>
                <div style="padding: 20px; line-height: 1.6;">
                  <p>Congratulations <b>${teamCheck.team_name}</b>,</p>
                  <p>Your solution for <b>KBT Avinyathon 2026</b> has been successfully uploaded.</p>
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 13px; color: #64748b;">TEAM ID: <b style="color: #2563eb;">${teamId}</b></p>
                    <p style="margin: 5px 0 0; font-size: 13px; color: #64748b;">PDF FILE: <b>${fileName}</b></p>
                  </div>
                  <p>Our judges will review your submission soon. Good luck!</p>
                </div>
                <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">KBT College of Engineering, Nashik</div>
              </div>`
            });
          }
        } catch (bgError) {
          console.error("⚠️ Background work warning:", bgError);
        }
      };

      if ((globalThis as any).EdgeRuntime) { (globalThis as any).EdgeRuntime.waitUntil(dualSyncAndEmail()); }
      else { dualSyncAndEmail(); }

      console.log("✅ Final success response sent");
      return new Response(JSON.stringify({ success: true, submission_id: result.id }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unsupported request format." }), { status: 415, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("❌ Submission error detail:", error);
    // Sanitize user message for security
    return new Response(JSON.stringify({ error: "Submission failed. Please try again later." }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
