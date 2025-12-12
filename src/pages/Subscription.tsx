import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const formatPrice = (cents: number | null): string => {
    if (cents === null) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const calculateYearlySavings = (monthlyCents: number | null, yearlyCents: number | null): number | null => {
    if (!monthlyCents || !yearlyCents) return null;
    const monthlyTotal = monthlyCents * 12;
    const savings = monthlyTotal - yearlyCents;
    return savings > 0 ? savings : null;
  };

  const handleSubscribe = async (plan: SubscriptionPlan, isYearly: boolean = false) => {
    if (plan.is_free) {
      // For free plan, just navigate to sign in or logbook
      if (!user) {
        navigate('/signin');
      } else {
        navigate('/logbook');
      }
      return;
    }

    // For paid plans, we'd need to integrate with Stripe
    // For now, show a message
    toast.info('Subscription checkout coming soon');
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
      <main className="container mx-auto px-6 pt-8 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Select the perfect subscription plan for your aviation career journey. All plans include access to our comprehensive airline database.
          </p>
        </div>

        {/* Subscription Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {plans.map((plan, index) => {
            const isPopular = plan.slug === 'pro';
            const yearlySavings = calculateYearlySavings(plan.monthly_price_cents, plan.yearly_price_cents);
            const isBasic = plan.slug === 'basic';

            return (
              <Card 
                key={plan.id} 
                className={`relative ${isPopular ? 'border-primary border-2 shadow-lg' : ''}`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  
                  {/* Pricing */}
                  <div className="mt-6">
                    {plan.is_free ? (
                      <div className="text-3xl font-bold text-primary">Free</div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-primary">
                          {formatPrice(plan.monthly_price_cents)}
                          <span className="text-lg font-normal text-muted-foreground"> /month</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          or {formatPrice(plan.yearly_price_cents)}/year
                          {yearlySavings && (
                            <span className="text-green-600 font-medium ml-2">
                              Save {formatPrice(yearlySavings)}/year
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* What's Included */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground">What's included:</h3>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations (if any) */}
                  {plan.limitations && plan.limitations.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Limitations:</h3>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleSubscribe(plan)}
                      variant={isPopular ? "default" : "outline"}
                    >
                      Get Started Free
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          All plans include a 7-day free trial. Cancel anytime, no questions asked.
        </div>
      </main>
    </div>
  );
};

export default Subscription;
