import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
      content: `# Welcome to Your AI Travel Assistant! ✈️

I'm here to help you plan amazing trips based on your preferences, budget, and travel history. 

## What I can help you with:
- **🏖️ Destination recommendations** based on your travel style
- **🏨 Hotel suggestions** with your preferred amenities  
- **💰 Budget-friendly options** and deals
- **📅 Trip planning** for business or leisure
- **🌟 Trending destinations** and hidden gems

**Get started by setting your preferences on the left, then ask me anything about travel!**`,
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
      console.log('Starting Gemini API call...');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      });

      const context = `
        You are a personalized travel planning AI agent. ALWAYS format your responses using markdown syntax for better readability.

        Use these markdown formatting guidelines:
        - Use # for main headings, ## for subheadings
        - Use **bold** for important information
        - Use bullet points with - or *
        - Use numbered lists when appropriate
        - Use > for important tips or quotes
        - Use \`code\` for specific terms or prices
        
        User's Travel History: ${mockTravelHistory.map(h => `${h.destination} (${h.date}, ${h.type})`).join(', ')}
        
        Current Preferences:
        - Budget: ${preferences.budget || 'Not specified'}
        - Travel Type: ${preferences.travelType || 'Not specified'}
        - Preferred Amenities: ${preferences.amenities.join(', ') || 'None specified'}
        
        Provide specific, helpful travel recommendations formatted in markdown. Keep responses under 500 words.
      `;

      console.log('Sending request to Gemini...');
      
      // Add timeout to the API call
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );

      const apiPromise = model.generateContent([context, input]);
      
      const result = await Promise.race([apiPromise, timeoutPromise]);
      const response = await (result as any).response;
      const text = response.text();

      console.log('Received response from Gemini');

      const assistantMessage: Message = {
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Detailed error:', error);
      
      let errorMessage = "Failed to get response from AI. ";
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage += "Request timed out. Please try again with a shorter question.";
        } else if (error.message.includes('API_KEY')) {
          errorMessage += "Invalid API key. Please check your Gemini API key.";
        } else if (error.message.includes('quota')) {
          errorMessage += "API quota exceeded. Please check your Gemini API usage.";
        } else {
          errorMessage += `Error: ${error.message}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Add error message to chat
      const errorChatMessage: Message = {
        role: 'assistant',
        content: `## ⚠️ Error Occurred

**${errorMessage}**

> Please try again with a simpler question or check your API key.

### Quick troubleshooting:
- Verify your Gemini API key is correct
- Check your internet connection  
- Try a shorter, more specific question`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
      console.log('API call completed');
    }
  };

  const quickPrompts = [
    "Suggest destinations based on my preferences",
    "Find hotels with my selected amenities",
    "Plan a trip within my budget",
    "What are trending destinations right now?",
    "Recommend activities for my travel type"
  ];

  const toggleAmenity = (amenity: string) => {
    setPreferences(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
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
                        {message.role === 'user' ? (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="text-sm prose prose-sm max-w-none">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-foreground">{children}</h1>,
                                h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                                h3: ({children}) => <h3 className="text-sm font-medium mb-1 text-foreground">{children}</h3>,
                                p: ({children}) => <p className="mb-2 text-foreground">{children}</p>,
                                ul: ({children}) => <ul className="mb-2 ml-4 list-disc text-foreground">{children}</ul>,
                                ol: ({children}) => <ol className="mb-2 ml-4 list-decimal text-foreground">{children}</ol>,
                                li: ({children}) => <li className="mb-1 text-foreground">{children}</li>,
                                strong: ({children}) => <strong className="font-semibold text-primary">{children}</strong>,
                                code: ({children}) => <code className="bg-accent px-1 py-0.5 rounded text-xs text-accent-foreground">{children}</code>,
                                blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-3 my-2 italic text-muted-foreground">{children}</blockquote>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
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
              
              
              {/* Quick Action Prompts */}
              {messages.length === 1 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickPrompt(prompt)}
                        className="text-xs"
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
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