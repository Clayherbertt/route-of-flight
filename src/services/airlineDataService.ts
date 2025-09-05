import { supabase } from "@/integrations/supabase/client";

export interface ScrapedAirlineData {
  name: string;
  iata?: string;
  icao?: string;
  headquarters?: string;
  founded?: string;
  fleet_size?: number;
  destinations?: number;
  employees?: string;
  website?: string;
  phone?: string;
  email?: string;
  description?: string;
  hiring_requirements?: {
    min_hours?: string;
    type_rating?: boolean;
    college_degree?: boolean;
    clean_record?: boolean;
  };
  benefits?: string[];
  fleet_types?: string[];
  bases?: string[];
  pay_scales?: {
    first_officer?: {
      year_1?: string;
      year_5?: string;
      year_10?: string;
    };
    captain?: {
      year_1?: string;
      year_5?: string;
      year_10?: string;
    };
  };
}

export class AirlineDataService {
  private static cache: Map<string, { data: ScrapedAirlineData; timestamp: number }> = new Map();
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static async scrapeAirlineData(airlineName: string): Promise<ScrapedAirlineData | null> {
    try {
      // Check cache first
      const cached = this.cache.get(airlineName);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('Returning cached data for', airlineName);
        return cached.data;
      }

      console.log('Scraping fresh data for', airlineName);

      const { data, error } = await supabase.functions.invoke('scrape-airline-data', {
        body: { airlineName }
      });

      if (error) {
        console.error('Error calling scrape function:', error);
        return null;
      }

      if (!data.success) {
        console.error('Scraping failed:', data.error);
        return null;
      }

      // Cache the result
      this.cache.set(airlineName, {
        data: data.data,
        timestamp: Date.now()
      });

      return data.data;
    } catch (error) {
      console.error('Error scraping airline data:', error);
      return null;
    }
  }

  static clearCache(airlineName?: string) {
    if (airlineName) {
      this.cache.delete(airlineName);
    } else {
      this.cache.clear();
    }
  }
}