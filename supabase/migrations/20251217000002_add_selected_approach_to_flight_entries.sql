-- Add column to store selected approach in flight entries
ALTER TABLE public.flight_entries 
ADD COLUMN IF NOT EXISTS selected_approach TEXT;

-- Add comment
COMMENT ON COLUMN public.flight_entries.selected_approach IS 'ID of the instrument approach flown (references instrument_approaches.id)';

