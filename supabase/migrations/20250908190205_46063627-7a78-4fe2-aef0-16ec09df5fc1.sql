-- Update admin user's metadata with full name
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'),
    '{full_name}',
    '"Clay Herbert"'
),
raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{display_name}',
    '"Clay Herbert"'
),
raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{first_name}',
    '"Clay"'
),
raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{last_name}',
    '"Herbert"'
)
WHERE email = 'd.clayherbert@gmail.com';