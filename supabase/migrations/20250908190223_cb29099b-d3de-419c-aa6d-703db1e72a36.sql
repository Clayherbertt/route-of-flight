-- Update admin user's metadata with full name (corrected)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    jsonb_set(
        jsonb_set(
            jsonb_set(
                COALESCE(raw_user_meta_data, '{}'),
                '{full_name}',
                '"Clay Herbert"'
            ),
            '{display_name}',
            '"Clay Herbert"'
        ),
        '{first_name}',
        '"Clay"'
    ),
    '{last_name}',
    '"Herbert"'
)
WHERE email = 'd.clayherbert@gmail.com';