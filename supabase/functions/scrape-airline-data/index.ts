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
    const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: searchUrl,
        formats: ['markdown', 'html'],
        extractorOptions: {
          mode: 'llm-extraction',
          extractionPrompt: `Extract airline information including: company overview (headquarters, founded, fleet size, destinations, employees), contact information (website, phone, email), hiring requirements (minimum flight hours, type rating required, college degree required, clean record required), benefits, fleet aircraft types, operating bases, and pilot pay scales for First Officer and Captain positions at years 1, 5, and 10. Format as structured JSON.`
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
      // Try to extract structured data from the LLM extraction
      if (scraped.llm_extraction) {
        const extracted = typeof scraped.llm_extraction === 'string' 
          ? JSON.parse(scraped.llm_extraction) 
          : scraped.llm_extraction;
        
        airlineData = {
          ...airlineData,
          ...extracted
        };
      } else if (scraped.markdown) {
        // Fallback: parse markdown content for key information
        const content = scraped.markdown;
        
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