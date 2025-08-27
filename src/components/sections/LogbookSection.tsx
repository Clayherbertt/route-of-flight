import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, Plane, MapPin } from "lucide-react";

const LogbookSection = () => {
  const recentEntries = [
    {
      date: "2024-01-15",
      aircraft: "B737-800",
      route: "DFW-LAX",
      totalTime: "3.2",
      pic: "3.2",
      approaches: 2
    },
    {
      date: "2024-01-14",
      aircraft: "B737-800", 
      route: "LAX-SEA",
      totalTime: "2.8",
      pic: "2.8",
      approaches: 1
    },
    {
      date: "2024-01-12",
      aircraft: "B737-MAX",
      route: "SEA-PHX",
      totalTime: "2.4",
      pic: "2.4",
      approaches: 1
    }
  ];

  const currentHours = {
    total: "4,250.5",
    pic: "3,890.2",
    multiEngine: "4,100.8",
    turbine: "3,950.3"
  };

  return (
    <section id="logbook" className="py-20 bg-subtle-gradient">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Digital Logbook</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Maintain comprehensive flight records with automatic currency calculations and professional formatting.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Hours Summary */}
          <div className="lg:col-span-1">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Current Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Time</span>
                  <span className="font-semibold">{currentHours.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PIC</span>
                  <span className="font-semibold">{currentHours.pic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Multi-Engine</span>
                  <span className="font-semibold">{currentHours.multiEngine}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Turbine</span>
                  <span className="font-semibold">{currentHours.turbine}</span>
                </div>
                <Button variant="aviation" className="w-full mt-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Entries */}
          <div className="lg:col-span-2">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Plane className="h-5 w-5 mr-2 text-primary" />
                    Recent Entries
                  </div>
                  <Button variant="outline" size="sm">View All</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 smooth-transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-sm font-medium">{entry.date}</div>
                          <div className="text-xs text-muted-foreground">{entry.aircraft}</div>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{entry.route}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{entry.totalTime} hrs</div>
                        <div className="text-xs text-muted-foreground">
                          PIC: {entry.pic} • {entry.approaches} approaches
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogbookSection;