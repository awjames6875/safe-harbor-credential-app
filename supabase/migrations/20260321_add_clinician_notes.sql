-- Add clinician_notes table for general activity log per clinician
CREATE TABLE IF NOT EXISTS clinician_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinician_id uuid NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS: admin-only (matches existing pattern)
ALTER TABLE clinician_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_all_clinician_notes ON clinician_notes FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
