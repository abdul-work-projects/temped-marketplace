-- Enforce character limits on description fields

-- Teacher description: 500 chars
ALTER TABLE teachers ADD CONSTRAINT teachers_description_length CHECK (char_length(description) <= 500);

-- School description: 500 chars
ALTER TABLE schools ADD CONSTRAINT schools_description_length CHECK (char_length(description) <= 500);

-- Job description: 2000 chars
ALTER TABLE jobs ADD CONSTRAINT jobs_description_length CHECK (char_length(description) <= 2000);

-- Job required qualifications: 1000 chars
ALTER TABLE jobs ADD CONSTRAINT jobs_qualifications_length CHECK (char_length(required_qualifications) <= 1000);

-- Teacher experience description: 500 chars
ALTER TABLE teacher_experiences ADD CONSTRAINT experiences_description_length CHECK (char_length(description) <= 500);

-- Cover letter: 1000 chars
ALTER TABLE applications ADD CONSTRAINT applications_cover_letter_length CHECK (char_length(cover_letter) <= 1000);
