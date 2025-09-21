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

serve(async (req) => {
  console.log('CSV import function called with method:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting CSV import function execution')
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.error('No authorization header provided')
      throw new Error('No authorization header provided')
    }

    // Extract JWT from header
    const jwt = authHeader.replace('Bearer ', '')
    console.log('JWT extracted, length:', jwt.length)

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )
    
    console.log('Supabase client created')

    // Verify user authentication using the JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt)
    console.log('User authentication result:', { 
      user: user ? { id: user.id, email: user.email } : null, 
      error: userError?.message 
    })

    if (userError || !user) {
      console.error('Authentication error:', userError)
      throw new Error(`User not authenticated: ${userError?.message || 'Unknown error'}`)
    }

    console.log('Processing CSV import for user:', user.id)

    const { flights } = await req.json() as { flights: FlightEntry[] }

    if (!flights || !Array.isArray(flights)) {
      throw new Error('Invalid flight data provided')
    }

    console.log(`Importing ${flights.length} flight entries`)

    let successCount = 0;
    let failureCount = 0;
    const batchSize = 50; // Process in batches to avoid timeout

    // Process flights in batches
    for (let i = 0; i < flights.length; i += batchSize) {
      const batch = flights.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} with ${batch.length} flights`)

      // Prepare batch for insertion
      const flightEntries = batch.map(flight => {
        // Validate and prepare the flight entry
        const entry: any = {
          user_id: user.id,
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
            !entry.departure_airport || !entry.arrival_airport || entry.total_time <= 0) {
          throw new Error(`Invalid flight entry: missing required fields`)
        }

        // Validate date format
        const dateObj = new Date(entry.date);
        if (isNaN(dateObj.getTime())) {
          throw new Error(`Invalid date format: ${entry.date}`)
        }

        return entry;
      });

      try {
        // Insert batch into database
        const { data, error } = await supabaseClient
          .from('flight_entries')
          .insert(flightEntries)

        if (error) {
          console.error('Batch insert error:', error)
          failureCount += batch.length;
        } else {
          console.log(`Successfully inserted ${batch.length} flights`)
          successCount += batch.length;
        }
      } catch (batchError) {
        console.error('Batch processing error:', batchError)
        failureCount += batch.length;
      }
    }

    console.log(`Import completed: ${successCount} success, ${failureCount} failed`)

    return new Response(
      JSON.stringify({
        success: successCount,
        failed: failureCount,
        message: `Import completed: ${successCount} flights imported successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('CSV import error:', error)
    console.error('Error stack:', error.stack)
    
    const errorMessage = error.message || 'An error occurred during CSV import'
    console.log('Returning error response:', errorMessage)
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
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