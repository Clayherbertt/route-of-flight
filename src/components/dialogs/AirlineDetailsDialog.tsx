import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Plane, Building2, ExternalLink, Phone, Mail, DollarSign, CalendarDays, Briefcase } from "lucide-react";

interface AirlineInfo {
  name: string;
  logo: string;
  callSign: string;
  pilotGroupSize: string;
  fleetSize: number;
  description: string;
  pilotUnion: string;
  fleetInfo: { type: string; quantity: number }[];
  bases: string[];
  hiring: {
    isHiring: boolean;
    applicationUrl: string;
    requiredQualifications: string[];
    preferredQualifications: string[];
    insideScoop?: string[];
  };
  seniority: {
    mostJuniorBase: string;
    mostJuniorCaptainHireDate: string;
    retirementsIn2025: number;
  };
  payScale: {
    firstOfficer: { year1: string; year5: string; year10: string; };
    captain: { year1: string; year5: string; year10: string; };
  };
  additionalInfo?: string[];
}

interface AirlineDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  airline: { name: string; logoUrl?: string } | null;
}

// Sample data for airlines with new structure
const airlinesData: Record<string, AirlineInfo> = {
  "Alaska Airlines": {
    name: "Alaska Airlines",
    logo: "✈️",
    callSign: "Alaska",
    pilotGroupSize: "3,200+",
    fleetSize: 314,
    description: "Alaska Airlines is a major American airline known for exceptional customer service and reliability, serving the West Coast and Alaska.",
    pilotUnion: "ALPA (Air Line Pilots Association)",
    fleetInfo: [
      { type: "Boeing 737-700", quantity: 32 },
      { type: "Boeing 737-800", quantity: 61 },
      { type: "Boeing 737-900", quantity: 76 },
      { type: "Boeing 737 MAX 8", quantity: 45 },
      { type: "Boeing 737 MAX 9", quantity: 67 },
      { type: "Airbus A320", quantity: 12 },
      { type: "Airbus A321neo", quantity: 21 }
    ],
    bases: ["Seattle (SEA)", "Anchorage (ANC)", "Los Angeles (LAX)", "San Francisco (SFO)", "Portland (PDX)"],
    hiring: {
      isHiring: true,
      applicationUrl: "https://careers.alaskaair.com/pilots",
      requiredQualifications: [
        "Minimum 1,500 hours total time",
        "ATP Certificate or meet ATP requirements",
        "Current First Class Medical",
        "500 hours fixed wing turbine time",
        "Current passport with 6+ months validity",
        "Must be 23+ years old",
        "High school diploma or equivalent"
      ],
      preferredQualifications: [
        "Bachelor's degree",
        "500 hours turbine PIC time",
        "50+ hours flight time in last 12 months",
        "Multi-engine experience"
      ],
      insideScoop: [
        "Known for excellent work-life balance",
        "Strong company culture and employee satisfaction",
        "Growing route network with Hawaiian acquisition"
      ]
    },
    seniority: {
      mostJuniorBase: "Seattle (SEA)",
      mostJuniorCaptainHireDate: "March 2019",
      retirementsIn2025: 85
    },
    payScale: {
      firstOfficer: { year1: "$108.16/hr", year5: "$201.45/hr", year10: "$224.41/hr" },
      captain: { year1: "$300.31/hr", year5: "$311.31/hr", year10: "$325.31/hr" }
    },
    additionalInfo: [
      "Industry-leading pilot contract ratified in 2022",
      "Market rate adjustment keeps pilots competitive",
      "Strong job security with growth opportunities"
    ]
  },
  "Delta Air Lines": {
    name: "Delta Air Lines",
    logo: "✈️",
    callSign: "Delta",
    pilotGroupSize: "15,000+",
    fleetSize: 865,
    description: "One of the major legacy carriers in the United States, known for premium service and global network.",
    pilotUnion: "ALPA (Air Line Pilots Association)",
    fleetInfo: [
      { type: "Boeing 777", quantity: 25 },
      { type: "Airbus A350", quantity: 28 },
      { type: "Boeing 787", quantity: 31 },
      { type: "Airbus A330", quantity: 36 },
      { type: "Boeing 767", quantity: 44 },
      { type: "Boeing 757", quantity: 111 },
      { type: "Airbus A321", quantity: 127 },
      { type: "Boeing 737", quantity: 255 },
      { type: "Airbus A320/319", quantity: 108 },
      { type: "Airbus A220", quantity: 95 }
    ],
    bases: ["Atlanta (ATL)", "Detroit (DTW)", "Minneapolis (MSP)", "New York JFK (JFK)", "Los Angeles (LAX)", "Seattle (SEA)", "Salt Lake City (SLC)", "Boston (BOS)"],
    hiring: {
      isHiring: true,
      applicationUrl: "https://careers.delta.com/pilots",
      requiredQualifications: [
        "ATP Certificate",
        "Current First Class Medical",
        "Minimum 1,500 hours total time",
        "250 hours PIC or SIC",
        "50 hours multi-engine time",
        "Bachelor's degree preferred",
        "Current passport"
      ],
      preferredQualifications: [
        "1,000+ hours turbine time",
        "Bachelor's degree from accredited university",
        "100+ hours flight time in last 12 months"
      ],
      insideScoop: [
        "Highly selective hiring process",
        "Excellent benefits and profit sharing",
        "Premium airline with global destinations"
      ]
    },
    seniority: {
      mostJuniorBase: "New York JFK (JFK)",
      mostJuniorCaptainHireDate: "January 2018",
      retirementsIn2025: 450
    },
    payScale: {
      firstOfficer: { year1: "$118.31/hr", year5: "$276.92/hr", year10: "$305.88/hr" },
      captain: { year1: "$418.37/hr", year5: "$432.08/hr", year10: "$449.11/hr" }
    },
    additionalInfo: [
      "Industry-leading compensation packages",
      "16% company contribution to 401(k)",
      "Extensive profit sharing program"
    ]
  },
  "United Airlines": {
    name: "United Airlines",
    logo: "✈️",
    callSign: "United",
    pilotGroupSize: "13,500+",
    fleetSize: 830,
    description: "Major American airline with extensive domestic and international route network across six continents.",
    pilotUnion: "ALPA (Air Line Pilots Association)",
    fleetInfo: [
      { type: "Boeing 777", quantity: 96 },
      { type: "Boeing 787", quantity: 55 },
      { type: "Airbus A350", quantity: 45 },
      { type: "Boeing 767", quantity: 38 },
      { type: "Boeing 757", quantity: 21 },
      { type: "Airbus A321", quantity: 158 },
      { type: "Boeing 737", quantity: 247 },
      { type: "Airbus A320/319", quantity: 99 },
      { type: "Embraer E175", quantity: 71 }
    ],
    bases: ["Chicago (ORD)", "Denver (DEN)", "Houston (IAH)", "Los Angeles (LAX)", "Newark (EWR)", "San Francisco (SFO)", "Washington DC (IAD)"],
    hiring: {
      isHiring: true,
      applicationUrl: "https://careers.united.com/pilots",
      requiredQualifications: [
        "Unrestricted ATP Certificate",
        "Current First Class Medical",
        "Minimum 1,500 hours total time",
        "Current passport with 6+ months validity",
        "Legal right to work in US",
        "High school diploma or GED"
      ],
      preferredQualifications: [
        "Bachelor's degree",
        "1,000+ hours turbine time",
        "100+ hours flight time in last 12 months"
      ],
      insideScoop: [
        "Large fleet expansion planned",
        "Good career progression opportunities",
        "Strong international route network"
      ]
    },
    seniority: {
      mostJuniorBase: "Newark (EWR)",
      mostJuniorCaptainHireDate: "May 2018",
      retirementsIn2025: 380
    },
    payScale: {
      firstOfficer: { year1: "$106.92/hr", year5: "$255.33/hr", year10: "$279.85/hr" },
      captain: { year1: "$357.74/hr", year5: "$371.58/hr", year10: "$385.39/hr" }
    },
    additionalInfo: [
      "Major fleet renewal with new aircraft orders",
      "Competitive profit sharing program",
      "Extensive training facilities"
    ]
  },
  "American Airlines": {
    name: "American Airlines",
    logo: "✈️",
    callSign: "American",
    pilotGroupSize: "15,500+",
    fleetSize: 875,
    description: "World's largest airline by fleet size and passengers carried, serving destinations across six continents from its hubs throughout the United States.",
    pilotUnion: "APA (Allied Pilots Association)",
    fleetInfo: [
      { type: "Boeing 777", quantity: 47 },
      { type: "Boeing 787", quantity: 51 },
      { type: "Airbus A330", quantity: 24 },
      { type: "Boeing 767", quantity: 24 },
      { type: "Boeing 757", quantity: 34 },
      { type: "Airbus A321", quantity: 219 },
      { type: "Boeing 737", quantity: 304 },
      { type: "Airbus A320/319", quantity: 132 },
      { type: "Embraer E175", quantity: 40 }
    ],
    bases: ["Dallas (DFW)", "Charlotte (CLT)", "Miami (MIA)", "Phoenix (PHX)", "Philadelphia (PHL)", "Chicago (ORD)", "Los Angeles (LAX)", "New York (LGA)", "Washington DC (DCA)"],
    hiring: {
      isHiring: true,
      applicationUrl: "https://careers.aa.com/pilots",
      requiredQualifications: [
        "ATP Certificate or meet ATP requirements",
        "Current First Class Medical",
        "Minimum 1,500 hours total time",
        "Multi-engine land rating",
        "Current passport valid for international travel",
        "Must be 23+ years old",
        "High school diploma or equivalent"
      ],
      preferredQualifications: [
        "Bachelor's degree from accredited institution",
        "1,000+ hours turbine time",
        "500+ hours turbine PIC time",
        "100+ hours flight time in last 12 months"
      ],
      insideScoop: [
        "Largest airline in the world by fleet and revenue",
        "Strong domestic and international route network",
        "Competitive compensation and benefits package"
      ]
    },
    seniority: {
      mostJuniorBase: "Miami (MIA)",
      mostJuniorCaptainHireDate: "February 2018",
      retirementsIn2025: 520
    },
    payScale: {
      firstOfficer: { year1: "$115.75/hr", year5: "$264.18/hr", year10: "$291.19/hr" },
      captain: { year1: "$384.25/hr", year5: "$398.45/hr", year10: "$412.89/hr" }
    },
    additionalInfo: [
      "World's largest airline with extensive global network",
      "Strong profit sharing and 401(k) matching",
      "Modern fleet with ongoing aircraft deliveries"
    ]
  },
  "Hawaiian Airlines": {
    name: "Hawaiian Airlines",
    logo: "✈️",
    callSign: "Hawaiian",
    pilotGroupSize: "800+",
    fleetSize: 61,
    description: "Hawaii's largest and longest-serving airline, connecting the Hawaiian Islands with destinations across the Pacific and mainland United States.",
    pilotUnion: "ALPA (Air Line Pilots Association)",
    fleetInfo: [
      { type: "Airbus A330", quantity: 24 },
      { type: "Airbus A321neo", quantity: 18 },
      { type: "Boeing 787", quantity: 8 },
      { type: "Boeing 717", quantity: 20 },
      { type: "ATR 72", quantity: 8 }
    ],
    bases: ["Honolulu (HNL)", "Kahului (OGG)", "Kona (KOA)", "Lihue (LIH)"],
    hiring: {
      isHiring: true,
      applicationUrl: "https://careers.hawaiianairlines.com/pilots",
      requiredQualifications: [
        "ATP Certificate",
        "Current First Class Medical",
        "Minimum 1,500 hours total time",
        "500 hours multi-engine time",
        "Current passport with 6+ months validity",
        "Must be 21+ years old"
      ],
      preferredQualifications: [
        "Bachelor's degree",
        "1,000+ hours turbine time",
        "International flying experience",
        "Pacific route experience"
      ],
      insideScoop: [
        "Unique island-based operations",
        "Excellent quality of life in Hawaii",
        "Strong company culture and employee satisfaction"
      ]
    },
    seniority: {
      mostJuniorBase: "Honolulu (HNL)",
      mostJuniorCaptainHireDate: "June 2019",
      retirementsIn2025: 35
    },
    payScale: {
      firstOfficer: { year1: "$98.50/hr", year5: "$185.75/hr", year10: "$208.25/hr" },
      captain: { year1: "$275.80/hr", year5: "$285.90/hr", year10: "$298.45/hr" }
    },
    additionalInfo: [
      "Living in paradise with island-based operations",
      "Strong local community involvement",
      "Unique inter-island and trans-Pacific routes"
    ]
  },
  "Southwest Airlines": {
    name: "Southwest Airlines",
    logo: "✈️",
    callSign: "Southwest",
    pilotGroupSize: "10,000+",
    fleetSize: 817,
    description: "Low-cost carrier known for point-to-point service, no-frills approach, and strong company culture. Operates exclusively Boeing 737 aircraft.",
    pilotUnion: "SWAPA (Southwest Airlines Pilots' Association)",
    fleetInfo: [
      { type: "Boeing 737-700", quantity: 215 },
      { type: "Boeing 737-800", quantity: 207 },
      { type: "Boeing 737 MAX 7", quantity: 30 },
      { type: "Boeing 737 MAX 8", quantity: 365 }
    ],
    bases: ["Dallas (DAL)", "Houston (HOU)", "Phoenix (PHX)", "Las Vegas (LAS)", "Chicago (MDW)", "Baltimore (BWI)", "Denver (DEN)", "Oakland (OAK)", "Orlando (MCO)", "Atlanta (ATL)"],
    hiring: {
      isHiring: true,
      applicationUrl: "https://careers.southwest.com/pilots",
      requiredQualifications: [
        "ATP Certificate",
        "Current First Class Medical",
        "Minimum 1,500 hours total time",
        "Boeing 737 type rating preferred",
        "Current passport",
        "Must be 23+ years old"
      ],
      preferredQualifications: [
        "Bachelor's degree",
        "1,000+ hours turbine time",
        "Part 121 experience",
        "Boeing 737 experience"
      ],
      insideScoop: [
        "Strong company culture and employee-friendly policies",
        "Single aircraft type simplifies operations",
        "Known for excellent work-life balance"
      ]
    },
    seniority: {
      mostJuniorBase: "Atlanta (ATL)",
      mostJuniorCaptainHireDate: "April 2019",
      retirementsIn2025: 295
    },
    payScale: {
      firstOfficer: { year1: "$102.35/hr", year5: "$238.85/hr", year10: "$263.75/hr" },
      captain: { year1: "$325.40/hr", year5: "$338.90/hr", year10: "$354.20/hr" }
    },
    additionalInfo: [
      "Profit sharing program with strong payouts",
      "Single fleet type reduces training complexity",
      "Strong company culture with employee ownership"
    ]
  },
  "Spirit": {
    name: "Spirit Airlines",
    logo: "✈️",
    callSign: "Spirit Wings",
    pilotGroupSize: "3,000+",
    fleetSize: 186,
    description: "Ultra-low-cost carrier known for unbundled pricing model and point-to-point service throughout the United States, Caribbean, and Latin America.",
    pilotUnion: "ALPA (Air Line Pilots Association)",
    fleetInfo: [
      { type: "Airbus A319", quantity: 31 },
      { type: "Airbus A320", quantity: 81 },
      { type: "Airbus A321", quantity: 74 }
    ],
    bases: ["Fort Lauderdale (FLL)", "Detroit (DTW)", "Las Vegas (LAS)", "Chicago (ORD)", "Dallas (DFW)", "Houston (IAH)", "Orlando (MCO)", "Atlantic City (ACY)"],
    hiring: {
      isHiring: true,
      applicationUrl: "https://careers.spirit.com/pilots",
      requiredQualifications: [
        "ATP Certificate or meet ATP requirements",
        "Current First Class Medical",
        "Minimum 1,500 hours total time",
        "Multi-engine land rating",
        "Current passport",
        "Must be 23+ years old"
      ],
      preferredQualifications: [
        "Bachelor's degree",
        "1,000+ hours turbine time",
        "Part 121 experience",
        "Airbus experience"
      ],
      insideScoop: [
        "Growing ULCC with expansion opportunities",
        "Single aircraft family operations",
        "Competitive entry-level airline"
      ]
    },
    seniority: {
      mostJuniorBase: "Orlando (MCO)",
      mostJuniorCaptainHireDate: "August 2019",
      retirementsIn2025: 25
    },
    payScale: {
      firstOfficer: { year1: "$90.00/hr", year5: "$165.00/hr", year10: "$185.00/hr" },
      captain: { year1: "$240.00/hr", year5: "$255.00/hr", year10: "$270.00/hr" }
    },
    additionalInfo: [
      "Rapid growth and fleet expansion",
      "Focus on leisure destinations",
      "Strong operational reliability"
    ]
  },
  "Frontier": {
    name: "Frontier Airlines",
    logo: "✈️",
    callSign: "Frontier Flight",
    pilotGroupSize: "1,800+",
    fleetSize: 137,
    description: "Ultra-low-cost carrier based in Denver, known for animal-themed aircraft liveries and focus on leisure travel markets.",
    pilotUnion: "ALPA (Air Line Pilots Association)",
    fleetInfo: [
      { type: "Airbus A320", quantity: 74 },
      { type: "Airbus A321", quantity: 63 }
    ],
    bases: ["Denver (DEN)", "Las Vegas (LAS)", "Orlando (MCO)", "Philadelphia (PHL)", "Phoenix (PHX)", "Tampa (TPA)", "Miami (MIA)"],
    hiring: {
      isHiring: true,
      applicationUrl: "https://careers.flyfrontier.com/pilots",
      requiredQualifications: [
        "ATP Certificate",
        "Current First Class Medical",
        "Minimum 1,500 hours total time",
        "Multi-engine rating",
        "Current passport",
        "English proficiency"
      ],
      preferredQualifications: [
        "Bachelor's degree",
        "1,000+ hours turbine time",
        "Airbus experience",
        "Part 121 experience"
      ],
      insideScoop: [
        "Animal-themed aircraft with unique culture",
        "Growing route network",
        "Good entry point into Part 121 operations"
      ]
    },
    seniority: {
      mostJuniorBase: "Denver (DEN)",
      mostJuniorCaptainHireDate: "September 2019",
      retirementsIn2025: 18
    },
    payScale: {
      firstOfficer: { year1: "$88.00/hr", year5: "$158.00/hr", year10: "$178.00/hr" },
      captain: { year1: "$235.00/hr", year5: "$248.00/hr", year10: "$262.00/hr" }
    },
    additionalInfo: [
      "Unique animal-themed aircraft liveries",
      "Focus on leisure travel markets",
      "Denver-based with western US focus"
    ]
  },
  "Allegiant Air": {
    name: "Allegiant Air",
    logo: "✈️",
    callSign: "Allegiant",
    pilotGroupSize: "1,500+",
    fleetSize: 130,
    description: "Ultra-low-cost carrier specializing in leisure travel from small cities to vacation destinations with high-frequency, point-to-point service.",
    pilotUnion: "IBT (International Brotherhood of Teamsters)",
    fleetInfo: [
      { type: "Airbus A319", quantity: 54 },
      { type: "Airbus A320", quantity: 76 }
    ],
    bases: ["Las Vegas (LAS)", "Orlando (MCO)", "Phoenix (PHX)", "St. Pete (PIE)", "Cincinnati (CVG)", "Grand Rapids (GRR)"],
    hiring: {
      isHiring: true,
      applicationUrl: "https://careers.allegiantair.com/pilots",
      requiredQualifications: [
        "ATP Certificate",
        "Current First Class Medical",
        "Minimum 1,500 hours total time",
        "Multi-engine land rating",
        "Current passport"
      ],
      preferredQualifications: [
        "Bachelor's degree",
        "1,000+ hours turbine time",
        "Airbus experience",
        "Previous Part 121 experience"
      ],
      insideScoop: [
        "Unique business model with leisure focus",
        "Good work-life balance",
        "Strong company performance"
      ]
    },
    seniority: {
      mostJuniorBase: "Las Vegas (LAS)",
      mostJuniorCaptainHireDate: "November 2019",
      retirementsIn2025: 12
    },
    payScale: {
      firstOfficer: { year1: "$86.00/hr", year5: "$155.00/hr", year10: "$175.00/hr" },
      captain: { year1: "$230.00/hr", year5: "$245.00/hr", year10: "$260.00/hr" }
    },
    additionalInfo: [
      "Leisure-focused route network",
      "Strong financial performance",
      "Unique small city to vacation destination model"
    ]
  },
  "JetBlue Airways": {
    name: "JetBlue Airways",
    logo: "✈️",
    callSign: "JetBlue",
    pilotGroupSize: "4,500+",
    fleetSize: 289,
    description: "Low-cost carrier known for premium cabin experience, free WiFi, and focus on customer service with operations primarily on the East Coast.",
    pilotUnion: "ALPA (Air Line Pilots Association)",
    fleetInfo: [
      { type: "Airbus A220", quantity: 63 },
      { type: "Airbus A320", quantity: 130 },
      { type: "Airbus A321", quantity: 96 }
    ],
    bases: ["New York JFK (JFK)", "Boston (BOS)", "Fort Lauderdale (FLL)", "Orlando (MCO)", "Los Angeles (LAX)", "Long Beach (LGB)"],
    hiring: {
      isHiring: true,
      applicationUrl: "https://careers.jetblue.com/pilots",
      requiredQualifications: [
        "ATP Certificate",
        "Current First Class Medical",
        "Minimum 1,500 hours total time",
        "Multi-engine rating",
        "Current passport",
        "English proficiency"
      ],
      preferredQualifications: [
        "Bachelor's degree",
        "1,000+ hours turbine time",
        "Airbus experience",
        "Part 121 experience"
      ],
      insideScoop: [
        "Known for excellent customer service culture",
        "Premium amenities in economy class",
        "Strong East Coast presence"
      ]
    },
    seniority: {
      mostJuniorBase: "Fort Lauderdale (FLL)",
      mostJuniorCaptainHireDate: "July 2019",
      retirementsIn2025: 42
    },
    payScale: {
      firstOfficer: { year1: "$95.00/hr", year5: "$175.00/hr", year10: "$195.00/hr" },
      captain: { year1: "$265.00/hr", year5: "$280.00/hr", year10: "$295.00/hr" }
    },
    additionalInfo: [
      "Premium service at low-cost carrier prices",
      "Strong brand recognition and customer loyalty",
      "Focus on technology and innovation"
    ]
  },
  "Breeze Airways": {
    name: "Breeze Airways",
    logo: "✈️",
    callSign: "Breeze",
    pilotGroupSize: "500+",
    fleetSize: 52,
    description: "Newest major US airline launched in 2021, focusing on underserved routes with modern aircraft and technology-forward approach.",
    pilotUnion: "Non-unionized",
    fleetInfo: [
      { type: "Embraer E190", quantity: 27 },
      { type: "Airbus A220", quantity: 25 }
    ],
    bases: ["Charleston (CHS)", "Norfolk (ORF)", "Tampa (TPA)", "New Orleans (MSY)", "Hartford (BDL)", "Providence (PVD)"],
    hiring: {
      isHiring: true,
      applicationUrl: "https://careers.flybreeze.com/pilots",
      requiredQualifications: [
        "ATP Certificate",
        "Current First Class Medical",
        "Minimum 1,500 hours total time",
        "Multi-engine rating",
        "Current passport"
      ],
      preferredQualifications: [
        "Bachelor's degree",
        "1,000+ hours turbine time",
        "Regional airline experience",
        "Embraer or Airbus experience"
      ],
      insideScoop: [
        "Newest airline with modern fleet",
        "Focus on underserved markets",
        "Technology-forward operations"
      ]
    },
    seniority: {
      mostJuniorBase: "Charleston (CHS)",
      mostJuniorCaptainHireDate: "March 2022",
      retirementsIn2025: 0
    },
    payScale: {
      firstOfficer: { year1: "$92.00/hr", year5: "$168.00/hr", year10: "$188.00/hr" },
      captain: { year1: "$250.00/hr", year5: "$265.00/hr", year10: "$280.00/hr" }
    },
    additionalInfo: [
      "Founded by JetBlue's founder David Neeleman",
      "Focus on point-to-point service",
      "Modern technology and guest experience"
    ]
  },
  "Sun Country Airlines": {
    name: "Sun Country Airlines",
    logo: "✈️",
    callSign: "Sun Country",
    pilotGroupSize: "700+",
    fleetSize: 50,
    description: "Low-cost carrier based in Minneapolis, offering scheduled passenger service, cargo, and charter operations with focus on leisure destinations.",
    pilotUnion: "ALPA (Air Line Pilots Association)",
    fleetInfo: [
      { type: "Boeing 737-700", quantity: 11 },
      { type: "Boeing 737-800", quantity: 39 }
    ],
    bases: ["Minneapolis (MSP)", "Dallas (DFW)", "Las Vegas (LAS)", "Phoenix (PHX)"],
    hiring: {
      isHiring: true,
      applicationUrl: "https://careers.suncountry.com/pilots",
      requiredQualifications: [
        "ATP Certificate",
        "Current First Class Medical",
        "Minimum 1,500 hours total time",
        "Multi-engine rating",
        "Current passport"
      ],
      preferredQualifications: [
        "Bachelor's degree",
        "1,000+ hours turbine time",
        "Boeing 737 experience",
        "Part 121 experience"
      ],
      insideScoop: [
        "Strong Midwest presence",
        "Diverse operations including cargo and charter",
        "Family-friendly company culture"
      ]
    },
    seniority: {
      mostJuniorBase: "Minneapolis (MSP)",
      mostJuniorCaptainHireDate: "October 2019",
      retirementsIn2025: 8
    },
    payScale: {
      firstOfficer: { year1: "$89.00/hr", year5: "$162.00/hr", year10: "$182.00/hr" },
      captain: { year1: "$245.00/hr", year5: "$260.00/hr", year10: "$275.00/hr" }
    },
    additionalInfo: [
      "Based in Minneapolis with Midwest focus",
      "Diverse revenue streams beyond passenger service",
      "Strong operational performance"
    ]
  }
};

export function AirlineDetailsDialog({ open, onOpenChange, airline }: AirlineDetailsDialogProps) {
  if (!airline) return null;

  const airlineData = airlinesData[airline.name];

  if (!airlineData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Plane className="h-6 w-6 text-primary" />
              {airline.name}
            </DialogTitle>
            <DialogDescription>
              Detailed information not available for this airline yet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <p className="text-muted-foreground">
              We're working on adding detailed information for {airline.name}. 
              Please check back later or contact us for specific information about this carrier.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="text-3xl">{airlineData.logo}</div>
            <div>
              <h2 className="text-2xl font-bold">{airlineData.name}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span>Call Sign: {airlineData.callSign}</span>
                <span>•</span>
                <Badge variant={airlineData.hiring.isHiring ? "default" : "secondary"}>
                  {airlineData.hiring.isHiring ? "Hiring" : "Not Hiring"}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Company Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Call Sign</span>
                    <p className="text-base font-medium">{airlineData.callSign}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Pilot Group Size</span>
                    <p className="text-base font-medium">{airlineData.pilotGroupSize}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Fleet Size</span>
                    <p className="text-base font-medium">{airlineData.fleetSize} aircraft</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Description</span>
                    <p className="text-base">{airlineData.description}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Pilot Union Group</span>
                    <p className="text-base font-medium">{airlineData.pilotUnion}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fleet Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Fleet Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {airlineData.fleetInfo.map((aircraft, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{aircraft.type}</span>
                    <Badge variant="outline">{aircraft.quantity}</Badge>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {airlineData.bases.map((base, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{base}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hiring Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Hiring Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Hiring Status:</span>
                <Badge variant={airlineData.hiring.isHiring ? "default" : "secondary"}>
                  {airlineData.hiring.isHiring ? "✓ Actively Hiring" : "✗ Not Currently Hiring"}
                </Badge>
              </div>
              
              {airlineData.hiring.isHiring && (
                <div>
                  <Button asChild className="w-full">
                    <a href={airlineData.hiring.applicationUrl} target="_blank" rel="noopener noreferrer">
                      Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}

              <Separator />
              
              <div>
                <h4 className="font-semibold mb-3">Required Qualifications</h4>
                <ul className="space-y-2 text-sm">
                  {airlineData.hiring.requiredQualifications.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1 text-xs">✓</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Preferred Qualifications</h4>
                <ul className="space-y-2 text-sm">
                  {airlineData.hiring.preferredQualifications.map((pref, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1 text-xs">◦</span>
                      <span>{pref}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {airlineData.hiring.insideScoop && airlineData.hiring.insideScoop.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-primary flex items-center gap-2">
                    <span>💡</span>
                    Inside Scoop
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {airlineData.hiring.insideScoop.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seniority Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Seniority Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Most Junior Base</div>
                  <div className="text-lg font-bold">{airlineData.seniority.mostJuniorBase}</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Most Jr Captain Hire Date</div>
                  <div className="text-lg font-bold">{airlineData.seniority.mostJuniorCaptainHireDate}</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Retirements in 2025</div>
                  <div className="text-lg font-bold">{airlineData.seniority.retirementsIn2025}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pay Scale */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pay Scale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">First Officer Pay</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Year 1</div>
                    <div className="text-lg font-bold">{airlineData.payScale.firstOfficer.year1}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Year 5</div>
                    <div className="text-lg font-bold">{airlineData.payScale.firstOfficer.year5}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Year 10</div>
                    <div className="text-lg font-bold">{airlineData.payScale.firstOfficer.year10}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Captain Pay</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Year 1</div>
                    <div className="text-lg font-bold">{airlineData.payScale.captain.year1}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Year 5</div>
                    <div className="text-lg font-bold">{airlineData.payScale.captain.year5}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Year 10</div>
                    <div className="text-lg font-bold">{airlineData.payScale.captain.year10}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {airlineData.additionalInfo && airlineData.additionalInfo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {airlineData.additionalInfo.map((info, index) => (
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