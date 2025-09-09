import { Card, CardContent } from "@/components/ui/card";
import { 
  Book, 
  Building2, 
  TrendingUp, 
  Shield, 
  Clock, 
  Globe,
  Smartphone,
  BarChart3,
  Award
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Book,
      title: "Digital Logbook",
      description: "Comprehensive flight logging with automatic currency tracking and backup",
      highlight: "Cloud Sync"
    },
    {
      icon: Building2,
      title: "Airline Database",
      description: "Complete profiles of 500+ US carriers with real-time hiring information",
      highlight: "Live Updates"
    },
    {
      icon: TrendingUp,
      title: "Career Analytics",
      description: "Track progress and identify the fastest path to your dream job",
      highlight: "AI Insights"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Bank-level encryption with FAA regulation compliance built-in",
      highlight: "SOC 2 Certified"
    },
    {
      icon: Clock,
      title: "Currency Tracking",
      description: "Never miss a deadline with automatic currency calculations",
      highlight: "Smart Alerts"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Access your data from anywhere in the world, on any device",
      highlight: "24/7 Available"
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Full-featured mobile app for logging flights on the go",
      highlight: "iOS & Android"
    },
    {
      icon: BarChart3,
      title: "Advanced Reports",
      description: "Generate professional reports for interviews and applications",
      highlight: "PDF Export"
    },
    {
      icon: Award,
      title: "Industry Leading",
      description: "Trusted by major airlines and flight training organizations",
      highlight: "Award Winner"
    }
  ];

  return (
    <section className="py-24 bg-subtle-gradient">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">
            Everything You Need to 
            <span className="sky-gradient bg-clip-text text-transparent"> Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful tools designed specifically for aviation professionals. 
            From first solo to airline captain, we've got you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group card-shadow hover:shadow-aviation smooth-transition cursor-pointer bg-card/50 backdrop-blur-sm border-border/50"
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 smooth-transition">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-xs font-semibold bg-accent/20 text-accent-foreground px-3 py-1 rounded-full">
                      {feature.highlight}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-primary smooth-transition">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;