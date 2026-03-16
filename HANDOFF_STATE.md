# Safe Harbor Credentialing — Handoff State
**Saved:** 2026-03-16
**Branch:** main
**Latest commit:** (pending — role-based access control)

---

## Current Status: CODE COMPLETE — Needs Manual Supabase Step

Role-based access control has been implemented and the build passes. One manual step remains before testing.

---

## What Was Just Done

### Role-Based Access Control (Admin vs Clinician)
**Problem:** Any authenticated user could access admin pages. Clinicians invited via the dashboard could navigate to `/admin` and see everything.

**Solution:** Uses Supabase `app_metadata.role` to distinguish "admin" from "clinician" users. This is secure — only the service role key can set `app_metadata`, users cannot change it themselves.

**Files changed:**
- `src/app/api/admin/invite/route.ts` — Now accepts a `role` field ("clinician" or "admin", defaults to "clinician"). After inviting, sets `app_metadata.role` via `admin.updateUserById()`.
- `src/lib/supabase/middleware.ts` — Checks `user.app_metadata.role`. If a non-admin user tries to access `/admin/*`, they get redirected to `/clinician`.
- `src/components/admin/InviteUserButton.tsx` — Added a dropdown selector (Clinician / Admin) so admins can choose what type of user they're inviting.

### Previous Session: Welcome Email + Email Fixes
- Fixed `initSendGrid()` to not require `ADMIN_EMAIL` for welcome emails
- Added `sendWelcomeEmail()` function in `src/lib/email.ts`
- Invite API fires welcome email after successful invite
- Fixed Supabase Site URL from localhost to production URL

---

## MANUAL STEP REQUIRED (before testing)

**Set your admin role in Supabase:**
1. Go to Supabase Dashboard → Authentication → Users
2. Click on your user (ajames@safeharborbehavioralhealth.com)
3. Edit the `app_metadata` field to: `{ "role": "admin" }`
4. Save

Without this step, the middleware won't recognize you as an admin (users without a role are allowed through for backward compatibility).

---

## Live URL
**Production:** https://safe-harbor-credential-app.vercel.app
**GitHub:** https://github.com/awjames6875/safe-harbor-credential-app

---

## How to Test After Manual Step

1. Log in as admin at `/login` → should access `/admin` normally
2. Click "Invite User" → notice the new Clinician/Admin dropdown
3. Invite a test email as "Clinician" → that user should NOT be able to access `/admin`
4. Invite a test email as "Admin" → that user SHOULD be able to access `/admin`

---

## Environment Variables (required in Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
SENDGRID_API_KEY=SG....
ADMIN_EMAIL=ajames@safeharborbehavioralhealth.com
NEXT_PUBLIC_APP_URL=https://safe-harbor-credential-app.vercel.app
```

---

## Supabase Configuration Checklist
- [x] Site URL set to `https://safe-harbor-credential-app.vercel.app`
- [x] Redirect URLs includes `https://safe-harbor-credential-app.vercel.app/**`
- [ ] Your user's `app_metadata` set to `{ "role": "admin" }`

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | `requireUser()` — checks auth, redirects to `/login` |
| `src/lib/supabase/admin.ts` | `createAdminClient()` — service role client |
| `src/lib/supabase/middleware.ts` | Route protection + role enforcement |
| `src/lib/email.ts` | SendGrid email functions (welcome, notification, digest) |
| `src/app/api/admin/invite/route.ts` | POST → invites user, sets role in app_metadata |
| `src/components/admin/InviteUserButton.tsx` | Invite form with role selector |

---

## Recent Commit History

```
(pending)  Add role-based access control: admin vs clinician
58ff9b2  Fix welcome email: don't require ADMIN_EMAIL to send SendGrid emails
1bb5ac2  Send welcome email with instructions when inviting a user
f36e476  Add handoff state document
581e5ba  Fix build error: rename getUser to requireUser in API routes
f0f33e6  Add forgot password to clinician login page
```
