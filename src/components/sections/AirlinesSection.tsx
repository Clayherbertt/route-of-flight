import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Plane, DollarSign, MapPin, TrendingUp } from "lucide-react";

const AirlinesSection = () => {
  const airlineCategories = [
    {
      title: "Major Airlines",
      description: "Legacy carriers with extensive domestic and international networks",
      count: 8,
      icon: Building2,
      examples: ["American Airlines", "Delta Air Lines", "United Airlines"]
    },
    {
      title: "Regional Airlines", 
      description: "Regional carriers operating under major airline brands",
      count: 15,
      icon: Users,
      examples: ["SkyWest", "Republic Airways", "Endeavor Air"]
    },
    {
      title: "Low Cost Carriers",
      description: "Budget airlines with point-to-point service models",
      count: 6,
      icon: TrendingUp,
      examples: ["Southwest Airlines", "JetBlue Airways", "Spirit Airlines"]
    },
    {
      title: "Fractional Operators",
      description: "Private jet and fractional ownership companies",
      count: 12,
      icon: Plane,
      examples: ["NetJets", "Flexjet", "Flight Options"]
    },
    {
      title: "Part 135 Operators", 
      description: "Charter and on-demand air taxi services",
      count: 25,
      icon: MapPin,
      examples: ["Corporate operators", "Air taxi services", "Charter companies"]
    }
  ];

  const featuredAirlines = [
    {
      name: "Delta Air Lines",
      category: "Major",
      hiring: true,
      minimums: {
        totalTime: "1500",
        turbineTime: "1000",
        pic: "1000"
      },
      payRange: "$92K - $350K",
      bases: ["ATL", "DTW", "MSP", "SEA", "LAX"],
      fleet: "350+ Aircraft"
    },
    {
      name: "SkyWest Airlines",
      category: "Regional", 
      hiring: true,
      minimums: {
        totalTime: "1000",
        turbineTime: "500",  
        pic: "500"
      },
      payRange: "$65K - $180K",
      bases: ["SLC", "DEN", "PHX", "LAX", "SEA"],
      fleet: "450+ Aircraft"
    },
    {
      name: "NetJets",
      category: "Fractional",
      hiring: false,
      minimums: {
        totalTime: "3000",
        turbineTime: "1500",
        pic: "1000"
      },
      payRange: "$120K - $280K",
      bases: ["CMH", "TEB", "Multiple"],
      fleet: "700+ Aircraft"
    }
  ];

  return (
    <section id="airlines" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Airlines Database</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive profiles of US aviation employers with real-time hiring status and requirements.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {airlineCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="card-shadow hover:shadow-aviation smooth-transition cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-lg">{category.title}</span>
                    </div>
                    <Badge variant="secondary">{category.count}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <div className="space-y-1">
                    {category.examples.map((example, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">• {example}</div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground">
                    View Airlines
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Featured Airlines */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Featured Airlines</h3>
          <div className="grid lg:grid-cols-3 gap-6">
            {featuredAirlines.map((airline, index) => (
              <Card key={index} className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold">{airline.name}</h4>
                      <Badge variant="outline" className="mt-1">{airline.category}</Badge>
                    </div>
                    <Badge variant={airline.hiring ? "default" : "secondary"}>
                      {airline.hiring ? "Hiring" : "Not Hiring"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Minimums
                    </h5>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Time:</span>
                        <span>{airline.minimums.totalTime} hrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Turbine:</span>
                        <span>{airline.minimums.turbineTime} hrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PIC:</span>
                        <span>{airline.minimums.pic} hrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="font-medium">{airline.payRange}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Plane className="h-4 w-4 mr-1" />
                      <span>{airline.fleet}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="font-medium">Bases:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {airline.bases.map((base, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {base}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button variant="aviation" className="w-full">
                    View Full Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button variant="sky" size="lg">
            Browse All Airlines
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AirlinesSection;