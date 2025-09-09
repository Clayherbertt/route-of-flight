import { Button } from "@/components/ui/button";
import { ArrowRight, Twitter, Linkedin, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const MinimalFooter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/logbook");
    } else {
      navigate("/signin");
    }
  };

  return (
    <footer className="py-24 bg-background border-t border-border/50">
      <div className="container mx-auto px-6">
        {/* Final CTA */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black mb-8">
            READY FOR 
            <span className="block aviation-gradient bg-clip-text text-transparent">TAKEOFF?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of pilots already accelerating their careers
          </p>
          <Button 
            variant="default" 
            size="xl" 
            className="group text-xl px-16 py-8 h-auto rounded-2xl aviation-shadow hover:shadow-2xl transform hover:scale-105 smooth-transition"
            onClick={handleGetStarted}
          >
            {user ? "Go to Dashboard" : "Start Free Now"}
            <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>

        {/* Minimal Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-border/30">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-black mb-2">Route of Flight</h3>
            <p className="text-sm text-muted-foreground">
              The professional pilot platform • Built by aviators, for aviators
            </p>
          </div>

          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <button className="text-muted-foreground hover:text-primary smooth-transition">
                <Twitter className="h-5 w-5" />
              </button>
              <button className="text-muted-foreground hover:text-primary smooth-transition">
                <Linkedin className="h-5 w-5" />
              </button>
              <button className="text-muted-foreground hover:text-primary smooth-transition">
                <Instagram className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary smooth-transition">Privacy</a>
              <a href="#" className="hover:text-primary smooth-transition">Terms</a>
              <a href="#" className="hover:text-primary smooth-transition">Support</a>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 pt-8 border-t border-border/30">
          <p className="text-sm text-muted-foreground">
            © 2024 Route of Flight. All rights reserved. • Made with ❤️ for aviation professionals
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MinimalFooter;