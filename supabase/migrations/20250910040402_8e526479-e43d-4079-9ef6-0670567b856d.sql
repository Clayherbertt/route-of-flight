-- Allow users to update the checked status of route step details
CREATE POLICY "Users can update checked status of route step details" 
ON public.route_step_details 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM route_steps 
    WHERE route_steps.id = route_step_details.route_step_id 
    AND route_steps.status = 'published'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM route_steps 
    WHERE route_steps.id = route_step_details.route_step_id 
    AND route_steps.status = 'published'
  )
);