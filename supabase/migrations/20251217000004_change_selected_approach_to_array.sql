-- Change selected_approach from single TEXT to TEXT[] array to support multiple approaches
ALTER TABLE public.flight_entries 
ALTER COLUMN selected_approach TYPE TEXT[] USING 
  CASE 
    WHEN selected_approach IS NULL THEN NULL
    ELSE ARRAY[selected_approach]
  END;

-- Update comment
COMMENT ON COLUMN public.flight_entries.selected_approach IS 'Array of instrument approach IDs flown (references instrument_approaches.id)';

