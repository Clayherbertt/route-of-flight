-- Reset route builder for Clay@iflysca.com
-- Run this in Supabase SQL Editor
-- This deletes all user_routes entries for this user

DO $$
DECLARE
  target_user_id UUID;
  deleted_count INTEGER;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'Clay@iflysca.com';
  
  -- Check if user was found
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email Clay@iflysca.com not found';
  END IF;
  
  -- Delete all user_routes for this user
  DELETE FROM public.user_routes
  WHERE user_id = target_user_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Successfully reset route builder for user: Clay@iflysca.com (ID: %)', target_user_id;
  RAISE NOTICE 'Deleted % route entries', deleted_count;
END $$;

