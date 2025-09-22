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
  let duplicateCount = 0;
  const batchSize = 10; // Much smaller batches to prevent timeouts
  
  // Parse numeric fields with better error handling
  const parseNumericField = (value: any, fieldName: string, defaultValue: number = 0): number => {
    if (value === undefined || value === null || value === '' || value === 'null') {
      return defaultValue;
    }
    const parsed = Number(value);
    if (isNaN(parsed)) {
      console.log(`Invalid ${fieldName} value "${value}", using ${defaultValue}`)
      return defaultValue;
    }
    return parsed;
  };
  
  // Process flights in smaller batches
  for (let i = 0; i < flights.length; i += batchSize) {
    const batch = flights.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(flights.length / batchSize)} (flights ${i + 1}-${i + batch.length})`)

    try {
      // Prepare batch entries
      const entries = [];
      for (const flight of batch) {
        const entry = {
          user_id: userId,
          date: flight.date,
          aircraft_registration: flight.aircraft_registration?.toString().trim() || '',
          aircraft_type: flight.aircraft_type?.toString().trim() || '',
          departure_airport: flight.departure_airport?.toString().trim() || '',
          arrival_airport: flight.arrival_airport?.toString().trim() || '',
          total_time: parseNumericField(flight.total_time, 'total_time'),
          pic_time: parseNumericField(flight.pic_time, 'pic_time'),
          cross_country_time: parseNumericField(flight.cross_country_time, 'cross_country_time'),
          night_time: parseNumericField(flight.night_time, 'night_time'),
          instrument_time: parseNumericField(flight.instrument_time, 'instrument_time'),
          approaches: flight.approaches?.toString() || '0',
          landings: parseNumericField(flight.landings, 'landings'),
          sic_time: parseNumericField(flight.sic_time, 'sic_time'),
          solo_time: parseNumericField(flight.solo_time, 'solo_time'),
          day_takeoffs: parseNumericField(flight.day_landings, 'day_takeoffs'),
          day_landings: parseNumericField(flight.day_landings, 'day_landings'),
          night_takeoffs: parseNumericField(flight.night_landings, 'night_takeoffs'),
          night_landings: parseNumericField(flight.night_landings, 'night_landings'),
          actual_instrument: parseNumericField(flight.actual_instrument, 'actual_instrument'),
          simulated_instrument: parseNumericField(flight.simulated_instrument, 'simulated_instrument'),
          holds: parseNumericField(flight.holds, 'holds'),
          dual_given: parseNumericField(flight.dual_given, 'dual_given'),
          dual_received: parseNumericField(flight.dual_received, 'dual_received'),
          simulated_flight: 0,
          ground_training: 0,
          route: flight.route?.toString() || null,
          remarks: flight.remarks?.toString() || null,
          start_time: flight.start_time || null,
          end_time: flight.end_time || null,
        };

        // Validate required fields
        const missingFields = [];
        if (!entry.date || entry.date === '') missingFields.push('date');
        if (!entry.aircraft_registration || entry.aircraft_registration.trim() === '') missingFields.push('aircraft_registration');
        if (!entry.aircraft_type || entry.aircraft_type.trim() === '') missingFields.push('aircraft_type');
        if (!entry.departure_airport || entry.departure_airport.trim() === '') missingFields.push('departure_airport');
        if (!entry.arrival_airport || entry.arrival_airport.trim() === '') missingFields.push('arrival_airport');
        
        if (missingFields.length > 0) {
          console.log(`Skipping flight: Missing ${missingFields.join(', ')} - ${entry.date || 'no date'} ${entry.aircraft_registration || 'no tail'}`)
          failureCount++;
          continue;
        }

        entries.push(entry);
      }

      // Insert valid entries in batch
      if (entries.length > 0) {
        console.log(`Inserting ${entries.length} valid flights from batch`)
        
        const { data, error } = await supabaseClient
          .from('flight_entries')
          .insert(entries)

        if (error) {
          console.error(`Batch insert failed:`, {
            message: error.message,
            code: error.code,
            details: error.details
          })
          failureCount += entries.length;
        } else {
          console.log(`Batch processed successfully: ${entries.length} flights`)
          successCount += entries.length;
          
          if (successCount % 100 === 0) {
            console.log(`Progress: ${successCount} flights processed so far`)
          }
        }
      }

    } catch (batchError) {
      console.error(`Error processing batch:`, batchError.message)
      failureCount += batch.length;
    }

    // Brief delay to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`=== BACKGROUND IMPORT COMPLETED ===`)
  console.log(`Final results: ${successCount} processed, ${failureCount} failed`)
  
  // Query final totals to verify
  try {
    const { data: finalStats, error: statsError } = await supabaseClient
      .from('flight_entries')
      .select('total_time')
      .eq('user_id', userId)
    
    if (!statsError && finalStats) {
      const totalFlightsNow = finalStats.length
      const totalHoursNow = finalStats.reduce((sum, f) => sum + (parseFloat(f.total_time) || 0), 0)
      console.log(`Database now contains ${totalFlightsNow} flights with ${totalHoursNow.toFixed(1)} total hours`)
    }
  } catch (e) {
    console.log(`Could not query final stats: ${e.message}`)
  }
  
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
      message: `Import started for ${flights.length} flights. Processing in background with improved error handling.`
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