-- Migration: Add tags table and phone_number to teachers
-- Run this in the Supabase SQL Editor

-- ============================================
-- 1. Tags table
-- ============================================

CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON tags FOR ALL USING (public.is_admin());

-- ============================================
-- 2. Phone number on teachers
-- ============================================

ALTER TABLE teachers ADD COLUMN phone_number TEXT;

-- ============================================
-- 3. Prevent edit/delete of approved testimonials (RLS)
-- ============================================

DROP POLICY IF EXISTS "Users can update own testimonials" ON testimonials;
CREATE POLICY "Users can update own testimonials" ON testimonials
  FOR UPDATE USING (from_user_id = auth.uid() AND status != 'approved');

DROP POLICY IF EXISTS "Users can delete own testimonials" ON testimonials
;
CREATE POLICY "Users can delete own testimonials" ON testimonials
  FOR DELETE USING (from_user_id = auth.uid() AND status != 'approved');
