import Header from "@/components/layout/Header";
import AnimatedHeroSection from "@/components/sections/AnimatedHeroSection";
import ScrollingFeaturesSection from "@/components/sections/ScrollingFeaturesSection";
import LogbookSection from "@/components/sections/LogbookSection";
import AirlinesSection from "@/components/sections/AirlinesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <AnimatedHeroSection />
        <ScrollingFeaturesSection />
        <LogbookSection />
        <AirlinesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      
      {/* Modern Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Route of Flight</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The professional pilot's platform for career advancement and flight tracking.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary smooth-transition">Digital Logbook</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Airline Database</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Career Analytics</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary smooth-transition">Help Center</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">API Documentation</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Flight Training</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Career Guides</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary smooth-transition">About Us</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border text-center text-muted-foreground text-sm">
            <p>&copy; 2024 Route of Flight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
