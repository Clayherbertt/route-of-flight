-- Create subscription_plans table to manage subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  monthly_price_cents INTEGER,
  yearly_price_cents INTEGER,
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (
  name, 
  slug, 
  description, 
  monthly_price_cents, 
  yearly_price_cents, 
  is_free, 
  is_active, 
  sort_order,
  features
) VALUES
(
  'Basic',
  'basic',
  'Essential tools to get started with Route of Flight.',
  NULL,
  NULL,
  true,
  true,
  1,
  ARRAY[
    'Digital logbook with limited entries',
    'Basic hour tracking',
    'Access to all airline profile pages',
    'Searchable airline hiring requirements',
    'Basic résumé builder with a single template'
  ]
),
(
  'Pro',
  'pro',
  'Advanced tools for logging, analytics, and route planning.',
  1200,
  12900,
  false,
  true,
  2,
  ARRAY[
    'Unlimited digital logbook entries',
    'Automatic currency and requirement tracking',
    'Full Route Builder access',
    'Automatic hour syncing into route steps',
    'Hour analytics and detailed breakdowns',
    'Cloud sync and backup',
    'Priority support'
  ]
),
(
  'Pro Plus',
  'pro-plus',
  'Includes advanced career tools for applications and résumé building.',
  2000,
  21600,
  false,
  true,
  3,
  ARRAY[
    'Everything in Pro',
    'Full résumé builder access',
    'Unlimited résumé exports',
    'Premium résumé templates',
    'Guided résumé prompts',
    'Airline-optimized formatting',
    'Additional analytics for turbine, PIC/SIC, multi-engine',
    'Optional pre-application readiness tools'
  ]
)
ON CONFLICT (slug) DO NOTHING;

