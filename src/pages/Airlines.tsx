import { useState } from "react";
import { Building2, Search, Plane, Users, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AirlineDetailsDialog } from "@/components/dialogs/AirlineDetailsDialog";
import Header from "@/components/layout/Header";

const Airlines = () => {
  console.log("Airlines component rendering...");
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);
  const [selectedAirlineLogo, setSelectedAirlineLogo] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  console.log("Airlines state initialized");

  // Using consistent airplane emoji for all airlines
  const getAirlineEmoji = (): string => "✈️";

  const handleAirlineClick = (airlineName: string) => {
    console.log("Airline clicked:", airlineName);
    setSelectedAirline(airlineName);
    setSelectedAirlineLogo(null); // No logo URLs for now
    setDialogOpen(true);
  };

  const getSectionIcon = (title: string) => {
    switch (title) {
      case "Majors": return "🛫";
      case "Ultra Low Cost Carriers & Large Operators": return "🎯";
      case "Regional Carriers": return "🗺️";
      case "Fractional Carriers": return "✨";
      case "Cargo": return "📋";
      default: return "✈️";
    }
  };

  const getSectionColor = (title: string) => {
    switch (title) {
      case "Majors": return "bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20";
      case "Ultra Low Cost Carriers & Large Operators": return "bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/20";
      case "Regional Carriers": return "bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/20";
      case "Fractional Carriers": return "bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200/20";
      case "Cargo": return "bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/20";
      default: return "bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-200/20";
    }
  };

  const getSectionBadgeColor = (title: string) => {
    switch (title) {
      case "Majors": return "bg-blue-500/10 text-blue-700 border-blue-200/30";
      case "Ultra Low Cost Carriers & Large Operators": return "bg-green-500/10 text-green-700 border-green-200/30";
      case "Regional Carriers": return "bg-purple-500/10 text-purple-700 border-purple-200/30";
      case "Fractional Carriers": return "bg-amber-500/10 text-amber-700 border-amber-200/30";
      case "Cargo": return "bg-orange-500/10 text-orange-700 border-orange-200/30";
      default: return "bg-gray-500/10 text-gray-700 border-gray-200/30";
    }
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

  // Filter airlines based on search term
  const filteredSections = airlineSections.map(section => ({
    ...section,
    airlines: section.airlines.filter(airline => 
      airline.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.airlines.length > 0);

  console.log("Airlines data prepared, about to render");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Plane className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Airlines Database
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover your next career opportunity. Explore hiring requirements, minimum hours, 
              and current openings at major US carriers, regional airlines, and cargo operators.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search airlines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg bg-background/80 backdrop-blur-sm border-primary/20 focus:border-primary/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Airlines Sections */}
      <div className="container mx-auto px-6 py-12">
        <div className="space-y-12">
          {filteredSections.map((section, sectionIndex) => {
            console.log(`Rendering section: ${section.title}`);
            return (
              <div key={sectionIndex} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{getSectionIcon(section.title)}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">{section.title}</h2>
                    <Badge variant="outline" className={getSectionBadgeColor(section.title)}>
                      {section.airlines.length} Airlines
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {section.airlines.map((airline, index) => (
                    <Card 
                      key={index}
                      className={`${getSectionColor(section.title)} hover:scale-105 transition-all duration-200 cursor-pointer hover:shadow-lg group`}
                      onClick={() => handleAirlineClick(airline.name)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 p-2 rounded-full bg-background/50 group-hover:bg-background/80 transition-colors">
                            <Plane className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                              {airline.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>View Details</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
          
          {filteredSections.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <Plane className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">No airlines found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search term or browse all airlines
              </p>
            </div>
          )}
        </div>
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