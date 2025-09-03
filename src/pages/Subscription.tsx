import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Settings } from "lucide-react";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const Subscription = () => {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const subscriptionPlans = [
    {
      title: "Standard",
      price: "$24.99",
      priceId: "price_standard_2499", // Replace with your actual Stripe price ID
      description: "Perfect for individual pilots and small operations",
      features: [
        "Digital logbook management",
        "Basic flight tracking",
        "Export capabilities",
        "Mobile access",
        "Email support"
      ]
    },
    {
      title: "Premium",
      price: "$59.99",
      priceId: "price_premium_5999", // Replace with your actual Stripe price ID
      description: "Advanced features for professional pilots and flight schools",
      features: [
        "Everything in Standard",
        "Advanced analytics",
        "Multi-aircraft management",
        "Custom reporting",
        "API access",
        "Priority support"
      ],
      isPopular: true
    }
  ];

  const checkSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      
      setSubscriptionData(data);
      toast.success("Subscription status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to check subscription");
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      window.open(data.url, '_blank');
    } catch (error: any) {
      toast.error(error.message || "Failed to open customer portal");
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 pt-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Please sign in to view subscription options</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 pt-24 pb-12">
        {/* Current Subscription Status */}
        {subscriptionData.subscribed && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Current Subscription
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkSubscription}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openCustomerPortal}
                    disabled={portalLoading}
                  >
                    <Settings className="h-4 w-4" />
                    Manage
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-primary">
                    {subscriptionData.subscription_tier} Plan
                  </p>
                  {subscriptionData.subscription_end && (
                    <p className="text-sm text-muted-foreground">
                      Renews on {new Date(subscriptionData.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 font-medium">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect subscription tier for your aviation needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {subscriptionPlans.map((plan) => (
            <SubscriptionCard
              key={plan.title}
              title={plan.title}
              price={plan.price}
              priceId={plan.priceId}
              description={plan.description}
              features={plan.features}
              isCurrentTier={subscriptionData.subscription_tier === plan.title}
              isPopular={plan.isPopular}
            />
          ))}
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={checkSubscription}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Checking..." : "Refresh Subscription Status"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Subscription;