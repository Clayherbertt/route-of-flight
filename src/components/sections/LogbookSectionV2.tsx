import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Plane, MapPin, Calendar, User, TrendingUp } from "lucide-react";
import aviationEngine from "@/assets/aviation-engine.jpg";

const LogbookSectionV2 = () => {
  const recentEntries = [
    {
      date: "2024-01-15",
      aircraft: "B737-800",
      registration: "N123AA",
      route: "DFW → LAX",
      totalTime: "3.2",
      pic: "3.2",
      approaches: 2,
      status: "completed"
    },
    {
      date: "2024-01-14",
      aircraft: "B737-800", 
      registration: "N456BB",
      route: "LAX → SEA",
      totalTime: "2.8",
      pic: "2.8",
      approaches: 1,
      status: "completed"
    },
    {
      date: "2024-01-12",
      aircraft: "B737-MAX",
      registration: "N789CC",
      route: "SEA → PHX",
      totalTime: "2.4",
      pic: "2.4",
      approaches: 1,
      status: "completed"
    }
  ];

  const currencies = [
    { name: "IFR Currency", status: "Current", expires: "Mar 15, 2024", color: "green" },
    { name: "Night Currency", status: "Current", expires: "Feb 28, 2024", color: "green" },
    { name: "Recurrent Training", status: "Expires Soon", expires: "Jan 30, 2024", color: "yellow" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={aviationEngine} 
          alt="Aviation engine" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-background/95"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">
            Professional 
            <span className="aviation-gradient bg-clip-text text-transparent"> Logbook</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Keep meticulous records with our advanced digital logbook. 
            Automatic calculations, currency tracking, and professional formatting.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          {/* Current Hours & Currency */}
          <div className="lg:col-span-4 space-y-6">
            {/* Hours Summary */}
            <Card className="card-shadow bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Clock className="h-6 w-6 mr-3 text-primary" />
                  Flight Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">4,250.5</div>
                    <div className="text-sm text-muted-foreground">Total Time</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">3,890.2</div>
                    <div className="text-sm text-muted-foreground">PIC</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">4,100.8</div>
                    <div className="text-sm text-muted-foreground">Multi-Engine</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">3,950.3</div>
                    <div className="text-sm text-muted-foreground">Turbine</div>
                  </div>
                </div>
                <Button variant="aviation" className="w-full">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Flight
                </Button>
              </CardContent>
            </Card>

            {/* Currency Status */}
            <Card className="card-shadow bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <TrendingUp className="h-6 w-6 mr-3 text-primary" />
                  Currency Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currencies.map((currency, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{currency.name}</div>
                      <div className="text-xs text-muted-foreground">Expires {currency.expires}</div>
                    </div>
                    <Badge variant={currency.color === 'green' ? 'default' : currency.color === 'yellow' ? 'destructive' : 'secondary'}>
                      {currency.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Flights */}
          <div className="lg:col-span-8">
            <Card className="card-shadow bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center text-xl">
                    <Plane className="h-6 w-6 mr-3 text-primary" />
                    Recent Flights
                  </div>
                  <Button variant="outline" size="sm">View All Entries</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="group p-6 bg-muted/30 rounded-xl hover:bg-muted/50 smooth-transition cursor-pointer border border-transparent hover:border-primary/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="flex items-center text-sm font-medium mb-1">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {entry.date}
                            </div>
                            <div className="text-xs text-muted-foreground">{entry.aircraft}</div>
                            <div className="text-xs text-muted-foreground">{entry.registration}</div>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-5 w-5 mr-2" />
                            <span className="font-medium">{entry.route}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{entry.totalTime} hrs</div>
                          <div className="text-sm text-muted-foreground">
                            <User className="h-4 w-4 inline mr-1" />
                            PIC: {entry.pic} • {entry.approaches} approaches
                          </div>
                          <Badge variant="outline" className="mt-2">
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="sky" size="lg" className="text-lg px-8 py-6">
            Explore Logbook Features
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LogbookSectionV2;