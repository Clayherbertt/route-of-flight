-- Update subscription plan features and limitations to match implemented feature gating

-- Update Basic Plan
UPDATE public.subscription_plans
SET 
  description = 'Essential tools to get started with Route of Flight.',
  features = ARRAY[
    'Digital logbook with limited entries (3 entries max)',
    'Basic hour tracking',
    'Access to all airline profile pages',
    'Searchable airline hiring requirements',
    'Route Builder access (7-day free trial)',
    'Résumé Builder access (7-day free trial)'
  ]
WHERE slug = 'basic';

-- Update Pro Plan
UPDATE public.subscription_plans
SET 
  description = 'Advanced tools for logging, analytics, and route planning.',
  features = ARRAY[
    'Unlimited digital logbook entries',
    'Automatic currency and requirement tracking',
    'Full Route Builder access',
    'Automatic hour syncing into route steps',
    'Hour analytics and detailed breakdowns',
    'Cloud sync and backup',
    'Priority support',
    'Full résumé builder access',
    'Unlimited résumé exports',
    'Premium résumé templates',
    'Guided résumé prompts',
    'Airline-optimized formatting',
    'Manual résumé hour entry (auto-sync available on Pro Plus)'
  ]
WHERE slug = 'pro';

-- Update Pro Plus Plan
UPDATE public.subscription_plans
SET 
  description = 'Includes advanced career tools for applications and résumé building with full feature access.',
  features = ARRAY[
    'Everything in Pro',
    'World / map view of recent flights',
    'Logbook predictions tool (milestone estimator)',
    'Automatic logbook syncing to résumé',
    'Additional analytics for turbine, PIC/SIC, multi-engine',
    'Optional pre-application readiness tools'
  ]
WHERE slug = 'pro-plus';

