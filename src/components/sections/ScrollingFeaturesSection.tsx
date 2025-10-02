import { useEffect, useState } from "react";
import { CalendarClock, PlaneTakeoff, Radar, ShieldCheck, TrendingUp, Users } from "lucide-react";

const ScrollingFeaturesSection = () => {
  const [visiblePhases, setVisiblePhases] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisiblePhases(prev => (prev.includes(index) ? prev : [...prev, index]));
          }
        });
      },
      { threshold: 0.3 }
    );

    const elements = document.querySelectorAll('.mission-card');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const quickStats = [
    { value: "37+", label: "Routes Created" },
    { value: "2800", label: "Milestones auto-tracked" },
    { value: "250+", label: "Routes accomplished" },
  ];

  const runwayPhases = [
    {
      icon: PlaneTakeoff,
      badge: "Route Builder • 01",
      title: "Start from zero hours",
      description: "Discovery flights, medical, and flight school shopping to set you up for success.",
      details: [
        "Personalized readiness checklist with medical guidance and flight school shopping tips",
        "Discovery flight guide to help you make the best decision",
        "Additional tips designed to help you make informed decisions",
      ],
    },
    {
      icon: Radar,
      badge: "Route Builder • 02",
      title: "Build time with purpose",
      description: "Logbook tracking to keep your goals and route aligned with your end goal.",
      details: [
        "Hour calculator that tracks instrument, XC, and night flight time",
        "Recommended what targeted goal should be completed in each order",
        "Logbook countdown at each step to show how close you are to your next milestone",
      ],
    },
  ];

  const runwayPhasesRowTwo = [
    {
      icon: TrendingUp,
      badge: "Route Builder • 03",
      title: "Cadet program guidance",
      description: "Wanting to join a cadet program? Using the route builder tracks all milestones and requirements.",
      details: [
        "Logbook integration to track your milestones and hours",
        "Step by step guide to accomplishing each cadet program requirement",
        "Never miss a goal with automated reminders",
      ],
    },
    {
      icon: ShieldCheck,
      badge: "Route Builder • 04",
      title: "Graduate to the flight deck",
      description: "Convert hours into airline-ready portfolios, mock interviews, and mentor sign-offs.",
      details: [
        "Airline comparison board tailored to your flight profile",
        "Resume and logbook export bundles formatted for airlines",
        "Airline requirements built right into your route milestones",
      ],
    },
  ];

  const missionHighlights = [
    {
      icon: CalendarClock,
      title: "Milestone tracker",
      description: "Easily track your flight hours and stay motivated with milestones that mark your progress along the way.",
    },
    {
      icon: Users,
      title: "Guided mentorship",
      description: "Get a clear path with built-in mentorship. Route Builder breaks goals into simple steps so progress is never guesswork.",
    },
  ];

  const phaseGradients = [
    "from-aviation-sky/60 via-aviation-sky/15 to-transparent",
    "from-aviation-navy/40 via-aviation-sky/15 to-transparent",
    "from-aviation-light/50 via-aviation-sky/15 to-transparent",
  ];

  return (
    <section className="relative overflow-hidden py-20 bg-background">
      <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-aviation-sky/15 blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-5%] h-96 w-96 rounded-full bg-aviation-navy/20 blur-3xl opacity-50" />

      <div className="relative z-10 container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-[0.95fr,1.05fr] items-start lg:items-stretch">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.4em] text-accent-gradient">Route Builder flight plan</p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Guide every aspiring pilot from
                <span className="block text-accent-gradient">
                  zero hours to the jet seat
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Unsure where to start? Route Builder breaks training into approachable missions, adapts to your pace, and makes sure every milestone is ready before you ever walk into a checkride or airline interview.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {quickStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-aviation-sky/20 bg-card/60 p-5 backdrop-blur">
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-border/30 bg-card/70 p-5 backdrop-blur">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                {missionHighlights.map((highlight) => {
                  const Icon = highlight.icon;
                  return (
                    <div key={highlight.title} className="flex items-start gap-4">
                      <div className="rounded-xl border border-aviation-sky/30 bg-aviation-sky/10 p-2.5">
                        <Icon className="h-5 w-5 text-aviation-sky" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{highlight.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-xs">
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative lg:h-full">
            <div className="absolute inset-0 rounded-3xl bg-card/60 backdrop-blur-3xl border border-border/40" />
            <div className="relative rounded-3xl p-7 h-full flex flex-col">
              <div className="grid gap-4 md:grid-cols-2 flex-1 min-h-0">
                {runwayPhases.map((phase, index) => {
                  const Icon = phase.icon;
                  const isVisible = visiblePhases.includes(index);
                  const gradient = phaseGradients[index % phaseGradients.length];

                  return (
                    <div
                      key={phase.title}
                      data-index={index}
                      className={`mission-card group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-[1px] transition-all duration-700 ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                      }`}
                      style={{ animationDelay: `${index * 0.12}s` }}
                    >
                      <div className="relative h-full rounded-[calc(1rem-1px)] bg-background/95 p-6 shadow-lg shadow-aviation-navy/10">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-aviation-sky/30 bg-aviation-sky/10">
                            <Icon className="h-5 w-5 text-aviation-sky" />
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">{phase.badge}</p>
                            <h3 className="mt-1 text-lg font-semibold text-foreground group-hover:text-aviation-sky transition-colors">
                              {phase.title}
                            </h3>
                          </div>
                        </div>

                        <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                          {phase.description}
                        </p>
                        <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                          {phase.details.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-aviation-sky" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 flex-none">
                {runwayPhasesRowTwo.map((phase, idx) => {
                  const Icon = phase.icon;
                  const index = idx + runwayPhases.length;
                  const isVisible = visiblePhases.includes(index);
                  const gradient = phaseGradients[index % phaseGradients.length];

                  return (
                    <div
                      key={phase.title}
                      data-index={index}
                      className={`mission-card group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-[1px] transition-all duration-700 ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                      }`}
                      style={{ animationDelay: `${index * 0.12}s` }}
                    >
                      <div className="relative h-full rounded-[calc(1rem-1px)] bg-background/95 p-6 shadow-lg shadow-aviation-navy/10">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-aviation-sky/30 bg-aviation-sky/10">
                            <Icon className="h-5 w-5 text-aviation-sky" />
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">{phase.badge}</p>
                            <h3 className="mt-1 text-lg font-semibold text-foreground group-hover:text-aviation-sky transition-colors">
                              {phase.title}
                            </h3>
                          </div>
                        </div>

                        <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                          {phase.description}
                        </p>
                        <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                          {phase.details.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-aviation-sky" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
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
