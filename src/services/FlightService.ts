import { getJson } from 'serpapi';

export interface FlightSearchParams {
  departure: string;
  arrival: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  class?: 'economy' | 'business' | 'first';
}

export interface Flight {
  airline: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  currency: string;
  stops: number;
  booking_url?: string;
}

export interface FlightResult {
  outbound_flights: Flight[];
  return_flights?: Flight[];
}

export class FlightService {
  private static API_KEY = '53dc47e47a56adfcbdcf995e3076c931f8494908fbaf5fe61446a7a48a9b8d9e';

  static async searchFlights(params: FlightSearchParams): Promise<FlightResult> {
    try {
      const searchParams = {
        engine: 'google_flights',
        departure_id: params.departure,
        arrival_id: params.arrival,
        outbound_date: params.departureDate,
        return_date: params.returnDate,
        adults: params.adults || 1,
        travel_class: params.class || 'economy',
        currency: 'USD',
        api_key: this.API_KEY
      };

      console.log('Searching flights with params:', searchParams);
      const response = await getJson(searchParams);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Transform SerpAPI response to our format
      const outbound_flights = this.transformFlights(response.best_flights || response.other_flights || []);
      const return_flights = response.return_flights ? this.transformFlights(response.return_flights) : undefined;

      return {
        outbound_flights,
        return_flights
      };
    } catch (error) {
      console.error('Flight search error:', error);
      throw error;
    }
  }

  private static transformFlights(flights: any[]): Flight[] {
    return flights.map((flight: any) => ({
      airline: flight.flights?.[0]?.airline || 'Unknown',
      flight_number: flight.flights?.[0]?.flight_number || 'N/A',
      departure_time: flight.flights?.[0]?.departure_airport?.time || '',
      arrival_time: flight.flights?.[flight.flights.length - 1]?.arrival_airport?.time || '',
      duration: flight.total_duration || 'N/A',
      price: flight.price || 0,
      currency: 'USD',
      stops: (flight.flights?.length || 1) - 1,
      booking_url: flight.booking_token ? `https://www.google.com/travel/flights/booking?token=${flight.booking_token}` : undefined
    }));
  }

  static formatFlightsForAI(flightResult: FlightResult, searchParams: FlightSearchParams): string {
    let formattedText = `## Flight Search Results\n\n`;
    formattedText += `**Route:** ${searchParams.departure} → ${searchParams.arrival}\n`;
    formattedText += `**Date:** ${searchParams.departureDate}\n`;
    if (searchParams.returnDate) {
      formattedText += `**Return:** ${searchParams.returnDate}\n`;
    }
    formattedText += `**Passengers:** ${searchParams.adults || 1} adult(s)\n\n`;

    if (flightResult.outbound_flights.length > 0) {
      formattedText += `### Outbound Flights\n\n`;
      formattedText += `| Airline | Flight | Departure | Arrival | Duration | Stops | Price | Book |\n`;
      formattedText += `|---------|--------|-----------|---------|----------|-------|-------|------|\n`;
      
      flightResult.outbound_flights.slice(0, 5).forEach(flight => {
        const bookingLink = flight.booking_url ? `[Book](${flight.booking_url})` : 'N/A';
        formattedText += `| ${flight.airline} | ${flight.flight_number} | ${flight.departure_time} | ${flight.arrival_time} | ${flight.duration} | ${flight.stops} | $${flight.price} | ${bookingLink} |\n`;
      });
    }

    if (flightResult.return_flights && flightResult.return_flights.length > 0) {
      formattedText += `\n### Return Flights\n\n`;
      formattedText += `| Airline | Flight | Departure | Arrival | Duration | Stops | Price | Book |\n`;
      formattedText += `|---------|--------|-----------|---------|----------|-------|-------|------|\n`;
      
      flightResult.return_flights.slice(0, 5).forEach(flight => {
        const bookingLink = flight.booking_url ? `[Book](${flight.booking_url})` : 'N/A';
        formattedText += `| ${flight.airline} | ${flight.flight_number} | ${flight.departure_time} | ${flight.arrival_time} | ${flight.duration} | ${flight.stops} | $${flight.price} | ${bookingLink} |\n`;
      });
    }

    return formattedText;
  }
}