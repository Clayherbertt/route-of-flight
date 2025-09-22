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
  let rejectedFlights: any[] = [];
  const batchSize = 10; // Much smaller batches to prevent timeouts
  
  // Parse numeric fields with better error handling
  const parseNumericField = (value: any, fieldName: string, defaultValue: number = 0): number => {
    if (value === undefined || value === null || value === '' || value === 'null' || value === 'undefined') {
      return defaultValue;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      console.log(`Invalid ${fieldName} value "${value}", using ${defaultValue}`)
      return defaultValue;
    }
    return parsed;
  };
  
  // Enhanced logging to track rejected flights
  const logRejectedFlight = (flight: any, reason: string) => {
    rejectedFlights.push({ flight, reason });
    console.log(`REJECTED FLIGHT: ${reason}`, {
      date: flight.date,
      aircraft: flight.aircraft_registration,
      total_time: flight.total_time
    });
  };
  
  // Process flights in smaller batches
  for (let i = 0; i < flights.length; i += batchSize) {
    const batch = flights.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(flights.length / batchSize)} (flights ${i + 1}-${i + batch.length})`)

    try {
      // Prepare batch entries
      const entries = [];
      for (const flight of batch) {
        // Log the flight data for debugging
        console.log(`Processing flight: date=${flight.date}, reg=${flight.aircraft_registration}, total_time=${flight.total_time}`)
        
        // Very lenient validation - only require date
        if (!flight.date || flight.date === '' || flight.date === 'null' || flight.date === 'undefined') {
          logRejectedFlight(flight, 'No date provided');
          failureCount++;
          continue;
        }

        const entry = {
          user_id: userId,
          date: flight.date,
          aircraft_registration: flight.aircraft_registration?.toString().trim() || 'UNKNOWN',
          aircraft_type: flight.aircraft_type?.toString().trim() || flight.aircraft_registration?.toString().trim() || 'UNKNOWN',
          departure_airport: flight.departure_airport?.toString().trim() || 'UNKN',
          arrival_airport: flight.arrival_airport?.toString().trim() || 'UNKN',
          total_time: parseNumericField(flight.total_time, 'total_time'),
          pic_time: parseNumericField(flight.pic_time, 'pic_time'),
          cross_country_time: parseNumericField(flight.cross_country_time, 'cross_country_time'),
          night_time: parseNumericField(flight.night_time, 'night_time'),
          instrument_time: parseNumericField(flight.instrument_time, 'instrument_time'),
          approaches: flight.approaches?.toString() || '0',
          landings: parseNumericField(flight.landings, 'landings'),
          sic_time: parseNumericField(flight.sic_time, 'sic_time'),
          solo_time: parseNumericField(flight.solo_time, 'solo_time'),
          day_takeoffs: parseNumericField(flight.day_takeoffs, 'day_takeoffs'),
          day_landings: parseNumericField(flight.day_landings, 'day_landings'),
          night_takeoffs: parseNumericField(flight.night_takeoffs, 'night_takeoffs'),
          night_landings: parseNumericField(flight.night_landings, 'night_landings'),
          actual_instrument: parseNumericField(flight.actual_instrument, 'actual_instrument'),
          simulated_instrument: parseNumericField(flight.simulated_instrument, 'simulated_instrument'),
          holds: parseNumericField(flight.holds, 'holds'),
          dual_given: parseNumericField(flight.dual_given, 'dual_given'),
          dual_received: parseNumericField(flight.dual_received, 'dual_received'),
          simulated_flight: parseNumericField(flight.simulated_flight, 'simulated_flight'),
          ground_training: parseNumericField(flight.ground_training, 'ground_training'),
          route: flight.route?.toString() || null,
          remarks: flight.remarks?.toString() || null,
          start_time: flight.start_time || null,
          end_time: flight.end_time || null,
        };

        // Always add the flight - only skip if no date
        entries.push(entry);
      }

      // Insert valid entries in batch
      if (entries.length > 0) {
        console.log(`Inserting ${entries.length} valid flights from batch`)
        
        // Use upsert to handle duplicates gracefully - will update existing records
        const { data, error } = await supabaseClient
          .from('flight_entries')
          .upsert(entries, { 
            onConflict: 'user_id,date,aircraft_registration,departure_airport,arrival_airport',
            ignoreDuplicates: false 
          })

        if (error) {
          console.error(`Batch insert failed:`, error.message)
          console.error(`Full error details:`, JSON.stringify(error, null, 2))
          
          // Try individual inserts to see which specific records are failing
          console.log(`Attempting individual inserts for ${entries.length} entries`)
          let individualSuccessCount = 0;
          for (const singleEntry of entries) {
            try {
              const { error: singleError } = await supabaseClient
                .from('flight_entries')
                .upsert([singleEntry], { 
                  onConflict: 'user_id,date,aircraft_registration,departure_airport,arrival_airport',
                  ignoreDuplicates: false 
                })
              
              if (singleError) {
                console.error(`Individual insert failed for flight ${singleEntry.date} ${singleEntry.aircraft_registration}:`, singleError.message)
                failureCount++;
              } else {
                individualSuccessCount++;
              }
            } catch (e) {
              console.error(`Exception during individual insert:`, e.message)
              failureCount++;
            }
          }
          successCount += individualSuccessCount;
          console.log(`Individual inserts: ${individualSuccessCount} succeeded out of ${entries.length}`)
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
  
  // Log detailed rejection analysis
  if (rejectedFlights.length > 0) {
    console.log(`=== REJECTED FLIGHTS ANALYSIS ===`)
    console.log(`Total rejected: ${rejectedFlights.length}`)
    
    const rejectionReasons = rejectedFlights.reduce((acc, { reason }) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Rejection reasons:', rejectionReasons);
    
    // Show sample rejected flights
    console.log('Sample rejected flights:', rejectedFlights.slice(0, 5).map(({ flight, reason }) => ({
      reason,
      date: flight.date,
      aircraft: flight.aircraft_registration,
      total_time: flight.total_time
    })));
  }
  
  // Query final totals to verify
  try {
    const { data: finalStats, error: statsError } = await supabaseClient
      .from('flight_entries')
      .select('total_time')
      .eq('user_id', userId)
    
    if (!statsError && finalStats) {
      const totalFlightsNow = finalStats.length;
      const totalHoursNow = finalStats.reduce((sum, f) => sum + (parseFloat(f.total_time) || 0), 0);
      console.log(`Database now contains ${totalFlightsNow} flights with ${totalHoursNow.toFixed(1)} total hours`)
      
      // Calculate expected vs actual
      const expectedTotal = flights.reduce((sum, f) => sum + (parseFloat(f.total_time) || 0), 0);
      const difference = expectedTotal - totalHoursNow;
      if (Math.abs(difference) > 0.1) {
        console.log(`HOURS MISMATCH: Expected ${expectedTotal.toFixed(1)}, got ${totalHoursNow.toFixed(1)}, difference: ${difference.toFixed(1)}`);
      }
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

    // Validate authentication header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization token. Please sign in and try again.', success: 0, failed: flights.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const jwt = authHeader.replace('Bearer ', '')
    console.log('JWT token received, length:', jwt.length)
    
    // Create authenticated client with the user's token
    const authenticatedClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )
    
    // Get the authenticated user - this validates the JWT and extracts user info
    console.log('Getting authenticated user...')
    const { data: { user }, error: userError } = await authenticatedClient.auth.getUser(jwt)
    
    if (!user || userError) {
      console.error('Authentication failed:', userError)
      return new Response(
        JSON.stringify({ 
          error: 'User authentication failed. Please sign out and sign in again.', 
          details: userError?.message,
          success: 0, 
          failed: flights.length 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    const userId = user.id
    console.log('Authenticated user ID:', userId, 'Email:', user.email)

    // Process flights synchronously to provide accurate results
    console.log('Starting flight import process...')
    const result = await processFlightImport(flights, userId, supabaseClient)
    
    // Add message with actual results
    result.message = `Import completed: ${result.success} flights imported successfully, ${result.failed} flights failed.`;

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