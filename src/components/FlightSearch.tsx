import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plane, Search } from 'lucide-react';
import { FlightService, FlightSearchParams } from '@/services/FlightService';
import { useToast } from '@/hooks/use-toast';

interface FlightSearchProps {
  onFlightSearch: (flightData: string, searchParams: FlightSearchParams) => void;
}

const FlightSearch = ({ onFlightSearch }: FlightSearchProps) => {
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    departure: '',
    arrival: '',
    departureDate: '',
    returnDate: '',
    adults: 1,
    class: 'economy'
  });
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchParams.departure || !searchParams.arrival || !searchParams.departureDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in departure city, arrival city, and departure date.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const flightResult = await FlightService.searchFlights(searchParams);
      const formattedData = FlightService.formatFlightsForAI(flightResult, searchParams);
      
      onFlightSearch(formattedData, searchParams);
      
      toast({
        title: "Flights Found",
        description: `Found ${flightResult.outbound_flights.length} outbound flights`,
      });
    } catch (error) {
      console.error('Flight search failed:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search flights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" />
          Flight Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="departure">From</Label>
            <Input
              id="departure"
              placeholder="e.g., JFK, New York"
              value={searchParams.departure}
              onChange={(e) => setSearchParams(prev => ({ ...prev, departure: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="arrival">To</Label>
            <Input
              id="arrival"
              placeholder="e.g., LAX, Los Angeles"
              value={searchParams.arrival}
              onChange={(e) => setSearchParams(prev => ({ ...prev, arrival: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="departureDate">Departure Date</Label>
            <Input
              id="departureDate"
              type="date"
              value={searchParams.departureDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="returnDate">Return Date (Optional)</Label>
            <Input
              id="returnDate"
              type="date"
              value={searchParams.returnDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="adults">Passengers</Label>
            <Select value={searchParams.adults?.toString()} onValueChange={(value) => setSearchParams(prev => ({ ...prev, adults: parseInt(value) }))}>
              <SelectTrigger>
                <SelectValue placeholder="Adults" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Adult</SelectItem>
                <SelectItem value="2">2 Adults</SelectItem>
                <SelectItem value="3">3 Adults</SelectItem>
                <SelectItem value="4">4 Adults</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="class">Class</Label>
            <Select value={searchParams.class} onValueChange={(value: any) => setSearchParams(prev => ({ ...prev, class: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="first">First Class</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleSearch} 
          disabled={isSearching}
          className="w-full"
          variant="travel"
        >
          {isSearching ? (
            <>
              <Search className="h-4 w-4 mr-2 animate-spin" />
              Searching Flights...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search Flights
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FlightSearch;