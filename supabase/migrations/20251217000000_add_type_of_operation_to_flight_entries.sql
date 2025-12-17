-- Add type_of_operation column to flight_entries table
ALTER TABLE public.flight_entries 
ADD COLUMN IF NOT EXISTS type_of_operation text;

-- Add comment to document the allowed values
COMMENT ON COLUMN public.flight_entries.type_of_operation IS 'Type of operation: FAR 91, FAR 91k, FAR 135, or FAR 121';

