import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface SubscriptionCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  priceId: string;
  isCurrentTier?: boolean;
  isPopular?: boolean;
}

export const SubscriptionCard = ({
  title,
  price,
  description,
  features,
  priceId,
  isCurrentTier = false,
  isPopular = false,
}: SubscriptionCardProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''} ${isCurrentTier ? 'ring-2 ring-primary' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}
      {isCurrentTier && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white">
          Current Plan
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="text-3xl font-bold text-primary">
          {price}<span className="text-sm font-normal text-muted-foreground">/month</span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button
          className="w-full"
          onClick={handleSubscribe}
          disabled={loading || isCurrentTier}
          variant={isCurrentTier ? "outline" : "default"}
        >
          {loading ? "Loading..." : isCurrentTier ? "Current Plan" : "Subscribe"}
        </Button>
      </CardContent>
    </Card>
  );
};