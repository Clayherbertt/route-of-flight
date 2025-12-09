import Header from "@/components/layout/Header";
import { Hero } from "@/components/figma-home/Hero";
import { LogbookSection } from "@/components/figma-home/LogbookSection";
import { AirlineSection } from "@/components/figma-home/AirlineSection";
import { CareerPathSection } from "@/components/figma-home/CareerPathSection";
import { FeaturesGrid } from "@/components/figma-home/FeaturesGrid";
import { CTASection } from "@/components/figma-home/CTASection";
import { Footer } from "@/components/figma-home/Footer";

export default function HomeFigma() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50">
      <Header />
      <main>
        <Hero />
        <LogbookSection />
        <AirlineSection />
        <CareerPathSection />
        <FeaturesGrid />
        <CTASection />
        <Footer />
      </main>
    </div>
  );
}

