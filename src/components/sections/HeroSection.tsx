import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Building2, TrendingUp } from "lucide-react";
import heroImage from "@/assets/aviation-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Professional aviation cockpit view"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Navigate Your
          <span className="block sky-gradient bg-clip-text text-transparent">
            Aviation Career
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90 leading-relaxed">
          The complete digital logbook and career platform for professional pilots. 
          Track hours, maintain currency, and explore opportunities at top airlines.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button variant="hero" size="xl" className="group">
            Start Your Logbook
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="xl" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
            View Airlines Database
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 card-shadow">
            <Book className="h-8 w-8 text-aviation-sky mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Digital Logbook</h3>
            <p className="text-white/80">Comprehensive flight logging with automatic currency tracking</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 card-shadow">
            <Building2 className="h-8 w-8 text-aviation-sky mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Airline Database</h3>
            <p className="text-white/80">Complete profiles of US carriers with hiring requirements</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 card-shadow">
            <TrendingUp className="h-8 w-8 text-aviation-sky mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Career Growth</h3>
            <p className="text-white/80">Track progress and identify opportunities for advancement</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;