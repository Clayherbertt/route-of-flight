import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check subscription status after successful payment
    const checkSubscription = async () => {
      try {
        await supabase.functions.invoke('check-subscription');
        toast.success("Subscription activated successfully!");
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    checkSubscription();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                Subscription Successful!
              </CardTitle>
              <CardDescription>
                Thank you for subscribing. Your account has been upgraded and you now have access to all premium features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You should receive a confirmation email shortly with your subscription details.
              </p>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/subscription")}
                >
                  View Subscription Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionSuccess;