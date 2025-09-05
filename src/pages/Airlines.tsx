import { useState } from "react";
import { Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AirlineDetailsDialog } from "@/components/dialogs/AirlineDetailsDialog";

const Airlines = () => {
  console.log("Airlines component rendering...");
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);
  const [selectedAirlineLogo, setSelectedAirlineLogo] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  console.log("Airlines state initialized");

  // Using consistent airplane emoji for all airlines
  const getAirlineEmoji = (): string => "✈️";

  const handleAirlineClick = (airlineName: string) => {
    console.log("Airline clicked:", airlineName);
    setSelectedAirline(airlineName);
    setSelectedAirlineLogo(null); // No logo URLs for now
    setDialogOpen(true);
  };

  const airlineSections = [
    {
      title: "Majors",
      airlines: [
        { name: "Alaska Airlines" },
        { name: "Delta Air Lines" },
        { name: "United Airlines" },
        { name: "American Airlines" },
        { name: "Hawaiian Airlines" },
        { name: "Southwest Airlines" }
      ]
    },
    {
      title: "Ultra Low Cost Carriers & Large Operators",
      airlines: [
        { name: "Frontier" },
        { name: "Spirit" },
        { name: "Breeze Airways" },
        { name: "Sun Country Airlines" },
        { name: "JetBlue Airways" },
        { name: "Allegiant Air" }
      ]
    },
    {
      title: "Regional Carriers",
      airlines: [
        { name: "Air Wisconsin" },
        { name: "Alaska Seaplanes" },
        { name: "Cape Air" },
        { name: "CommutAir" },
        { name: "Contour Airlines" },
        { name: "Denver Air Connection" },
        { name: "Elite Airways" },
        { name: "Endeavor Air" },
        { name: "Envoy Air" },
        { name: "ExpressJet Airlines" },
        { name: "GoJet Airlines" },
        { name: "Grant Aviation" },
        { name: "Great Lakes Airlines" },
        { name: "Horizon Air" },
        { name: "Mesa Airlines" },
        { name: "Ohana by Hawaiian" },
        { name: "Piedmont Airlines" },
        { name: "PSA Airlines" },
        { name: "Quantum Air" },
        { name: "Raven Alaska" },
        { name: "Republic Airways" },
        { name: "Seaborne Airlines" },
        { name: "Silver Airways" },
        { name: "SkyWest" },
        { name: "Star Air" },
        { name: "Sterling Airways" }
      ]
    },
    {
      title: "Fractional Carriers",
      airlines: [
        { name: "NetJets" },
        { name: "Flexjet" },
        { name: "Flight Options" },
        { name: "Directional Aviation" },
        { name: "Executive AirShare" },
        { name: "PlaneSense" },
        { name: "XOJet" },
        { name: "JetSuite" },
        { name: "Airshare" },
        { name: "Wheels Up" },
        { name: "VistaJet" },
        { name: "Jet Linx" }
      ]
    },
    {
      title: "Cargo",
      airlines: [
        { name: "21 Air, LLC" },
        { name: "ABX Air" },
        { name: "Air Cargo Carriers" },
        { name: "Air Transport International" },
        { name: "Alaska Central Express" },
        { name: "Aloha Air Cargo" },
        { name: "Alpine Air" },
        { name: "Ameriflight" },
        { name: "Amerijet International" },
        { name: "Ameristar Air Cargo, Inc." },
        { name: "Atlas Air" },
        { name: "Bemidji Aviation Services, Inc." },
        { name: "CSA Air" },
        { name: "Empire Airlines" },
        { name: "Encore Air Cargo" },
        { name: "Everts Air Cargo" },
        { name: "FedEx Express" },
        { name: "Freight Runners Express" },
        { name: "IFL Group" },
        { name: "Kalitta Air" },
        { name: "Kalitta Charters II" },
        { name: "Key Lime Air" },
        { name: "Lynden Air Cargo" },
        { name: "Mountain Air Cargo" },
        { name: "National Airlines" },
        { name: "Northern Air Cargo" },
        { name: "Quest Diagnostics" },
        { name: "Ryan Air" },
        { name: "SkyLease Cargo" },
        { name: "Transair" },
        { name: "United Parcel Service" },
        { name: "USA Jet Airlines" },
        { name: "Western Global Airlines" },
        { name: "Wiggins Airways" }
      ]
    }
  ];

  console.log("Airlines data prepared, about to render");

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
        {airlineSections.map((section, sectionIndex) => {
          console.log(`Rendering section: ${section.title}`);
          return (
          <div key={sectionIndex}>
            <h2 className="text-3xl font-bold mb-8 text-center">{section.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {section.airlines.map((airline, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-shadow select-none cursor-pointer" 
                  onClick={() => handleAirlineClick(airline.name)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getAirlineEmoji()}
                      </div>
                      <CardTitle className="text-lg leading-tight">{airline.name}</CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )})}
      </div>

      {/* Airlines Details Dialog */}
      <AirlineDetailsDialog 
        open={dialogOpen}
        onOpenChange={(open) => {
          console.log("Dialog state changing to:", open);
          setDialogOpen(open);
        }}
        airline={selectedAirline ? { name: selectedAirline, logoUrl: selectedAirlineLogo || undefined } : null}
      />
    </div>
  );
};

export default Airlines;