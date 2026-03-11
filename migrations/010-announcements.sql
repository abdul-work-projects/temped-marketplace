-- Announcements table for admin-managed announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT 'all' CHECK (target IN ('teacher', 'school', 'all')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can read active announcements
CREATE POLICY "Anyone can read active announcements"
  ON announcements FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  USING (is_admin());
