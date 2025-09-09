-- Add category column to route_steps table
ALTER TABLE public.route_steps 
ADD COLUMN category text DEFAULT 'Primary Training';

-- Add a comment to document the available categories
COMMENT ON COLUMN public.route_steps.category IS 'Available categories: Initial Tasks, Primary Training, Cadet Programs, Flight Instructing, Other Time Builders, Regional Requirements, Major Requirements';