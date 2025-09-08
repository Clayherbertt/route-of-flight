-- Remove admin role from old email and assign to correct email
DELETE FROM public.user_roles 
WHERE user_id = '97b0fa5a-be6b-4859-bc94-18161143a3be' 
AND role = 'admin';

-- Add admin role to correct user
INSERT INTO public.user_roles (user_id, role)
VALUES ('d9f8d5cb-1e56-41f8-81a1-7c70e7d661f9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;