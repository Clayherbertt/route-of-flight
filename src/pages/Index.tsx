import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import LogbookSection from "@/components/sections/LogbookSection";
import AirlinesSection from "@/components/sections/AirlinesSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <LogbookSection />
        <AirlinesSection />
      </main>
      
      {/* Footer */}
      <footer className="bg-aviation-navy text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Take Flight?</h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Join thousands of pilots who trust Route of Flight to manage their careers and achieve their aviation goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="aviation-gradient text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 smooth-transition aviation-shadow">
                Start Free Trial
              </button>
              <button className="border border-white/30 text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 smooth-transition">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/60">
            <p>&copy; 2024 Route of Flight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
