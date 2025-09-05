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
    captain: Record<string, {
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
    }>;
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
        "default": {
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
        "B-777": { year_1: "$418.37", year_2: "$421.76", year_3: "$425.21", year_4: "$428.64", year_5: "$432.08", year_6: "$435.47", year_7: "$438.90", year_8: "$442.28", year_9: "$445.71", year_10: "$449.11", year_11: "$452.52", year_12: "$455.96" },
        "A-350": { year_1: "$418.37", year_2: "$421.76", year_3: "$425.21", year_4: "$428.64", year_5: "$432.08", year_6: "$435.47", year_7: "$438.90", year_8: "$442.28", year_9: "$445.71", year_10: "$449.11", year_11: "$452.52", year_12: "$455.96" },
        "B-787": { year_1: "$418.37", year_2: "$421.76", year_3: "$425.21", year_4: "$428.64", year_5: "$432.08", year_6: "$435.47", year_7: "$438.90", year_8: "$442.28", year_9: "$445.71", year_10: "$449.11", year_11: "$452.52", year_12: "$455.96" },
        "A-330-900/300/200": { year_1: "$418.37", year_2: "$421.76", year_3: "$425.21", year_4: "$428.64", year_5: "$432.08", year_6: "$435.47", year_7: "$438.90", year_8: "$442.28", year_9: "$445.71", year_10: "$449.11", year_11: "$452.52", year_12: "$455.96" },
        "B-767-400ER": { year_1: "$418.37", year_2: "$421.76", year_3: "$425.21", year_4: "$428.64", year_5: "$432.08", year_6: "$435.47", year_7: "$438.90", year_8: "$442.28", year_9: "$445.71", year_10: "$449.11", year_11: "$452.52", year_12: "$455.96" },
        "B-767-300ER": { year_1: "$347.00", year_2: "$349.94", year_3: "$352.78", year_4: "$355.64", year_5: "$358.66", year_6: "$361.46", year_7: "$364.14", year_8: "$367.15", year_9: "$369.76", year_10: "$373.73", year_11: "$377.76", year_12: "$381.66" },
        "B-767-300/200": { year_1: "$347.00", year_2: "$349.94", year_3: "$352.78", year_4: "$355.64", year_5: "$358.66", year_6: "$361.46", year_7: "$364.14", year_8: "$367.15", year_9: "$369.76", year_10: "$373.73", year_11: "$377.76", year_12: "$381.66" },
        "B-757": { year_1: "$347.00", year_2: "$349.94", year_3: "$352.78", year_4: "$355.64", year_5: "$358.66", year_6: "$361.46", year_7: "$364.14", year_8: "$367.15", year_9: "$369.76", year_10: "$373.73", year_11: "$377.76", year_12: "$381.66" },
        "A-321N": { year_1: "$347.00", year_2: "$349.94", year_3: "$352.78", year_4: "$355.64", year_5: "$358.66", year_6: "$361.46", year_7: "$364.14", year_8: "$367.15", year_9: "$369.76", year_10: "$373.73", year_11: "$377.76", year_12: "$381.66" },
        "B-737-900": { year_1: "$337.46", year_2: "$340.11", year_3: "$342.78", year_4: "$345.56", year_5: "$348.37", year_6: "$351.16", year_7: "$353.92", year_8: "$356.69", year_9: "$359.53", year_10: "$362.20", year_11: "$365.04", year_12: "$367.88" },
        "A-321": { year_1: "$337.46", year_2: "$340.11", year_3: "$342.78", year_4: "$345.56", year_5: "$348.37", year_6: "$351.16", year_7: "$353.92", year_8: "$356.69", year_9: "$359.53", year_10: "$362.20", year_11: "$365.04", year_12: "$367.88" },
        "B-737-800/700": { year_1: "$335.99", year_2: "$338.61", year_3: "$341.28", year_4: "$344.04", year_5: "$346.82", year_6: "$349.55", year_7: "$352.27", year_8: "$355.02", year_9: "$357.79", year_10: "$360.51", year_11: "$363.27", year_12: "$365.97" },
        "A-320/319": { year_1: "$335.99", year_2: "$338.61", year_3: "$341.28", year_4: "$344.04", year_5: "$346.82", year_6: "$349.55", year_7: "$352.27", year_8: "$355.02", year_9: "$357.79", year_10: "$360.51", year_11: "$363.27", year_12: "$365.97" },
        "A-220-300": { year_1: "$323.79", year_2: "$326.47", year_3: "$329.10", year_4: "$331.76", year_5: "$334.44", year_6: "$337.15", year_7: "$339.80", year_8: "$342.45", year_9: "$345.09", year_10: "$347.77", year_11: "$350.47", year_12: "$353.14" },
        "A-220-100": { year_1: "$310.53", year_2: "$313.11", year_3: "$315.62", year_4: "$318.19", year_5: "$320.76", year_6: "$323.35", year_7: "$325.87", year_8: "$328.43", year_9: "$330.96", year_10: "$333.53", year_11: "$336.12", year_12: "$338.69" },
        "B-717": { year_1: "$302.38", year_2: "$304.61", year_3: "$307.10", year_4: "$309.60", year_5: "$311.97", year_6: "$314.55", year_7: "$316.94", year_8: "$319.43", year_9: "$321.90", year_10: "$324.41", year_11: "$326.94", year_12: "$329.32" },
        "EMB-195": { year_1: "$253.83", year_2: "$255.72", year_3: "$257.81", year_4: "$259.95", year_5: "$261.92", year_6: "$264.06", year_7: "$266.07", year_8: "$268.16", year_9: "$270.24", year_10: "$272.33", year_11: "$274.47", year_12: "$276.48" },
        "EMB-190/CRJ-900": { year_1: "$215.96", year_2: "$217.56", year_3: "$219.39", year_4: "$221.15", year_5: "$222.82", year_6: "$224.61", year_7: "$226.38", year_8: "$228.16", year_9: "$229.91", year_10: "$231.71", year_11: "$233.49", year_12: "$235.23" }
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
        "default": {
          year_1: "$198,000",
          year_5: "$275,000", 
          year_10: "$335,000"
        }
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
        "default": {
          year_1: "$200,000",
          year_5: "$280,000",
          year_10: "$340,000"
        }
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
        "default": {
          year_1: "$175,000",
          year_5: "$225,000",
          year_10: "$275,000"
        }
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
        "default": {
          year_1: "$189,000",
          year_5: "$245,000",
          year_10: "$295,000"
        }
      }
    }
  }
};

export function AirlineDetailsDialog({ open, onOpenChange, airline }: AirlineDetailsDialogProps) {
  // Use detailed data for major airlines
  const airlineData = airline ? majorAirlinesData[airline.name] : null;

  // Helper function to get First Officer pay by aircraft type (Delta only)
  const getFirstOfficerPay = (aircraft: string, year: number): string => {
    if (!airlineData || airlineData.name !== "Delta Air Lines") return "$0";
    
    const payScales: { [key: string]: { [key: string]: string } } = {
      "Boeing 777": { year_1: "$118.31", year_2: "$225.66", year_3: "$264.07", year_4: "$270.46", year_5: "$276.92", year_6: "$283.94", year_7: "$291.83", year_8: "$298.53", year_9: "$301.79", year_10: "$305.88", year_11: "$308.62", year_12: "$311.46" },
      "Airbus A350": { year_1: "$118.31", year_2: "$225.66", year_3: "$264.07", year_4: "$270.46", year_5: "$276.92", year_6: "$283.94", year_7: "$291.83", year_8: "$298.53", year_9: "$301.79", year_10: "$305.88", year_11: "$308.62", year_12: "$311.46" },
      "Boeing 787": { year_1: "$118.31", year_2: "$225.66", year_3: "$264.07", year_4: "$270.46", year_5: "$276.92", year_6: "$283.94", year_7: "$291.83", year_8: "$298.53", year_9: "$301.79", year_10: "$305.88", year_11: "$308.62", year_12: "$311.46" },
      "Airbus A330-900/300/200": { year_1: "$118.31", year_2: "$225.66", year_3: "$264.07", year_4: "$270.46", year_5: "$276.92", year_6: "$283.94", year_7: "$291.83", year_8: "$298.53", year_9: "$301.79", year_10: "$305.88", year_11: "$308.62", year_12: "$311.46" },
      "Boeing 767-400ER": { year_1: "$118.31", year_2: "$225.66", year_3: "$264.07", year_4: "$270.46", year_5: "$276.92", year_6: "$283.94", year_7: "$291.83", year_8: "$298.53", year_9: "$301.79", year_10: "$305.88", year_11: "$308.62", year_12: "$311.46" },
      "Boeing 767-300ER": { year_1: "$118.31", year_2: "$187.21", year_3: "$219.08", year_4: "$224.42", year_5: "$229.91", year_6: "$235.66", year_7: "$242.16", year_8: "$247.84", year_9: "$250.35", year_10: "$254.51", year_11: "$257.64", year_12: "$260.68" },
      "Boeing 767-300/200": { year_1: "$118.31", year_2: "$187.21", year_3: "$219.08", year_4: "$224.42", year_5: "$229.91", year_6: "$235.66", year_7: "$242.16", year_8: "$247.84", year_9: "$250.35", year_10: "$254.51", year_11: "$257.64", year_12: "$260.68" },
      "Boeing 757": { year_1: "$118.31", year_2: "$187.21", year_3: "$219.08", year_4: "$224.42", year_5: "$229.91", year_6: "$235.66", year_7: "$242.16", year_8: "$247.84", year_9: "$250.35", year_10: "$254.51", year_11: "$257.64", year_12: "$260.68" },
      "Airbus A321N": { year_1: "$118.31", year_2: "$187.21", year_3: "$219.08", year_4: "$224.42", year_5: "$229.91", year_6: "$235.66", year_7: "$242.16", year_8: "$247.84", year_9: "$250.35", year_10: "$254.51", year_11: "$257.64", year_12: "$260.68" },
      "Boeing 737-900": { year_1: "$118.31", year_2: "$181.93", year_3: "$212.89", year_4: "$218.04", year_5: "$223.28", year_6: "$228.96", year_7: "$235.37", year_8: "$240.80", year_9: "$243.38", year_10: "$246.70", year_11: "$248.96", year_12: "$251.27" },
      "Airbus A321": { year_1: "$118.31", year_2: "$181.93", year_3: "$212.89", year_4: "$218.04", year_5: "$223.28", year_6: "$228.96", year_7: "$235.37", year_8: "$240.80", year_9: "$243.38", year_10: "$246.70", year_11: "$248.96", year_12: "$251.27" },
      "Boeing 737-800/700": { year_1: "$118.31", year_2: "$181.18", year_3: "$211.94", year_4: "$217.10", year_5: "$222.32", year_6: "$227.87", year_7: "$234.24", year_8: "$239.65", year_9: "$242.21", year_10: "$245.48", year_11: "$247.74", year_12: "$249.96" },
      "Airbus A320/319": { year_1: "$118.31", year_2: "$181.18", year_3: "$211.94", year_4: "$217.10", year_5: "$222.32", year_6: "$227.87", year_7: "$234.24", year_8: "$239.65", year_9: "$242.21", year_10: "$245.48", year_11: "$247.74", year_12: "$249.96" },
      "Airbus A220-300": { year_1: "$118.31", year_2: "$174.67", year_3: "$204.39", year_4: "$209.34", year_5: "$214.39", year_6: "$219.79", year_7: "$225.95", year_8: "$231.15", year_9: "$233.66", year_10: "$236.86", year_11: "$239.02", year_12: "$241.20" },
      "Airbus A220-100": { year_1: "$118.31", year_2: "$167.51", year_3: "$196.02", year_4: "$200.75", year_5: "$205.59", year_6: "$210.80", year_7: "$216.69", year_8: "$221.69", year_9: "$224.08", year_10: "$227.15", year_11: "$229.24", year_12: "$231.32" },
      "Boeing 717": { year_1: "$118.31", year_2: "$162.94", year_3: "$190.69", year_4: "$195.34", year_5: "$199.96", year_6: "$205.08", year_7: "$210.76", year_8: "$215.63", year_9: "$217.92", year_10: "$220.92", year_11: "$223.02", year_12: "$224.91" },
      "Embraer EMB-195": { year_1: "$118.31", year_2: "$136.81", year_3: "$160.11", year_4: "$164.01", year_5: "$167.92", year_6: "$172.16", year_7: "$176.94", year_8: "$181.02", year_9: "$182.97", year_10: "$185.46", year_11: "$187.19", year_12: "$188.86" },
      "Embraer EMB-190/CRJ-900": { year_1: "$118.31", year_2: "$118.31", year_3: "$136.21", year_4: "$139.52", year_5: "$142.83", year_6: "$146.45", year_7: "$150.53", year_8: "$154.00", year_9: "$155.65", year_10: "$157.77", year_11: "$159.26", year_12: "$160.64" }
    };
    
    const aircraftPayScale = payScales[aircraft];
    if (!aircraftPayScale) {
      // Return default pay if aircraft not found
      return airlineData.pay_scales?.first_officer?.[`year_${year}` as keyof typeof airlineData.pay_scales.first_officer] || "$0";
    }
    
    return aircraftPayScale[`year_${year}`] || "$0";
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
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
          <Card className="md:col-span-2">
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

        {/* First Officer Pay Scale - Full Width (Delta only) */}
        {airlineData.name === "Delta Air Lines" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                First Officer Hourly Pay Scale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Aircraft Type</th>
                      <th className="text-center p-3 font-semibold">1</th>
                      <th className="text-center p-3 font-semibold">2</th>
                      <th className="text-center p-3 font-semibold">3</th>
                      <th className="text-center p-3 font-semibold">4</th>
                      <th className="text-center p-3 font-semibold">5</th>
                      <th className="text-center p-3 font-semibold">6</th>
                      <th className="text-center p-3 font-semibold">7</th>
                      <th className="text-center p-3 font-semibold">8</th>
                      <th className="text-center p-3 font-semibold">9</th>
                      <th className="text-center p-3 font-semibold">10</th>
                      <th className="text-center p-3 font-semibold">11</th>
                      <th className="text-center p-3 font-semibold">12</th>
                    </tr>
                  </thead>
                  <tbody>
                    {airlineData.fleet_types.map((aircraft, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{aircraft}</td>
                        <td className="text-center p-3">{getFirstOfficerPay(aircraft, 1)}</td>
                        <td className="text-center p-3">{getFirstOfficerPay(aircraft, 2)}</td>
                        <td className="text-center p-3">{getFirstOfficerPay(aircraft, 3)}</td>
                        <td className="text-center p-3">{getFirstOfficerPay(aircraft, 4)}</td>
                        <td className="text-center p-3">{getFirstOfficerPay(aircraft, 5)}</td>
                        <td className="text-center p-3">{getFirstOfficerPay(aircraft, 6)}</td>
                        <td className="text-center p-3">{getFirstOfficerPay(aircraft, 7)}</td>
                        <td className="text-center p-3">{getFirstOfficerPay(aircraft, 8)}</td>
                        <td className="text-center p-3">{getFirstOfficerPay(aircraft, 9)}</td>
                        <td className="text-center p-3">{getFirstOfficerPay(aircraft, 10)}</td>
                        <td className="text-center p-3">{getFirstOfficerPay(aircraft, 11)}</td>
                        <td className="text-center p-3">{getFirstOfficerPay(aircraft, 12)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Captain Pay Scale - Full Width (Delta only) */}
        {airlineData.name === "Delta Air Lines" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Captain Hourly Pay Scale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Aircraft Type</th>
                      <th className="text-center p-3 font-semibold">1</th>
                      <th className="text-center p-3 font-semibold">2</th>
                      <th className="text-center p-3 font-semibold">3</th>
                      <th className="text-center p-3 font-semibold">4</th>
                      <th className="text-center p-3 font-semibold">5</th>
                      <th className="text-center p-3 font-semibold">6</th>
                      <th className="text-center p-3 font-semibold">7</th>
                      <th className="text-center p-3 font-semibold">8</th>
                      <th className="text-center p-3 font-semibold">9</th>
                      <th className="text-center p-3 font-semibold">10</th>
                      <th className="text-center p-3 font-semibold">11</th>
                      <th className="text-center p-3 font-semibold">12</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(airlineData.pay_scales.captain).map(([aircraft, payScale]) => (
                      <tr key={aircraft} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{aircraft === "default" ? "All Aircraft" : aircraft}</td>
                        <td className="text-center p-3">{payScale.year_1 || "-"}</td>
                        <td className="text-center p-3">{payScale.year_2 || "-"}</td>
                        <td className="text-center p-3">{payScale.year_3 || "-"}</td>
                        <td className="text-center p-3">{payScale.year_4 || "-"}</td>
                        <td className="text-center p-3">{payScale.year_5 || "-"}</td>
                        <td className="text-center p-3">{payScale.year_6 || "-"}</td>
                        <td className="text-center p-3">{payScale.year_7 || "-"}</td>
                        <td className="text-center p-3">{payScale.year_8 || "-"}</td>
                        <td className="text-center p-3">{payScale.year_9 || "-"}</td>
                        <td className="text-center p-3">{payScale.year_10 || "-"}</td>
                        <td className="text-center p-3">{payScale.year_11 || "-"}</td>
                        <td className="text-center p-3">{payScale.year_12 || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Pay Scale for non-Delta airlines */}
        {airlineData.name !== "Delta Air Lines" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pay Scale (Estimated Annual)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {airlineData.name === "Alaska Airlines" ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-gray-300 p-3 text-left">Years of Service</th>
                        <th className="border border-gray-300 p-3 text-center">First Officer</th>
                        <th className="border border-gray-300 p-3 text-center">Captain</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { range: "0 to 1", firstOfficer: airlineData.pay_scales.first_officer.year_1, captain: airlineData.pay_scales.captain.default?.year_1 },
                        { range: "1 to 2", firstOfficer: airlineData.pay_scales.first_officer.year_2, captain: airlineData.pay_scales.captain.default?.year_2 },
                        { range: "2 to 3", firstOfficer: airlineData.pay_scales.first_officer.year_3, captain: airlineData.pay_scales.captain.default?.year_3 },
                        { range: "3 to 4", firstOfficer: airlineData.pay_scales.first_officer.year_4, captain: airlineData.pay_scales.captain.default?.year_4 },
                        { range: "4 to 5", firstOfficer: airlineData.pay_scales.first_officer.year_5, captain: airlineData.pay_scales.captain.default?.year_5 },
                        { range: "5 to 6", firstOfficer: airlineData.pay_scales.first_officer.year_6, captain: airlineData.pay_scales.captain.default?.year_6 },
                        { range: "6 to 7", firstOfficer: airlineData.pay_scales.first_officer.year_7, captain: airlineData.pay_scales.captain.default?.year_7 },
                        { range: "7 to 8", firstOfficer: airlineData.pay_scales.first_officer.year_8, captain: airlineData.pay_scales.captain.default?.year_8 },
                        { range: "8 to 9", firstOfficer: airlineData.pay_scales.first_officer.year_9, captain: airlineData.pay_scales.captain.default?.year_9 },
                        { range: "9 to 10", firstOfficer: airlineData.pay_scales.first_officer.year_10, captain: airlineData.pay_scales.captain.default?.year_10 },
                        { range: "10 to 11", firstOfficer: airlineData.pay_scales.first_officer.year_11, captain: airlineData.pay_scales.captain.default?.year_11 },
                        { range: "11 and Up", firstOfficer: airlineData.pay_scales.first_officer.year_12, captain: airlineData.pay_scales.captain.default?.year_12 }
                      ].map((yearData, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="border border-gray-300 p-3 font-medium">{yearData.range}</td>
                          <td className="border border-gray-300 p-3 text-center">{yearData.firstOfficer || "-"}</td>
                          <td className="border border-gray-300 p-3 text-center">{yearData.captain || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">First Officer</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year 1:</span>
                        <span className="font-medium">{airlineData.pay_scales.first_officer.year_1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year 5:</span>
                        <span className="font-medium">{airlineData.pay_scales.first_officer.year_5}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year 10:</span>
                        <span className="font-medium">{airlineData.pay_scales.first_officer.year_10}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Captain</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year 1:</span>
                        <span className="font-medium">{airlineData.pay_scales.captain.default?.year_1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year 5:</span>
                        <span className="font-medium">{airlineData.pay_scales.captain.default?.year_5}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year 10:</span>
                        <span className="font-medium">{airlineData.pay_scales.captain.default?.year_10}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Schedules/Line Details (Delta only) */}
        {airlineData.name === "Delta Air Lines" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedules/Line Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 overflow-hidden">
              {/* Line Types */}
              <div>
                <h4 className="font-semibold text-base mb-3">Line Types</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium block mb-1">Initial/Adjusted:</span>
                    <span className="block pl-4 text-muted-foreground">Awarded via PBS/DBMS, modified for conflicts.</span>
                  </div>
                  <div>
                    <span className="font-medium block mb-1">Regular:</span>
                    <span className="block pl-4 text-muted-foreground">Includes rotations, vacations, leaves, days off.</span>
                  </div>
                  <div>
                    <span className="font-medium block mb-1">Reserve:</span>
                    <span className="block pl-4 text-muted-foreground">Includes on-call days and X-days (off days).</span>
                  </div>
                  <div>
                    <span className="font-medium block mb-1">Blank Regular:</span>
                    <span className="block pl-4 text-muted-foreground">No rotations, no guarantee.</span>
                  </div>
                  <div>
                    <span className="font-medium block mb-1">RLL:</span>
                    <span className="block pl-4 text-muted-foreground">Reduced Lower Limit Line - Below Line Construction Window (LCW) lower limit, awarded on request.</span>
                  </div>
                  <div>
                    <span className="font-medium block mb-1">Specially Created:</span>
                    <span className="block pl-4 text-muted-foreground">Post-award reserve line.</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Key Terms */}
              <div>
                <h4 className="font-semibold text-base mb-3">Key Terms</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium block mb-1">Line Adjustment:</span>
                    <span className="block pl-4 text-muted-foreground">Company removes rotations to resolve FAR/PWA conflicts.</span>
                  </div>
                  <div>
                    <span className="font-medium block mb-1">Guarantees:</span>
                    <span className="block pl-4 text-muted-foreground">Minimum pay/credit entitlements; pro rata calculations for partial periods.</span>
                  </div>
                  <div>
                    <span className="font-medium block mb-1">Reserve Day/Share:</span>
                    <span className="block pl-4 text-muted-foreground">On-call or X-day; pro rata share is guarantee divided by on-call days.</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Regular Line Guarantee */}
              <div>
                <h4 className="font-semibold text-base mb-3">Regular Line Guarantee</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Minimum:</span> Lesser of 65 credit hours or pilot's block hour limit.
                  </div>
                  <div>
                    <span className="font-medium">Exceptions:</span> RLL guarantees LCW lower limit (pilot option); blank lines have no guarantee.
                  </div>
                  <div>
                    <span className="font-medium">Computation:</span> Computed at aircraft model pay rates; prorated for mixed models based on scheduled credit.
                  </div>
                  <div>
                    <span className="font-medium">Reductions:</span> For unpaid leaves/furloughs, line adjustments, or net swap losses.
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reserve Line Guarantee */}
              <div>
                <h4 className="font-semibold text-base mb-3">Reserve Line Guarantee</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Credit:</span> Average Line Value (ALV) minus 2 hours (72–80 hours range).
                  </div>
                  <div>
                    <span className="font-medium">Pay:</span> Complex formula ensuring minimum based on highest-paying aircraft in category:
                    <div className="ml-4 mt-1 p-2 bg-muted rounded text-xs">
                      (ALV - 2 hrs, 72–80 range) - accumulated credit, multiplied by highest rate, plus accumulated credit value (at highest rate, plus international/ocean crossing pay).
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Adjustments:</span>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Reduced pro rata for vacation/CQ training days or post-award unpaid leaves.</li>
                      <li>• Increased pro rata for added on-call days or extra short calls (1 hour each).</li>
                      <li>• Specially created lines: Pro rata for on-call/X-days.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Guarantees */}
              <div>
                <h4 className="font-semibold text-base mb-3">Additional Guarantees</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-medium text-primary mb-1">Unassigned Pilots</h5>
                    <span>Guarantee: Reserve guarantee of lowest-paying revenue aircraft position (per Section 22 B.).</span>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-primary mb-1">Company-Removal Guarantee</h5>
                    <div className="space-y-1">
                      <div><span className="font-medium">If removed post-adjustment:</span> Pay/credit for scheduled credit + flown portion, plus international/ocean pay if applicable.</div>
                      <div><span className="font-medium">Exclusions:</span> Pilot-initiated (e.g., sick, vacation, swaps), IROPS, training/OE, prior bid conflicts, asterisk rotations, low-time pairings, reserve conflicts, recovery/reroutes, discipline, document failures, retirement/death/furlough/termination.</div>
                      <div><span className="font-medium">Reserve conflict removal:</span> Greater of removed rotation credit or accumulated reserve credit.</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-primary mb-1">Rotation Guarantee</h5>
                    <div className="space-y-1">
                      <div><span className="font-medium">For IROPS/FAR/PWA conflicts:</span> Greater of scheduled credit or accumulated recovery/reroute credit.</div>
                      <div><span className="font-medium">Exception:</span> No guarantee if conflict from prior bid white/yellow slip.</div>
                      <div><span className="font-medium">Application:</span> At completion date; special rules for transition rotations (may shift credit across bid periods, capped at white slip limit).</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-primary mb-1">Mixed Aircraft Model Guarantee</h5>
                    <div className="space-y-1">
                      <div>If FAA approves mixing models in types: Composite hourly rate for reserve guarantee is weighted average by fleet mix, adjusted annually Jan 1.</div>
                      <div className="text-muted-foreground italic">Example: A350 and B767-300ER mix yields ~$373.16/hour (12-year captain rate).</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-primary mb-1">Suit-Up Pay and Credit</h5>
                    <ul className="space-y-1">
                      <li>• <span className="font-medium">Regular/long-call reserve:</span> 2 hours pay/credit if unacknowledged removal and reports</li>
                      <li>• <span className="font-medium">Short-call reserve:</span> 2 hours if notified &lt;2 hours before report</li>
                      <li>• <span className="font-medium">Reserve short call without flying:</span> 1 hour pay (no credit) per completed period</li>
                      <li>• <span className="font-medium">Reserve on X-day report:</span> 2 hours pay (no credit), released with rest periods</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-primary mb-1">Miscellaneous Guarantees</h5>
                    <ul className="space-y-1">
                      <li>• <span className="font-medium">Cancelled known absence (non-unpaid):</span> Pay/credit for original value</li>
                      <li>• <span className="font-medium">Disciplinary/investigatory meeting on day off:</span> Additional pay equal to Average Daily Guarantee (ADG), if not on paid leave</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md text-sm">
                <span className="font-medium">Note:</span> This section protects pilots from pay losses due to company actions or disruptions while allowing reductions for personal choices. Guarantees are tied to bid periods (~monthly schedules) and ensure equitable compensation across roles and aircraft.
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}