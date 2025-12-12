-- Create a function to completely delete a user and all their data
-- This function requires admin privileges
-- Note: This function cannot delete from auth.users directly - that must be done via Supabase Admin API
CREATE OR REPLACE FUNCTION public.delete_user_completely(user_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the caller is an admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can delete users';
  END IF;

  -- Delete from subscribers (cancels subscription)
  DELETE FROM public.subscribers WHERE user_id = user_id_to_delete;
  
  -- Delete from user_routes
  DELETE FROM public.user_routes WHERE user_id = user_id_to_delete;
  
  -- Delete from flight_entries
  DELETE FROM public.flight_entries WHERE user_id = user_id_to_delete;
  
  -- Delete from aircraft_logbook
  DELETE FROM public.aircraft_logbook WHERE user_id = user_id_to_delete;
  
  -- Delete from user_endorsements (if table exists)
  -- Use a DO block to handle if table doesn't exist
  BEGIN
    DELETE FROM public.user_endorsements WHERE user_id = user_id_to_delete;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, skip
    NULL;
  END;
  
  -- Delete from profiles
  DELETE FROM public.profiles WHERE id = user_id_to_delete;
  
  -- Note: Cannot delete from auth.users here - requires Supabase Admin API
  -- The Edge Function delete-user handles auth.users deletion
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_completely(UUID) TO authenticated;

-- Create a policy to allow admins to execute this function
-- Note: The function itself checks for admin status, so this is just for RLS
CREATE POLICY "Admins can delete users" 
ON public.profiles
FOR DELETE
USING (public.is_admin());

