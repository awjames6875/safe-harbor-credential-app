# Safe Harbor Credentialing — Handoff State

**Saved:** 2026-03-21 ~3:00 AM CDT
**Branch:** main (pushed to GitHub)
**Latest commit:** `5253576` — Add general notes/activity log per clinician

---

## Current Status: FEATURE COMPLETE — Ready for Next Feature

All recent work is committed, pushed, and migrations applied.

---

## What Was Just Done

### Clinician Notes/Activity Log (this session)
- New `clinician_notes` table in Supabase (migration applied)
- API route: `GET/POST /api/admin/clinician-notes`
- Client component: `ClinicianNotes.tsx` on clinician detail page
- Admins can log general communications per clinician (e.g., "Called CAQH support")

### Previous Sessions (committed)
- CAQH expansion: 9 new clinician fields + 2 reference fields for CAQH ProView
- Enhanced CAQH cheat sheet PDF generator (15 sections)
- Specialties & Board Certification section in intake form
- Bulk document download (JSZip, client-side)
- 5 QA bug fixes in clinician intake form
- Date normalization across all parsers
- Role-based access control (admin vs clinician)
- Welcome emails via SendGrid

---

## Uncommitted Files (need attention)

These exist in the working directory but were NOT committed:
- `src/components/clinician/sections/SpecialtiesSection.tsx` — new form section (CAQH expansion)
- `supabase/migrations/add_caqh_fields.sql` — CAQH expansion migration (already applied in Supabase)
- `src/app/clinician/settings/` — clinician settings page (may be WIP)
- `test-documents/` — test data for E2E testing
- Various auto-generated `CLAUDE.md` files (can ignore)

**Decision needed:** The SpecialtiesSection and add_caqh_fields migration are production code that should be committed.

---

## Suggested Next Features

### Already Built (admin may not realize)
1. Payer Tracking Board — `/admin/tracker`
2. Expiration Alerts — `/admin/alerts`
3. CAQH Re-attestation Reminders — built into alerts
4. Credentialing Steps/Checklist — `/admin/steps`
5. General Notes/Activity Log — on clinician detail page

### Still Missing (good next features)
1. **Print-friendly clinician summary** — one-page view for phone calls with payers
2. **Inline document viewer** — preview docs without downloading
3. **Per-clinician checklist on detail page** — steps page is global, not per-clinician

---

## Live URL
**Production:** https://safe-harbor-credential-app.vercel.app
**GitHub:** https://github.com/awjames6875/safe-harbor-credential-app

---

## Environment Variables (required in Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG....
ADMIN_EMAIL=ajames@safeharborbehavioralhealth.com
NEXT_PUBLIC_APP_URL=https://safe-harbor-credential-app.vercel.app
```

---

## Quick Resume

```bash
cd safe-harbor-credentialing
npm install
npm run dev
```

Then open `http://localhost:3000/admin` to see the admin dashboard.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | `requireUser()` — checks auth, redirects to `/login` |
| `src/lib/supabase/admin.ts` | `createAdminClient()` — service role client |
| `src/lib/supabase/middleware.ts` | Route protection + role enforcement |
| `src/lib/email.ts` | SendGrid email functions |
| `src/app/api/admin/clinician-notes/route.ts` | GET/POST clinician notes |
| `src/components/admin/ClinicianNotes.tsx` | Notes UI on clinician detail page |
| `src/lib/caqhPdfGenerator.ts` | CAQH cheat sheet PDF (15 sections) |

---

## Recent Commit History

```
5253576  Add general notes/activity log per clinician
652c9a0  Add bulk document download and owner column to Document Vault
69b7be8  Fix 5 QA bugs in clinician intake form
580f0aa  Add document-first upload flow with AI vision parsing
8a0ea17  Update intake form sections, fix select width, add e2e tests and test data
```
