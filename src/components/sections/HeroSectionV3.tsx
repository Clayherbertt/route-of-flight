import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const HeroSectionV3 = () => {
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
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full px-8 py-3 mb-8">
              <Zap className="h-5 w-5 mr-3 text-primary" />
              <span className="font-medium">The Future of Flight Tracking</span>
            </div>

            <h1 className="text-7xl md:text-9xl font-black mb-8 leading-none tracking-tight">
              <span className="block">FLY</span>
              <span className="block sky-gradient bg-clip-text text-transparent">SMART</span>
            </h1>
            
            <p className="text-2xl md:text-3xl mb-12 max-w-4xl mx-auto text-muted-foreground font-light leading-relaxed">
              Revolutionary aviation career platform. Track every flight, explore every opportunity, 
              achieve every goal. Built by pilots, for pilots.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-16">
              <Button 
                variant="default" 
                size="xl" 
                className="group text-xl px-16 py-8 h-auto rounded-2xl aviation-shadow hover:shadow-2xl transform hover:scale-105 smooth-transition"
                onClick={handleStartLogbook}
              >
                {user ? "Dashboard" : "Launch App"}
                <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button 
                variant="ghost" 
                size="xl" 
                className="text-xl px-16 py-8 h-auto rounded-2xl group"
                onClick={handleViewAirlines}
              >
                <Play className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Interactive Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="group cursor-pointer">
              <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 text-center card-shadow hover:shadow-aviation smooth-transition transform hover:-translate-y-2 border border-border/50">
                <div className="text-4xl font-black text-primary mb-3 group-hover:scale-110 smooth-transition">10K+</div>
                <div className="text-sm font-medium text-muted-foreground">Pilots</div>
                <div className="text-xs text-muted-foreground/70 mt-1">Active Users</div>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 text-center card-shadow hover:shadow-aviation smooth-transition transform hover:-translate-y-2 border border-border/50">
                <div className="text-4xl font-black text-primary mb-3 group-hover:scale-110 smooth-transition">50M+</div>
                <div className="text-sm font-medium text-muted-foreground">Hours</div>
                <div className="text-xs text-muted-foreground/70 mt-1">Flight Time</div>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 text-center card-shadow hover:shadow-aviation smooth-transition transform hover:-translate-y-2 border border-border/50">
                <div className="text-4xl font-black text-primary mb-3 group-hover:scale-110 smooth-transition">500+</div>
                <div className="text-sm font-medium text-muted-foreground">Airlines</div>
                <div className="text-xs text-muted-foreground/70 mt-1">In Database</div>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 text-center card-shadow hover:shadow-aviation smooth-transition transform hover:-translate-y-2 border border-border/50">
                <div className="text-4xl font-black text-primary mb-3 group-hover:scale-110 smooth-transition">99.9%</div>
                <div className="text-sm font-medium text-muted-foreground">Uptime</div>
                <div className="text-xs text-muted-foreground/70 mt-1">Reliability</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionV3;