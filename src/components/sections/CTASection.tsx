import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import aviationWing from "@/assets/aviation-wing.jpg";

const CTASection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/logbook");
    } else {
      navigate("/signin");
    }
  };

  const features = [
    "Unlimited flight entries",
    "Automatic currency tracking", 
    "Complete airline database",
    "Professional reports",
    "Mobile app access",
    "24/7 cloud sync"
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={aviationWing} 
          alt="Aircraft wing" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 aviation-gradient opacity-90"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Ready to Accelerate Your 
            <span className="block">Aviation Career?</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
            Join thousands of pilots who are already using Route of Flight to track their progress 
            and land their dream aviation jobs.
          </p>

          {/* Features List */}
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center text-white/90">
                <div className="bg-white/20 rounded-full p-1 mr-3">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Button 
              variant="secondary" 
              size="xl" 
              className="group text-xl px-12 py-8 bg-white text-primary hover:bg-white/90"
              onClick={handleGetStarted}
            >
              {user ? "View Your Dashboard" : "Start Free Today"}
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-white/70 text-sm">
            Free forever • No credit card required • Set up in 2 minutes
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-12 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10,000+</div>
              <div className="text-white/70 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-white/70 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">4.9★</div>
              <div className="text-white/70 text-sm">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;