-- Safe Harbor Credentialing Command Center
-- Database Schema for Supabase (PostgreSQL)
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TRIGGER FUNCTION: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TABLE: clinic (org-level data)
-- ============================================
CREATE TABLE clinic (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  npi_type2 VARCHAR(10),
  ein VARCHAR(20),
  odmhsas_license VARCHAR(100),
  odmhsas_expiry DATE,
  malpractice_carrier VARCHAR(255),
  malpractice_policy VARCHAR(100),
  malpractice_expiry DATE,
  bank_routing VARCHAR(20),
  bank_account VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER clinic_updated_at
  BEFORE UPDATE ON clinic
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TABLE: clinicians
-- ============================================
CREATE TABLE clinicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  dob DATE,
  ssn_encrypted TEXT,
  home_address VARCHAR(500),
  npi_type1 VARCHAR(10),
  taxonomy_code VARCHAR(20),
  license_type VARCHAR(100),
  license_number VARCHAR(100),
  license_state VARCHAR(2),
  license_issued DATE,
  license_expiry DATE,
  malpractice_carrier VARCHAR(255),
  malpractice_policy VARCHAR(100),
  malpractice_per_claim VARCHAR(50),
  malpractice_aggregate VARCHAR(50),
  malpractice_start DATE,
  malpractice_end DATE,
  caqh_id VARCHAR(20),
  caqh_last_attest DATE,
  school_name VARCHAR(255),
  degree VARCHAR(100),
  major VARCHAR(100),
  grad_date DATE,
  portal_submitted BOOLEAN DEFAULT FALSE,
  portal_submitted_at TIMESTAMPTZ,
  intake_complete BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending',
  oig_check_date DATE,
  oig_excluded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER clinicians_updated_at
  BEFORE UPDATE ON clinicians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TABLE: work_history
-- ============================================
CREATE TABLE work_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinician_id UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  employer_name VARCHAR(255) NOT NULL,
  employer_address VARCHAR(500),
  job_title VARCHAR(100),
  supervisor_name VARCHAR(100),
  supervisor_phone VARCHAR(20),
  start_date DATE,
  end_date DATE,
  reason_leaving TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: disclosures
-- ============================================
CREATE TABLE disclosures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinician_id UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  malpractice_claim BOOLEAN DEFAULT FALSE,
  license_action BOOLEAN DEFAULT FALSE,
  federal_exclusion BOOLEAN DEFAULT FALSE,
  felony BOOLEAN DEFAULT FALSE,
  explanation TEXT,
  signed_name VARCHAR(255),
  signed_at TIMESTAMPTZ,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: professional_references (CAQH requires 3)
-- ============================================
CREATE TABLE professional_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinician_id UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  specialty VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: documents
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type VARCHAR(20) NOT NULL,
  owner_id UUID NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255),
  file_url TEXT,
  file_size INTEGER,
  expiry_date DATE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by VARCHAR(100),
  notes TEXT
);

-- ============================================
-- TABLE: payer_applications
-- ============================================
CREATE TABLE payer_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinician_id UUID REFERENCES clinicians(id) ON DELETE SET NULL,
  payer_name VARCHAR(255) NOT NULL,
  payer_type VARCHAR(50),
  phase INTEGER,
  npi_used VARCHAR(10),
  caqh_id VARCHAR(20),
  date_submitted DATE,
  method VARCHAR(50),
  confirmation_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Not Started',
  missing_items TEXT,
  follow_up_date DATE,
  last_follow_up DATE,
  follow_up_notes TEXT,
  approval_date DATE,
  effective_date DATE,
  fee_schedule_received BOOLEAN DEFAULT FALSE,
  eft_setup BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER payer_applications_updated_at
  BEFORE UPDATE ON payer_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TABLE: follow_ups
-- ============================================
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES payer_applications(id) ON DELETE CASCADE,
  due_date DATE,
  completed_date DATE,
  contact_name VARCHAR(255),
  contact_phone VARCHAR(20),
  notes TEXT,
  next_follow_up DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: alerts
-- ============================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  related_table VARCHAR(50),
  related_id UUID,
  message TEXT NOT NULL,
  action_required TEXT,
  due_date DATE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: credentialing_steps
-- ============================================
CREATE TABLE credentialing_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinician_id UUID REFERENCES clinicians(id) ON DELETE CASCADE,
  phase INTEGER NOT NULL,
  step_number VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT,
  document_checklist JSONB,
  field_instructions JSONB,
  phone_script TEXT,
  common_mistakes TEXT,
  time_estimate VARCHAR(50),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by VARCHAR(100),
  notes TEXT
);

-- ============================================
-- TABLE: resume_parses
-- ============================================
CREATE TABLE resume_parses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinician_id UUID REFERENCES clinicians(id) ON DELETE CASCADE,
  original_file_name VARCHAR(255),
  file_url TEXT,
  raw_text TEXT,
  parsed_data JSONB,
  confidence_score FLOAT,
  parsed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for common queries
-- ============================================
CREATE INDEX idx_clinicians_status ON clinicians(status);
CREATE INDEX idx_work_history_clinician ON work_history(clinician_id);
CREATE INDEX idx_disclosures_clinician ON disclosures(clinician_id);
CREATE INDEX idx_professional_references_clinician ON professional_references(clinician_id);
CREATE INDEX idx_documents_owner ON documents(owner_type, owner_id);
CREATE INDEX idx_payer_applications_clinician ON payer_applications(clinician_id);
CREATE INDEX idx_payer_applications_status ON payer_applications(status);
CREATE INDEX idx_follow_ups_application ON follow_ups(application_id);
CREATE INDEX idx_follow_ups_due_date ON follow_ups(due_date);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_dismissed ON alerts(is_dismissed);
CREATE INDEX idx_credentialing_steps_clinician ON credentialing_steps(clinician_id);
CREATE INDEX idx_resume_parses_clinician ON resume_parses(clinician_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE clinic ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE disclosures ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentialing_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_parses ENABLE ROW LEVEL SECURITY;

-- Admin (authenticated) can read/write everything
CREATE POLICY admin_all_clinic ON clinic FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_clinicians ON clinicians FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_work_history ON work_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_disclosures ON disclosures FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_references ON professional_references FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_documents ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_payer_apps ON payer_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_follow_ups ON follow_ups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_alerts ON alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_steps ON credentialing_steps FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_resume ON resume_parses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anon (clinician portal) can INSERT into submission-related tables
CREATE POLICY anon_insert_clinicians ON clinicians FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_insert_work_history ON work_history FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_insert_disclosures ON disclosures FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_insert_references ON professional_references FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_insert_documents ON documents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_insert_resume ON resume_parses FOR INSERT TO anon WITH CHECK (true);

-- Anon can read clinic data (for pre-loaded org info)
CREATE POLICY anon_read_clinic ON clinic FOR SELECT TO anon USING (true);
