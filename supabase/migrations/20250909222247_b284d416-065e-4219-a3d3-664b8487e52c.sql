-- Add task_type column to route_step_details table
ALTER TABLE public.route_step_details 
ADD COLUMN task_type TEXT NOT NULL DEFAULT 'flight' CHECK (task_type IN ('flight', 'ground'));