import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Plane, Building2, ExternalLink, Phone, Mail } from "lucide-react";

interface AirlineInfo {
  name: string;
  logo: string;
  iata: string;
  icao: string;
  headquarters: string;
  founded: string;
  fleet_size: number;
  destinations: number;
  employees: string;
  website: string;
  phone: string;
  email: string;
  description: string;
  hiring_requirements: {
    min_hours: string;
    type_rating: boolean;
    college_degree: boolean;
    clean_record: boolean;
  };
  benefits: string[];
  fleet_types: string[];
  bases: string[];
}

interface AirlineDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  airline: { name: string } | null;
}

// Sample data for Alaska Airlines
const sampleAirlineData: AirlineInfo = {
  name: "Alaska Airlines",
  logo: "❄️",
  iata: "AS",
  icao: "ASA",
  headquarters: "Seattle, Washington",
  founded: "1932",
  fleet_size: 314,
  destinations: 115,
  employees: "23,000+",
  website: "alaskaair.com",
  phone: "1-800-252-7522",
  email: "careers@alaskaair.com",
  description: "Alaska Airlines is a major American airline headquartered in SeaTac, Washington, within the Seattle metropolitan area. Known for exceptional customer service and reliability.",
  hiring_requirements: {
    min_hours: "1,500 ATP minimum",
    type_rating: false,
    college_degree: false,
    clean_record: true
  },
  benefits: [
    "Competitive salary",
    "Medical, dental, vision insurance",
    "401(k) with company match",
    "Travel benefits",
    "Paid time off",
    "Life insurance",
    "Employee stock purchase plan"
  ],
  fleet_types: [
    "Boeing 737-700",
    "Boeing 737-800",
    "Boeing 737-900",
    "Boeing 737 MAX 8",
    "Boeing 737 MAX 9",
    "Airbus A320",
    "Airbus A321neo"
  ],
  bases: [
    "Seattle (SEA)",
    "Anchorage (ANC)",
    "Los Angeles (LAX)",
    "San Francisco (SFO)",
    "Portland (PDX)"
  ]
};

export function AirlineDetailsDialog({ open, onOpenChange, airline }: AirlineDetailsDialogProps) {
  // Use sample data for Alaska Airlines, or show basic info for other airlines
  const airlineData = airline?.name === "Alaska Airlines" ? sampleAirlineData : null;

  if (!airline) return null;

  // If we don't have detailed data, show a placeholder
  if (!airlineData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{airline.name}</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-muted-foreground text-center">
              Detailed information for {airline.name} is coming soon.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {airlineData.logo && (
              <div className="text-4xl">{airlineData.logo}</div>
            )}
            <div>
              <DialogTitle className="text-2xl">{airlineData.name}</DialogTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary">{airlineData.iata}</Badge>
                <Badge variant="secondary">{airlineData.icao}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Company Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Headquarters:</span>
                <span className="font-medium">{airlineData.headquarters}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Founded:</span>
                <span className="font-medium">{airlineData.founded}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fleet Size:</span>
                <span className="font-medium">{airlineData.fleet_size} aircraft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destinations:</span>
                <span className="font-medium">{airlineData.destinations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employees:</span>
                <span className="font-medium">{airlineData.employees}</span>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">{airlineData.description}</p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href={`https://${airlineData.website}`} target="_blank" rel="noopener noreferrer">
                    {airlineData.website}
                  </a>
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{airlineData.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{airlineData.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Hiring Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Hiring Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum Hours:</span>
                <span className="font-medium">{airlineData.hiring_requirements.min_hours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type Rating:</span>
                <Badge variant={airlineData.hiring_requirements.type_rating ? "default" : "secondary"}>
                  {airlineData.hiring_requirements.type_rating ? "Required" : "Not Required"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">College Degree:</span>
                <Badge variant={airlineData.hiring_requirements.college_degree ? "default" : "secondary"}>
                  {airlineData.hiring_requirements.college_degree ? "Required" : "Preferred"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clean Record:</span>
                <Badge variant={airlineData.hiring_requirements.clean_record ? "default" : "secondary"}>
                  {airlineData.hiring_requirements.clean_record ? "Required" : "Not Required"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Benefits Package</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {airlineData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fleet Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Fleet Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {airlineData.fleet_types.map((aircraft, index) => (
                  <Badge key={index} variant="outline">
                    {aircraft}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Operating Bases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Operating Bases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {airlineData.bases.map((base, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{base}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}