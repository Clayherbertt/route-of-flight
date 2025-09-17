import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Plane, Building2, ExternalLink, Phone, Mail, DollarSign, CalendarDays, Briefcase } from "lucide-react";
import type { AirlineData } from "@/hooks/useAirlines";

interface AirlineDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  airline: AirlineData | null;
}

export function AirlineDetailsDialog({ open, onOpenChange, airline }: AirlineDetailsDialogProps) {
  console.log("🔍 AirlineDetailsDialog received airline data:", airline);
  
  if (!airline) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{airline.logo}</div>
            <div>
              <DialogTitle className="text-2xl font-bold">{airline.name}</DialogTitle>
              <DialogDescription className="text-base">{airline.call_sign}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{airline.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{airline.fleet_size}</div>
                  <div className="text-xs text-muted-foreground">Fleet Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{airline.pilot_group_size}</div>
                  <div className="text-xs text-muted-foreground">Pilots</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-primary">{airline.pilot_union}</div>
                  <div className="text-xs text-muted-foreground">Union</div>
                </div>
                <div className="text-center">
                  <Badge variant={airline.is_hiring ? "default" : "secondary"}>
                    {airline.is_hiring ? "Hiring" : "Not Hiring"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fleet Information */}
          {airline.fleet_info && airline.fleet_info.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Fleet Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {airline.fleet_info.map((aircraft, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{aircraft.type}</span>
                      <Badge variant="outline">{aircraft.quantity}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bases */}
          {airline.bases && airline.bases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Crew Bases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {airline.bases.map((base, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {base}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hiring Requirements */}
          {airline.is_hiring && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Hiring Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {airline.application_url && (
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">Currently Hiring Pilots</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Applications being accepted</div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <a href={airline.application_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        Apply Now
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}

                {/* Required Qualifications */}
                {airline.required_qualifications && airline.required_qualifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Required Qualifications
                    </h4>
                    <ul className="space-y-2">
                      {airline.required_qualifications.map((qual, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Preferred Qualifications */}
                {airline.preferred_qualifications && airline.preferred_qualifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Preferred Qualifications
                    </h4>
                    <ul className="space-y-2">
                      {airline.preferred_qualifications.map((qual, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Inside Scoop */}
                {airline.inside_scoop && airline.inside_scoop.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Inside Scoop</h4>
                    <ul className="space-y-2">
                      {airline.inside_scoop.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">💡</span>
                          <span className="italic">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Seniority Information */}
          {(airline.most_junior_base || airline.most_junior_captain_hire_date || airline.retirements_in_2025) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Seniority Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {airline.most_junior_base && (
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Most Junior Base</div>
                      <div className="font-semibold">{airline.most_junior_base}</div>
                    </div>
                  )}
                  {airline.most_junior_captain_hire_date && (
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Junior Captain Hire Date</div>
                      <div className="font-semibold">{airline.most_junior_captain_hire_date}</div>
                    </div>
                  )}
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">2025 Retirements</div>
                    <div className="font-semibold text-primary">{airline.retirements_in_2025}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pay Scale */}
          {(airline.fo_pay_year_1 || airline.captain_pay_year_1) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pay Scale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* First Officer Pay */}
                  {airline.fo_pay_year_1 && (
                    <div>
                      <h4 className="font-semibold mb-3">First Officer</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => {
                          const payKey = `fo_pay_year_${year}` as keyof typeof airline;
                          const payValue = airline[payKey] as string;
                          
                          if (!payValue || typeof payValue !== 'string') return null;
                          
                          return (
                            <div key={year} className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="text-sm text-muted-foreground">Year {year}</div>
                              <div className="text-lg font-bold">{payValue}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {airline.fo_pay_year_1 && airline.captain_pay_year_1 && <Separator />}

                  {/* Captain Pay */}
                  {airline.captain_pay_year_1 && (
                    <div>
                      <h4 className="font-semibold mb-3">Captain</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => {
                          const payKey = `captain_pay_year_${year}` as keyof typeof airline;
                          const payValue = airline[payKey] as string;
                          
                          if (!payValue || typeof payValue !== 'string') return null;
                          
                          return (
                            <div key={year} className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="text-sm text-muted-foreground">Year {year}</div>
                              <div className="text-lg font-bold">{payValue}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          {airline.additional_info && airline.additional_info.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {airline.additional_info.map((info, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{info}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}