import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  Building2, 
  TrendingUp, 
  Clock,
  Plane,
  MapPin,
  BarChart3,
  Smartphone,
  Shield
} from "lucide-react";

const BentoGridSection = () => {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-6xl font-black mb-8">
            <span className="block">EVERYTHING</span>
            <span className="aviation-gradient bg-clip-text text-transparent">IN ONE PLACE</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A unified platform that grows with your aviation career
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
          
          {/* Large Feature - Digital Logbook */}
          <Card className="md:col-span-6 lg:col-span-8 group card-shadow hover:shadow-aviation smooth-transition cursor-pointer overflow-hidden">
            <CardContent className="p-12 relative">
              <div className="absolute top-6 right-6">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Featured</Badge>
              </div>
              <Book className="h-16 w-16 text-primary mb-6 group-hover:scale-110 smooth-transition" />
              <h3 className="text-4xl font-bold mb-4 group-hover:text-primary smooth-transition">Digital Logbook</h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Comprehensive flight logging with automatic calculations, currency tracking, 
                and professional formatting. Never lose your records again.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-primary">∞</div>
                  <div className="text-sm text-muted-foreground">Unlimited Entries</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Cloud Sync</div>
                </div>
              </div>
              <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground smooth-transition">
                Explore Logbook
              </Button>
            </CardContent>
          </Card>

          {/* Tall Feature - Career Analytics */}
          <Card className="md:col-span-3 lg:col-span-4 md:row-span-2 group card-shadow hover:shadow-aviation smooth-transition cursor-pointer">
            <CardContent className="p-8 h-full flex flex-col">
              <TrendingUp className="h-12 w-12 text-primary mb-6 group-hover:scale-110 smooth-transition" />
              <h3 className="text-2xl font-bold mb-4">Career Analytics</h3>
              <p className="text-muted-foreground mb-6 flex-grow">
                AI-powered insights to accelerate your career progression.
              </p>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Progress to ATP</span>
                  <span className="text-sm font-medium text-primary">85%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-[85%]"></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Major Airline Ready</span>
                  <span className="text-sm font-medium text-accent">67%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full w-[67%]"></div>
                </div>
              </div>
              <Button variant="aviation" className="w-full">View Analytics</Button>
            </CardContent>
          </Card>

          {/* Wide Feature - Airline Database */}
          <Card className="md:col-span-3 lg:col-span-8 group card-shadow hover:shadow-aviation smooth-transition cursor-pointer">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <Building2 className="h-12 w-12 text-primary mr-4 group-hover:scale-110 smooth-transition" />
                  <div>
                    <h3 className="text-2xl font-bold">Airline Database</h3>
                    <p className="text-muted-foreground">500+ carriers with live hiring data</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  Updated Daily
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">Major</div>
                  <div className="text-sm text-muted-foreground">8 Airlines</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">Regional</div>
                  <div className="text-sm text-muted-foreground">25 Airlines</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">Cargo</div>
                  <div className="text-sm text-muted-foreground">15 Airlines</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Square Feature - Mobile App */}
          <Card className="md:col-span-2 lg:col-span-4 group card-shadow hover:shadow-aviation smooth-transition cursor-pointer">
            <CardContent className="p-8 text-center">
              <Smartphone className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 smooth-transition" />
              <h3 className="text-xl font-bold mb-2">Mobile Ready</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Full app for iOS & Android
              </p>
              <Button variant="outline" size="sm" className="w-full">Download</Button>
            </CardContent>
          </Card>

          {/* Square Feature - Security */}
          <Card className="md:col-span-2 lg:col-span-4 group card-shadow hover:shadow-aviation smooth-transition cursor-pointer">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 smooth-transition" />
              <h3 className="text-xl font-bold mb-2">Bank-Level Security</h3>
              <p className="text-sm text-muted-foreground mb-4">
                SOC 2 certified protection
              </p>
              <Button variant="outline" size="sm" className="w-full">Learn More</Button>
            </CardContent>
          </Card>

          {/* Square Feature - Currency Tracking */}
          <Card className="md:col-span-2 lg:col-span-4 group card-shadow hover:shadow-aviation smooth-transition cursor-pointer">
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 smooth-transition" />
              <h3 className="text-xl font-bold mb-2">Auto Currency</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Never miss a deadline
              </p>
              <Button variant="outline" size="sm" className="w-full">Set Alerts</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BentoGridSection;