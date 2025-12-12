-- Create a function to check if a user's email is confirmed
-- This function can be called by admins to check email confirmation status
CREATE OR REPLACE FUNCTION public.get_user_email_confirmed(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  email_confirmed BOOLEAN;
BEGIN
  -- Check if the caller is an admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can check email confirmation status';
  END IF;

  -- Check if email is confirmed in auth.users
  -- email_confirmed_at is a timestamp - if it's not null, email is confirmed
  SELECT (email_confirmed_at IS NOT NULL) INTO email_confirmed
  FROM auth.users
  WHERE id = user_id_param;

  -- Return false if user not found, otherwise return the confirmation status
  RETURN COALESCE(email_confirmed, false);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_email_confirmed(UUID) TO authenticated;

