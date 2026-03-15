# Safe Harbor Credentialing — Handoff State
**Saved:** 2026-03-15
**Branch:** main
**Latest commit:** 581e5ba — Fix build error: rename getUser to requireUser in API routes

---

## Current Status: STABLE — Deploying to Vercel

The app is fully built and functional. The last 2 Vercel deployments had failed due to a TypeScript build error (now fixed and pushed). Vercel should complete a successful deployment within 1–2 minutes of this handoff being saved.

---

## What Was Just Fixed

Two API routes were importing `getUser` from `@/lib/auth`, but that function is named `requireUser`. This caused TypeScript build errors, blocking 2 commits from going live:

- `f0f33e6` — "Forgot password?" added to clinician login page
- `b4532c7` — "Invite User" button added to admin dashboard

**Fix applied in:**
- `src/app/api/admin/follow-ups/route.ts` — `getUser` → `requireUser`
- `src/app/api/admin/payer/[id]/route.ts` — `getUser` → `requireUser`

---

## Live URL
**Production:** https://safe-harbor-credential-app.vercel.app
**GitHub:** https://github.com/awjames6875/safe-harbor-credential-app

---

## App Overview
Full-stack credentialing management tool for Safe Harbor Behavioral Health (Tulsa, OK).
Guides clinic staff through insurance credentialing for behavioral health clinicians.

**Tech stack:** Next.js 15 App Router · TypeScript · Tailwind CSS v4 · Supabase (auth + DB + storage) · shadcn/ui

---

## Key Pages & Routes

| URL | Who sees it | Description |
|-----|-------------|-------------|
| `/` | Public | Landing page |
| `/login` | Admin | Admin sign in (with forgot password) |
| `/clinician/login` | Clinicians | Clinician sign in (with forgot password) |
| `/reset-password` | Anyone | Set new password after reset/invite email |
| `/admin` | Admin | Dashboard — stats, alerts, invite users |
| `/admin/clinicians` | Admin | List of all clinicians |
| `/admin/clinicians/[id]` | Admin | Clinician detail — profile, payer apps, docs |
| `/admin/tracker` | Admin | Payer application tracker with inline edit |
| `/admin/alerts` | Admin | All active alerts grouped by severity |
| `/admin/steps` | Admin | Credentialing step guide (4 phases) |
| `/clinician` | Clinician | Intake form (10 sections) |
| `/clinician/success` | Clinician | Success page with CAQH PDF download |

---

## Auth Flow

### Admin login
1. Go to `/login` → sign in with email/password
2. Forgot password: enter email → check email → click link → `/reset-password`

### Clinician login
1. Admin invites via "Invite User" button on dashboard → Supabase sends magic link email
2. Clinician clicks link → `/reset-password` to set own password → logs in at `/clinician/login`
3. Forgot password: same flow as admin

### Multiple admins
Add users directly in Supabase dashboard (Authentication → Users). No code changes needed.

---

## Environment Variables (required in `.env.local` and Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # for admin invite API
ANTHROPIC_API_KEY=sk-ant-...       # for resume parsing
SENDGRID_API_KEY=SG....            # for email notifications
NEXT_PUBLIC_APP_URL=https://safe-harbor-credential-app.vercel.app
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | `requireUser()` — checks auth, redirects to `/login` if not |
| `src/lib/supabase/admin.ts` | `createAdminClient()` — service role client for invite API |
| `src/lib/supabase/server.ts` | `createClient()` — server-side Supabase client |
| `src/lib/supabase/client.ts` | `createClient()` — browser-side Supabase client |
| `src/lib/alerts.ts` | `calculateAlerts()` — expiry/follow-up alert logic |
| `src/middleware.ts` | Route protection (admin → `/login`, clinician → `/clinician/login`) |
| `src/app/api/admin/invite/route.ts` | POST → invites user by email via Supabase admin API |
| `src/components/admin/InviteUserButton.tsx` | Client component for inline invite form on dashboard |

---

## Database (Supabase)
Tables: `clinicians`, `work_history`, `professional_references`, `disclosures`, `payer_applications`, `follow_ups`, `documents`, `clinic`, `credentialing_steps`

---

## Local Dev Setup

```bash
cd "safe-harbor-credentialing"
npm install
# Create .env.local with credentials above
npm run dev          # → http://localhost:3000
npm run build        # Verify TypeScript before pushing
```

---

## Recent Commit History

```
581e5ba  Fix build error: rename getUser to requireUser in API routes
f0f33e6  Add forgot password to clinician login page
b4532c7  Add Invite User feature to admin dashboard
7b76a0a  Add /reset-password page to complete forgot password flow
95e5208  Remove duplicate nav links from landing page
625cbf7  Add forgot password to admin login page
b042b51  Fix PDF download on success page and show documents on clinician detail
87bb054  Add clinician portal login with password authentication
fd7650f  Add landing page + switch email to SendGrid + add all app files
```

---

## Known Good State
- Build: passing (`npm run build` ✓)
- All auth flows implemented and tested in code
- Vercel deployment in progress (should be live within 2 min of commit 581e5ba)
