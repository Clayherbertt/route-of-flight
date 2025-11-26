-- Add CFI certificate and signature fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cfi_certificate_number TEXT,
ADD COLUMN IF NOT EXISTS cfi_expiration_date DATE,
ADD COLUMN IF NOT EXISTS electronic_signature TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.cfi_certificate_number IS 'CFI/CFII/MEI certificate number if the user is an instructor';
COMMENT ON COLUMN public.profiles.cfi_expiration_date IS 'CFI certificate expiration date';
COMMENT ON COLUMN public.profiles.electronic_signature IS 'Base64 encoded electronic signature image for endorsements';

