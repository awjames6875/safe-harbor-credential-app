-- Safe Harbor Credentialing Command Center
-- Seed data: org info + Oklahoma payer reference data
-- Run AFTER schema.sql in Supabase SQL Editor

-- ============================================
-- Safe Harbor Behavioral Health clinic data
-- ============================================
INSERT INTO clinic (
  name, address, city, state, zip, phone, email, website,
  npi_type2, ein, odmhsas_license, odmhsas_expiry,
  malpractice_carrier, malpractice_policy, malpractice_expiry,
  bank_routing, bank_account
) VALUES (
  'SafeHarbor Behavioral Health LLC',
  '2510 E 15th St, Suite 207',
  'Tulsa',
  'OK',
  '74104',
  '(918) 553-5746',
  'ajames@safeharborbehavioralhealth.com',
  'safeharborbehavioralhealth.com',
  '1871316414',
  '99-4757524',
  'Active',
  '2028-01-31',
  'HPSO/CNA',
  '0843977098',
  '2027-02-26',
  '064209588',
  '200001054020'
);

-- ============================================
-- Oklahoma Medicaid / SoonerSelect MCOs
-- ============================================
-- Note: These are org-level (group) payer applications, clinician_id is NULL

INSERT INTO payer_applications (payer_name, payer_type, phase, status) VALUES
  ('OHCA SoonerCare', 'medicaid', 2, 'Not Started'),
  ('Humana Healthy Horizons', 'mco', 2, 'Not Started'),
  ('Aetna Better Health OK', 'mco', 2, 'Not Started'),
  ('Oklahoma Complete Health', 'mco', 2, 'Not Started');

-- ============================================
-- Commercial Payers
-- ============================================
INSERT INTO payer_applications (payer_name, payer_type, phase, status) VALUES
  ('BCBS Oklahoma', 'commercial', 3, 'Not Started'),
  ('UnitedHealthcare', 'commercial', 3, 'Not Started'),
  ('Aetna Commercial', 'commercial', 3, 'Not Started'),
  ('Cigna/Evernorth', 'commercial', 3, 'Not Started');
