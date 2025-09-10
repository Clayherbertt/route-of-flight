import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const AnimatedHeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-aviation-navy/20">
      {/* Removed aircraft PNGs as requested */}

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-aviation-sky/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              transform: `translateY(${scrollY * (0.1 + i * 0.05)}px)`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-12 text-center min-h-screen flex flex-col justify-center">
        {/* Tagline */}
        <div className="animate-fade-in mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-aviation-sky/10 border border-aviation-sky/20 text-aviation-sky text-sm font-medium">
            ✈️ Professional Aviation Platform
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight animate-fade-in animation-delay-200">
          Navigate Your
          <span className="block sky-gradient bg-clip-text text-transparent mt-2">
            Aviation Journey
          </span>
        </h1>
        
        {/* Description */}
        <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-muted-foreground leading-relaxed animate-fade-in animation-delay-400">
          The complete digital ecosystem for professional pilots. Track flight hours, 
          maintain currency, and chart your course to the airlines.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in animation-delay-600">
          <Button 
            variant="default" 
            size="lg" 
            className="group px-8 py-4 text-lg hover-scale" 
            onClick={handleStartLogbook}
          >
            {user ? "View Dashboard" : "Start Free Today"}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-4 text-lg hover-scale border-aviation-sky/30 hover:border-aviation-sky hover:bg-aviation-sky/10" 
            onClick={handleViewAirlines}
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in animation-delay-800">
          {[
            { number: "2,500+", label: "Active Pilots" },
            { number: "50K+", label: "Flight Hours Logged" },
            { number: "45", label: "Partner Airlines" },
            { number: "99.9%", label: "Uptime" },
          ].map((stat, index) => (
            <div 
              key={index} 
              className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover-scale"
              style={{ animationDelay: `${0.8 + index * 0.1}s` }}
            >
              <div className="text-2xl md:text-3xl font-bold text-aviation-sky mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedHeroSection;