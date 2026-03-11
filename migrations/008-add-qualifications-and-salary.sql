-- Add teacher_qualifications table
CREATE TABLE IF NOT EXISTS teacher_qualifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  date_obtained DATE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE teacher_qualifications ENABLE ROW LEVEL SECURITY;

-- Teachers can read/write their own qualifications
CREATE POLICY "Teachers can view own qualifications"
  ON teacher_qualifications FOR SELECT
  USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

CREATE POLICY "Teachers can insert own qualifications"
  ON teacher_qualifications FOR INSERT
  WITH CHECK (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

CREATE POLICY "Teachers can update own qualifications"
  ON teacher_qualifications FOR UPDATE
  USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

CREATE POLICY "Teachers can delete own qualifications"
  ON teacher_qualifications FOR DELETE
  USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

-- Schools and admins can view qualifications
CREATE POLICY "Schools can view qualifications"
  ON teacher_qualifications FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('school', 'admin')));

-- Admins can update qualification status (approve/reject)
CREATE POLICY "Admins can update qualifications"
  ON teacher_qualifications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));

-- Add salary fields to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary NUMERIC;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_type TEXT CHECK (salary_type IN ('per_month', 'per_day'));
