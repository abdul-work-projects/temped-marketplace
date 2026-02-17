-- Allow end_date to be NULL for permanent jobs
ALTER TABLE jobs ALTER COLUMN end_date DROP NOT NULL;
