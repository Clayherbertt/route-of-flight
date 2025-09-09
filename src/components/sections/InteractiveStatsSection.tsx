import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  Zap, 
  Star,
  Users,
  Globe,
  Award,
  Rocket
} from "lucide-react";

const InteractiveStatsSection = () => {
  const achievements = [
    {
      icon: Trophy,
      title: "#1 Aviation Platform",
      subtitle: "Pilot Choice Awards 2024",
      color: "text-yellow-500"
    },
    {
      icon: Star,
      title: "4.9/5 Rating",
      subtitle: "Over 2,500 reviews",
      color: "text-primary"
    },
    {
      icon: Award,
      title: "Industry Leader",
      subtitle: "Featured in Flying Magazine",
      color: "text-accent"
    }
  ];

  const metrics = [
    {
      value: "10,247",
      label: "Active Pilots",
      change: "+12% this month",
      icon: Users,
      trend: "up"
    },
    {
      value: "52.3M",
      label: "Flight Hours",
      change: "+2.1M this month",
      icon: Globe,
      trend: "up"
    },
    {
      value: "98.2%",
      label: "Success Rate",
      change: "Pilot job placements",
      icon: Target,
      trend: "stable"
    },
    {
      value: "< 2min",
      label: "Setup Time",
      change: "Average onboarding",
      icon: Zap,
      trend: "up"
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-muted/20 via-background to-muted/10">
      <div className="container mx-auto px-6">
        {/* Awards Section */}
        <div className="text-center mb-20">
          <h2 className="text-6xl font-black mb-12">
            <span className="sky-gradient bg-clip-text text-transparent">AWARD WINNING</span>
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="group cursor-pointer">
                  <Card className="card-shadow hover:shadow-aviation smooth-transition transform hover:scale-105 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <Icon className={`h-16 w-16 mx-auto mb-4 ${achievement.color} group-hover:scale-110 smooth-transition`} />
                      <h3 className="text-xl font-bold mb-2">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.subtitle}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Metrics */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4">Live Platform Metrics</h3>
            <p className="text-lg text-muted-foreground">Real-time data from our global pilot community</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} className="group card-shadow hover:shadow-aviation smooth-transition cursor-pointer bg-card/80 backdrop-blur-sm border-border/50">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <Icon className="h-10 w-10 text-primary group-hover:scale-110 smooth-transition" />
                      <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                        {metric.trend === 'up' ? '↗' : '→'} Live
                      </Badge>
                    </div>
                    <div className="text-4xl font-black text-primary mb-2 group-hover:scale-110 smooth-transition">
                      {metric.value}
                    </div>
                    <div className="text-lg font-semibold mb-2">{metric.label}</div>
                    <div className="text-sm text-muted-foreground">{metric.change}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="inline-block card-shadow bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-12">
              <Rocket className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-4">Join the Elite</h3>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Be part of the most successful aviation community. 
                Over 5,000 pilots have landed their dream jobs using our platform.
              </p>
              <Button variant="aviation" size="lg" className="text-lg px-12 py-6">
                Start Your Journey
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default InteractiveStatsSection;