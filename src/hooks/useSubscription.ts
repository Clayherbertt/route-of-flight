import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserSubscription, Plan } from '@/lib/featureGates';

interface SubscriptionState {
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and manage user subscription status
 * Automatically initializes trial for new Basic users
 */
export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    loading: true,
    error: null,
  });

  const fetchSubscription = async () => {
    if (!user) {
      setState({ subscription: null, loading: false, error: null });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch subscription from subscribers table
      // Try to select new columns first, fallback to old columns if migration hasn't run
      let subscriberData: any = null;
      let subError: any = null;
      
      const { data, error } = await supabase
        .from('subscribers')
        .select('current_plan_slug, trial_start_at, trial_end_at, subscribed, subscription_tier')
        .eq('user_id', user.id)
        .maybeSingle();
      
      subscriberData = data;
      subError = error;

      // If column doesn't exist (migration not run), try with old columns
      if (subError && (subError.message?.includes('column') || subError.code === '42703')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('subscribers')
          .select('subscription_tier, subscribed')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (fallbackError && fallbackError.code !== 'PGRST116') {
          throw fallbackError;
        }
        
        subscriberData = fallbackData;
        subError = null;
      } else if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      // If no subscription record exists, create one with Basic plan and start trial
      if (!subscriberData) {
        const trialStart = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7); // 7-day trial

        const { data: newSubscriber, error: insertError } = await supabase
          .from('subscribers')
          .insert({
            user_id: user.id,
            email: user.email || '',
            current_plan_slug: Plan.BASIC,
            subscribed: false,
            trial_start_at: trialStart.toISOString(),
            trial_end_at: trialEnd.toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setState({
          subscription: {
            current_plan_slug: newSubscriber.current_plan_slug || Plan.BASIC,
            trial_start_at: newSubscriber.trial_start_at,
            trial_end_at: newSubscriber.trial_end_at,
            subscribed: newSubscriber.subscribed || false,
          },
          loading: false,
          error: null,
        });
      } else {
        // Map old subscription_tier to new current_plan_slug if needed
        let planSlug = subscriberData.current_plan_slug;
        if (!planSlug && subscriberData.subscription_tier) {
          // Map legacy tier names to new slugs
          const tier = subscriberData.subscription_tier.toLowerCase();
          if (tier === 'standard' || tier === 'pro') {
            planSlug = Plan.PRO;
          } else if (tier === 'premium' || tier === 'pro-plus' || tier === 'pro_plus') {
            planSlug = Plan.PRO_PLUS;
          } else {
            planSlug = Plan.BASIC;
          }
        }
        
        setState({
          subscription: {
            current_plan_slug: planSlug || Plan.BASIC,
            trial_start_at: subscriberData.trial_start_at || null,
            trial_end_at: subscriberData.trial_end_at || null,
            subscribed: subscriberData.subscribed || false,
          },
          loading: false,
          error: null,
        });
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      setState({
        subscription: null,
        loading: false,
        error: error.message || 'Failed to load subscription',
      });
    }
  };

  useEffect(() => {
    fetchSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    ...state,
    refetch: fetchSubscription,
  };
}

