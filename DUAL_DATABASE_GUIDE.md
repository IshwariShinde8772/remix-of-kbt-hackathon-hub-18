# Dual Database Architecture & Logging System

## Overview

The KBT Avinyathon platform now uses a **dual-database architecture** with centralized logging and automated email notifications.

### Databases
- **Lovable DB (Primary)**: `https://wunqjksrgdppzcucwcyd.supabase.co` - Main database
- **External DB (Secondary)**: `https://lxawemydhhmqjahttrlb.supabase.co` - Backup/sync database

## How It Works

### 1. Team Registration Flow

```
User Submitted Form
    ↓
[register-team edge function]
    ↓
├─ Upload registration PDF to storage
├─ Generate Team ID (KBT-XXXX)
├─ Save to Lovable Database (PRIMARY)
├─ Sync to External Database (SECONDARY - non-blocking)
├─ Log activity to both databases
└─ Send confirmation email
    ↓
Success Response: {team_id, sync_status}
```

**Key Features:**
- ✅ Data saved to BOTH databases simultaneously
- ✅ Activity logged for audit trail
- ✅ Email sent automatically
- ✅ File uploaded to storage
- ✅ Non-blocking sync - if external DB fails, registration still succeeds

### 2. Solution Submission Flow

```
Team Submitted Solution
    ↓
[submit-solution edge function]
    ↓
├─ Validate team credentials
├─ Upload PDF to storage
├─ Save to Lovable Database (PRIMARY)
├─ Sync to External Database (SECONDARY - non-blocking)
├─ Log activity to both databases
└─ Send confirmation email
    ↓
Success Response: {submission_id, sync_status}
```

**Key Features:**
- ✅ Team authentication verified
- ✅ Solution stored in both databases
- ✅ Complete audit trail maintained
- ✅ Confirmation email with submission details

## Database Tables

### 1. `registered_teams`
Stores team registration data in BOTH databases
```sql
- team_id (text, PRIMARY KEY)
- team_name, college_name, institute_number
- leader_name, leader_email, leader_contact
- member2-5 (name, email, contact, role)
- mentor_name, mentor_email, mentor_contact
- selected_domain, selected_problem_id
- registration_form_url
- registered_at, updated_at
```

### 2. `submissions`
Stores solution submission data in BOTH databases
```sql
- id (uuid, PRIMARY KEY)
- team_id
- youtube_link
- description
- solution_pdf_url
- status (pending/approved/rejected)
- submitted_at
```

### 3. `activity_logs` (NEW)
Audit trail for all actions in BOTH databases
```sql
- id (uuid, PRIMARY KEY)
- timestamp
- action (registration/solution_submission)
- team_id
- user_email
- details (JSON)
- status (success/failed/pending)
```

## Key Improvements

### ✅ Simplified Code
- Removed complex dual-database logic
- Clear, step-by-step process
- Easy to understand and maintain
- Centralized error handling

### ✅ Better Logging
- All actions logged to both databases
- Complete audit trail
- Easy to query activity history
- Tracks what happened, when, and by whom

### ✅ Reliable Email
- Centralized email sending
- Nodemailer with Gmail SMTP
- Professional HTML templates
- Non-blocking (doesn't delay response)
- Detailed logging of send status

### ✅ Data Integrity
- Written to primary database first (guaranteed)
- Synced to secondary database (best effort)
- If sync fails, primary success is maintained
- Clear status response shows sync result

## Environment Setup

### Required Variables (Netlify/Supabase)

```env
# Email Configuration
GMAIL_APP_PASSWORD=your_gmail_app_password

# Supabase Keys (Lovable)
EXTERNAL_SUPABASE_SERVICE_ROLE_KEY=your_lovable_key
EXTERNAL_SUPABASE_ANON_KEY=your_lovable_anon_key

# These can be the same for dual-sync
SUPABASE_SERVICE_ROLE_KEY=your_external_key
```

## API Responses

### Registration Success
```json
{
  "success": true,
  "message": "Registration successful!",
  "team_id": "KBT-0001",
  "synced_to": "both_databases" | "primary_database"
}
```

### Submission Success
```json
{
  "success": true,
  "message": "Solution submitted successfully!",
  "submission_id": "uuid",
  "synced_to": "both_databases" | "primary_database"
}
```

### Activity Logs Query
```sql
-- View all registrations
SELECT * FROM activity_logs WHERE action = 'registration' ORDER BY timestamp DESC;

-- View all submissions
SELECT * FROM activity_logs WHERE action = 'solution_submission' ORDER BY timestamp DESC;

-- View team's activity
SELECT * FROM activity_logs WHERE team_id = 'KBT-0001';

-- View failed operations
SELECT * FROM activity_logs WHERE status = 'failed';
```

## Troubleshooting

### Problem: Data only in one database
**Solution:** Check if the secondary database sync failed. Look at console logs for non-blocking errors. The registration/submission still succeeds even if secondary sync fails.

### Problem: Email not sent
**Check:**
1. Is `GMAIL_APP_PASSWORD` set in environment?
2. Gmail SMTP credentials valid?
3. Check Supabase edge function logs for email errors
4. Email errors are non-blocking - registration still succeeds

### Problem: Missing activity logs
**Check:**
1. Is `activity_logs` table created? Run migrations
2. Are Row Level Security (RLS) policies open for inserts?
3. Check if logs table exists in both databases

### Problem: Team registration showing duplicate
**This is expected behavior** - prevents accidental re-registration
Check `activity_logs` to see original registration timestamp

## Deployment Steps

1. **Pull latest from GitHub**
   ```bash
   git pull origin main
   ```

2. **Apply migrations to both databases**
   - Login to Lovable Supabase Dashboard
   - Go to SQL Editor
   - Run migrations from `supabase/migrations/2026031400*`
   - Repeat for External database

3. **Deploy edge functions**
   - Netlify automatically deploys on GitHub push
   - Or manually trigger: `netlify deploy --prod`

4. **Verify deployments**
   - Test registration: Go to Register Team page
   - Test submission: Go to Submit Solution page
   - Check `activity_logs` table for entries

## File Structure

```
supabase/
├── functions/
│   ├── register-team/index.ts       (Simplified with dual-sync)
│   ├── submit-solution/index.ts     (Simplified with dual-sync)
│   └── _shared/utils.ts             (Shared utilities - optional)
├── migrations/
│   ├── 20260314000000_add_missing_registration_columns.sql
│   └── 20260314000001_create_activity_logs.sql
```

## Benefits of This Architecture

| Aspect | Benefit |
|--------|---------|
| **Redundancy** | If one database fails, data is still in the other |
| **Audit Trail** | Complete history of all actions with timestamps |
| **Performance** | Non-blocking sync doesn't slow down user responses |
| **Reliability** | Email failures don't prevent registration |
| **Maintainability** | Clear, simple code structure |
| **Scalability** | Easy to add more databases or webhooks |

## Future Enhancements

- [ ] SMS notifications for registrations
- [ ] Admin dashboard showing activity logs
- [ ] Auto-backup sync every hour
- [ ] Real-time activity monitoring
- [ ] Export activity logs to CSV
