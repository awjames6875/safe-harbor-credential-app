# Safe Harbor Credentialing - Phase 3 Plan

## Goal
Implement remaining Phase 3 PRD features: multi-admin support and re-credentialing reminders.

---

## Task 12: Multi-Admin Support (Invite Team Members)
**Problem:** Currently any Supabase Auth user is an admin. No way to invite new team members from within the app.

- [x] 12a. Create `src/app/admin/settings/page.tsx` - Settings page with "Team Members" section showing current users and invite form
- [x] 12b. Create `src/app/api/admin/invite/route.ts` - POST endpoint that uses Supabase Auth admin API to invite a user by email (sends magic link)
- [x] 12c. Create `src/app/api/admin/team/route.ts` - GET endpoint listing all auth users (via Supabase admin `listUsers`)
- [x] 12d. Add "Settings" nav link to Sidebar.tsx
- [x] 12e. Add activity logging: when an admin makes changes (status updates, follow-ups), record who did it

## Task 13: Re-Credentialing Reminders (3-Year Cycle)
**Problem:** Payer credentialing must be renewed every 3 years. No tracking or alerts exist for this.

- [x] 13a. Add migration SQL: `ALTER TABLE payer_applications ADD COLUMN recredentialing_due DATE`
- [x] 13b. Update alerts.ts - Add re-credentialing checks (warning at 180 days, critical at 60 days before due date)
- [x] 13c. Update PayerTable.tsx - Show recredentialing_due column with red/amber color coding
- [x] 13d. Update payer PUT API - When status changes to "Approved"/"Active", auto-set recredentialing_due = approval_date + 3 years
- [x] 13e. Update admin/page.tsx - Include recredentialing_due in query, pass payerApps to calculateAlerts()
- [x] 13f. Update admin/tracker/page.tsx - Include recredentialing_due in mapped data for PayerTable

---

## Verification
After each task: `npm run build` to verify no errors.

## Review

### Task 13: Re-Credentialing Reminders
**Changes made:**
1. **Migration file** (`supabase/migrations/20260312_add_recredentialing.sql`) - Documents the schema change to add `recredentialing_due` column
2. **alerts.ts** - Added `PayerAppRow` interface and re-credentialing alert logic: critical at <=60 days, warning at <=180 days, overdue if past due
3. **PayerTable.tsx** - Added `recredentialing_due` to interface, new "Re-cred Due" column with red (<=60 days) and amber (<=180 days) color coding
4. **payer/[id]/route.ts** - Auto-calculates `recredentialing_due` as approval_date + 3 years when status is set to "Approved" or "Active"
5. **admin/page.tsx** - Updated Supabase query to fetch `recredentialing_due`, `payer_name`, `id`; passes payerApps to `calculateAlerts()`
6. **admin/tracker/page.tsx** - Maps `recredentialing_due` field to PayerTable component
