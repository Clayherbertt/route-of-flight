import { useEffect, useState } from "react";
import { Book, Building2, TrendingUp, Shield, Clock, Users } from "lucide-react";

const ScrollingFeaturesSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleFeatures(prev => [...prev, index]);
          }
        });
      },
      { threshold: 0.3 }
    );

    const elements = document.querySelectorAll('.feature-card');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Book,
      title: "Digital Logbook",
      description: "Comprehensive flight logging with automatic currency tracking and regulatory compliance.",
      aircraft: "/lovable-uploads/20ac9e9e-9335-4712-9293-9cd8c3398fbd.png"
    },
    {
      icon: Building2,
      title: "Airline Database",
      description: "Complete profiles of US carriers with real-time hiring requirements and application tracking.",
      aircraft: "/lovable-uploads/aec766ea-ce67-4779-9c02-1899b323b772.png"
    },
    {
      icon: TrendingUp,
      title: "Career Analytics",
      description: "Advanced insights and progression tracking to optimize your path to the airlines.",
      aircraft: "/lovable-uploads/4e62a767-b61c-46c7-b2ec-97c987a12622.png"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Bank-level security with full FAA regulation compliance and data backup.",
      aircraft: "/lovable-uploads/20ac9e9e-9335-4712-9293-9cd8c3398fbd.png"
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Live currency tracking, automatic calculations, and instant progress updates.",
      aircraft: "/lovable-uploads/aec766ea-ce67-4779-9c02-1899b323b772.png"
    },
    {
      icon: Users,
      title: "Community Network",
      description: "Connect with pilots, mentors, and industry professionals in your career journey.",
      aircraft: "/lovable-uploads/4e62a767-b61c-46c7-b2ec-97c987a12622.png"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated background aircraft */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-10 left-1/4 w-20 h-20 opacity-5"
          style={{
            transform: `translateX(${scrollY * 0.1}px) rotate(${scrollY * 0.02}deg)`,
          }}
        >
          <img 
            src="/lovable-uploads/20ac9e9e-9335-4712-9293-9cd8c3398fbd.png" 
            alt="Aircraft" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div 
          className="absolute bottom-1/4 right-1/3 w-24 h-24 opacity-5"
          style={{
            transform: `translateX(${scrollY * -0.08}px) rotate(${scrollY * -0.03}deg)`,
          }}
        >
          <img 
            src="/lovable-uploads/aec766ea-ce67-4779-9c02-1899b323b772.png" 
            alt="Business Jet" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to
            <span className="block sky-gradient bg-clip-text text-transparent">
              Advance Your Career
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional-grade tools designed specifically for pilots pursuing airline careers
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = visibleFeatures.includes(index);
            
            return (
              <div
                key={index}
                data-index={index}
                className={`feature-card group relative bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-aviation-sky/30 transition-all duration-700 ${
                  isVisible ? 'animate-fade-in translate-y-0' : 'translate-y-8 opacity-0'
                }`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  transform: isVisible ? 'translateY(0)' : 'translateY(32px)'
                }}
              >
                {/* Feature aircraft that slides in */}
                <div className={`absolute -top-4 -right-4 w-16 h-16 transition-all duration-1000 ${
                  isVisible ? 'translate-x-0 opacity-30' : 'translate-x-8 opacity-0'
                }`}>
                  <img 
                    src={feature.aircraft} 
                    alt="Feature Aircraft" 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-aviation-sky/10 flex items-center justify-center mr-4 group-hover:bg-aviation-sky/20 transition-colors">
                      <Icon className="h-6 w-6 text-aviation-sky" />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-aviation-sky transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-aviation-sky/5 to-aviation-light/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ScrollingFeaturesSection;