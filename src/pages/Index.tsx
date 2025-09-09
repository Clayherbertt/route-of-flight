import Header from "@/components/layout/Header";
import HeroSectionV3 from "@/components/sections/HeroSectionV3";
import BentoGridSection from "@/components/sections/BentoGridSection";
import InteractiveStatsSection from "@/components/sections/InteractiveStatsSection";
import MinimalFooter from "@/components/sections/MinimalFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSectionV3 />
        <BentoGridSection />
        <InteractiveStatsSection />
      </main>
      <MinimalFooter />
    </div>
  );
};

export default Index;
