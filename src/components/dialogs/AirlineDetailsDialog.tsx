import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Plane, Building2, ExternalLink, Phone, Mail, DollarSign } from "lucide-react";

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
  hiring_status: boolean;
  pilot_application_url: string;
  description: string;
  hiring_requirements: {
    min_hours: string;
    type_rating: boolean;
    college_degree: boolean;
    clean_record: boolean;
  };
  detailed_requirements?: {
    required: string[];
    preferred: string[];
  };
  inside_scoop?: string[];
  benefits: string[];
  fleet_types: string[];
  bases: string[];
  pay_scales: {
    first_officer: {
      year_1: string;
      year_2?: string;
      year_3?: string;
      year_4?: string;
      year_5: string;
      year_6?: string;
      year_7?: string;
      year_8?: string;
      year_9?: string;
      year_10: string;
      year_11?: string;
      year_12?: string;
    };
    captain: {
      year_1: string;
      year_2?: string;
      year_3?: string;
      year_4?: string;
      year_5: string;
      year_6?: string;
      year_7?: string;
      year_8?: string;
      year_9?: string;
      year_10: string;
      year_11?: string;
      year_12?: string;
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
    logo: "✈️",
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
    hiring_status: true,
    pilot_application_url: "https://careers.alaskaair.com/pilots",
    description: "Alaska Airlines is a major American airline headquartered in SeaTac, Washington, within the Seattle metropolitan area. Known for exceptional customer service and reliability.",
    hiring_requirements: {
      min_hours: "1,500 ATP minimum",
      type_rating: false,
      college_degree: false,
      clean_record: true
    },
    detailed_requirements: {
      required: [
        "Minimum of 1,500 hours of total documented flight time",
        "A current First Class FAA Medical Certificate",
        "Minimum of 500 hours of fixed wing turbine time (airplane and powered lift combined)",
        "Must possess and/or obtain a current passport with unlimited access in and out of the United States and have at least six months of validity remaining at time of employment. Employees with non-U.S. passports also will need any appropriate travel documentation",
        "Ability to travel immediately and repeatedly to any location, domestic or international, where Alaska Airlines and Hawaiian Airlines flies",
        "FAA Commercial Pilot Certificate with Instrument-Airplane",
        "All aeronautical experience requirements for an ATP, Airplane category rating, as set forth in 14 CFR §61.159",
        "Current ATP written exam",
        "Strong written and verbal communication skills in English",
        "Must possess a valid Driver's License issued by a US state or US territory",
        "Must be comfortable with a domicile in Seattle, WA; Los Angeles, CA; Anchorage, AK; Portland, OR; San Francisco, CA",
        "Excellent judgement, leadership skills, demonstrated commandability and maturity",
        "Professional demeanor and appearance",
        "Ability to use sound judgement in decision making",
        "Ability to maintain composure under pressure",
        "Minimum 23 years of age",
        "Must be Authorized to work in the U.S.",
        "High school diploma or equivalent"
      ],
      preferred: [
        "Four-year degree from an accredited university",
        "An FAA Airline Transport Pilot (ATP) certificate",
        "500 hours of multi-engine airplane time",
        "Minimum of 50 hours of flight time within the last 12 months",
        "500 hours of turbine PIC time",
        "Turbojet/ turbo prop experience in a complex flying environment"
      ]
    },
    benefits: [
      "Industry-leading pilot contract ratified in 2022",
      "Top of scale captain rate of $361.29",
      "First year first officer rate of $119.92", 
      "Market rate adjustment that keeps pilots in line with peers at other airlines",
      "Flexibility to build schedules you want with ability to drop and trade",
      "Stronger job security - pilot group grows as company grows",
      "Medical, dental, vision insurance",
      "401(k) with company match",
      "Travel benefits",
      "Paid time off",
      "Life insurance",
      "Employee stock purchase plan",
      "KCM and Cass privileges"
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
        year_1: "$108.16",
        year_2: "$160.67",
        year_3: "$186.06",
        year_4: "$193.69",
        year_5: "$201.45",
        year_6: "$207.45",
        year_7: "$213.20",
        year_8: "$218.32",
        year_9: "$220.73",
        year_10: "$224.41",
        year_11: "$226.60",
        year_12: "$228.80"
      },
      captain: {
        year_1: "$300.31",
        year_2: "$303.01",
        year_3: "$305.76",
        year_4: "$308.56",
        year_5: "$311.31",
        year_6: "$314.17",
        year_7: "$316.95",
        year_8: "$319.73",
        year_9: "$322.56",
        year_10: "$325.31",
        year_11: "$328.16",
        year_12: "$330.97"
      }
    }
  },
  "Delta Air Lines": {
    name: "Delta Air Lines",
    logo: "✈️",
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
    hiring_status: true,
    pilot_application_url: "https://www.delta.com/us/en/careers/pilots/hiring-faqs",
    description: "Delta Air Lines is one of the major airlines of the United States and a legacy carrier. Delta is the oldest airline in the United States still operating under its original name.",
    hiring_requirements: {
      min_hours: "1,500 ATP minimum",
      type_rating: false,
      college_degree: true,
      clean_record: true
    },
    detailed_requirements: {
      required: [
        "At least 23 years of age",
        "Must be legally authorized to work in the US without sponsorship currently and not require future sponsorship for employment",
        "Current passport or other travel documents enabling the bearer to freely exit and re-enter the U.S. (multiple reentry status)",
        "High school diploma or GED equivalent",
        "Graduate of a four-year degree program from a college or university accredited by a U.S. Dept. of Education recognized accrediting organization is preferred",
        "FAA Commercial Pilot Certificate with Instrument - Airplane",
        "Current FAA First Class Medical Certificate",
        "All aeronautical experience requirements for an ATP, Airplane category rating, as set forth in 14 CFR §61.159",
        "Current ATP written exam",
        "Minimum of 1,500 hours of total documented flight time",
        "Minimum of 250 hours PIC or SIC as defined in 14 CFR §61.159(a)(5) in an airplane category",
        "Minimum of 50 hours of multi-engine airplane time",
        "FCC Radiotelephone Operator's Permit",
        "DOT required pre-employment drug test",
        "International Certificate of Vaccination (Yellow Card) for Yellow Fever prior to starting indoctrination training",
        "TSA required fingerprint based Criminal History Records Check and a Delta background check"
      ],
      preferred: [
        "1,000 hours of fixed-wing turbine time preferred (A minimum of 500 turbine hours must be in a non-powered lift airplane)",
        "Degrees obtained from a non-U.S. institution must be evaluated for equivalency to U.S. degrees by a member organization of the National Association of Credential Evaluation Services (NACES)"
      ]
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
      "Boeing 777",
      "Airbus A350",
      "Boeing 787",
      "Airbus A330-900/300/200",
      "Boeing 767-400ER",
      "Boeing 767-300ER", 
      "Boeing 767-300/200",
      "Boeing 757",
      "Airbus A321N",
      "Boeing 737-900",
      "Airbus A321",
      "Boeing 737-800/700",
      "Airbus A320/319",
      "Airbus A220-300",
      "Airbus A220-100",
      "Boeing 717",
      "Embraer EMB-195",
      "Embraer EMB-190/CRJ-900"
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
        year_1: "$118.31",
        year_2: "$225.66", 
        year_3: "$264.07",
        year_4: "$270.46",
        year_5: "$276.92",
        year_6: "$283.94",
        year_7: "$291.83", 
        year_8: "$298.53",
        year_9: "$301.79",
        year_10: "$305.88",
        year_11: "$308.62",
        year_12: "$311.46"
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
    logo: "✈️",
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
    hiring_status: true,
    pilot_application_url: "https://careers.united.com/pilots",
    description: "United Airlines is a major American airline headquartered at the Willis Tower in Chicago, Illinois. United operates a large domestic and international route network spanning cities large and small across the United States and all six continents.",
    hiring_requirements: {
      min_hours: "1,500 ATP minimum",
      type_rating: false,
      college_degree: true,
      clean_record: true
    },
    detailed_requirements: {
      required: [
        "Unrestricted FAA Airline Transport Pilot (ATP) certificate with airplane multiengine class rating",
        "Current FAA first-class medical certificate",
        "FCC Restricted Radiotelephone Operator Permit (RR)",
        "Minimum of 1,500 hours of total time",
        "Current passport with at least six-months of validity remaining at time of employment",
        "Legal right to work in the United States without sponsorship",
        "Must be able to travel freely within the United States and without restriction to all countries United serves",
        "High school diploma or GED equivalent",
        "International Certificate of Vaccination for Yellow Fever (Yellow Card) must be presented on the first day of employment",
        "Reliable, punctual attendance is an essential function of the position",
        "Availability without any planned absences during the first twelve weeks of employment"
      ],
      preferred: [
        "Bachelor's degree from accredited college or university",
        "1,000 hours of fixed wing turbine time",
        "Minimum of 100 hours of flight time within the last 12 months",
        "All foreign transcripts need to be evaluated for equivalency to U.S. degrees by a member organization of the National Association of Credential Evaluation Services (NACES)"
      ]
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
    logo: "✈️",
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
    hiring_status: true,
    pilot_application_url: "https://pilots.aa.com/",
    description: "American Airlines is a major US airline headquartered in Fort Worth, Texas. It is the world's largest airline when measured by fleet size, scheduled passengers carried, and revenue passenger mile.",
    hiring_requirements: {
      min_hours: "1,500 ATP minimum",
      type_rating: false,
      college_degree: true,
      clean_record: true
    },
    detailed_requirements: {
      required: [
        "Unrestricted FAA Airline Transport Pilot (ATP) certificate with airplane multiengine class rating",
        "Current FAA first-class medical certificate",
        "FCC Restricted Radiotelephone Operator Permit (RR)",
        "Minimum of 1,500 hours of total time",
        "Current passport with at least six-months of validity remaining at time of employment",
        "Legal right to work in the United States without sponsorship",
        "Must be able to travel freely within the United States and without restriction to all countries United serves",
        "High school diploma or GED equivalent",
        "International Certificate of Vaccination for Yellow Fever (Yellow Card) must be presented on the first day of employment",
        "Reliable, punctual attendance is an essential function of the position",
        "Availability without any planned absences during the first twelve weeks of employment"
      ],
      preferred: [
        "Bachelor's degree from accredited college or university",
        "1,000 hours of fixed wing turbine time",
        "Minimum of 100 hours of flight time within the last 12 months",
        "150 - 250 Turbine PIC"
      ]
    },
    inside_scoop: [
      "Will get you looked at:",
      "3000 TT",
      "1500 Turbine"
    ],
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
    logo: "✈️",
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
    hiring_status: false,
    pilot_application_url: "https://www.hawaiianairlines.com/careers/first-officer",
    description: "Hawaiian Airlines is the largest airline in Hawaii and the 10th-largest commercial airline in the United States. Known for authentic Hawaiian hospitality and connecting the Hawaiian Islands to the world.",
    hiring_requirements: {
      min_hours: "1,500 ATP minimum",
      type_rating: false,
      college_degree: false,
      clean_record: true
    },
    detailed_requirements: {
      required: [
        "FAA ATP certified, Airplane Multiengine Land with English proficient endorsement",
        "First Class FAA Medical Certificate",
        "1,500 total flight hours",
        "Minimum of 1,000 fixed wing hours",
        "FCC Restricted Radiotelephone Operator Permit",
        "High school diploma or its equivalent",
        "Eligible to work in the United States"
      ],
      preferred: [
        "1,000 hours turbine as PIC (as defined by FAR Part 1)",
        "Turbojet/turbo prop experience in complex flying environments",
        "College degree"
      ]
    },
    benefits: [
      "Comprehensive medical plan benefits at excellent rates",
      "Dental coverage", 
      "Flexible spending accounts for health care and dependent care",
      "401(k) retirement plan with company contributions",
      "Life and accidental death and dismemberment insurance",
      "Long-term disability",
      "Paid vacation time",
      "Exceptional travel privileges",
      "Employee discounts from various stores and companies",
      "KCM and Cass privileges"
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
    logo: "✈️",
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
    hiring_status: true,
    pilot_application_url: "https://careers.southwest.com/pilots",
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
  // Use detailed data for major airlines
  const airlineData = airline ? majorAirlinesData[airline.name] : null;

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
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center gap-4">
              {airline.logoUrl ? (
                <img 
                  src={airline.logoUrl} 
                  alt={`${airline.name} logo`}
                  className="w-12 h-12 object-contain"
                />
              ) : airlineData?.logo && (
                <div className="text-4xl">{airlineData.logo}</div>
              )}
              <div>
                <DialogTitle className="text-2xl">{airlineData.name}</DialogTitle>
                <DialogDescription>
                  Complete airline profile with hiring requirements, benefits, and career information
                </DialogDescription>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary">{airlineData.iata}</Badge>
                  <Badge variant="secondary">{airlineData.icao}</Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

        <div className="flex-1 min-h-0">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
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

          {/* Pilot Application Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pilot Application Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Currently Hiring:</span>
                <Badge variant={airlineData.hiring_status ? "default" : "secondary"}>
                  {airlineData.hiring_status ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href={airlineData.pilot_application_url} target="_blank" rel="noopener noreferrer">
                    Apply Now
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hiring Requirements */}
          <Card className={airlineData.detailed_requirements ? "md:col-span-2" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Hiring Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {airlineData.detailed_requirements ? (
                 <div className="grid md:grid-cols-2 gap-6">
                   <div>
                     <h4 className="font-semibold text-sm mb-3 text-green-700 dark:text-green-400">Required</h4>
                     <div className="space-y-2">
                       {airlineData.detailed_requirements.required.map((requirement, index) => (
                         <div key={index} className="flex items-start gap-2">
                           <div className="h-1.5 w-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                           <span className="text-sm">{requirement}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                   <div>
                     <h4 className="font-semibold text-sm mb-3 text-blue-700 dark:text-blue-400">Preferred</h4>
                     <div className="space-y-2">
                       {airlineData.detailed_requirements.preferred.map((requirement, index) => (
                         <div key={index} className="flex items-start gap-2">
                           <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                           <span className="text-sm">{requirement}</span>
                         </div>
                       ))}
                     </div>
                     
                     {airlineData.inside_scoop && (
                       <div className="mt-6">
                         <h4 className="font-semibold text-sm mb-3 text-amber-700 dark:text-amber-400">Inside Scoop</h4>
                         <div className="space-y-2">
                           {airlineData.inside_scoop.map((tip, index) => (
                             <div key={index} className="flex items-start gap-2">
                               <div className="h-1.5 w-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                               <span className="text-sm italic">{tip}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               ) : (
                 <div className="space-y-3">
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
                 </div>
               )}
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
        </div>

        {/* First Officer Pay Scale - Full Width */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              First Officer Hourly Pay Scale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto border rounded">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-background border-b">
                  <tr>
                    <th className="text-left p-2 font-semibold bg-background">Aircraft Type</th>
                    <th className="text-center p-2 font-semibold bg-background">1</th>
                    <th className="text-center p-2 font-semibold bg-background">2</th>
                    <th className="text-center p-2 font-semibold bg-background">3</th>
                    <th className="text-center p-2 font-semibold bg-background">4</th>
                    <th className="text-center p-2 font-semibold bg-background">5</th>
                    <th className="text-center p-2 font-semibold bg-background">6</th>
                    <th className="text-center p-2 font-semibold bg-background">7</th>
                    <th className="text-center p-2 font-semibold bg-background">8</th>
                    <th className="text-center p-2 font-semibold bg-background">9</th>
                    <th className="text-center p-2 font-semibold bg-background">10</th>
                    <th className="text-center p-2 font-semibold bg-background">11</th>
                    <th className="text-center p-2 font-semibold bg-background">12</th>
                  </tr>
                </thead>
                <tbody>
                  {airlineData.fleet_types.map((aircraft, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{aircraft}</td>
                      <td className="text-center p-2">{airlineData.pay_scales.first_officer.year_1}</td>
                      <td className="text-center p-2">{airlineData.pay_scales.first_officer.year_2}</td>
                      <td className="text-center p-2">{airlineData.pay_scales.first_officer.year_3}</td>
                      <td className="text-center p-2">{airlineData.pay_scales.first_officer.year_4}</td>
                      <td className="text-center p-2">{airlineData.pay_scales.first_officer.year_5}</td>
                      <td className="text-center p-2">{airlineData.pay_scales.first_officer.year_6}</td>
                      <td className="text-center p-2">{airlineData.pay_scales.first_officer.year_7}</td>
                      <td className="text-center p-2">{airlineData.pay_scales.first_officer.year_8}</td>
                      <td className="text-center p-2">{airlineData.pay_scales.first_officer.year_9}</td>
                      <td className="text-center p-2">{airlineData.pay_scales.first_officer.year_10}</td>
                      <td className="text-center p-2">{airlineData.pay_scales.first_officer.year_11}</td>
                      <td className="text-center p-2">{airlineData.pay_scales.first_officer.year_12}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </div>

        <div className="flex-shrink-0 flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}