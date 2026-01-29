
-- Ensure is_active defaults to true if not set
ALTER TABLE services ALTER COLUMN is_active SET DEFAULT true;

-- Update existing services to be active if they are null
UPDATE services SET is_active = true WHERE is_active IS NULL;
