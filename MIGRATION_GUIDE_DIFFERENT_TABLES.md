## 🚀 MIGRATION GUIDE - Different Databases, Different Tables!

⚠️ **IMPORTANT:** Each database uses DIFFERENT table names!

---

# TABLE NAMES MAPPING

| Object | Lovable DB | External DB |
|--------|-----------|------------|
| **URL** | wunqjksrgdppzcucwcyd | lxawemydhhmqjahttrlb |
| **Registration** | `registered_teams` | `team_registrations` |
| **Submission** | `submissions` | `team_solutions` |

---

# MIGRATION STEP 1: LOVABLE DATABASE

**URL:** https://app.supabase.com/project/wunqjksrgdppzcucwcyd/sql

### Copy & Paste This SQL Code:

```sql
-- ===== LOVABLE DATABASE MIGRATIONS =====
-- Table: registered_teams

-- Add missing columns to registered_teams
ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS registration_form_url text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member2_contact text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member3_contact text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member4_contact text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member5_name text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member5_email text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member5_contact text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS member5_role text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE public.registered_teams
ADD COLUMN IF NOT EXISTS state text;

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  action text NOT NULL,
  team_id text NOT NULL,
  user_email text,
  details jsonb,
  status text NOT NULL DEFAULT 'success',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log activity"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Activity logs are viewable"
  ON public.activity_logs FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_activity_logs_team_id ON public.activity_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp);

ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.activity_logs;
```

### Steps:
1. ✅ Go to https://app.supabase.com/project/wunqjksrgdppzcucwcyd (Lovable)
2. ✅ Find **SQL Editor** (left sidebar)
3. ✅ Click **+ New Query**
4. ✅ Paste the SQL code above
5. ✅ Click **Run** button
6. ✅ Wait for "Query succeeded" message

---

# MIGRATION STEP 2: EXTERNAL DATABASE

**URL:** https://app.supabase.com/project/lxawemydhhmqjahttrlb/sql

### Copy & Paste This SQL Code:

```sql
-- ===== EXTERNAL DATABASE MIGRATIONS =====
-- Tables: team_registrations, team_solutions

-- Add missing columns to team_registrations (DIFFERENT TABLE NAME!)
ALTER TABLE public.team_registrations
ADD COLUMN IF NOT EXISTS registration_form_url text;

ALTER TABLE public.team_registrations
ADD COLUMN IF NOT EXISTS member2_contact text;

ALTER TABLE public.team_registrations
ADD COLUMN IF NOT EXISTS member3_contact text;

ALTER TABLE public.team_registrations
ADD COLUMN IF NOT EXISTS member4_contact text;

ALTER TABLE public.team_registrations
ADD COLUMN IF NOT EXISTS member5_name text;

ALTER TABLE public.team_registrations
ADD COLUMN IF NOT EXISTS member5_email text;

ALTER TABLE public.team_registrations
ADD COLUMN IF NOT EXISTS member5_contact text;

ALTER TABLE public.team_registrations
ADD COLUMN IF NOT EXISTS member5_role text;

ALTER TABLE public.team_registrations
ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE public.team_registrations
ADD COLUMN IF NOT EXISTS state text;

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  action text NOT NULL,
  team_id text NOT NULL,
  user_email text,
  details jsonb,
  status text NOT NULL DEFAULT 'success',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log activity"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Activity logs are viewable"
  ON public.activity_logs FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_activity_logs_team_id ON public.activity_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp);

ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.activity_logs;
```

### Steps:
1. ✅ Go to https://app.supabase.com/project/lxawemydhhmqjahttrlb (External)
2. ✅ Find **SQL Editor** (left sidebar)
3. ✅ Click **+ New Query**
4. ✅ Paste the SQL code above
5. ✅ Click **Run** button
6. ✅ Wait for "Query succeeded" message

---

# VERIFY MIGRATIONS WORKED

After running migrations, execute these queries to verify:

### For LOVABLE Database:
```sql
-- Check registered_teams table columns
\d public.registered_teams

-- Check activity_logs table exists
SELECT COUNT(*) as activity_logs_count FROM public.activity_logs;

-- Should show: 0 rows (empty table is good)
```

### For EXTERNAL Database:
```sql
-- Check team_registrations table columns
\d public.team_registrations

-- Check activity_logs table exists
SELECT COUNT(*) as activity_logs_count FROM public.activity_logs;

-- Should show: 0 rows (empty table is good)
```

---

# STEP 2: TEST THE SYSTEM

### Test Registration

1. **Go to:** http://localhost:5173/register (or your live domain)
2. **Fill out form:**
   - Team Name: "Test Team 1"
   - College: "KBTCOE Nashik"
   - Institute Number: "INST001"
   - Leader Name: "John Doe"
   - Leader Email: "test@example.com"
   - Leader Phone: "9876543210"
3. **Add 2 members** with dummy data
4. **Select domain and problem**
5. **Add mentor info**
6. **Upload registration PDF** (any PDF file)
7. **Click Submit**

### Expected Results:
```
✅ See "Registration successful" message with Team ID (KBT-XXXX)
✅ Email received at test@example.com
✅ Data appears in both databases
✅ Entry in activity_logs
```

### Verify in Database:

**Lovable Database:**
```sql
SELECT team_id, team_name, college_name, leader_email 
FROM public.registered_teams 
ORDER BY created_at DESC LIMIT 1;

SELECT action, team_id, user_email, status 
FROM public.activity_logs 
WHERE action = 'registration' 
ORDER BY timestamp DESC LIMIT 1;
```

**External Database:**
```sql
SELECT team_id, team_name, college_name, leader_email 
FROM public.team_registrations 
ORDER BY created_at DESC LIMIT 1;

SELECT action, team_id, user_email, status 
FROM public.activity_logs 
WHERE action = 'registration' 
ORDER BY timestamp DESC LIMIT 1;
```

---

# STEP 3: TEST SOLUTION SUBMISSION

### Test Submission

1. **Go to:** http://localhost:5173/submit-solution
2. **Enter credentials:**
   - Team ID: "KBT-XXXX" (from registration)
   - College: "KBTCOE Nashik"
   - Institute Number: "INST001"
3. **Click Validate** - Should show team name
4. **Fill submission:**
   - YouTube Link: "https://www.youtube.com/watch?v=test"
   - Description: "Test solution"
5. **Upload solution PDF**
6. **Click Submit**

### Expected Results:
```
✅ See "Solution submitted successfully" message
✅ Email received at leader email
✅ Data appears in both databases
✅ Entry in activity_logs with action='solution_submission'
```

### Verify in Database:

**Lovable Database:**
```sql
SELECT team_id, youtube_link, status 
FROM public.submissions 
ORDER BY submitted_at DESC LIMIT 1;

SELECT action, team_id, user_email, status 
FROM public.activity_logs 
WHERE action = 'solution_submission' 
ORDER BY timestamp DESC LIMIT 1;
```

**External Database:**
```sql
SELECT team_id, youtube_link, status 
FROM public.team_solutions 
ORDER BY submitted_at DESC LIMIT 1;

SELECT action, team_id, user_email, status 
FROM public.activity_logs 
WHERE action = 'solution_submission' 
ORDER BY timestamp DESC LIMIT 1;
```

---

# STEP 4: MONITOR FOR ISSUES

### Check Edge Function Logs

**Lovable:**
1. Go to: https://app.supabase.com/project/wunqjksrgdppzcucwcyd
2. Left sidebar → **Edge Functions**
3. Select **register-team** or **submit-solution**
4. Click **Logs** tab
5. Look for errors (red) or warnings (yellow)

**External:**
1. Go to: https://app.supabase.com/project/lxawemydhhmqjahttrlb
2. Left sidebar → **Edge Functions**
3. Select **register-team** or **submit-solution**
4. Click **Logs** tab

### Common Issues & Fixes

| Issue | Check | Fix |
|-------|-------|-----|
| "Registration failed" | Edge function logs | Check migrations ran successfully |
| Data only in one DB | Check secondary DB migration | Re-run migration for External DB |
| Email not received | Check GMAIL_APP_PASSWORD set | Set in Netlify environment |
| activity_logs empty | Check table created | Re-run activity_logs migration |

### Query Activity History

```sql
-- View all registrations
SELECT team_id, team_name, created_at FROM activity_logs 
WHERE action = 'registration' 
ORDER BY created_at DESC;

-- View all submissions
SELECT team_id, user_email, created_at FROM activity_logs 
WHERE action = 'solution_submission' 
ORDER BY created_at DESC;

-- View failures
SELECT * FROM activity_logs 
WHERE status = 'failed' 
ORDER BY timestamp DESC;

-- View specific team activity
SELECT * FROM activity_logs 
WHERE team_id = 'KBT-0001' 
ORDER BY timestamp DESC;
```

---

# ⚠️ IMPORTANT NOTES

### Why Different Table Names?
- **Lovable DB** (wunqjksrgdppzcucwcyd) = Original KBT schema
  - Uses: `registered_teams`, `submissions`
  
- **External DB** (lxawemydhhmqjahttrlb) = Different schema
  - Uses: `team_registrations`, `team_solutions`

### Edge Functions Handle This Automatically
The edge functions already have the logic to:
1. Detect which DB primary is (Lovable)
2. Sync to both databases with correct table names
3. Log to activity_logs in both

**You don't need to change edge functions - they're already configured!**

---

# ✅ CHECKLIST

- [ ] Run Lovable migrations (registered_teams + activity_logs)
- [ ] Run External migrations (team_registrations + activity_logs)
- [ ] Test registration on local/live site
- [ ] Check email received
- [ ] Verify data in both databases
- [ ] Test solution submission
- [ ] Check activity_logs on both DBs
- [ ] Review edge function logs for errors
- [ ] Update DEPLOYMENT_CHECKLIST.md with results

---

**Next:** Run these migrations and test! Let me know if you see any errors.
