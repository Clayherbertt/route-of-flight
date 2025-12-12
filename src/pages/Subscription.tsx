import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type PlanSlug = "pro" | "pro-plus";
type BillingInterval = "month" | "year";
type BillingCycle = "monthly" | "yearly";

const PRICE_IDS: Record<PlanSlug, Record<BillingInterval, string>> = {
  pro: {
    month: "price_1SdNdEB9GgOD5ExOdAc5Zzkr",
    year: "price_1SdNdrB9GgOD5ExO2WhycsfE",
  },
  "pro-plus": {
    month: "price_1SdNeSB9GgOD5ExODm7HYov4",
    year: "price_1SdNf8B9GgOD5ExO199JIxhY",
  },
};

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price_cents: number | null;
  yearly_price_cents: number | null;
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
  features: string[];
  limitations: string[];
  created_at: string;
  updated_at: string;
}

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  // Fetch subscription plans from database
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    
    setCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      
      setSubscriptionData(data);
      toast.success("Subscription status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to check subscription");
    } finally {
      setCheckingSubscription(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const formatPrice = (cents: number | null): number => {
    if (cents === null) return 0;
    return cents / 100;
  };

  const calculateSavings = (monthlyCents: number | null, yearlyCents: number | null): number => {
    if (!monthlyCents || !yearlyCents) return 0;
    const monthlyCost = monthlyCents * 12;
    return (monthlyCost - yearlyCents) / 100;
  };

  const handleSubscribe = async (planSlug: PlanSlug, billing: BillingInterval) => {
    // For free plan (basic), just navigate to sign in or logbook
    if (planSlug === 'basic' || (planSlug !== 'pro' && planSlug !== 'pro-plus')) {
      if (!user) {
        navigate('/signin');
      } else {
        navigate('/logbook');
      }
      return;
    }

    const priceId = PRICE_IDS[planSlug]?.[billing];

    if (!priceId) {
      toast.error("Subscription pricing not available. Please contact support.");
      return;
    }

    // For paid plans
    if (!user) {
      // User is signed out - store plan info and redirect to sign up
      localStorage.setItem('pendingSubscriptionPriceId', priceId);
      localStorage.setItem('pendingSubscriptionPlan', planSlug);
      localStorage.setItem('pendingSubscriptionBilling', billing);
      
      // Redirect to sign up page
      navigate('/signin?tab=signup');
      return;
    }

    // User is signed in - proceed to Stripe checkout
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) {
        console.error("Error creating checkout session:", error);
        toast.error(error.message || "Failed to create checkout session");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned from create-checkout");
        toast.error("Failed to redirect to checkout");
      }
    } catch (err: any) {
      console.error("Unexpected error starting checkout:", err);
      toast.error(err.message || "An unexpected error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 pt-24 pb-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading plans...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-slate-900 mb-3 text-4xl md:text-5xl font-bold">Choose Your Plan</h1>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6 text-lg md:text-xl">
            Select the perfect subscription plan for your aviation career journey. All plans
            include access to our comprehensive airline database.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`transition-colors text-sm ${
                billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-12 h-6 bg-slate-200 rounded-full transition-colors hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-[#24587E] focus:ring-offset-2 focus:ring-offset-white"
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-lg brand-gradient-primary"
                animate={{ x: billingCycle === 'yearly' ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span
              className={`transition-colors text-sm ${
                billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-2 px-2 py-0.5 bg-green-50 text-green-600 rounded-md text-xs border border-green-200"
              >
                Save up to 20%
              </motion.span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {plans.map((plan) => {
            const isPopular = plan.slug === 'pro';
            const monthlyPrice = formatPrice(plan.monthly_price_cents);
            const yearlyPrice = formatPrice(plan.yearly_price_cents);
            const price = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice;
            const savings = calculateSavings(plan.monthly_price_cents, plan.yearly_price_cents);
            const billing: BillingInterval = billingCycle === 'monthly' ? 'month' : 'year';
            const planSlug = plan.slug as PlanSlug;

            return (
              <motion.div
                key={plan.id}
                layout
                className={`relative bg-white backdrop-blur-sm rounded-xl p-6 lg:p-8 border-2 transition-all hover:scale-[1.02] shadow-sm ${
                  isPopular
                    ? 'brand-border shadow-lg brand-shadow'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="brand-gradient-primary text-white px-3 py-0.5 rounded-full text-xs shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-slate-900 mb-2 text-2xl font-bold">{plan.name}</h3>
                  <p className="text-slate-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    {price === 0 ? (
                      <span className="text-slate-900 text-3xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-slate-900 text-3xl font-bold">${price.toFixed(2)}</span>
                        <span className="text-slate-500 text-base">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </>
                    )}
                  </div>
                  {billingCycle === 'yearly' && monthlyPrice > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1"
                    >
                      <p className="text-xs text-slate-600">
                        or ${monthlyPrice.toFixed(2)}/month
                      </p>
                      {savings > 0 && (
                        <p className="text-xs text-green-600 font-medium">Save ${savings.toFixed(2)}/year</p>
                      )}
                    </motion.div>
                  )}
                  {billingCycle === 'monthly' && yearlyPrice > 0 && savings > 0 && (
                    <p className="text-xs text-slate-600 mt-1">
                      or ${yearlyPrice.toFixed(2)}/year • Save ${savings.toFixed(2)}/year
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (plan.is_free) {
                      handleSubscribe('basic' as PlanSlug, 'month');
                    } else {
                      handleSubscribe(planSlug, billing);
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-lg transition-all mb-5 text-base font-medium ${
                    isPopular
                      ? 'brand-button text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  {plan.is_free 
                    ? 'Get Started Free'
                    : `Get Started${price > 0 ? ` – $${price.toFixed(2)}/${billingCycle === 'monthly' ? 'mo' : 'year'}` : ''}`
                  }
                </button>

                <div className="space-y-4">
                  <div>
                    <p className="text-slate-600 text-sm mb-3 font-semibold">What's included:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations && plan.limitations.length > 0 && (
                    <div>
                      <p className="text-slate-600 text-sm mb-3 font-semibold">Limitations:</p>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-500">
                            <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-8">
          All plans include a 7-day free trial. Cancel anytime, no questions asked.
        </p>
      </main>
    </div>
  );
};

export default Subscription;
