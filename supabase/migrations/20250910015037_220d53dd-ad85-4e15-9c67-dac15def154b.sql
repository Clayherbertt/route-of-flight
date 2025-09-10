-- Delete the problematic user account to allow fresh signup
DELETE FROM auth.users WHERE email = 'clayyyh@yahoo.com';