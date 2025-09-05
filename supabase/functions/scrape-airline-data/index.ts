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

    // Construct URL for airline pilot central
    const searchUrl = `https://www.airlinepilotcentral.com/airlines/${airlineName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    console.log('Attempting to scrape URL:', searchUrl);

    // Use Firecrawl to scrape the airline data
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: searchUrl,
        formats: ['extract', 'markdown'],
        extract: {
          schema: {
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
          }
        }
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Firecrawl API error: ${response.status} ${response.statusText}`);
    }

    const scraped = await response.json();
    console.log('Firecrawl response:', JSON.stringify(scraped, null, 2));

    if (!scraped.success) {
      throw new Error(scraped.error || 'Failed to scrape airline data');
    }

    // Parse the extracted data
    let airlineData: AirlineData = {
      name: airlineName
    };

    try {
      // Try to extract structured data from the extraction
      if (scraped.data?.extract) {
        console.log('Using extracted data:', JSON.stringify(scraped.data.extract, null, 2));
        airlineData = {
          ...airlineData,
          ...scraped.data.extract
        };
      } else if (scraped.data?.markdown) {
        // Fallback: parse markdown content for key information
        console.log('Falling back to markdown parsing');
        const content = scraped.data.markdown;
        
        // Extract basic info using regex patterns
        const iataMatch = content.match(/IATA[:\s]+([A-Z]{2})/i);
        const icaoMatch = content.match(/ICAO[:\s]+([A-Z]{3})/i);
        const headquartersMatch = content.match(/Headquarters[:\s]+([^\n]+)/i);
        const foundedMatch = content.match(/Founded[:\s]+(\d{4})/i);
        const fleetSizeMatch = content.match(/Fleet[:\s]+(\d+)/i);
        const websiteMatch = content.match(/(https?:\/\/[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i);

        if (iataMatch) airlineData.iata = iataMatch[1];
        if (icaoMatch) airlineData.icao = icaoMatch[1];
        if (headquartersMatch) airlineData.headquarters = headquartersMatch[1].trim();
        if (foundedMatch) airlineData.founded = foundedMatch[1];
        if (fleetSizeMatch) airlineData.fleet_size = parseInt(fleetSizeMatch[1]);
        if (websiteMatch) airlineData.website = websiteMatch[0];
      }
    } catch (parseError) {
      console.error('Error parsing extracted data:', parseError);
    }

    // If we don't have enough data, provide a basic structure
    if (!airlineData.description) {
      airlineData.description = `${airlineName} airline profile data scraped from Airline Pilot Central.`;
    }

    console.log('Processed airline data:', JSON.stringify(airlineData, null, 2));

    return new Response(JSON.stringify({ 
      success: true, 
      data: airlineData 
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