
-- Add a JSONB column to store the full layout grid definition
-- This allows the Layout Engine to persist custom block arrangements and bindings
ALTER TABLE modus_issues 
ADD COLUMN IF NOT EXISTS sections JSONB;

-- Comment for clarity
COMMENT ON COLUMN modus_issues.sections IS 'Stores the serialized BlockInstance[] and Section[] configuration for the Layout Engine';
