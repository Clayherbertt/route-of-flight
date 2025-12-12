-- Add limitations column to subscription_plans table
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS limitations TEXT[] DEFAULT '{}';

-- Update existing plans with limitations
UPDATE public.subscription_plans
SET limitations = ARRAY[
  'Limited logbook entries (3 max)',
  'Route Builder locked after 7-day trial',
  'Résumé Builder locked after 7-day trial',
  'No analytics or breakdowns',
  'No cloud sync'
]
WHERE slug = 'basic';

-- Pro and Pro Plus don't have limitations, so they remain empty arrays

