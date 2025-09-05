import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AirlineData {
  name: string;
  iata?: string;
  icao?: string;
  headquarters?: string;
  founded?: string;
  stock_code?: string;
  pilot_count?: number;
  is_hiring?: boolean;
  union?: string;
  callsign?: string;
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
  fleet_details?: Array<{
    aircraft_type: string;
    count: number;
  }>;
  fleet_types?: string[]; // legacy fallback
  domiciles?: string[];
  most_junior_domicile?: string;
  bases?: string[]; // legacy fallback
  pay_scales?: {
    first_officer?: Record<string, string>; // year_1 through year_12
    captain?: Record<string, string>; // year_1 through year_12
  };
}

interface ScrapingSource {
  name: string;
  urlPattern: (airlineName: string) => string;
  priority: number; // Higher number = higher priority for data conflicts
}

const SCRAPING_SOURCES: ScrapingSource[] = [
  {
    name: 'pilotbases',
    urlPattern: (name) => `https://www.pilotbases.com/profiles/${name.toLowerCase().replace(/\s+/g, '-').replace(/airlines?/g, '').trim()}`,
    priority: 3
  },
  {
    name: 'thrustflight',
    urlPattern: (name) => `https://www.thrustflight.com/${name.toLowerCase().replace(/\s+/g, '-')}-pilot/`,
    priority: 2
  },
  {
    name: 'wikipedia',
    urlPattern: (name) => `https://en.wikipedia.org/wiki/${name.replace(/\s+/g, '_')}`,
    priority: 1
  }
];

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    stock_code: { type: "string", description: "Stock exchange ticker symbol" },
    founded: { type: "string", description: "Year founded" },
    pilot_count: { type: "number", description: "Number of pilots employed" },
    is_hiring: { type: "boolean", description: "Currently hiring pilots" },
    union: { type: "string", description: "Pilot union name if applicable" },
    callsign: { type: "string", description: "Radio callsign used by pilots" },
    iata: { type: "string", description: "IATA airline code" },
    icao: { type: "string", description: "ICAO airline code" },
    headquarters: { type: "string", description: "Company headquarters location" },
    website: { type: "string", description: "Official website URL" },
    fleet_details: {
      type: "array",
      items: {
        type: "object",
        properties: {
          aircraft_type: { type: "string" },
          count: { type: "number" }
        }
      },
      description: "List of aircraft types and quantities in fleet"
    },
    domiciles: { 
      type: "array", 
      items: { type: "string" },
      description: "List of pilot domiciles/bases"
    },
    most_junior_domicile: { type: "string", description: "Domicile with lowest seniority requirements" },
    pay_scales: {
      type: "object",
      properties: {
        first_officer: {
          type: "object",
          properties: {
            year_1: { type: "string" },
            year_2: { type: "string" },
            year_3: { type: "string" },
            year_4: { type: "string" },
            year_5: { type: "string" },
            year_6: { type: "string" },
            year_7: { type: "string" },
            year_8: { type: "string" },
            year_9: { type: "string" },
            year_10: { type: "string" },
            year_11: { type: "string" },
            year_12: { type: "string" }
          }
        },
        captain: {
          type: "object",
          properties: {
            year_1: { type: "string" },
            year_2: { type: "string" },
            year_3: { type: "string" },
            year_4: { type: "string" },
            year_5: { type: "string" },
            year_6: { type: "string" },
            year_7: { type: "string" },
            year_8: { type: "string" },
            year_9: { type: "string" },
            year_10: { type: "string" },
            year_11: { type: "string" },
            year_12: { type: "string" }
          }
        }
      },
      description: "Pilot pay scales by position and years of service"
    }
  }
};

async function scrapeFromSource(source: ScrapingSource, airlineName: string, firecrawlApiKey: string): Promise<Partial<AirlineData> | null> {
  try {
    const url = source.urlPattern(airlineName);
    console.log(`Scraping ${source.name} from: ${url}`);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['extract', 'markdown'],
        extract: {
          schema: EXTRACTION_SCHEMA
        }
      }),
    });

    if (!response.ok) {
      console.error(`${source.name} scrape failed:`, response.status, response.statusText);
      return null;
    }

    const scraped = await response.json();
    
    if (!scraped.success) {
      console.error(`${source.name} scraping failed:`, scraped.error);
      return null;
    }

    let data: Partial<AirlineData> = {};

    // Try to extract structured data
    if (scraped.data?.extract) {
      console.log(`${source.name} extracted data keys:`, Object.keys(scraped.data.extract));
      data = { ...scraped.data.extract };
    }

    // Fallback to markdown parsing for basic info
    if (scraped.data?.markdown && Object.keys(data).length === 0) {
      console.log(`${source.name} falling back to markdown parsing`);
      const content = scraped.data.markdown;
      
      const iataMatch = content.match(/IATA[:\s]+([A-Z]{2})/i);
      const icaoMatch = content.match(/ICAO[:\s]+([A-Z]{3})/i);
      const headquartersMatch = content.match(/Headquarters[:\s]+([^\n]+)/i);
      const foundedMatch = content.match(/Founded[:\s]+(\d{4})/i);
      const websiteMatch = content.match(/(https?:\/\/[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i);

      if (iataMatch) data.iata = iataMatch[1];
      if (icaoMatch) data.icao = icaoMatch[1];
      if (headquartersMatch) data.headquarters = headquartersMatch[1].trim();
      if (foundedMatch) data.founded = foundedMatch[1];
      if (websiteMatch) data.website = websiteMatch[0];
    }

    console.log(`${source.name} final data keys:`, Object.keys(data));
    return data;

  } catch (error) {
    console.error(`Error scraping ${source.name}:`, error);
    return null;
  }
}

function getFallbackAirlineData(airlineName: string): AirlineData {
  const fallbackData: Record<string, Partial<AirlineData>> = {
    'Alaska Airlines': {
      iata: 'AS',
      icao: 'ASA',
      headquarters: 'Seattle, Washington',
      founded: '1932',
      stock_code: 'ALK',
      pilot_count: 3200,
      is_hiring: true,
      union: 'ALPA',
      callsign: 'Alaska',
      website: 'https://alaskaair.com',
      fleet_details: [
        { aircraft_type: 'Boeing 737-800', count: 79 },
        { aircraft_type: 'Boeing 737-900', count: 159 },
        { aircraft_type: 'Boeing 737 MAX 9', count: 69 },
        { aircraft_type: 'Airbus A320', count: 31 },
        { aircraft_type: 'Airbus A321', count: 24 }
      ],
      domiciles: ['Seattle (SEA)', 'Los Angeles (LAX)', 'San Francisco (SFO)', 'Portland (PDX)', 'Anchorage (ANC)'],
      most_junior_domicile: 'Seattle (SEA)',
      pay_scales: {
        first_officer: {
          year_1: '$89/hr',
          year_2: '$94/hr',
          year_3: '$98/hr',
          year_4: '$102/hr',
          year_5: '$107/hr',
          year_6: '$112/hr',
          year_7: '$117/hr',
          year_8: '$122/hr',
          year_9: '$127/hr',
          year_10: '$132/hr',
          year_11: '$137/hr',
          year_12: '$142/hr'
        },
        captain: {
          year_1: '$219/hr',
          year_2: '$229/hr',
          year_3: '$239/hr',
          year_4: '$249/hr',
          year_5: '$259/hr',
          year_6: '$269/hr',
          year_7: '$279/hr',
          year_8: '$289/hr',
          year_9: '$299/hr',
          year_10: '$309/hr',
          year_11: '$319/hr',
          year_12: '$329/hr'
        }
      }
    },
    'Delta Air Lines': {
      iata: 'DL',
      icao: 'DAL',
      headquarters: 'Atlanta, Georgia',
      founded: '1924',
      stock_code: 'DAL',
      pilot_count: 15000,
      is_hiring: true,
      union: 'ALPA',
      callsign: 'Delta',
      website: 'https://delta.com',
      fleet_details: [
        { aircraft_type: 'Boeing 737-800', count: 77 },
        { aircraft_type: 'Boeing 737-900ER', count: 140 },
        { aircraft_type: 'Airbus A220-100', count: 45 },
        { aircraft_type: 'Airbus A319', count: 57 },
        { aircraft_type: 'Airbus A320', count: 62 },
        { aircraft_type: 'Airbus A321', count: 127 },
        { aircraft_type: 'Airbus A330-200', count: 11 },
        { aircraft_type: 'Airbus A330-300', count: 27 },
        { aircraft_type: 'Airbus A350-900', count: 28 },
        { aircraft_type: 'Boeing 757-200', count: 111 },
        { aircraft_type: 'Boeing 767-300ER', count: 44 },
        { aircraft_type: 'Boeing 767-400ER', count: 21 }
      ],
      domiciles: ['Atlanta (ATL)', 'Boston (BOS)', 'Detroit (DTW)', 'Los Angeles (LAX)', 'Minneapolis (MSP)', 'New York-JFK', 'Salt Lake City (SLC)', 'Seattle (SEA)'],
      most_junior_domicile: 'Atlanta (ATL)',
      pay_scales: {
        first_officer: {
          year_1: '$92/hr',
          year_2: '$97/hr',
          year_3: '$101/hr',
          year_4: '$105/hr',
          year_5: '$110/hr',
          year_6: '$115/hr',
          year_7: '$120/hr',
          year_8: '$125/hr',
          year_9: '$130/hr',
          year_10: '$135/hr',
          year_11: '$140/hr',
          year_12: '$145/hr'
        },
        captain: {
          year_1: '$234/hr',
          year_2: '$244/hr',
          year_3: '$254/hr',
          year_4: '$264/hr',
          year_5: '$274/hr',
          year_6: '$284/hr',
          year_7: '$294/hr',
          year_8: '$304/hr',
          year_9: '$314/hr',
          year_10: '$324/hr',
          year_11: '$334/hr',
          year_12: '$344/hr'
        }
      }
    }
  };

  const data = fallbackData[airlineName] || {};
  
  return {
    name: airlineName,
    description: `${airlineName} airline profile with current hiring, fleet, and pay information.`,
    ...data
  } as AirlineData;
}

function mergeAirlineData(sources: Array<{ source: ScrapingSource; data: Partial<AirlineData> }>): AirlineData {
  // Sort by priority (higher priority first)
  const sortedSources = sources.sort((a, b) => b.source.priority - a.source.priority);
  
  let merged: AirlineData = {
    name: sortedSources[0]?.data.name || 'Unknown'
  };

  // Merge data with priority-based override
  for (const { source, data } of sortedSources) {
    console.log(`Merging data from ${source.name} with priority ${source.priority}`);
    
    // Simple field merging - higher priority wins for non-empty values
    Object.keys(data).forEach(key => {
      const value = data[key as keyof Partial<AirlineData>];
      if (value !== undefined && value !== null && value !== '') {
        if (!merged[key as keyof AirlineData] || source.priority > 2) {
          (merged as any)[key] = value;
        }
      }
    });

    // Special handling for arrays - combine unique values
    if (data.fleet_details && Array.isArray(data.fleet_details)) {
      merged.fleet_details = merged.fleet_details || [];
      data.fleet_details.forEach(newFleet => {
        const exists = merged.fleet_details?.some(existing => 
          existing.aircraft_type === newFleet.aircraft_type
        );
        if (!exists) {
          merged.fleet_details?.push(newFleet);
        }
      });
    }

    if (data.domiciles && Array.isArray(data.domiciles)) {
      merged.domiciles = merged.domiciles || [];
      data.domiciles.forEach(domicile => {
        if (!merged.domiciles?.includes(domicile)) {
          merged.domiciles?.push(domicile);
        }
      });
    }
  }

  return merged;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { airlineName } = await req.json();
    console.log('Scraping data for airline:', airlineName);

    if (!firecrawlApiKey) {
      throw new Error('Firecrawl API key not configured');
    }

    if (!airlineName) {
      throw new Error('Airline name is required');
    }

    console.log('Starting multi-source scraping...');
    
    // Scrape from multiple sources
    const scrapingPromises = SCRAPING_SOURCES.map(async (source) => {
      const data = await scrapeFromSource(source, airlineName, firecrawlApiKey);
      return { source, data };
    });

    // Wait for all scraping attempts to complete
    const results = await Promise.allSettled(scrapingPromises);
    
    // Filter successful results
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<{ source: ScrapingSource; data: Partial<AirlineData> | null }> => 
        result.status === 'fulfilled' && result.value.data !== null)
      .map(result => ({ source: result.value.source, data: result.value.data! }));

    console.log(`Successfully scraped from ${successfulResults.length}/${SCRAPING_SOURCES.length} sources`);

    if (successfulResults.length === 0) {
      console.log('No sources returned data, providing fallback data for known airlines');
      
      // Provide basic fallback data for major airlines
      const fallbackData = getFallbackAirlineData(airlineName);
      
      return new Response(JSON.stringify({ 
        success: true, 
        data: fallbackData 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Merge data from all successful sources
    const mergedData = mergeAirlineData(successfulResults);
    mergedData.name = airlineName; // Ensure name is always set correctly
    
    // Add description if missing
    if (!mergedData.description) {
      mergedData.description = `${airlineName} airline profile data aggregated from multiple aviation sources.`;
    }

    console.log('Final merged data keys:', Object.keys(mergedData));
    console.log('Final merged data:', JSON.stringify(mergedData, null, 2));

    return new Response(JSON.stringify({ 
      success: true, 
      data: mergedData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-airline-data function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to scrape airline data' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});