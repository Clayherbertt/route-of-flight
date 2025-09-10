-- Fix foreign key constraint for route_step_details
-- First, let's ensure the foreign key constraint exists properly
ALTER TABLE route_step_details 
DROP CONSTRAINT IF EXISTS route_step_details_route_step_id_fkey;

ALTER TABLE route_step_details 
ADD CONSTRAINT route_step_details_route_step_id_fkey 
FOREIGN KEY (route_step_id) 
REFERENCES route_steps(id) 
ON DELETE CASCADE;