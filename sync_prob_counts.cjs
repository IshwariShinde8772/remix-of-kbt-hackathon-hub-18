const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = 'https://lxawemydhhmqjahttrlb.supabase.co';
// Use Service Role Key to bypass RLS and actually update the database
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YXdlbXlkaGhtcWphaHR0cmxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk3MDcwMywiZXhwIjoyMDg0NTQ2NzAzfQ.8lpW26X2YtAtvvImtcGP7Iw_tcwMPBVTBIygbCBYatM';
const supabase = createClient(url, key);

async function checkAndFixCounts() {
  console.log('--- Fetching Problem Statements ---');
  const { data: problems, error: probError } = await supabase
    .from('problem_statements')
    .select('id, problem_title, selected_by_count');

  if (probError) {
    console.error('Error fetching problems:', probError);
    return;
  }

  // Hardcoded manual mappings for corrupted/mismatched data
  const manualMappings = {
    // team_name (optional) or current_registration_title -> target_problem_id
    'Earthy Hues Digital Printer for All Natural Fabrics': '13bd89c8-ff99-419a-bb42-12e68e24f71c',
    'Draping app': '3ae7cc41-44fa-4db2-b305-d94f8fec94f6', // Virtual Saree Draping
  };

  console.log('--- Fetching Team Registrations ---');
  const { data: registrations, error: regError } = await supabase
    .from('team_registrations')
    .select('problem_statement_id, problem_statement_title');

  if (regError) {
    console.error('Error fetching registrations:', regError);
    return;
  }

  // Load title mapping
  let titleMappingContent = fs.readFileSync('title_mapping.json', 'utf16le');
  if (titleMappingContent.startsWith('\uFEFF')) {
      titleMappingContent = titleMappingContent.slice(1);
  }
  const titleMapping = JSON.parse(titleMappingContent);

  // Utility to normalize
  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  
  // A second normalization that just handles basic whitespace/case
  const normalizeSimple = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

  // Create lookup maps
  const problemMap = new Map(); // id -> problem
  const titleMapByNormalizedCurrentTitle = new Map(); // normalizedTitle -> problem
  
  problems.forEach(p => {
    problemMap.set(p.id, p);
    titleMapByNormalizedCurrentTitle.set(normalize(p.problem_title), p);
  });

  // Calculate actual counts
  const actualCounts = new Map();
  registrations.forEach(r => {
    let matchedProblem = null;
    
    // 0. Try manual mapping first
    if (r.problem_statement_title && manualMappings[r.problem_statement_title.trim()]) {
         matchedProblem = problemMap.get(manualMappings[r.problem_statement_title.trim()]);
    }
    
    // 1. Try matching by ID first
    if (!matchedProblem && r.problem_statement_id && problemMap.has(r.problem_statement_id)) {
      matchedProblem = problemMap.get(r.problem_statement_id);
    } 
    // 2. Try matching by Title (after normalization)
    else if (!matchedProblem && r.problem_statement_title) {
      const origTitle = r.problem_statement_title;
      const normalizedOrigTitle = normalize(origTitle);
      
      // Look up in title mapping first
      const mappedTitle = titleMapping[origTitle.toLowerCase().trim()];
      if (mappedTitle) {
        matchedProblem = titleMapByNormalizedCurrentTitle.get(normalize(mappedTitle));
      } else if (titleMapByNormalizedCurrentTitle.has(normalizedOrigTitle)) {
        matchedProblem = titleMapByNormalizedCurrentTitle.get(normalizedOrigTitle);
      } else {
         // Fallback: try partial matching (most lenient)
         const simpleTitle = normalizeSimple(origTitle);
         matchedProblem = problems.find(p => {
             const pSimple = normalizeSimple(p.problem_title);
             return pSimple.includes(simpleTitle) || simpleTitle.includes(pSimple);
         });
      }
    }

    if (matchedProblem) {
      const current = actualCounts.get(matchedProblem.id) || 0;
      actualCounts.set(matchedProblem.id, current + 1);
    } else {
      console.warn(`Could not match registration: ID=${r.problem_statement_id}, Title="${r.problem_statement_title}"`);
    }
  });

  // Compare and Fix
  console.log('\n--- Syncing Counts ---');
  for (const prob of problems) {
    const actual = actualCounts.get(prob.id) || 0;
    const currentDB = prob.selected_by_count || 0;

    if (actual !== currentDB) {
      console.log(`Updating "${prob.problem_title.substring(0, 30)}...": ${currentDB} -> ${actual}`);
      const { error: updateError, count } = await supabase
        .from('problem_statements')
        .update({ selected_by_count: actual }, { count: 'exact' })
        .eq('id', prob.id);
      
      if (updateError) {
        console.error(`❌ Error updating count for ${prob.id} (${prob.problem_title}):`, updateError.message || updateError);
      } else {
        console.log(`✅ Updated "${prob.problem_title.substring(0, 30)}...": ${currentDB} -> ${actual}. Affected: ${count}`);
      }
    }
  }

  console.log('\n--- Final Verification ---');
  const { data: verifyData } = await supabase.from('problem_statements').select('selected_by_count');
  const total = verifyData.reduce((sum, p) => sum + (p.selected_by_count || 0), 0);
  console.log(`Total selected_by_count sum in DB now: ${total}`);

  console.log('\n✅ Counts synchronization finished.');
}

checkAndFixCounts();
