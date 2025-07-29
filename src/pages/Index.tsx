import HeroSection from '@/components/HeroSection';
import TravelAgent from '@/components/TravelAgent';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <div id="travel-agent" className="py-12">
        <TravelAgent />
      </div>
    </div>
  );
};

export default Index;
