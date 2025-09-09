-- Add mandatory and published columns to route_step_details table
ALTER TABLE public.route_step_details 
ADD COLUMN mandatory boolean DEFAULT false,
ADD COLUMN published boolean DEFAULT true;