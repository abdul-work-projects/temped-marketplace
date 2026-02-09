-- TempEd Database Schema
-- Run this in the Supabase SQL Editor

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_type AS ENUM ('teacher', 'school', 'admin');
CREATE TYPE school_type AS ENUM ('Primary', 'Secondary', 'Pre-primary', 'Combined');
CREATE TYPE ownership_type AS ENUM ('Public', 'Private');
CREATE TYPE curriculum_type AS ENUM ('CAPS', 'Cambridge', 'IEB', 'Other');
CREATE TYPE job_type AS ENUM ('Permanent', 'Temporary', 'Invigilator', 'Coach');
CREATE TYPE job_progress AS ENUM ('Open', 'Interviewing', 'Hired', 'Closed');
CREATE TYPE application_status AS ENUM ('Applied', 'In Progress', 'Hired', 'Closed');
CREATE TYPE testimonial_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================
-- TABLES
-- ============================================

-- Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_type user_type NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers
CREATE TABLE teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT,
  profile_picture TEXT,
  education_phases TEXT[] DEFAULT '{}',
  subjects JSONB DEFAULT '{}',
  address TEXT,
  location JSONB,
  distance_radius INTEGER DEFAULT 50,
  date_of_birth DATE,
  id_number TEXT,
  sports JSONB DEFAULT '{}',
  arts_culture JSONB DEFAULT '{}',
  teacher_references JSONB DEFAULT '[]',
  profile_completeness INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher Experiences
CREATE TABLE teacher_experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schools
CREATE TABLE schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT,
  profile_picture TEXT,
  emis_number TEXT,
  district TEXT,
  school_type school_type,
  ownership_type ownership_type,
  education_district TEXT,
  curriculum curriculum_type,
  address TEXT,
  location JSONB,
  registration_certificate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subject TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  application_deadline DATE NOT NULL,
  required_qualifications TEXT NOT NULL,
  education_phase TEXT NOT NULL,
  job_type job_type DEFAULT 'Temporary',
  progress job_progress DEFAULT 'Open',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  status application_status DEFAULT 'Applied',
  shortlisted BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, teacher_id)
);

-- Testimonials
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  from_type user_type NOT NULL,
  comment TEXT NOT NULL,
  status testimonial_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher Documents (upload tracking + verification review)
CREATE TABLE teacher_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_education_phases ON teachers USING GIN(education_phases);
CREATE INDEX idx_teachers_subjects ON teachers USING GIN(subjects);
CREATE INDEX idx_teachers_sports ON teachers USING GIN(sports);
CREATE INDEX idx_schools_user_id ON schools(user_id);

CREATE INDEX idx_jobs_school_id ON jobs(school_id);
CREATE INDEX idx_jobs_progress ON jobs(progress);
CREATE INDEX idx_jobs_education_phase ON jobs(education_phase);
CREATE INDEX idx_jobs_tags ON jobs USING GIN(tags);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_teacher_id ON applications(teacher_id);
CREATE INDEX idx_applications_status ON applications(status);

CREATE INDEX idx_testimonials_to_user ON testimonials(to_user_id);
CREATE INDEX idx_testimonials_status ON testimonials(status);

CREATE INDEX idx_teacher_documents_teacher ON teacher_documents(teacher_id);
CREATE INDEX idx_teacher_documents_status ON teacher_documents(status);
CREATE INDEX idx_teacher_documents_type ON teacher_documents(document_type);

-- ============================================
-- AUTO-CREATE PROFILE + TEACHER/SCHOOL ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, user_type, email)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'teacher'),
    NEW.email
  );

  -- Create teacher or school record based on user type
  IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'teacher') = 'teacher' THEN
    INSERT INTO teachers (user_id, first_name, surname, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.email
    );
  ELSIF NEW.raw_user_meta_data->>'user_type' = 'school' THEN
    INSERT INTO schools (user_id, name, email, emis_number)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'school_name', ''),
      NEW.email,
      NEW.raw_user_meta_data->>'emis_number'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- HELPER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_documents ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Teachers policies
CREATE POLICY "Teachers can view own data" ON teachers
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Schools can view teacher profiles" ON teachers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'school')
  );
CREATE POLICY "Teachers can update own data" ON teachers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Teachers can insert own data" ON teachers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Teacher experiences policies
CREATE POLICY "Teachers can manage own experiences" ON teacher_experiences
  FOR ALL USING (
    EXISTS (SELECT 1 FROM teachers WHERE id = teacher_id AND user_id = auth.uid())
    OR is_admin()
  );
CREATE POLICY "Schools can view teacher experiences" ON teacher_experiences
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'school')
  );

-- Schools policies
CREATE POLICY "Schools can view own data" ON schools
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Teachers can view school profiles" ON schools
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'teacher')
  );
CREATE POLICY "Schools can update own data" ON schools
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Schools can insert own data" ON schools
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Jobs policies
CREATE POLICY "Anyone authenticated can view open jobs" ON jobs
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Schools can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM schools WHERE id = school_id AND user_id = auth.uid())
  );
CREATE POLICY "Schools can update own jobs" ON jobs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM schools WHERE id = school_id AND user_id = auth.uid())
    OR is_admin()
  );
CREATE POLICY "Schools can delete own jobs" ON jobs
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM schools WHERE id = school_id AND user_id = auth.uid())
    OR is_admin()
  );

-- Applications policies
CREATE POLICY "Teachers can view own applications" ON applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teachers WHERE id = teacher_id AND user_id = auth.uid())
    OR is_admin()
  );
CREATE POLICY "Schools can view applications for their jobs" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN schools s ON j.school_id = s.id
      WHERE j.id = job_id AND s.user_id = auth.uid()
    )
  );
CREATE POLICY "Teachers can insert applications" ON applications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM teachers WHERE id = teacher_id AND user_id = auth.uid())
  );
CREATE POLICY "Teachers can delete own applications" ON applications
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM teachers WHERE id = teacher_id AND user_id = auth.uid())
  );
CREATE POLICY "Schools can update application status" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN schools s ON j.school_id = s.id
      WHERE j.id = job_id AND s.user_id = auth.uid()
    )
    OR is_admin()
  );

-- Testimonials policies
CREATE POLICY "Users can view approved testimonials" ON testimonials
  FOR SELECT USING (status = 'approved' OR from_user_id = auth.uid() OR to_user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can create testimonials" ON testimonials
  FOR INSERT WITH CHECK (from_user_id = auth.uid());
CREATE POLICY "Admins can update testimonials" ON testimonials
  FOR UPDATE USING (is_admin());

-- Teacher documents policies
CREATE POLICY "Teachers can view own documents" ON teacher_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teachers WHERE id = teacher_id AND user_id = auth.uid())
    OR is_admin()
  );
CREATE POLICY "Schools can view teacher documents" ON teacher_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'school')
  );
CREATE POLICY "Teachers can insert own documents" ON teacher_documents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM teachers WHERE id = teacher_id AND user_id = auth.uid())
  );
CREATE POLICY "Teachers can delete own pending documents" ON teacher_documents
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM teachers WHERE id = teacher_id AND user_id = auth.uid())
    AND status = 'pending'
  );
CREATE POLICY "Admins can manage all documents" ON teacher_documents
  FOR ALL USING (is_admin());

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('registration-certificates', 'registration-certificates', false);

-- Storage policies: profile pictures
CREATE POLICY "Authenticated users can read profile pictures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-pictures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can upload own profile pictures"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own profile pictures"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own profile pictures"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies: documents (private, user + admin)
CREATE POLICY "Users can read own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR is_admin()));

CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies: registration certificates (school + admin)
CREATE POLICY "Schools and admins can read registration certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'registration-certificates' AND ((storage.foldername(name))[1] = auth.uid()::text OR is_admin()));

CREATE POLICY "Schools can upload own registration certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'registration-certificates' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Schools can update own registration certificates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'registration-certificates' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Schools can delete own registration certificates"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'registration-certificates' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
