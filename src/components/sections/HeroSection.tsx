import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Building2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
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
    <section className="min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Navigate Your
          <span className="block sky-gradient bg-clip-text text-transparent">
            Aviation Career
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-muted-foreground leading-relaxed">
          The complete digital logbook and career platform for professional pilots. 
          Track hours, maintain currency, and build a road map to get you to your end goal.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button variant="default" size="xl" className="group" onClick={handleStartLogbook}>
            {user ? "View your logbook" : "Start Your Logbook"}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="xl" onClick={handleViewAirlines}>
            View Airlines Database
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-card rounded-lg p-6 border border-border card-shadow">
            <Book className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Digital Logbook</h3>
            <p className="text-muted-foreground">Comprehensive flight logging with automatic currency tracking</p>
          </div>
          
          <div className="bg-card rounded-lg p-6 border border-border card-shadow">
            <Building2 className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Airline Database</h3>
            <p className="text-muted-foreground">Complete profiles of US carriers with hiring requirements</p>
          </div>
          
          <div className="bg-card rounded-lg p-6 border border-border card-shadow">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Career Growth</h3>
            <p className="text-muted-foreground">Track progress and identify opportunities for advancement</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;