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

-- Track which users have dismissed which announcements
CREATE TABLE announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- Users can see their own reads
CREATE POLICY "Users can view own reads"
  ON announcement_reads FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert own reads
CREATE POLICY "Users can insert own reads"
  ON announcement_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());
