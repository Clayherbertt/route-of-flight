import { Building2, Users, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Airlines = () => {
  const airlines = [
    {
      id: 1,
      name: "Delta Air Lines",
      logo: "🔺",
      minimumHours: 1500,
      location: "Atlanta, GA",
      pilots: "15,000+",
      hiring: true,
      requirements: ["ATP Certificate", "First Class Medical", "Clean Record"]
    },
    {
      id: 2,
      name: "American Airlines",
      logo: "🦅",
      minimumHours: 1500,
      location: "Fort Worth, TX",
      pilots: "17,000+",
      hiring: true,
      requirements: ["ATP Certificate", "First Class Medical", "4-Year Degree Preferred"]
    },
    {
      id: 3,
      name: "United Airlines",
      logo: "🌎",
      minimumHours: 1500,
      location: "Chicago, IL",
      pilots: "13,000+",
      hiring: false,
      requirements: ["ATP Certificate", "First Class Medical", "Multi-Engine Rating"]
    },
    {
      id: 4,
      name: "Southwest Airlines",
      logo: "❤️",
      minimumHours: 2500,
      location: "Dallas, TX",
      pilots: "10,000+",
      hiring: true,
      requirements: ["ATP Certificate", "First Class Medical", "Boeing 737 Type Rating Preferred"]
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

      {/* Airlines Grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {airlines.map((airline) => (
            <Card key={airline.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{airline.logo}</span>
                  <div>
                    <CardTitle className="text-xl">{airline.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {airline.location}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={airline.hiring ? "default" : "secondary"}>
                    {airline.hiring ? "Currently Hiring" : "Not Hiring"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{airline.minimumHours} min hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{airline.pilots} pilots</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {airline.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Airlines;