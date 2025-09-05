import { Building2, Users, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Import airline logos
import alaskaAirlinesLogo from "@/assets/airlines/alaska-airlines.png";
import deltaAirlinesLogo from "@/assets/airlines/delta-airlines.png";
import unitedAirlinesLogo from "@/assets/airlines/united-airlines.png";
import americanAirlinesLogo from "@/assets/airlines/american-airlines.png";
import hawaiianAirlinesLogo from "@/assets/airlines/hawaiian-airlines.png";
import southwestAirlinesLogo from "@/assets/airlines/southwest-airlines.png";
import frontierAirlinesLogo from "@/assets/airlines/frontier-airlines.png";
import spiritAirlinesLogo from "@/assets/airlines/spirit-airlines.png";
import breezeAirwaysLogo from "@/assets/airlines/breeze-airways.png";
import sunCountryAirlinesLogo from "@/assets/airlines/sun-country-airlines.png";
import jetblueAirlinesLogo from "@/assets/airlines/jetblue-airlines.png";
import allegiantAirLogo from "@/assets/airlines/allegiant-air.png";
import skywestAirlinesLogo from "@/assets/airlines/skywest-airlines.png";
import mesaAirlinesLogo from "@/assets/airlines/mesa-airlines.png";
import republicAirwaysLogo from "@/assets/airlines/republic-airways.png";
import endeavorAirLogo from "@/assets/airlines/endeavor-air.png";
import envoyAirLogo from "@/assets/airlines/envoy-air.png";
import psaAirlinesLogo from "@/assets/airlines/psa-airlines.png";
import piedmontAirlinesLogo from "@/assets/airlines/piedmont-airlines.png";
import gojetAirlinesLogo from "@/assets/airlines/gojet-airlines.png";
import airWisconsinLogo from "@/assets/airlines/air-wisconsin.png";
import commutairLogo from "@/assets/airlines/commutair.png";

const Airlines = () => {
  // Helper function to get airline logo
  const getAirlineLogo = (airlineName: string): string | null => {
    const logoMap: Record<string, string> = {
      "Alaska Airlines": alaskaAirlinesLogo,
      "Delta Air Lines": deltaAirlinesLogo,
      "United Airlines": unitedAirlinesLogo,
      "American Airlines": americanAirlinesLogo,
      "Hawaiian Airlines": hawaiianAirlinesLogo,
      "Southwest Airlines": southwestAirlinesLogo,
      "Frontier": frontierAirlinesLogo,
      "Spirit": spiritAirlinesLogo,
      "Breeze Airways": breezeAirwaysLogo,
      "Sun Country Airlines": sunCountryAirlinesLogo,
      "JetBlue Airways": jetblueAirlinesLogo,
      "Allegiant Air": allegiantAirLogo,
      "SkyWest": skywestAirlinesLogo,
      "Mesa Airlines": mesaAirlinesLogo,
      "Republic Airways": republicAirwaysLogo,
      "Endeavor Air": endeavorAirLogo,
      "Envoy Air": envoyAirLogo,
      "PSA Airlines": psaAirlinesLogo,
      "Piedmont Airlines": piedmontAirlinesLogo,
      "GoJet Airlines": gojetAirlinesLogo,
      "Air Wisconsin": airWisconsinLogo,
      "CommutAir": commutairLogo
    };
    return logoMap[airlineName] || null;
  };

  const airlineSections = [
    {
      title: "Majors",
      airlines: [
        { name: "Alaska Airlines", logo: "❄️" },
        { name: "Delta Air Lines", logo: "🔺" },
        { name: "United Airlines", logo: "🌎" },
        { name: "American Airlines", logo: "🦅" },
        { name: "Hawaiian Airlines", logo: "🌺" },
        { name: "Southwest Airlines", logo: "❤️" }
      ]
    },
    {
      title: "Ultra Low Cost Carriers & Large Operators",
      airlines: [
        { name: "Frontier", logo: "🦎" },
        { name: "Spirit", logo: "✈️" },
        { name: "Breeze Airways", logo: "🌊" },
        { name: "Sun Country Airlines", logo: "☀️" },
        { name: "JetBlue Airways", logo: "💙" },
        { name: "Allegiant Air", logo: "🏝️" }
      ]
    },
    {
      title: "Regional Carriers",
      airlines: [
        { name: "Air Wisconsin", logo: "🧀" },
        { name: "Alaska Seaplanes", logo: "🛩️" },
        { name: "Cape Air", logo: "🦅" },
        { name: "CommutAir", logo: "🚁" },
        { name: "Connect Airlines", logo: "🔗" },
        { name: "Denver Air Connection", logo: "🏔️" },
        { name: "Elite Airways", logo: "👑" },
        { name: "Endeavor Air", logo: "🎯" },
        { name: "Envoy Air", logo: "📧" },
        { name: "ExpressJet", logo: "⚡" },
        { name: "GoJet Airlines", logo: "🚀" },
        { name: "Grant Aviation", logo: "🎁" },
        { name: "Great Lakes Airlines", logo: "🌊" },
        { name: "Horizon Air", logo: "🌅" },
        { name: "Mesa Airlines", logo: "🏜️" },
        { name: "Ohana by Hawaiian", logo: "🌺" },
        { name: "Piedmont Airlines", logo: "⛰️" },
        { name: "PSA Airlines", logo: "📋" },
        { name: "Quantum Spatial inc. (QSI)", logo: "🔬" },
        { name: "Ravn Alaska", logo: "🐦" },
        { name: "Republic Airways", logo: "🏛️" },
        { name: "Seaborne Airlines", logo: "🌊" },
        { name: "Silver Airways", logo: "🥈" },
        { name: "SkyWest", logo: "🌤️" },
        { name: "Star Marianas Air, Inc.", logo: "⭐" },
        { name: "Sterling Airways", logo: "💎" }
      ]
    },
    {
      title: "Fractional Carriers",
      airlines: [
        { name: "NetJets", logo: "🛩️" },
        { name: "Flexjet", logo: "💎" },
        { name: "Flight Options", logo: "✈️" },
        { name: "Directional Aviation", logo: "🧭" },
        { name: "Executive AirShare", logo: "👔" },
        { name: "PlaneSense", logo: "🎯" },
        { name: "XOJet", logo: "🚀" },
        { name: "JetSuite", logo: "🏆" },
        { name: "Airshare", logo: "🤝" },
        { name: "Wheels Up", logo: "🎡" },
        { name: "VistaJet", logo: "👁️" },
        { name: "Jet Linx", logo: "🔗" }
      ]
    },
    {
      title: "Cargo",
      airlines: [
        { name: "21 Air, LLC", logo: "📦" },
        { name: "ABX Air", logo: "📮" },
        { name: "Air Cargo Carriers", logo: "🚛" },
        { name: "Air Transport International", logo: "🌍" },
        { name: "Alaska Central Express", logo: "📦" },
        { name: "Aloha Air Cargo", logo: "🌺" },
        { name: "Alpine Air", logo: "🏔️" },
        { name: "Ameriflight", logo: "🇺🇸" },
        { name: "Amerijet International", logo: "✈️" },
        { name: "Ameristar Air Cargo, Inc.", logo: "⭐" },
        { name: "Atlas Air", logo: "🗺️" },
        { name: "Bemidji Aviation Services, Inc.", logo: "✈️" },
        { name: "CSA Air", logo: "📦" },
        { name: "Empire Airlines", logo: "👑" },
        { name: "Encore Air Cargo", logo: "🎭" },
        { name: "Everts Air Cargo", logo: "📦" },
        { name: "FedEx Express", logo: "📦" },
        { name: "Freight Runners Express", logo: "🏃" },
        { name: "IFL Group", logo: "📦" },
        { name: "Kalitta Air", logo: "✈️" },
        { name: "Kalitta Charters II", logo: "🛩️" },
        { name: "Key Lime Air", logo: "🟢" },
        { name: "Lynden Air Cargo", logo: "📦" },
        { name: "Mountain Air Cargo", logo: "⛰️" },
        { name: "National Airlines", logo: "🇺🇸" },
        { name: "Northern Air Cargo", logo: "❄️" },
        { name: "Quest Diagnostics", logo: "🔬" },
        { name: "Ryan Air", logo: "✈️" },
        { name: "SkyLease Cargo", logo: "📦" },
        { name: "Transair", logo: "🔄" },
        { name: "United Parcel Service", logo: "🤎" },
        { name: "USA Jet Airlines", logo: "🇺🇸" },
        { name: "Western Global Airlines", logo: "🌎" },
        { name: "Wiggins Airways", logo: "✈️" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Airlines Database</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Explore opportunities at major US carriers. Find hiring requirements, 
            minimum hours, and current openings.
          </p>
        </div>
      </div>

      {/* Airlines Sections */}
      <div className="container mx-auto px-6 py-12 space-y-16">
        {airlineSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h2 className="text-3xl font-bold mb-8 text-center">{section.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {section.airlines.map((airline, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      {getAirlineLogo(airline.name) ? (
                        <img 
                          src={getAirlineLogo(airline.name)!} 
                          alt={`${airline.name} logo`}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <span className="text-2xl">{airline.logo}</span>
                      )}
                      <CardTitle className="text-lg leading-tight">{airline.name}</CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Airlines;