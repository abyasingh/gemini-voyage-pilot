import { Button } from '@/components/ui/button';
import { MapPin, Sparkles, Globe } from 'lucide-react';
import heroImage from '@/assets/hero-travel.jpg';

const HeroSection = () => {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-secondary animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            Your AI Travel
          </h1>
          <Globe className="h-8 w-8 text-accent animate-pulse" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Planning Agent
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Discover personalized destinations, get smart recommendations, and plan unforgettable journeys with AI-powered insights tailored just for you.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="xl" 
            variant="hero"
            className="font-semibold text-lg px-8 py-4"
            onClick={() => {
              const travelAgent = document.getElementById('travel-agent');
              travelAgent?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <MapPin className="mr-2 h-5 w-5" />
            Start Planning
          </Button>
          
          <Button 
            size="xl" 
            variant="outline"
            className="font-semibold text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Learn More
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-white/80">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Smart Recommendations</h3>
            <p className="text-sm">AI-powered suggestions based on your travel history and preferences</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Personalized Experience</h3>
            <p className="text-sm">Tailored travel plans that match your budget and interests</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Real-time Insights</h3>
            <p className="text-sm">Live data on deals, weather, and trending destinations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;