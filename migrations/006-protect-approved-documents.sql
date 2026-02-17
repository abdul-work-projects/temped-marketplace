-- Protect approved documents from deletion by teachers/schools
-- Teacher documents: RLS already blocks deletion of non-pending docs
-- This migration adds storage-level and school certificate protection

-- 1. Helper: check if a storage file belongs to an approved teacher document
CREATE OR REPLACE FUNCTION is_approved_teacher_document(file_path text) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM teacher_documents
    WHERE teacher_documents.file_path = file_path
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update storage policy for documents bucket: block deletion of approved doc files
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND NOT is_approved_teacher_document(name)
  );

-- 3. Update storage policy for registration-certificates bucket: block deletion when school is approved
DROP POLICY IF EXISTS "Schools can delete own registration certificates" ON storage.objects;
CREATE POLICY "Schools can delete own registration certificates"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'registration-certificates'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND NOT EXISTS (
      SELECT 1 FROM schools
      WHERE user_id = auth.uid()
      AND verification_status = 'approved'
    )
  );

-- 4. Trigger to prevent schools from nullifying registration_certificate when approved
CREATE OR REPLACE FUNCTION prevent_approved_cert_removal() RETURNS trigger AS $$
BEGIN
  IF OLD.verification_status = 'approved'
    AND OLD.registration_certificate IS NOT NULL
    AND NEW.registration_certificate IS NULL
    AND NOT is_admin() THEN
    RAISE EXCEPTION 'Cannot remove registration certificate while school is approved';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_cert_removal
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION prevent_approved_cert_removal();
