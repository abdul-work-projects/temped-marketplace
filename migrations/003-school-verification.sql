-- School verification columns
ALTER TABLE schools ADD COLUMN verification_status TEXT DEFAULT 'unverified';
ALTER TABLE schools ADD COLUMN verified_by UUID REFERENCES profiles(id);
ALTER TABLE schools ADD COLUMN verified_at TIMESTAMPTZ;
ALTER TABLE schools ADD COLUMN rejection_reason TEXT;
