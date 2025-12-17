-- Add column to store circle-to-land information for each approach
-- This will be a JSONB object mapping approach_id -> boolean
-- Example: {"approach-id-1": true, "approach-id-2": false}
ALTER TABLE public.flight_entries 
ADD COLUMN IF NOT EXISTS approach_circle_to_land JSONB DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON COLUMN public.flight_entries.approach_circle_to_land IS 'JSONB object mapping approach IDs to circle-to-land boolean (true = circle to land, false/absent = straight-in)';

