-- Allow admins to update teachers and schools
-- Current policies only allow owner (auth.uid() = user_id) to update

DROP POLICY "Teachers can update own data" ON teachers;
CREATE POLICY "Teachers can update own data" ON teachers
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

DROP POLICY "Schools can update own data" ON schools;
CREATE POLICY "Schools can update own data" ON schools
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());
