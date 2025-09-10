-- Update the commercial route step to published status
UPDATE route_steps 
SET status = 'published', updated_at = now()
WHERE title = 'Commercial Pilot Single-Engine Part 61' AND status = 'draft';

-- Update all route step details for the commercial step to be published
UPDATE route_step_details 
SET published = true, updated_at = now()
WHERE route_step_id = (
  SELECT id FROM route_steps 
  WHERE title = 'Commercial Pilot Single-Engine Part 61'
);