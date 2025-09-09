-- Remove overview column from route_steps table
ALTER TABLE public.route_steps 
DROP COLUMN overview;