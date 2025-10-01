import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardList, Compass, PlayCircle, ShieldCheck, Timer, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const heroStats = [
  { icon: Timer, label: "Smart Logbook", detail: "Import, edit, and reconcile entries in minutes" },
  { icon: Compass, label: "Route Builder", detail: "Build a step by step route to get you from zero hours to the flight deck of your dream job!" },
  { icon: TrendingUp, label: "Airline Intel", detail: "Track hiring mins and fleet data across airlines" },
];

const AnimatedHeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePrimaryCta = () => {
    navigate(user ? "/profile" : "/signin");
  };

  const handleWorkflowTour = () => {
    if (user) {
      navigate("/route");
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

      <section className="relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-aviation-navy/30" />
        <div className="absolute top-[-20%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-aviation-sky/20 blur-3xl opacity-50" />
        <div className="absolute bottom-[-25%] right-[-10%] h-[500px] w-[500px] rounded-full bg-aviation-navy/40 blur-3xl opacity-60" />

        <div className="relative container mx-auto px-6 pt-28 pb-24 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-aviation-sky">
                Digital Logbook • Airline Database • Route Builder • Career Path Tracker
              </p>

              <h1 className="text-4xl md:text-6xl xl:text-7xl font-bold leading-tight">
                Command your
                <span className="block bg-gradient-to-r from-aviation-sky to-aviation-navy bg-clip-text text-transparent">
                  professional flight path
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Consolidate logbook entries, automate recency tracking, and visualize career milestones—all from a cockpit-ready dashboard designed for working pilots.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="px-8 text-base" onClick={handlePrimaryCta}>
                  Launch Platform
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 text-base"
                  onClick={handleWorkflowTour}
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Tour The Workflow
                </Button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {heroStats.map(({ icon: Icon, label, detail }) => (
                  <div key={label} className="rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur">
                    <Icon className="mb-4 h-8 w-8 text-aviation-sky" />
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -m-6 rounded-3xl bg-gradient-to-br from-aviation-sky/30 via-transparent to-aviation-navy/40 blur-3xl opacity-80" />

              <div className="relative rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-aviation-navy/20 p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Recent Logbook Entry</p>
                    <p className="text-lg font-semibold">Nov 18, 2024 · N482JF</p>
                    <p className="text-sm text-muted-foreground">KDEN → KLAX · Cessna CJ4</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-aviation-sky/20 px-3 py-1 text-xs font-medium text-aviation-sky">
                    <ShieldCheck className="h-3.5 w-3.5" /> Synced
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: "Total Time", value: "02.1 hrs" },
                    { label: "PIC", value: "01.5 hrs" },
                    { label: "SIC", value: "00.6 hrs" },
                    { label: "Night", value: "00.4 hrs" },
                    { label: "Instrument", value: "00.7 hrs" },
                    { label: "Approaches", value: "2 ILS" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-border/40 bg-background/70 p-4">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-aviation-sky/40 bg-aviation-sky/10 p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-aviation-sky">
                    <ClipboardList className="h-4 w-4" /> Career Targets Snapshot
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: "ATP Minimums", value: "74%" },
                      { title: "Airline Hiring Benchmarks", value: "58%" },
                      { title: "Currency Window", value: "14 days" },
                    ].map(({ title, value }) => (
                      <div key={title} className="flex justify-between text-sm font-medium text-aviation-navy">
                        <span>{title}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default AnimatedHeroSection;
