import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/ROF Blue PNG.png";

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, resetPassword, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [signInForm, setSignInForm] = useState({ email: "", password: "" });
  const [signUpForm, setSignUpForm] = useState({ 
    firstName: "",
    lastName: "",
    email: "", 
    password: "", 
    confirmPassword: "" 
  });

  // Get the default tab from URL params
  const defaultTab = searchParams.get('tab') || 'signin';

  // Check for pending subscription when user becomes authenticated
  useEffect(() => {
    const checkPendingSubscription = async () => {
      if (!user) return;
      
      const pendingPriceId = localStorage.getItem('pendingSubscriptionPriceId');
      if (!pendingPriceId) return;

      console.log('User authenticated, checking for pending subscription:', pendingPriceId);
      
      // Clear the pending subscription from localStorage
      localStorage.removeItem('pendingSubscriptionPriceId');
      localStorage.removeItem('pendingSubscriptionPlan');
      localStorage.removeItem('pendingSubscriptionBilling');
      
      // Wait a bit more to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create Stripe checkout session
      try {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: { priceId: pendingPriceId },
        });

        if (error) {
          console.error("Error creating checkout session:", error);
          toast.error(error.message || "Failed to create checkout session");
          toast.info("You can subscribe from the subscription page.");
          return;
        }

        if (data?.url) {
          toast.success("Redirecting to checkout...");
          window.location.href = data.url;
        } else {
          console.error("No checkout URL returned from create-checkout");
          toast.info("You can subscribe from the subscription page.");
        }
      } catch (checkoutError: any) {
        console.error("Unexpected error starting checkout:", checkoutError);
        toast.info("You can subscribe from the subscription page.");
      }
    };

    checkPendingSubscription();
  }, [user]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(signInForm.email, signInForm.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: signUpForm.email,
        password: signUpForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: signUpForm.firstName,
            last_name: signUpForm.lastName,
            display_name: signUpForm.firstName ? `${signUpForm.firstName} ${signUpForm.lastName || ''}`.trim() : undefined
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Check if there's a pending subscription
      const pendingPriceId = localStorage.getItem('pendingSubscriptionPriceId');
      
      if (pendingPriceId && signUpData?.session) {
        // User has a session immediately (email confirmation disabled or auto-confirmed)
        // Clear the pending subscription from localStorage
        localStorage.removeItem('pendingSubscriptionPriceId');
        localStorage.removeItem('pendingSubscriptionPlan');
        localStorage.removeItem('pendingSubscriptionBilling');
        
        // Wait a moment for the session to be fully established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create Stripe checkout session
        try {
          const { data, error } = await supabase.functions.invoke("create-checkout", {
            body: { priceId: pendingPriceId },
          });

          if (error) {
            console.error("Error creating checkout session:", error);
            toast.error(error.message || "Failed to create checkout session");
            toast.success("Account created! You can subscribe from the subscription page.");
            navigate("/");
            return;
          }

          if (data?.url) {
            toast.success("Account created! Redirecting to checkout...");
            window.location.href = data.url;
            return;
          } else {
            console.error("No checkout URL returned from create-checkout");
            toast.success("Account created! You can subscribe from the subscription page.");
            navigate("/");
            return;
          }
        } catch (checkoutError: any) {
          console.error("Unexpected error starting checkout:", checkoutError);
          toast.success("Account created! You can subscribe from the subscription page.");
          navigate("/");
          return;
        }
      } else if (pendingPriceId) {
        // No session yet - email verification required
        // The useEffect hook will handle redirecting to Stripe once user verifies email and signs in
        toast.success("Account created! Please check your email to verify your account. After verification, you'll be redirected to checkout.");
        navigate("/");
      } else {
        // No pending subscription, just navigate home
        toast.success("Account created! Please check your email to verify your account.");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!signInForm.email) {
      toast.error("Please enter your email address first");
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(signInForm.email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Animated Logo */}
        <div className="text-center -mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 1,
              ease: "easeOut",
              scale: {
                type: "spring",
                stiffness: 80,
                damping: 12
              }
            }}
            className="flex justify-center"
          >
            <Link 
              to="/" 
              className="flex items-center relative no-underline focus:outline-none focus:ring-0 hover:opacity-100"
              style={{ outline: 'none' }}
            >
              <motion.img 
                src={logo} 
                alt="Route of Flight" 
                className="h-80 w-auto"
                initial={{ filter: "blur(10px)" }}
                animate={{ filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </Link>
          </motion.div>
        </div>

        {/* Animated Sign In Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInForm.password}
                      onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                    variant="aviation"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-muted-foreground hover:text-primary"
                      onClick={handleResetPassword}
                      disabled={resetLoading}
                    >
                      {resetLoading ? "Sending..." : "Forgot Password?"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Legal First Name</Label>
                      <Input
                        id="first-name"
                        type="text"
                        placeholder="First name"
                        value={signUpForm.firstName}
                        onChange={(e) => setSignUpForm({ ...signUpForm, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Legal Last Name</Label>
                      <Input
                        id="last-name"
                        type="text"
                        placeholder="Last name"
                        value={signUpForm.lastName}
                        onChange={(e) => setSignUpForm({ ...signUpForm, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpForm.email}
                      onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpForm.password}
                      onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signUpForm.confirmPassword}
                      onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                    variant="aviation"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;