import { useState, useEffect } from "react";
import { Building2, Search, Plane, Users, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AirlineDetailsDialog } from "@/components/dialogs/AirlineDetailsDialog";
import Header from "@/components/layout/Header";
import { useAirlines } from "@/hooks/useAirlines";
import type { AirlineData } from "@/hooks/useAirlines";

const Airlines = () => {
  console.log("Airlines component rendering...");
  const { airlines, loading, refetch } = useAirlines();
  const [selectedAirline, setSelectedAirline] = useState<AirlineData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  console.log("Airlines state initialized", { airlineCount: airlines.length });
  console.log("📊 Current airlines data:", airlines);
  
  // Check specifically for Alaska Airlines in the component
  const alaskaAirline = airlines.find(airline => airline.name === "Alaska Airlines");
  console.log("🔍 Alaska Airlines in component:", alaskaAirline);

  // Force refresh on component mount to ensure fresh data
  useEffect(() => {
    console.log("Airlines component mounted, forcing refresh");
    refetch();
  }, []);

  // Refetch data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, refreshing data");
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetch]);

  const handleAirlineClick = (airline: AirlineData) => {
    console.log("Airline clicked:", airline.name);
    setSelectedAirline(airline);
    setDialogOpen(true);
  };

  const getSectionIcon = (title: string) => {
    switch (title) {
      case "Majors": return null; // Will use image instead
      case "Ultra Low Cost Carriers & Large Operators": return null; // Will use image instead
      case "Regional Carriers": return null; // Will use image instead
      case "Fractional Carriers": return null; // Will use image instead
      case "Cargo": return null; // Will use image instead
      default: return "✈️";
    }
  };

  const getSectionImage = (title: string) => {
    switch (title) {
      case "Majors": return "/lovable-uploads/e536b000-3a4f-403c-b132-c459660fe41d.png";
      case "Ultra Low Cost Carriers & Large Operators": return "/lovable-uploads/e536b000-3a4f-403c-b132-c459660fe41d.png";
      case "Regional Carriers": return "/lovable-uploads/8f6a895d-390c-4dda-a132-a08e4852d21e.png";
      case "Fractional Carriers": return "/lovable-uploads/db04b737-ee64-4781-9004-8353c99d2b4b.png";
      case "Cargo": return "/lovable-uploads/30305ffb-1a1d-4220-ad7d-a7296a06c2db.png";
      default: return null;
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

  // Group airlines by category and only show active ones
  const airlineSections = [
    {
      title: "Majors",
      airlines: airlines.filter(airline => airline.category === "Majors" && airline.active)
    },
    {
      title: "Ultra Low Cost Carriers & Large Operators", 
      airlines: airlines.filter(airline => airline.category === "Ultra Low Cost Carriers & Large Operators" && airline.active)
    },
    {
      title: "Regional Carriers",
      airlines: airlines.filter(airline => airline.category === "Regional Carriers" && airline.active)
    },
    {
      title: "Fractional Carriers",
      airlines: airlines.filter(airline => airline.category === "Fractional Carriers" && airline.active)
    },
    {
      title: "Cargo",
      airlines: airlines.filter(airline => airline.category === "Cargo" && airline.active)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <div className="container mx-auto px-6 py-24">
          <div className="text-center">
            <Plane className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Loading Airlines...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the latest airline data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Plane className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Airlines Database
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-4">
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
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8 sm:space-y-12">
          {filteredSections.map((section, sectionIndex) => {
            console.log(`Rendering section: ${section.title}`);
            return (
              <div key={sectionIndex} className="space-y-6">
                <div className="flex items-center gap-4">
                  {getSectionImage(section.title) ? (
                    <img 
                      src={getSectionImage(section.title)!} 
                      alt={section.title}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div className="text-3xl">{getSectionIcon(section.title)}</div>
                  )}
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
                      onClick={() => handleAirlineClick(airline)}
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
        airline={selectedAirline}
      />
    </div>
  );
};

export default Airlines;