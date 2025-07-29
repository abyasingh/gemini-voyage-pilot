import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Send, Loader2, Plane, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TravelPreferences {
  budget: string;
  travelType: string;
  amenities: string[];
  destinations: string[];
}

const TravelAgent = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI travel planning assistant. I can help you plan amazing trips based on your preferences, budget, and travel history. What kind of adventure are you looking for?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [preferences, setPreferences] = useState<TravelPreferences>({
    budget: '',
    travelType: '',
    amenities: [],
    destinations: []
  });
  const { toast } = useToast();

  const mockTravelHistory = [
    { destination: 'Bali, Indonesia', date: '2023-12', type: 'Leisure' },
    { destination: 'Tokyo, Japan', date: '2023-08', type: 'Business' },
    { destination: 'Paris, France', date: '2023-05', type: 'Leisure' }
  ];

  const amenityOptions = ['Pool', 'Gym', 'Spa', 'Club Lounge', 'Beach Access', 'Free WiFi', 'Restaurant', 'Room Service'];

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to start chatting.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const context = `
        You are a personalized travel planning AI agent. Use this information to provide tailored recommendations:
        
        User's Travel History: ${mockTravelHistory.map(h => `${h.destination} (${h.date}, ${h.type})`).join(', ')}
        
        Current Preferences:
        - Budget: ${preferences.budget || 'Not specified'}
        - Travel Type: ${preferences.travelType || 'Not specified'}
        - Preferred Amenities: ${preferences.amenities.join(', ') || 'None specified'}
        - Interested Destinations: ${preferences.destinations.join(', ') || 'Open to suggestions'}
        
        Provide personalized travel recommendations considering:
        1. Past travel patterns and preferences
        2. Budget sensitivity and deal opportunities
        3. Seasonal factors and trending destinations
        4. Hotel amenities and experiences
        5. Real-time context and mobile deals
        6. Social signals and highly-rated places
        7. Loyalty program benefits
        
        Be conversational, helpful, and provide specific actionable recommendations.
      `;

      const result = await model.generateContent([context, input]);
      const response = await result.response;
      const text = response.text();

      const assistantMessage: Message = {
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please check your API key.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setPreferences(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* API Key Input */}
      {!apiKey && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              Get Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Enter your Gemini API key to start planning your next adventure.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your Gemini API key..."
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => {
                    if (apiKey) {
                      toast({
                        title: "API Key Set",
                        description: "You can now start chatting with your travel agent!"
                      });
                    }
                  }}
                  variant="travel"
                >
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Travel Preferences */}
        <div className="space-y-4">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Travel Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Budget Range</label>
                <Input
                  placeholder="e.g., $1000-2000"
                  value={preferences.budget}
                  onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Travel Type</label>
                <div className="flex gap-2 flex-wrap">
                  {['Leisure', 'Business', 'Adventure', 'Luxury'].map(type => (
                    <Badge
                      key={type}
                      variant={preferences.travelType === type ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setPreferences(prev => ({ ...prev, travelType: type }))}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Preferred Amenities</label>
                <div className="flex gap-1 flex-wrap">
                  {amenityOptions.map(amenity => (
                    <Badge
                      key={amenity}
                      variant={preferences.amenities.includes(amenity) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel History */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Travels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTravelHistory.map((trip, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{trip.destination}</p>
                      <p className="text-xs text-muted-foreground">{trip.type}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{trip.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card shadow-card h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                AI Travel Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask about destinations, hotels, activities, or get personalized recommendations..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 min-h-[40px] max-h-[120px]"
                  disabled={!apiKey || isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || !apiKey || isLoading}
                  size="icon"
                  variant="travel"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TravelAgent;