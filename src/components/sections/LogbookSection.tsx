import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle2, Database, GaugeCircle, MapPinned, NotepadText, Plane, Plus, ShieldCheck, UploadCloud } from "lucide-react";

const runwayGrid = [
  { label: "Total time", value: "4,892.6" },
  { label: "PIC", value: "3,554.1" },
  { label: "Multi-engine", value: "4,221.9" },
  { label: "Turbine", value: "3,998.0" },
  { label: "Night", value: "612.4" },
  { label: "IFR", value: "842.7" },
];

const quickActions = [
  {
    icon: UploadCloud,
    title: "One-click imports",
    description: "Drop AirlineHub, ForeFlight, or CSV files and let Route of Flight initialize the data instantly.",
  },
  {
    icon: CheckCircle2,
    title: "Currency tracker",
    description: "Get proactive alerts the moment IFR, night, or 135 windows approach the edge of compliance.",
  },
  {
    icon: ShieldCheck,
    title: "Audit armour",
    description: "Route of Flight ensures logbook audits run smoothly, giving you confidence when it matters most",
  },
];

const missionFeed = [
  {
    aircraft: "A320 • N762VA",
    route: "SFO → AUS",
    block: "3.6 hrs",
    notes: "Autoland demo + Cat II brief",
    status: "Completed",
  },
  {
    aircraft: "A320 • N762VA",
    route: "AUS → SFO",
    block: "3.1 hrs",
    notes: "Crew swap, fuel uplift delay",
    status: "Signed",
  },
];

const compliancePanels = [
  {
    icon: MapPinned,
    label: "Duty timeline",
    value: "24 hrs",
    detail: "Rest satisfied for next 121 leg",
  },
  {
    icon: BarChart3,
    label: "ATP planner",
    value: "97%",
    detail: "Milestones met for goal carrier",
  },
  {
    icon: Database,
    label: "Archive status",
    value: "Synced",
    detail: "Encrypted backup 14 min ago",
  },
  {
    icon: NotepadText,
    label: "Export queue",
    value: "3 packets",
    detail: "Airline + recruiter shares pending",
  },
];

const LogbookSection = () => {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-aviation-sky/10 to-background" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-aviation-sky/15 to-transparent" />

      <div className="relative z-10 container mx-auto px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,1.6fr,1fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.4em] text-aviation-sky">Professional Logbook</span>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Chart every hour with
                <span className="block bg-gradient-to-r from-aviation-sky via-aviation-light to-aviation-navy bg-clip-text text-transparent">
                  precise detail
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                With the Logbook Hub, imports run automatically, your currency stays validated, and exports are ready for your next career move—instantly
              </p>
            </div>

            <div className="space-y-4">
              {quickActions.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-3xl border border-aviation-sky/20 bg-card/80 p-5 backdrop-blur flex gap-4">
                  <div className="rounded-2xl border border-aviation-sky/30 bg-aviation-sky/10 p-3">
                    <Icon className="h-5 w-5 text-aviation-sky" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="rounded-full px-8">
              <Plus className="mr-2 h-5 w-5" /> Add flight entry
            </Button>
          </div>

          <div className="rounded-3xl border border-border/40 bg-card/80 p-8 backdrop-blur-xl shadow-2xl shadow-aviation-navy/20">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Flight totals</p>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">Your Logbook</h3>
              </div>
              <Badge variant="outline" className="rounded-full px-4">Synced 2 min ago</Badge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {runwayGrid.map((item) => (
                <div key={item.label} className="rounded-2xl border border-aviation-sky/15 bg-background/80 p-4">
                  <p className="text-xl font-semibold text-foreground">{item.value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              {missionFeed.map(({ id, aircraft, route, block, notes, status }) => (
                <div key={id} className="rounded-2xl border border-aviation-sky/20 bg-background/80 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Plane className="h-4 w-4 text-aviation-sky" />
                      {route}
                      <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{id}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{aircraft}</p>
                    <p className="text-xs text-muted-foreground">{notes}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-lg font-semibold text-foreground">{block}</p>
                    <Badge className="rounded-full bg-aviation-sky/10 text-aviation-sky border border-aviation-sky/30">{status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/40 bg-card/80 p-6 backdrop-blur space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Compliance radar</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">Stay inspection ready</h3>
              </div>
              <GaugeCircle className="h-8 w-8 text-aviation-sky" />
            </div>

            <div className="space-y-4">
              {compliancePanels.map(({ icon: Icon, label, value, detail }) => (
                <div key={label} className="rounded-2xl border border-aviation-sky/15 bg-background/80 p-4 flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="rounded-xl border border-aviation-sky/30 bg-aviation-sky/10 p-2">
                      <Icon className="h-4 w-4 text-aviation-sky" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-dashed border-aviation-sky/30 bg-background/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Next export</p>
              <p className="mt-2 text-sm font-semibold text-foreground">Build airline-ready packet</p>
              <p className="mt-1 text-xs text-muted-foreground">Select logbook filters, add mentor signature, share securely.</p>
              <Button variant="outline" size="sm" className="mt-3 rounded-full px-4">Start checklist</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogbookSection;
