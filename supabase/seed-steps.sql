-- Credentialing Steps seed data
-- Run in Supabase SQL Editor AFTER schema.sql

-- ============================================
-- PHASE 1: Foundation (NPI + CAQH)
-- ============================================

INSERT INTO credentialing_steps (phase, step_number, title, description, url, document_checklist, field_instructions, phone_script, common_mistakes, time_estimate) VALUES

(1, '1.1', 'Register Type 1 NPI for Clinician',
 'Every clinician needs their own individual NPI (National Provider Identifier). Think of it like a Social Security Number but for healthcare providers. This is free and required before anything else.',
 'https://nppes.cms.hhs.gov',
 '["State license (current, not expired)", "SSN", "Date of birth", "Home address", "Taxonomy code (e.g. 101YM0800X for Mental Health Counseling)"]',
 '{"Entity Type": "Select Individual (Type 1)", "Name": "Clinician legal name exactly as on license", "SSN": "Required for identity verification", "Taxonomy": "Search for your specialty — Mental Health Counseling = 101YM0800X, Clinical Social Work = 1041C0700X, Psychology = 103T00000X", "Practice Location": "Use Safe Harbor address: 2510 E 15th St Suite 207, Tulsa OK 74104", "Authorized Official": "Leave blank for Type 1"}',
 NULL,
 'Trap #1 — Name mismatch: Your NPI name MUST match your license exactly. If your license says "Lashauna" don''t register as "La Shauna". This causes weeks of delays with every single payer.\n\nTrap #2 — Wrong taxonomy: Using the wrong taxonomy code means claims get denied. Double-check your specialty code at taxonomy.nucc.org.',
 '30 minutes'),

(1, '1.2', 'Create CAQH ProView Account',
 'CAQH ProView is the universal credentialing database that all insurance companies check. You fill it out once, and every payer pulls from it. If CAQH is incomplete, no payer will credential you.',
 'https://proview.caqh.org',
 '["NPI number (from Step 1.1)", "State license", "Malpractice insurance certificate", "DEA certificate (if applicable)", "Resume/CV", "Photo ID"]',
 '{"Registration": "Click New User Registration", "CAQH ID": "If you already have one, use Existing Provider. If not, select New Provider", "NPI": "Enter the NPI from Step 1.1", "Email": "Use a professional email you check regularly — CAQH sends re-attestation reminders here"}',
 NULL,
 'Trap #3 — Forgetting CAQH exists: Some clinicians skip CAQH and go straight to payers. Every payer checks CAQH first. If your CAQH profile is empty, your application sits in limbo.',
 '15 minutes'),

(1, '1.3', 'Complete All CAQH Sections',
 'This is the big one. CAQH has 12+ sections covering your entire professional history. Use the CAQH Cheat Sheet we generated from the intake form to fill everything out. Every field matters.',
 'https://proview.caqh.org',
 '["CAQH Cheat Sheet (generated from intake)", "5-year work history with no gaps > 30 days", "3 professional references with contact info", "Education details (school, degree, dates)", "All licenses and certifications"]',
 '{"Personal Info": "Must match NPI and license exactly", "Practice Location": "2510 E 15th St Suite 207, Tulsa OK 74104", "Work History": "List ALL positions for past 5 years. Gaps > 30 days need explanation", "Education": "Include degree, school name, graduation date", "References": "Need 3 professional references — colleagues who can vouch for your clinical competence", "Malpractice": "Per claim minimum $1,000,000 / Aggregate minimum $3,000,000", "Disclosures": "Answer honestly — a ''yes'' doesn''t disqualify you, but lying does"}',
 NULL,
 'Trap #4 — Work history gaps: If you have a gap > 30 days between jobs, CAQH flags it. You must explain every gap (maternity leave, education, etc). Unexplained gaps delay credentialing by weeks.\n\nTrap #5 — Incomplete sections: Even one empty required field means CAQH shows as "incomplete" to payers. Check every section twice.',
 '2 hours'),

(1, '1.4', 'Upload Documents to CAQH',
 'Upload all required documents to your CAQH profile. These must be current (not expired) and clearly legible. Payers will reject blurry or expired documents.',
 'https://proview.caqh.org',
 '["State license (PDF, current)", "Malpractice certificate (PDF, showing coverage dates and amounts)", "DEA certificate (if applicable)", "Board certification (if applicable)", "Photo ID (driver''s license or passport)", "Resume/CV"]',
 '{"Format": "PDF preferred, JPG accepted. Max 10MB per file", "License": "Must show expiry date clearly", "Malpractice": "Must show per-claim and aggregate amounts", "Naming": "Name files clearly: LastName_License_2026.pdf"}',
 NULL,
 'Trap #6 — Expired documents: If your malpractice certificate expired yesterday, every payer sees it. Upload the renewed version immediately. One expired doc = entire application stalled.',
 '30 minutes'),

(1, '1.5', 'Attest CAQH Profile',
 'Attestation means you''re confirming everything in your CAQH profile is accurate and current. You must re-attest every 120 days or CAQH locks your profile and payers can''t see it.',
 'https://proview.caqh.org',
 '["Review all CAQH sections are complete", "Verify all documents are current"]',
 '{"Process": "Go to Attestation section → Review all sections → Click Attest → Confirm", "Re-attestation": "Set a calendar reminder for 90 days from now to re-attest (gives 30-day buffer)"}',
 NULL,
 'Trap #7 — Letting attestation expire: CAQH requires re-attestation every 120 days. If you miss it, your profile goes dark. Payers see nothing. Set a recurring calendar reminder for every 90 days.',
 '10 minutes'),

(1, '1.6', 'Authorize All Target Payers in CAQH',
 'You must explicitly authorize each insurance company to view your CAQH data. If you don''t authorize them, they can''t pull your information even if your profile is complete.',
 'https://proview.caqh.org',
 '["List of all payers to authorize"]',
 '{"Navigate": "Go to Authorization section", "Payers to authorize": "OHCA/SoonerCare, Humana, Aetna Better Health, Oklahoma Complete Health, BCBS Oklahoma, UnitedHealthcare, Aetna Commercial, Cigna/Evernorth", "Select All": "Authorize ALL Oklahoma payers to be safe — there''s no downside to over-authorizing"}',
 NULL,
 'Trap #8 — Not authorizing payers: Your CAQH can be 100% complete, but if you forgot to authorize BlueCross, they literally cannot see your profile. It looks like you don''t exist.',
 '15 minutes');

-- ============================================
-- PHASE 2: Oklahoma Medicaid + SoonerSelect MCOs
-- ============================================

INSERT INTO credentialing_steps (phase, step_number, title, description, url, document_checklist, field_instructions, phone_script, common_mistakes, time_estimate) VALUES

(2, '2.1', 'OHCA SoonerCare Group Enrollment',
 'Oklahoma Health Care Authority (OHCA) manages SoonerCare (Oklahoma Medicaid). You need group enrollment first, then individual clinician enrollment. This is the foundation for all Medicaid MCOs.',
 'https://www.ohcaprovider.com/Enrollment/Site/Home/createuser.aspx',
 '["Type 2 NPI (group): 1871316414", "EIN: 99-4757524", "ODMHSAS license", "Clinician Type 1 NPI", "Clinician state license", "Signed provider agreement"]',
 '{"Portal": "Oklahoma Provider Enrollment Portal", "Enrollment Type": "Group Practice enrollment", "Group NPI": "1871316414", "Taxonomy": "Use group taxonomy code", "Service Location": "2510 E 15th St Suite 207, Tulsa OK 74104"}',
 'Hello, my name is Adam James and I''m calling from SafeHarbor Behavioral Health LLC. I''m calling to check on the status of our group provider enrollment application.\n\nOur group NPI is 1871316414 and our Tax ID is 99-4757524.\n\nCan you tell me the current status of our application? Is there anything else you need from us to complete the process?\n\n[Write down: name of person, reference number, any action items, callback date]',
 'Trap #9 — Submitting individual before group: OHCA requires the group to be enrolled first. If you submit clinician enrollments before the group is approved, they get rejected.',
 '45 minutes'),

(2, '2.2', 'Humana Healthy Horizons Enrollment',
 'Humana is one of Oklahoma''s SoonerSelect managed care organizations. They require CAQH to be complete and authorized before they''ll process your application.',
 'https://provider.humana.com',
 '["CAQH ID (authorized for Humana)", "Group NPI: 1871316414", "Clinician NPI", "State license", "Malpractice certificate"]',
 '{"Portal": "Humana Provider Portal → New Provider Enrollment", "Network": "Select Medicaid/SoonerSelect", "Group Info": "SafeHarbor Behavioral Health LLC, NPI 1871316414", "CAQH": "Confirm your CAQH ID is entered and authorized for Humana"}',
 'Hello, I''m calling from SafeHarbor Behavioral Health about our provider enrollment application with Humana Healthy Horizons.\n\nOur group NPI is 1871316414. The clinician we''re enrolling is [Name] with NPI [number].\n\nCan you check the status? We submitted on [date]. Is there anything outstanding?\n\n[Write down: reference number, status, any missing items, follow-up date]',
 'Trap #10 — Not checking CAQH authorization: Humana pulls directly from CAQH. If you didn''t authorize Humana in Step 1.6, they see a blank profile and deny the application.',
 '30 minutes'),

(2, '2.3', 'Aetna Better Health of Oklahoma Enrollment',
 'Aetna Better Health manages Oklahoma Medicaid members. Application is typically through their provider portal or Availity.',
 'https://aetnabetterhealth.com/oklahoma',
 '["CAQH ID (authorized for Aetna)", "Group NPI: 1871316414", "Clinician NPI", "State license", "Malpractice certificate"]',
 '{"Portal": "Aetna Better Health OK Provider Portal", "Application": "Online enrollment form", "Group Info": "SafeHarbor Behavioral Health LLC, NPI 1871316414", "CAQH": "Must be authorized for Aetna"}',
 'Hello, I''m calling from SafeHarbor Behavioral Health regarding our provider enrollment with Aetna Better Health of Oklahoma.\n\nOur group NPI is 1871316414. We''re enrolling clinician [Name] with NPI [number].\n\nCan you provide a status update? We submitted on [date].\n\n[Write down: case number, status, missing items, expected timeline]',
 'Trap #11 — Mixing up Aetna entities: Aetna Better Health (Medicaid) and Aetna Commercial are SEPARATE enrollments. Enrolling in one does NOT enroll you in the other.',
 '30 minutes'),

(2, '2.4', 'Oklahoma Complete Health Enrollment',
 'Oklahoma Complete Health is another SoonerSelect MCO. They have their own provider enrollment process separate from OHCA.',
 'https://oklahomacompletehealth.com',
 '["CAQH ID (authorized)", "Group NPI: 1871316414", "Clinician NPI", "State license", "Malpractice certificate"]',
 '{"Portal": "Oklahoma Complete Health Provider Portal", "Application": "New provider enrollment", "Group Info": "SafeHarbor Behavioral Health LLC, NPI 1871316414"}',
 'Hello, I''m calling from SafeHarbor Behavioral Health about our provider enrollment with Oklahoma Complete Health.\n\nOur group NPI is 1871316414. We''re enrolling [Name], NPI [number].\n\nCan you tell me the application status? We submitted on [date].\n\n[Write down: reference number, status, action items, follow-up date]',
 'Trap #12 — Assuming MCO enrollment is automatic: Just because OHCA approved you doesn''t mean the MCOs will auto-enroll you. Each MCO is a separate application.',
 '30 minutes');

-- ============================================
-- PHASE 3: Commercial Insurance
-- ============================================

INSERT INTO credentialing_steps (phase, step_number, title, description, url, document_checklist, field_instructions, phone_script, common_mistakes, time_estimate) VALUES

(3, '3.1', 'BCBS Oklahoma Enrollment',
 'Blue Cross Blue Shield of Oklahoma is one of the largest commercial payers in the state. Their credentialing process typically takes 60-90 days.',
 'https://bcbsok.com/provider',
 '["CAQH ID (authorized for BCBS)", "Group NPI: 1871316414", "Clinician NPI", "State license", "Malpractice certificate", "W-9"]',
 '{"Portal": "BCBS Oklahoma Provider Portal → Join Our Network", "Network": "Select Behavioral Health network", "Application": "Complete online or download PDF application", "Group Info": "SafeHarbor Behavioral Health LLC, NPI 1871316414, EIN 99-4757524"}',
 'Hello, I''m calling from SafeHarbor Behavioral Health LLC regarding a provider enrollment application with BCBS Oklahoma.\n\nOur group NPI is 1871316414 and Tax ID is 99-4757524. We''re enrolling clinician [Name] with NPI [number].\n\nCan you check the application status? We submitted on [date]. What is the expected timeline for completion?\n\n[Write down: reference/case number, status, credentialing analyst name, missing items, expected completion date]',
 'Trap #13 — Not following up: BCBS can take 90 days. If you don''t call every 2 weeks to check status, applications can sit in a queue unprocessed. Squeaky wheel gets the grease.',
 '45 minutes'),

(3, '3.2', 'UnitedHealthcare / Optum Enrollment',
 'UnitedHealthcare enrollment for behavioral health goes through Optum. Their online portal is the primary method for new provider applications.',
 'https://uhcprovider.com',
 '["CAQH ID (authorized for UHC)", "Group NPI: 1871316414", "Clinician NPI", "State license", "Malpractice certificate"]',
 '{"Portal": "UHC Provider Portal → Join Our Network", "Behavioral Health": "Optum handles BH credentialing for UHC", "CAQH": "UHC relies heavily on CAQH — make sure profile is 100% complete", "Group Info": "SafeHarbor Behavioral Health LLC, NPI 1871316414"}',
 'Hello, I''m calling from SafeHarbor Behavioral Health about a provider enrollment with UnitedHealthcare/Optum.\n\nOur group NPI is 1871316414. The clinician is [Name] with NPI [number].\n\nCan you check our application status? We submitted on [date]. Is there anything needed from our end?\n\n[Write down: case number, status, contact name, follow-up date]',
 'Trap #14 — Wrong portal: Behavioral health providers enroll through Optum, not the main UHC portal. If you submit through the wrong one, it gets routed incorrectly and adds weeks.',
 '30 minutes'),

(3, '3.3', 'Aetna Commercial Enrollment',
 'Aetna Commercial enrollment is separate from Aetna Better Health (Medicaid). Applications typically go through Availity for Aetna commercial networks.',
 'https://availity.com',
 '["CAQH ID (authorized for Aetna)", "Group NPI: 1871316414", "Clinician NPI", "State license", "Malpractice certificate"]',
 '{"Portal": "Availity → Payer Spaces → Aetna → Provider Enrollment", "Network": "Behavioral Health", "CAQH": "Aetna Commercial uses CAQH — ensure authorized", "Group Info": "SafeHarbor Behavioral Health LLC, NPI 1871316414"}',
 'For Aetna Commercial, use Availity chat or call the Availity support line. Aetna Commercial does not have a direct provider enrollment phone line.\n\nIf using Availity chat: "I need to check the status of a provider enrollment application for SafeHarbor Behavioral Health, group NPI 1871316414, for clinician [Name], NPI [number]."',
 'Trap #11 (again) — Remember: Aetna Better Health (Medicaid) and Aetna Commercial are completely separate. You need both applications if you want both patient populations.',
 '30 minutes'),

(3, '3.4', 'Cigna / Evernorth Enrollment',
 'Cigna behavioral health credentialing is managed through Evernorth. Their process requires CAQH and typically takes 45-60 days.',
 'https://cigna.com/providers',
 '["CAQH ID (authorized for Cigna)", "Group NPI: 1871316414", "Clinician NPI", "State license", "Malpractice certificate"]',
 '{"Portal": "Cigna for Providers → Join Our Network", "Network": "Behavioral Health / Evernorth", "CAQH": "Cigna pulls from CAQH — must be authorized", "Group Info": "SafeHarbor Behavioral Health LLC, NPI 1871316414"}',
 'Hello, I''m calling from SafeHarbor Behavioral Health about a provider enrollment with Cigna/Evernorth.\n\nOur group NPI is 1871316414. We''re enrolling clinician [Name] with NPI [number].\n\nCan you check our credentialing status? Application submitted [date].\n\n[Write down: reference number, status, analyst name, timeline, follow-up date]',
 'Trap #15 — Not checking Evernorth separately: Cigna medical and Cigna behavioral health (Evernorth) are different divisions. Make sure you''re in the behavioral health network specifically.',
 '30 minutes');

-- ============================================
-- PHASE 4: Payment Setup
-- ============================================

INSERT INTO credentialing_steps (phase, step_number, title, description, url, document_checklist, field_instructions, phone_script, common_mistakes, time_estimate) VALUES

(4, '4.1', 'Set Up EFT (Electronic Funds Transfer) Per Payer',
 'Once credentialed, you need to set up direct deposit for each payer so claims payments go straight to your bank account. Without EFT, you''ll get paper checks that take weeks.',
 NULL,
 '["Bank verification letter or voided check", "Bank routing number: 064209588", "Bank account number: 200001054020", "W-9 (signed)", "EFT authorization form (each payer has their own)"]',
 '{"Per Payer": "Each payer has a separate EFT enrollment form", "Bank Info": "Routing: 064209588, Account: 200001054020", "Method": "Most payers offer EFT setup through their provider portal or via Availity"}',
 NULL,
 'Not setting up EFT means you get paper checks mailed to you. These take 2-4 weeks longer and can get lost. Always set up EFT immediately after approval.',
 '20 minutes per payer'),

(4, '4.2', 'Enroll in ERA (Electronic Remittance Advice)',
 'ERA is the electronic explanation of payment — it tells you what was paid, denied, or adjusted for each claim. Without ERA, you have to manually read paper EOBs.',
 NULL,
 '["EFT must be set up first", "Practice management system or clearinghouse info"]',
 '{"Setup": "Usually done alongside EFT enrollment in the payer portal", "Clearinghouse": "If using a clearinghouse, provide their Payer ID for ERA routing", "Format": "Standard 835 format — your billing software reads this automatically"}',
 NULL,
 'ERA and EFT go hand in hand. Some payers won''t send ERA unless EFT is active. Set them up together to avoid missing payment information.',
 '15 minutes per payer'),

(4, '4.3', 'Submit Test Claim',
 'Before seeing real patients under a new payer, submit a test claim to verify everything is connected — your NPI is active, your taxonomy is correct, and payments route to the right bank account.',
 NULL,
 '["Active provider status with payer", "EFT and ERA set up", "Correct NPI and taxonomy in billing system", "Sample claim with valid CPT codes"]',
 '{"Process": "Submit a claim for a recent visit or a test encounter", "CPT Codes": "Common BH codes: 90834 (45-min therapy), 90837 (60-min therapy), 90791 (intake assessment)", "Watch for": "Check ERA within 14 days for adjudication result", "If denied": "Check denial reason — common issues are wrong NPI, inactive status, or incorrect taxonomy"}',
 'If your test claim is denied, call the payer:\n\n"I submitted a test claim for SafeHarbor Behavioral Health, group NPI 1871316414, for clinician [Name], NPI [number]. The claim was denied with reason code [X]. Can you help me understand what needs to be corrected?"',
 'Don''t skip the test claim. If your first real patient''s claim gets denied because of a setup error, you''re chasing money for weeks while the patient wonders why they got a bill.',
 '30 minutes'),

(4, '4.4', 'Go-Live Verification',
 'Final check: confirm everything is active and working before scheduling patients under the new payer. This is your green light.',
 NULL,
 '["All payer approvals received", "EFT confirmed active", "ERA flowing to billing system", "Test claim paid successfully", "Provider listed in payer directory"]',
 '{"Verify each payer": "Log into each payer portal and confirm Active status", "Directory listing": "Search for your clinician in the payer''s online provider directory — patients use this to find you", "Effective date": "Note the effective date — you can only bill for visits on or after this date", "Calendar": "Set reminders for re-credentialing (usually every 3 years) and re-attestation (CAQH every 120 days)"}',
 NULL,
 'Check the provider directory! If your clinician isn''t listed, patients can''t find you and referrals won''t come. Call the payer to fix directory listings proactively.',
 '15 minutes');
