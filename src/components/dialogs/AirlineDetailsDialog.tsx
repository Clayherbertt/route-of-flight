import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Building2,
  DollarSign,
  ExternalLink,
  MapPin,
  Phone,
  Plane,
  Users,
  Mail,
} from "lucide-react";
import type { AirlineData } from "@/hooks/useAirlines";

interface AirlineDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  airline: AirlineData | null;
}

export function AirlineDetailsDialog({ open, onOpenChange, airline }: AirlineDetailsDialogProps) {
  if (!airline) return null;

  const summaryMetrics = [
    {
      label: "Fleet size",
      value: airline.fleet_size ? airline.fleet_size.toLocaleString() : "Updating",
    },
    {
      label: "Pilot group",
      value: airline.pilot_group_size || "Updating",
    },
    {
      label: "Union",
      value: airline.pilot_union || "Non-union",
    },
  ];

  const years = Array.from({ length: 10 }, (_, index) => index + 1);

  const formatPay = (value?: string) => {
    if (!value) return "-";
    return value.includes("$") ? value : `$${value}`;
  };

  const renderSimplePayTable = (prefix: string) => (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left py-3 px-4 font-semibold">Year</th>
          <th className="text-center py-3 px-4 font-semibold">Rate</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {years.map((year) => {
          const key = `${prefix}_${year}` as keyof AirlineData;
          const raw = airline[key] as string;
          const value = formatPay(raw);

          return (
            <tr key={year} className="hover:bg-muted/30 transition-colors">
              <td className="py-3 px-4 font-medium">Year {year}</td>
              <td className="text-center py-3 px-4">
                <div className="font-bold text-sm">{value}</div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const renderBodyPayTable = (narrowPrefix: string, widePrefix: string) => (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left py-3 px-4 font-semibold">Year</th>
          <th className="text-center py-3 px-4 font-semibold">Narrow Body</th>
          <th className="text-center py-3 px-4 font-semibold">Wide Body</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {years.map((year) => {
          const narrowKey = `${narrowPrefix}_${year}` as keyof AirlineData;
          const wideKey = `${widePrefix}_${year}` as keyof AirlineData;
          const narrowValue = formatPay(airline[narrowKey] as string);
          const wideValue = formatPay(airline[wideKey] as string);

          return (
            <tr key={year} className="hover:bg-muted/30 transition-colors">
              <td className="py-3 px-4 font-medium">Year {year}</td>
              <td className="text-center py-3 px-4">
                <div className="font-bold text-sm">{narrowValue}</div>
              </td>
              <td className="text-center py-3 px-4">
                <div className="font-bold text-sm">{wideValue}</div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] h-[90vh] border-none bg-transparent p-0">
        <div className="grid lg:grid-cols-[320px,1fr] gap-6 rounded-3xl bg-card/95 shadow-2xl h-full">
          <aside className="space-y-8 bg-primary/5 px-8 py-10">
            <div className="space-y-3">
              <div className="text-4xl">{airline.logo}</div>
              <h2 className="text-2xl font-bold text-foreground">{airline.name}</h2>
                <p className="text-sm text-muted-foreground">{airline.call_sign || "Call sign updating"}</p>
                <Badge variant={airline.is_hiring ? "default" : "outline"} className="rounded-full">
                {airline.is_hiring ? "Hiring now" : "Monitoring"}
              </Badge>
            </div>

            <Separator className="bg-primary/30" />

            <div className="space-y-3">
              {summaryMetrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-primary/20 bg-background/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{metric.label}</p>
                  <p className="text-lg font-semibold text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>

            {airline.application_url && (
              <Button asChild variant="sky" className="w-full rounded-full">
                <a href={airline.application_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2">
                  Apply or refer <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}

            {airline.additional_info && airline.additional_info.length > 0 && (
              <div className="rounded-2xl border border-primary/20 bg-background/70 px-4 py-3 text-sm text-muted-foreground space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Insider notes</p>
                <ul className="space-y-1">
                  {airline.additional_info.slice(0, 4).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                  {airline.additional_info.length > 4 && (
                    <li>+{airline.additional_info.length - 4} more</li>
                  )}
                </ul>
              </div>
            )}
          </aside>

          <div className="px-6 py-10 space-y-8 overflow-y-auto max-h-[90vh]">
            <section className="rounded-2xl border border-border/60 bg-card/80 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Company overview</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    {airline.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Most junior base</p>
                  <p className="text-sm font-semibold text-foreground">{airline.most_junior_base || "Updating"}</p>
                </div>
                <div className="rounded-xl bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Most junior captain hire</p>
                  <p className="text-sm font-semibold text-foreground">{airline.most_junior_captain_hire_date || "Tracking"}</p>
                </div>
              </div>
            </section>

            {airline.fleet_info && airline.fleet_info.length > 0 && (
              <section className="rounded-2xl border border-border/60 bg-card/80 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Plane className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Fleet composition</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {airline.fleet_info.map((aircraft, index) => (
                    <div key={index} className="flex items-center justify-between rounded-xl bg-background/60 px-4 py-3">
                      <span className="font-medium text-foreground">{aircraft.type}</span>
                      <Badge variant="outline">{aircraft.quantity}</Badge>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {airline.bases && airline.bases.length > 0 && (
              <section className="rounded-2xl border border-border/60 bg-card/80 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Crew bases</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {airline.bases.map((base, index) => (
                    <Badge key={index} variant="outline" className="rounded-full px-3 py-1">
                      {base}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {airline.is_hiring && (
              <section className="rounded-2xl border border-border/60 bg-card/80 p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Hiring information</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {airline.required_qualifications && airline.required_qualifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-[0.2em]">Required</h4>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {airline.required_qualifications.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {airline.preferred_qualifications && airline.preferred_qualifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-[0.2em]">Preferred</h4>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {airline.preferred_qualifications.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {airline.inside_scoop && airline.inside_scoop.length > 0 && (
                  <div className="rounded-xl bg-background/60 px-4 py-3 text-sm text-muted-foreground space-y-1">
                    <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Inside scoop</h4>
                    <ul className="space-y-1">
                      {airline.inside_scoop.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {(airline.application_url || airline.additional_info.length > 0) && (
              <section className="rounded-2xl border border-border/60 bg-card/80 p-6 space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3 text-foreground">
                  <Phone className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Contacts & links</h3>
                </div>
                {airline.application_url && (
                  <div className="flex items-center justify-between rounded-xl bg-background/60 px-4 py-3">
                    <span>Official application portal</span>
                    <Button asChild variant="ghost" className="text-primary">
                      <a href={airline.application_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                        Visit site <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
                {airline.additional_info && airline.additional_info.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Notes
                    </h4>
                    <ul className="space-y-1.5 leading-relaxed">
                      {airline.additional_info.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {(airline.fo_pay_year_1 || airline.captain_pay_year_1 || airline.fo_narrowbody_pay_year_1 || airline.captain_narrowbody_pay_year_1) && (
              <section className="rounded-2xl border border-border/60 bg-card/80 p-6 space-y-6 text-sm">
                <div className="flex items-center gap-3 text-foreground">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Pay information</h3>
                </div>

                {airline.fo_pay_year_1 && airline.captain_pay_year_1 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-lg">First Officer</h4>
                      {renderSimplePayTable("fo_pay_year")}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-lg">Captain</h4>
                      {renderSimplePayTable("captain_pay_year")}
                    </div>
                  </div>
                ) : airline.fo_narrowbody_pay_year_1 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-lg">First Officer Pay Scale</h4>
                      <div className="overflow-x-auto">{renderBodyPayTable("fo_narrowbody_pay_year", "fo_widebody_pay_year")}</div>
                    </div>
                    {airline.captain_narrowbody_pay_year_1 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Captain Pay Scale</h4>
                        <div className="overflow-x-auto">{renderBodyPayTable("captain_narrowbody_pay_year", "captain_widebody_pay_year")}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">{renderSimplePayTable("fo_pay_year")}</div>
                )}
              </section>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
