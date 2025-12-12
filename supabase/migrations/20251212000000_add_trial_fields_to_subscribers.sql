-- Add trial fields to subscribers table
ALTER TABLE public.subscribers
ADD COLUMN IF NOT EXISTS trial_start_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_plan_slug TEXT DEFAULT 'basic';

-- Update subscription_tier to use plan slugs (Basic, Pro, Pro Plus)
-- Map existing values if needed
UPDATE public.subscribers
SET current_plan_slug = CASE
  WHEN subscription_tier = 'Standard' THEN 'pro'
  WHEN subscription_tier = 'Premium' THEN 'pro-plus'
  WHEN subscription_tier IS NULL OR subscription_tier = '' THEN 'basic'
  ELSE LOWER(REPLACE(subscription_tier, ' ', '-'))
END
WHERE current_plan_slug IS NULL OR current_plan_slug = 'basic';

-- Create function to check if user is in trial
CREATE OR REPLACE FUNCTION public.is_user_in_trial(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  trial_end TIMESTAMPTZ;
BEGIN
  SELECT trial_end_at INTO trial_end
  FROM public.subscribers
  WHERE user_id = user_id_param;
  
  RETURN trial_end IS NOT NULL AND trial_end > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's effective plan (considering trial)
CREATE OR REPLACE FUNCTION public.get_user_effective_plan(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  plan_slug TEXT;
  in_trial BOOLEAN;
BEGIN
  SELECT current_plan_slug, is_user_in_trial(user_id_param)
  INTO plan_slug, in_trial
  FROM public.subscribers
  WHERE user_id = user_id_param;
  
  -- If user is on Basic and in trial, they get Pro-level access for Route Builder and Resume Builder
  -- But we still return 'basic' as the plan - the feature gates will check trial status separately
  RETURN COALESCE(plan_slug, 'basic');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

