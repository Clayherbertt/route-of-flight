import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FlightEntry {
  date: string;
  aircraft_registration: string;
  aircraft_type: string;
  departure_airport: string;
  arrival_airport: string;
  total_time: number;
  pic_time?: number;
  sic_time?: number;
  cross_country_time?: number;
  night_time?: number;
  instrument_time?: number;
  actual_instrument?: number;
  simulated_instrument?: number;
  solo_time?: number;
  dual_given?: number;
  dual_received?: number;
  approaches?: string;
  landings?: number;
  day_landings?: number;
  night_landings?: number;
  holds?: number;
  route?: string;
  remarks?: string;
  start_time?: string;
  end_time?: string;
}

async function processFlightImport(flights: FlightEntry[], userId: string, supabaseClient: any) {
  console.log(`=== BACKGROUND IMPORT STARTED ===`)
  console.log(`Processing ${flights.length} flights for user ${userId}`)
  
  let successCount = 0;
  let failureCount = 0;
  const batchSize = 25; // Smaller batches for better reliability
  
  // Process flights in smaller batches
  for (let i = 0; i < flights.length; i += batchSize) {
    const batch = flights.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(flights.length / batchSize)} with ${batch.length} flights`)

    // Process each flight individually within the batch to identify failures
    for (let j = 0; j < batch.length; j++) {
      const flight = batch[j];
      const flightIndex = i + j + 1;
      
      try {
        const entry = {
          user_id: userId,
          date: flight.date,
          aircraft_registration: flight.aircraft_registration,
          aircraft_type: flight.aircraft_type,
          departure_airport: flight.departure_airport,
          arrival_airport: flight.arrival_airport,
          total_time: Number(flight.total_time) || 0,
          pic_time: Number(flight.pic_time) || 0,
          cross_country_time: Number(flight.cross_country_time) || 0,
          night_time: Number(flight.night_time) || 0,
          instrument_time: Number(flight.instrument_time) || 0,
          approaches: flight.approaches?.toString() || '0',
          landings: Number(flight.landings) || 0,
          sic_time: Number(flight.sic_time) || 0,
          solo_time: Number(flight.solo_time) || 0,
          day_takeoffs: Number(flight.day_landings) || 0,
          day_landings: Number(flight.day_landings) || 0,
          night_takeoffs: Number(flight.night_landings) || 0,
          night_landings: Number(flight.night_landings) || 0,
          actual_instrument: Number(flight.actual_instrument) || 0,
          simulated_instrument: Number(flight.simulated_instrument) || 0,
          holds: Number(flight.holds) || 0,
          dual_given: Number(flight.dual_given) || 0,
          dual_received: Number(flight.dual_received) || 0,
          simulated_flight: 0,
          ground_training: 0,
          route: flight.route || null,
          remarks: flight.remarks || null,
          start_time: flight.start_time || null,
          end_time: flight.end_time || null,
        };

        // Validate required fields
        if (!entry.date || !entry.aircraft_registration || !entry.aircraft_type || 
            !entry.departure_airport || !entry.arrival_airport) {
          console.log(`Skipping flight ${flightIndex}: Missing required fields`)
          failureCount++;
          continue;
        }

        const { data, error } = await supabaseClient
          .from('flight_entries')
          .insert([entry])

        if (error) {
          console.error(`Failed to insert flight ${flightIndex}:`, error.message)
          failureCount++;
        } else {
          successCount++;
          if (successCount % 50 === 0) {
            console.log(`Progress: ${successCount}/${flights.length} flights imported`)
          }
        }
      } catch (flightError) {
        console.error(`Error processing flight ${flightIndex}:`, flightError)
        failureCount++;
      }
    }

    // Small delay between batches to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`=== BACKGROUND IMPORT COMPLETED ===`)
  console.log(`Final results: ${successCount} successful, ${failureCount} failed`)
  return { success: successCount, failed: failureCount };
}

serve(async (req) => {
  console.log('=== CSV IMPORT FUNCTION START ===')
  console.log('Method:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Returning CORS preflight response')
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing POST request...')
    
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    const requestBody = await req.json()
    console.log('Request body received, flights count:', requestBody?.flights?.length || 0)
    
    const { flights } = requestBody as { flights: FlightEntry[] }

    if (!flights || !Array.isArray(flights)) {
      console.error('Invalid flight data provided')
      return new Response(
        JSON.stringify({ error: 'Invalid flight data provided', success: 0, failed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client using service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    console.log('Supabase client created successfully')

    // Extract user ID from JWT
    let userId = 'd9f8d5cb-1e56-41f8-81a1-7c70e7d661f9'; // Fallback
    
    if (authHeader) {
      try {
        const jwt = authHeader.replace('Bearer ', '')
        const payload = JSON.parse(atob(jwt.split('.')[1]))
        userId = payload.sub
        console.log('Extracted user ID from JWT:', userId)
      } catch (jwtError) {
        console.warn('Could not parse JWT, using fallback user ID')
      }
    }

    // Start the background import process
    console.log('Starting background import process...')
    EdgeRuntime.waitUntil(processFlightImport(flights, userId, supabaseClient))

    // Return immediate response
    const result = {
      success: 0, // Will be updated in background
      failed: 0,  // Will be updated in background
      message: `Import started for ${flights.length} flights. This will continue in the background.`
    };

    console.log('Returning immediate response:', result)
    console.log('=== CSV IMPORT FUNCTION END (background processing continues) ===')

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('=== CSV IMPORT FUNCTION ERROR ===')
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during CSV import',
        success: 0,
        failed: 0,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})