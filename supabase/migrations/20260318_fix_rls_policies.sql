-- ============================================
-- Migration: Fix RLS policies for role-based access
-- Problem: All authenticated users (including clinicians) could read/write ALL tables
-- Fix: Admin-only full access, clinician INSERT-only on submission tables
-- ============================================

-- Drop overly permissive "authenticated = full access" policies
DROP POLICY IF EXISTS admin_all_clinic ON clinic;
DROP POLICY IF EXISTS admin_all_clinicians ON clinicians;
DROP POLICY IF EXISTS admin_all_work_history ON work_history;
DROP POLICY IF EXISTS admin_all_disclosures ON disclosures;
DROP POLICY IF EXISTS admin_all_references ON professional_references;
DROP POLICY IF EXISTS admin_all_documents ON documents;
DROP POLICY IF EXISTS admin_all_payer_apps ON payer_applications;
DROP POLICY IF EXISTS admin_all_follow_ups ON follow_ups;
DROP POLICY IF EXISTS admin_all_alerts ON alerts;
DROP POLICY IF EXISTS admin_all_steps ON credentialing_steps;
DROP POLICY IF EXISTS admin_all_resume ON resume_parses;

-- ============================================
-- ADMIN policies: full CRUD (role = 'admin' in app_metadata)
-- ============================================
CREATE POLICY admin_all_clinic ON clinic FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all_clinicians ON clinicians FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all_work_history ON work_history FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all_disclosures ON disclosures FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all_references ON professional_references FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all_documents ON documents FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all_payer_apps ON payer_applications FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all_follow_ups ON follow_ups FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all_alerts ON alerts FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all_steps ON credentialing_steps FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_all_resume ON resume_parses FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================
-- CLINICIAN policies: INSERT-only on submission tables
-- ============================================
CREATE POLICY clinician_insert_clinicians ON clinicians FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'clinician');

CREATE POLICY clinician_insert_work_history ON work_history FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'clinician');

CREATE POLICY clinician_insert_disclosures ON disclosures FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'clinician');

CREATE POLICY clinician_insert_references ON professional_references FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'clinician');

CREATE POLICY clinician_insert_documents ON documents FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'clinician');

CREATE POLICY clinician_insert_resume ON resume_parses FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'clinician');

-- Note: Existing anon policies (anon_insert_*, anon_read_clinic) are unchanged
