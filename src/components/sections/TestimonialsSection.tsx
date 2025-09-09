import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Captain Sarah Johnson",
      role: "Boeing 777 Captain",
      company: "Delta Air Lines",
      avatar: "/lovable-uploads/30305ffb-1a1d-4220-ad7d-a7296a06c2db.png",
      quote: "Route of Flight transformed how I manage my career. The airline database helped me land my dream job at Delta. The insights are incredible.",
      rating: 5,
      hours: "12,500+ hrs"
    },
    {
      name: "First Officer Mike Chen",
      role: "A320 First Officer",
      company: "JetBlue Airways",
      avatar: "/lovable-uploads/8f6a895d-390c-4dda-a132-a08e4852d21e.png",
      quote: "Finally, a logbook that actually works! The automatic currency tracking saved me from missing my IFR currency deadline. Game changer.",
      rating: 5,
      hours: "3,200+ hrs"
    },
    {
      name: "Captain Robert Taylor",
      role: "Corporate Pilot",
      company: "Fortune 500 Company",
      avatar: "/lovable-uploads/9c341b88-0d1e-4d0e-a7ad-4fbcdfecd5d6.png",
      quote: "The career analytics showed me exactly what I needed to get hired at the majors. Worth every penny. Now I'm interviewing next month.",
      rating: 5,
      hours: "8,750+ hrs"
    },
    {
      name: "Flight Instructor Lisa Martinez",
      role: "CFI/CFII/MEI",
      company: "ATP Flight School",
      avatar: "/lovable-uploads/bb3a6e69-698a-405f-94ad-1cb53d1cc647.png",
      quote: "I track all my student progress and my own hours in one place. The mobile app is perfect for logging right after flights. Love it!",
      rating: 5,
      hours: "2,100+ hrs"
    },
    {
      name: "Captain David Wilson",
      role: "B737 Captain",
      company: "Southwest Airlines",
      avatar: "/lovable-uploads/db04b737-ee64-4781-9004-8353c99d2b4b.png",
      quote: "Been using paper logbooks for 20 years. Route of Flight convinced me to go digital. Best decision I've made for my career tracking.",
      rating: 5,
      hours: "15,200+ hrs"
    },
    {
      name: "Commercial Pilot Amanda Foster",
      role: "Regional Pilot",
      company: "SkyWest Airlines",
      avatar: "/lovable-uploads/e536b000-3a4f-403c-b132-c459660fe41d.png",
      quote: "The hiring insights helped me understand exactly what regionals were looking for. Got my first airline job 6 months ahead of schedule!",
      rating: 5,
      hours: "1,800+ hrs"
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">
            Trusted by 
            <span className="sky-gradient bg-clip-text text-transparent"> Aviation Professionals</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From flight instructors to airline captains, see what pilots are saying about Route of Flight.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group card-shadow hover:shadow-aviation smooth-transition bg-card border-border/50">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {testimonial.hours}
                  </Badge>
                </div>

                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-primary font-medium">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-primary/10 border border-primary/20 rounded-full px-6 py-3">
            <div className="flex -space-x-2 mr-4">
              {testimonials.slice(0, 4).map((testimonial, index) => (
                <Avatar key={index} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback className="text-xs">{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm font-medium">Join 10,000+ satisfied pilots</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;