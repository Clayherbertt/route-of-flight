import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import aviationHero from "@/assets/aviation-hero.jpg";

const HeroSectionV2 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartLogbook = () => {
    if (user) {
      navigate("/logbook");
    } else {
      navigate("/signin");
    }
  };

  const handleViewAirlines = () => {
    if (user) {
      navigate("/airlines");
    } else {
      navigate("/signin");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Content */}
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-primary/10 border border-primary/20 rounded-full px-6 py-2 mb-8">
            <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm font-medium">Trusted by 10,000+ Professional Pilots</span>
          </div>

          <div className="pb-4">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[1.3]">
              Your Career
              <span className="block sky-gradient bg-clip-text text-transparent py-2">
                Takes Flight Here
              </span>
            </h1>
          </div>
          
          <p className="text-2xl md:text-3xl mb-12 max-w-3xl mx-auto text-muted-foreground font-light">
            The most comprehensive platform for professional pilots to track flights, 
            explore opportunities, and accelerate their aviation careers.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button variant="hero" size="xl" className="group text-xl px-12 py-8" onClick={handleStartLogbook}>
              {user ? "View Logbook" : "Start Free Today"}
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl" className="text-xl px-12 py-8 bg-background/50 backdrop-blur-sm border-2" onClick={handleViewAirlines}>
              <Play className="mr-3 h-6 w-6" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 card-shadow">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Active Pilots</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 card-shadow">
              <div className="text-3xl font-bold text-primary mb-2">50M+</div>
              <div className="text-sm text-muted-foreground">Flight Hours Tracked</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 card-shadow">
              <div className="text-3xl font-bold text-primary mb-2">80+</div>
              <div className="text-sm text-muted-foreground">Airlines Listed</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 card-shadow">
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionV2;