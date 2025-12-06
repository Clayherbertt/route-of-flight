-- Update pay_scale_image_url to support multiple images (JSON array)
-- Change column type to JSONB to store array of image URLs
-- This will convert existing TEXT values to JSONB arrays
ALTER TABLE public.airlines 
ALTER COLUMN pay_scale_image_url TYPE JSONB USING 
  CASE 
    WHEN pay_scale_image_url IS NULL THEN NULL::jsonb
    WHEN pay_scale_image_url::text = '' THEN NULL::jsonb
    -- Try to parse as JSON first (in case it's already JSON)
    ELSE 
      CASE 
        WHEN pay_scale_image_url::text ~ '^\[.*\]$' THEN pay_scale_image_url::jsonb
        ELSE jsonb_build_array(pay_scale_image_url::text)
      END
  END;

