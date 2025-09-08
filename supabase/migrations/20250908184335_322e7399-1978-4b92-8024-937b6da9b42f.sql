-- Set up admin role for D.clayherbert@gmail
-- First, we need to find the user ID for the specified email and insert the admin role
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get the user ID for the specified email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'D.clayherbert@gmail';
    
    -- If user exists, insert admin role (or update if already exists)
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;