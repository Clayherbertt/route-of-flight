import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Plane, Building2, ExternalLink, Phone, Mail, DollarSign, RefreshCw } from "lucide-react";
import { AirlineDataService, ScrapedAirlineData } from "@/services/airlineDataService";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

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
  pay_scales: {
    first_officer: {
      year_1: string;
      year_5: string;
      year_10: string;
    };
    captain: {
      year_1: string;
      year_5: string;
      year_10: string;
    };
  };
}

interface AirlineDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  airline: { name: string; logoUrl?: string } | null;
}

// Sample data for major airlines
const majorAirlinesData: Record<string, AirlineInfo> = {
  "Alaska Airlines": {
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
    ],
    pay_scales: {
      first_officer: {
        year_1: "$89,000",
        year_5: "$142,000",
        year_10: "$178,000"
      },
      captain: {
        year_1: "$195,000",
        year_5: "$248,000",
        year_10: "$295,000"
      }
    }
  },
  "Delta Air Lines": {
    name: "Delta Air Lines",
    logo: "🔺",
    iata: "DL",
    icao: "DAL",
    headquarters: "Atlanta, Georgia",
    founded: "1924",
    fleet_size: 865,
    destinations: 325,
    employees: "95,000+",
    website: "delta.com",
    phone: "1-800-221-1212",
    email: "pilot.recruitment@delta.com",
    description: "Delta Air Lines is one of the major airlines of the United States and a legacy carrier. Delta is the oldest airline in the United States still operating under its original name.",
    hiring_requirements: {
      min_hours: "1,500 ATP minimum",
      type_rating: false,
      college_degree: true,
      clean_record: true
    },
    benefits: [
      "Industry-leading compensation",
      "Comprehensive health benefits",
      "401(k) with 16% company contribution",
      "Profit sharing program",
      "Travel privileges worldwide",
      "Life and disability insurance",
      "Education assistance"
    ],
    fleet_types: [
      "Airbus A220-100/300",
      "Airbus A319/320/321",
      "Airbus A330-200/300/900neo",
      "Airbus A350-900",
      "Boeing 717-200",
      "Boeing 737-800/900",
      "Boeing 757-200/300",
      "Boeing 767-300/400",
      "Boeing 777-200LR"
    ],
    bases: [
      "Atlanta (ATL)",
      "Detroit (DTW)",
      "Minneapolis (MSP)",
      "New York JFK (JFK)",
      "Los Angeles (LAX)",
      "Seattle (SEA)",
      "Salt Lake City (SLC)",
      "Boston (BOS)"
    ],
    pay_scales: {
      first_officer: {
        year_1: "$92,000",
        year_5: "$156,000",
        year_10: "$195,000"
      },
      captain: {
        year_1: "$205,000",
        year_5: "$285,000",
        year_10: "$350,000"
      }
    }
  },
  "United Airlines": {
    name: "United Airlines",
    logo: "🌎",
    iata: "UA",
    icao: "UAL",
    headquarters: "Chicago, Illinois",
    founded: "1926",
    fleet_size: 830,
    destinations: 342,
    employees: "96,000+",
    website: "united.com",
    phone: "1-800-864-8331",
    email: "pilot.jobs@united.com",
    description: "United Airlines is a major American airline headquartered at the Willis Tower in Chicago, Illinois. United operates a large domestic and international route network spanning cities large and small across the United States and all six continents.",
    hiring_requirements: {
      min_hours: "1,500 ATP minimum",
      type_rating: false,
      college_degree: true,
      clean_record: true
    },
    benefits: [
      "Competitive salary packages",
      "Medical, dental, vision coverage",
      "401(k) with company match",
      "Profit sharing",
      "Travel benefits for family",
      "Flexible spending accounts",
      "Employee assistance program"
    ],
    fleet_types: [
      "Airbus A319/320/321",
      "Boeing 737-700/800/900/MAX 8/MAX 9",
      "Boeing 757-200/300",
      "Boeing 767-300/400",
      "Boeing 777-200/300",
      "Boeing 787-8/9/10"
    ],
    bases: [
      "Chicago O'Hare (ORD)",
      "Denver (DEN)",
      "Houston (IAH)",
      "Los Angeles (LAX)",
      "Newark (EWR)",
      "San Francisco (SFO)",
      "Washington Dulles (IAD)"
    ],
    pay_scales: {
      first_officer: {
        year_1: "$88,000",
        year_5: "$148,000",
        year_10: "$185,000"
      },
      captain: {
        year_1: "$198,000",
        year_5: "$275,000",
        year_10: "$335,000"
      }
    }
  },
  "American Airlines": {
    name: "American Airlines",
    logo: "🦅",
    iata: "AA",
    icao: "AAL",
    headquarters: "Fort Worth, Texas",
    founded: "1930",
    fleet_size: 950,
    destinations: 350,
    employees: "130,000+",
    website: "aa.com",
    phone: "1-800-433-7300",
    email: "pilotrecruiting@aa.com",
    description: "American Airlines is a major US airline headquartered in Fort Worth, Texas. It is the world's largest airline when measured by fleet size, scheduled passengers carried, and revenue passenger mile.",
    hiring_requirements: {
      min_hours: "1,500 ATP minimum",
      type_rating: false,
      college_degree: true,
      clean_record: true
    },
    benefits: [
      "Competitive compensation",
      "Comprehensive medical benefits",
      "401(k) with company match",
      "Profit sharing program",
      "Travel privileges",
      "Life insurance coverage",
      "Tuition reimbursement"
    ],
    fleet_types: [
      "Airbus A319/320/321",
      "Boeing 737-800/MAX 8",
      "Boeing 757-200",
      "Boeing 767-300",
      "Boeing 777-200/300",
      "Boeing 787-8/9"
    ],
    bases: [
      "Charlotte (CLT)",
      "Dallas/Fort Worth (DFW)",
      "Los Angeles (LAX)",
      "Miami (MIA)",
      "New York JFK (JFK)",
      "Philadelphia (PHL)",
      "Phoenix (PHX)",
      "Washington (DCA)"
    ],
    pay_scales: {
      first_officer: {
        year_1: "$90,000",
        year_5: "$152,000",
        year_10: "$190,000"
      },
      captain: {
        year_1: "$200,000",
        year_5: "$280,000",
        year_10: "$340,000"
      }
    }
  },
  "Hawaiian Airlines": {
    name: "Hawaiian Airlines",
    logo: "🌺",
    iata: "HA",
    icao: "HAL",
    headquarters: "Honolulu, Hawaii",
    founded: "1929",
    fleet_size: 61,
    destinations: 30,
    employees: "7,000+",
    website: "hawaiianairlines.com",
    phone: "1-800-367-5320",
    email: "pilotcareers@hawaiianair.com",
    description: "Hawaiian Airlines is the largest airline in Hawaii and the 10th-largest commercial airline in the United States. Known for authentic Hawaiian hospitality and connecting the Hawaiian Islands to the world.",
    hiring_requirements: {
      min_hours: "1,500 ATP minimum",
      type_rating: false,
      college_degree: false,
      clean_record: true
    },
    benefits: [
      "Competitive pay scale",
      "Health and dental insurance",
      "401(k) retirement plan",
      "Travel benefits in paradise",
      "Paid vacation time",
      "Life insurance",
      "Flexible work arrangements"
    ],
    fleet_types: [
      "Airbus A321neo",
      "Airbus A330-200",
      "Boeing 717-200"
    ],
    bases: [
      "Honolulu (HNL)",
      "Kahului (OGG)",
      "Kona (KOA)",
      "Lihue (LIH)"
    ],
    pay_scales: {
      first_officer: {
        year_1: "$82,000",
        year_5: "$128,000",
        year_10: "$165,000"
      },
      captain: {
        year_1: "$175,000",
        year_5: "$225,000",
        year_10: "$275,000"
      }
    }
  },
  "Southwest Airlines": {
    name: "Southwest Airlines",
    logo: "❤️",
    iata: "WN",
    icao: "SWA",
    headquarters: "Dallas, Texas",
    founded: "1967",
    fleet_size: 817,
    destinations: 121,
    employees: "66,000+",
    website: "southwest.com",
    phone: "1-800-435-9792",
    email: "pilotjobs@wnco.com",
    description: "Southwest Airlines is a major US low-cost airline based in Dallas, Texas. Known for its point-to-point service model, no baggage fees, and friendly customer service culture.",
    hiring_requirements: {
      min_hours: "1,500 ATP minimum",
      type_rating: false,
      college_degree: false,
      clean_record: true
    },
    benefits: [
      "Profit sharing program",
      "Medical, dental, vision insurance",
      "401(k) with company match",
      "Free flights for employees and family",
      "Paid time off",
      "Adoption assistance",
      "Employee stock purchase plan"
    ],
    fleet_types: [
      "Boeing 737-700",
      "Boeing 737-800",
      "Boeing 737 MAX 7",
      "Boeing 737 MAX 8"
    ],
    bases: [
      "Atlanta (ATL)",
      "Baltimore (BWI)",
      "Chicago Midway (MDW)",
      "Dallas Love Field (DAL)",
      "Denver (DEN)",
      "Las Vegas (LAS)",
      "Orlando (MCO)",
      "Phoenix (PHX)"
    ],
    pay_scales: {
      first_officer: {
        year_1: "$79,000",
        year_5: "$135,000",
        year_10: "$170,000"
      },
      captain: {
        year_1: "$189,000",
        year_5: "$245,000",
        year_10: "$295,000"
      }
    }
  }
};

export function AirlineDetailsDialog({ open, onOpenChange, airline }: AirlineDetailsDialogProps) {
  const { toast } = useToast();
  const [scrapedData, setScrapedData] = useState<ScrapedAirlineData | null>(null);
  const [isLoadingScrapedData, setIsLoadingScrapedData] = useState(false);
  
  // Use detailed data for major airlines as fallback
  const staticAirlineData = airline ? majorAirlinesData[airline.name] : null;
  
  // Prefer scraped data over static data when available
  const airlineData = scrapedData || staticAirlineData;

  useEffect(() => {
    if (airline && open) {
      loadScrapedData();
    }
  }, [airline, open]);

  const loadScrapedData = async () => {
    if (!airline) return;
    
    setIsLoadingScrapedData(true);
    try {
      const data = await AirlineDataService.scrapeAirlineData(airline.name);
      if (data) {
        setScrapedData(data);
        toast({
          title: "Data Updated",
          description: "Latest airline information loaded successfully",
        });
      }
    } catch (error) {
      console.error('Error loading scraped data:', error);
      toast({
        title: "Note", 
        description: "Using cached airline data. Live data may be temporarily unavailable.",
        variant: "default",
      });
    } finally {
      setIsLoadingScrapedData(false);
    }
  };

  const handleRefreshData = async () => {
    if (!airline) return;
    
    AirlineDataService.clearCache(airline.name);
    await loadScrapedData();
  };

  if (!airline) return null;

  // If we don't have detailed data, show a placeholder
  if (!airlineData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{airline.name}</DialogTitle>
            <DialogDescription>
              Airline details and career information
            </DialogDescription>
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
              {airline.logoUrl ? (
                <img 
                  src={airline.logoUrl} 
                  alt={`${airline.name} logo`}
                  className="w-12 h-12 object-contain"
                />
              ) : staticAirlineData?.logo && (
                <div className="text-4xl">{staticAirlineData.logo}</div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-2xl">{airlineData?.name || airline.name}</DialogTitle>
                  {scrapedData && (
                    <Badge variant="default" className="text-xs">Live Data</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshData}
                    disabled={isLoadingScrapedData}
                    className="ml-auto"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingScrapedData ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <DialogDescription>
                  Complete airline profile with hiring requirements, benefits, and career information
                </DialogDescription>
                <div className="flex gap-2 mt-1">
                  {airlineData?.iata && <Badge variant="secondary">{airlineData.iata}</Badge>}
                  {airlineData?.icao && <Badge variant="secondary">{airlineData.icao}</Badge>}
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
              {airlineData?.headquarters && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Headquarters:</span>
                  <span className="font-medium">{airlineData.headquarters}</span>
                </div>
              )}
              {airlineData?.founded && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Founded:</span>
                  <span className="font-medium">{airlineData.founded}</span>
                </div>
              )}
              {airlineData?.fleet_size && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fleet Size:</span>
                  <span className="font-medium">{airlineData.fleet_size} aircraft</span>
                </div>
              )}
              {airlineData?.destinations && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destinations:</span>
                  <span className="font-medium">{airlineData.destinations}</span>
                </div>
              )}
              {airlineData?.employees && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employees:</span>
                  <span className="font-medium">{airlineData.employees}</span>
                </div>
              )}
              {airlineData?.description && (
                <>
                  <Separator />
                  <p className="text-sm text-muted-foreground">{airlineData.description}</p>
                </>
              )}
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
              {airlineData?.website && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <a href={`https://${airlineData.website}`} target="_blank" rel="noopener noreferrer">
                      {airlineData.website}
                    </a>
                  </Button>
                </div>
              )}
              {airlineData?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{airlineData.phone}</span>
                </div>
              )}
              {airlineData?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{airlineData.email}</span>
                </div>
              )}
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
              {airlineData?.hiring_requirements?.min_hours && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minimum Hours:</span>
                  <span className="font-medium">{airlineData.hiring_requirements.min_hours}</span>
                </div>
              )}
              {airlineData?.hiring_requirements?.type_rating !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type Rating:</span>
                  <Badge variant={airlineData.hiring_requirements.type_rating ? "default" : "secondary"}>
                    {airlineData.hiring_requirements.type_rating ? "Required" : "Not Required"}
                  </Badge>
                </div>
              )}
              {airlineData?.hiring_requirements?.college_degree !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">College Degree:</span>
                  <Badge variant={airlineData.hiring_requirements.college_degree ? "default" : "secondary"}>
                    {airlineData.hiring_requirements.college_degree ? "Required" : "Preferred"}
                  </Badge>
                </div>
              )}
              {airlineData?.hiring_requirements?.clean_record !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clean Record:</span>
                  <Badge variant={airlineData.hiring_requirements.clean_record ? "default" : "secondary"}>
                    {airlineData.hiring_requirements.clean_record ? "Required" : "Not Required"}
                  </Badge>
                </div>
              )}
              {!airlineData?.hiring_requirements && (
                <p className="text-sm text-muted-foreground">Hiring requirements information not available.</p>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Benefits Package</CardTitle>
            </CardHeader>
            <CardContent>
              {airlineData?.benefits && airlineData.benefits.length > 0 ? (
                <div className="grid gap-2">
                  {airlineData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Benefits information not available.</p>
              )}
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
              {airlineData?.fleet_types && airlineData.fleet_types.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {airlineData.fleet_types.map((aircraft, index) => (
                    <Badge key={index} variant="outline">
                      {aircraft}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Fleet information not available.</p>
              )}
            </CardContent>
          </Card>

          {/* Pay Scales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pay Scales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {airlineData?.pay_scales ? (
                <>
                  {airlineData.pay_scales.first_officer && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">First Officer</h4>
                      <div className="space-y-2 text-sm">
                        {airlineData.pay_scales.first_officer.year_1 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Year 1:</span>
                            <span className="font-medium">{airlineData.pay_scales.first_officer.year_1}</span>
                          </div>
                        )}
                        {airlineData.pay_scales.first_officer.year_5 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Year 5:</span>
                            <span className="font-medium">{airlineData.pay_scales.first_officer.year_5}</span>
                          </div>
                        )}
                        {airlineData.pay_scales.first_officer.year_10 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Year 10:</span>
                            <span className="font-medium">{airlineData.pay_scales.first_officer.year_10}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {airlineData.pay_scales.first_officer && airlineData.pay_scales.captain && <Separator />}
                  {airlineData.pay_scales.captain && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Captain</h4>
                      <div className="space-y-2 text-sm">
                        {airlineData.pay_scales.captain.year_1 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Year 1:</span>
                            <span className="font-medium">{airlineData.pay_scales.captain.year_1}</span>
                          </div>
                        )}
                        {airlineData.pay_scales.captain.year_5 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Year 5:</span>
                            <span className="font-medium">{airlineData.pay_scales.captain.year_5}</span>
                          </div>
                        )}
                        {airlineData.pay_scales.captain.year_10 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Year 10:</span>
                            <span className="font-medium">{airlineData.pay_scales.captain.year_10}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Pay scale information not available.</p>
              )}
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
              {airlineData?.bases && airlineData.bases.length > 0 ? (
                <div className="grid gap-2">
                  {airlineData.bases.map((base, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{base}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Operating bases information not available.</p>
              )}
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