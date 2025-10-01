import { useEffect, useState } from "react";
import { Book, Building2, TrendingUp, Shield, Clock, Users } from "lucide-react";

const ScrollingFeaturesSection = () => {
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleFeatures(prev => (prev.includes(index) ? prev : [...prev, index]));
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
      description: "Comprehensive flight logging with automatic currency tracking and regulatory compliance."
    },
    {
      icon: Building2,
      title: "Airline Database",
      description: "Complete profiles of US carriers with real-time hiring requirements and application tracking."
    },
    {
      icon: TrendingUp,
      title: "Career Analytics",
      description: "Advanced insights and progression tracking to optimize your path to the airlines."
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Bank-level security with full FAA regulation compliance and data backup."
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Live currency tracking, automatic calculations, and instant progress updates."
    },
    {
      icon: Users,
      title: "Community Network",
      description: "Connect with pilots, mentors, and industry professionals in your career journey."
    }
  ];

  const accentGradients = [
    "from-aviation-sky/60 via-aviation-sky/10 to-transparent",
    "from-aviation-navy/40 via-aviation-sky/10 to-transparent",
    "from-aviation-light/50 via-aviation-sky/10 to-transparent",
  ];

  const strategicPillars = [
    {
      title: "Logbook Automation",
      summary: "Import, reconcile, and audit every flight with confidence.",
    },
    {
      title: "Airline Intelligence",
      summary: "Track hiring requirements and application status in one hub.",
    },
    {
      title: "Career Momentum",
      summary: "Translate hours into next steps with analytics and mentorship.",
    },
  ];

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-aviation-sky/10 to-background" />
      <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-aviation-sky/20 blur-3xl opacity-60" />
      <div className="absolute bottom-[-10%] right-[-5%] h-96 w-96 rounded-full bg-aviation-navy/30 blur-3xl opacity-60" />

      <div className="relative z-10 container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-[0.85fr,1.15fr] items-start">
          <div className="space-y-10">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.4em] text-aviation-sky">
                Professional Platform for professional Pilots
                
              </p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Everything you need to
                <span className="block bg-gradient-to-r from-aviation-sky to-aviation-navy bg-clip-text text-transparent">
                  advance your career
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                From your first imported logbook entry to the day you class-date with an airline, Route of Flight keeps every compliance task, application milestone, and mentoring conversation in sync.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {strategicPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-aviation-sky/20 bg-card/60 p-4 backdrop-blur hover:border-aviation-sky/40 transition-colors"
                >
                  <p className="text-sm font-semibold text-foreground">{pillar.title}</p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {pillar.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-card/50 backdrop-blur-3xl border border-border/40" />
            <div className="relative rounded-3xl p-8">
              <div className="grid gap-6 md:grid-cols-2">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  const isVisible = visibleFeatures.includes(index);
                  const gradient = accentGradients[index % accentGradients.length];

                  return (
                    <div
                      key={feature.title}
                      data-index={index}
                      className={`feature-card group relative rounded-3xl bg-gradient-to-br ${gradient} p-[1px] transition-all duration-700 ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-background/95 p-6 shadow-lg shadow-aviation-navy/10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-aviation-sky/30 bg-aviation-sky/10">
                              <Icon className="h-6 w-6 text-aviation-sky" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                                0{index + 1}
                              </p>
                              <h3 className="text-lg font-semibold text-foreground group-hover:text-aviation-sky transition-colors">
                                {feature.title}
                              </h3>
                            </div>
                          </div>
                        </div>

                        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>

                        <div className="mt-6 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-muted-foreground/80">
                          <span>Included</span>
                          <span>Route of Flight</span>
                        </div>
                        <div className="absolute inset-x-6 bottom-4 h-[1px] bg-gradient-to-r from-transparent via-aviation-sky/30 to-transparent" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollingFeaturesSection;
