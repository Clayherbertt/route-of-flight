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
  
  // Helper function to detect flight data format based on date and content
  const detectFlightFormat = (flight: any): 'modern' | 'legacy2019' | 'legacy2018' => {
    const flightDate = new Date(flight.date);
    const year = flightDate.getFullYear();
    
    if (year >= 2020) return 'modern';
    if (year === 2019) return 'legacy2019'; 
    return 'legacy2018';
  };
  
  // Helper function to calculate flight time from TimeOut/TimeIn
  const calculateFlightTime = (timeOut: string, timeIn: string): number => {
    if (!timeOut || !timeIn) return 0;
    
    try {
      // Parse time strings (assuming format like "HH:MM" or decimal hours)
      const parseTime = (timeStr: string): number => {
        if (timeStr.includes(':')) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours + minutes / 60;
        }
        return parseFloat(timeStr) || 0;
      };
      
      const outTime = parseTime(timeOut);
      const inTime = parseTime(timeIn);
      
      // Handle day rollover
      if (inTime < outTime) {
        return (24 - outTime) + inTime;
      }
      
      return inTime - outTime;
    } catch (e) {
      console.log(`Error calculating flight time from ${timeOut} to ${timeIn}:`, e);
      return 0;
    }
  };

  // Helper function to normalize flight data based on format
  const normalizeFlightData = (flight: any, format: string) => {
    console.log(`Normalizing flight with format ${format}:`, JSON.stringify(flight, null, 2));
    
    const base = {
      date: flight.date,
      aircraft_registration: flight.aircraft_registration || flight.AircraftID,
      aircraft_type: flight.aircraft_type || flight.AircraftID,
      departure_airport: flight.departure_airport || flight.From,
      arrival_airport: flight.arrival_airport || flight.To,
      route: flight.route || flight.Route,
      remarks: flight.remarks || flight.PilotComments,
      start_time: flight.start_time || flight.TimeOut,
      end_time: flight.end_time || flight.TimeIn,
    };

    if (format === 'modern') {
      // Modern format (2020+) - current structure
      return {
        ...base,
        total_time: parseNumericField(flight.total_time || flight.TotalTime, 'total_time'),
        pic_time: parseNumericField(flight.pic_time || flight.PIC, 'pic_time'),
        sic_time: parseNumericField(flight.sic_time || flight.SIC, 'sic_time'),
        cross_country_time: parseNumericField(flight.cross_country_time || flight.CrossCountry, 'cross_country_time'),
        night_time: parseNumericField(flight.night_time || flight.Night, 'night_time'),
        instrument_time: parseNumericField(flight.instrument_time || flight.IFR, 'instrument_time'),
        actual_instrument: parseNumericField(flight.actual_instrument || flight.ActualInstrument, 'actual_instrument'),
        simulated_instrument: parseNumericField(flight.simulated_instrument || flight.SimulatedInstrument, 'simulated_instrument'),
        solo_time: parseNumericField(flight.solo_time || flight.Solo, 'solo_time'),
        dual_given: parseNumericField(flight.dual_given || flight.DualGiven, 'dual_given'),
        dual_received: parseNumericField(flight.dual_received || flight.DualReceived, 'dual_received'),
        holds: parseNumericField(flight.holds || flight.Holds, 'holds'),
        approaches: (flight.approaches || flight.Approach1 || '0').toString(),
        landings: parseNumericField(flight.landings || flight.AllLandings, 'landings'),
        day_takeoffs: parseNumericField(flight.day_takeoffs || flight.DayTakeoffs, 'day_takeoffs'),
        day_landings: parseNumericField(flight.day_landings || flight.DayLandingsFullStop, 'day_landings'),
        night_takeoffs: parseNumericField(flight.night_takeoffs || flight.NightTakeoffs, 'night_takeoffs'),
        night_landings: parseNumericField(flight.night_landings || flight.NightLandingsFullStop, 'night_landings'),
        simulated_flight: parseNumericField(flight.simulated_flight || flight.SimulatedFlight, 'simulated_flight'),
        ground_training: parseNumericField(flight.ground_training || flight.GroundTraining, 'ground_training'),
      };
    } else if (format === 'legacy2019') {
      // 2019 format - may have different column structure
      const totalTime = parseNumericField(flight.TotalTime, 'total_time');
      const picTime = parseNumericField(flight.PIC, 'pic_time'); 
      const sicTime = parseNumericField(flight.SIC, 'sic_time');
      const dualReceived = parseNumericField(flight.DualReceived, 'dual_received');
      
      return {
        ...base,
        total_time: totalTime,
        pic_time: picTime,
        sic_time: sicTime,
        cross_country_time: parseNumericField(flight.CrossCountry, 'cross_country_time'),
        night_time: parseNumericField(flight.Night, 'night_time'),
        instrument_time: parseNumericField(flight.IFR, 'instrument_time'),
        actual_instrument: parseNumericField(flight.ActualInstrument, 'actual_instrument'),
        simulated_instrument: parseNumericField(flight.SimulatedInstrument, 'simulated_instrument'),
        solo_time: parseNumericField(flight.Solo, 'solo_time'),
        dual_given: parseNumericField(flight.DualGiven, 'dual_given'),
        dual_received: dualReceived,
        holds: parseNumericField(flight.Holds, 'holds'),
        approaches: (flight.Approach1 || '0').toString(),
        landings: parseNumericField(flight.AllLandings || flight.DayLandingsFullStop, 'landings'),
        day_takeoffs: parseNumericField(flight.DayTakeoffs, 'day_takeoffs'),
        day_landings: parseNumericField(flight.DayLandingsFullStop, 'day_landings'),
        night_takeoffs: parseNumericField(flight.NightTakeoffs, 'night_takeoffs'),
        night_landings: parseNumericField(flight.NightLandingsFullStop, 'night_landings'),
        simulated_flight: parseNumericField(flight.SimulatedFlight, 'simulated_flight'),
        ground_training: parseNumericField(flight.GroundTraining, 'ground_training'),
      };
    } else {
      // Legacy 2018 format - enhanced handling
      console.log(`Processing 2018 flight - available fields:`, Object.keys(flight));
      console.log(`Raw flight data:`, flight);
      
      let totalTime = parseNumericField(flight.TotalTime, 'total_time');
      let picTime = parseNumericField(flight.PIC, 'pic_time'); 
      let sicTime = parseNumericField(flight.SIC, 'sic_time');
      const dualReceived = parseNumericField(flight.DualReceived, 'dual_received');
      
      // For 2018 data, try many alternative column names
      if (totalTime === 0) {
        // Try all possible total time column variations
        const totalTimeFields = ['Total', 'Total Time', 'FlightTime', 'Flight Time', 'Duration', 'TotalDuration', 'Time'];
        for (const field of totalTimeFields) {
          const value = parseNumericField(flight[field], 'total_time');
          if (value > 0) {
            totalTime = value;
            console.log(`Found 2018 total time in field '${field}': ${totalTime}`);
            break;
          }
        }
        
        // If still zero, try to calculate from TimeOut/TimeIn
        if (totalTime === 0 && flight.TimeOut && flight.TimeIn) {
          totalTime = calculateFlightTime(flight.TimeOut, flight.TimeIn);
          console.log(`Calculated total time for 2018 flight from ${flight.TimeOut} to ${flight.TimeIn}: ${totalTime}`);
        }
        
        // Check if any numeric value exists in the flight object that could be time
        if (totalTime === 0) {
          console.log(`Still no total time found, checking all numeric fields...`);
          for (const [key, value] of Object.entries(flight)) {
            const numValue = parseFloat(value as string);
            if (!isNaN(numValue) && numValue > 0 && numValue < 24) { // Reasonable flight time
              console.log(`Potential time field '${key}': ${numValue}`);
            }
          }
        }
      }
      
      // Enhanced PIC time detection for 2018
      if (picTime === 0) {
        const picFields = ['PIC', 'PilotInCommand', 'PIC Time', 'Captain', 'P1'];
        for (const field of picFields) {
          const value = parseNumericField(flight[field], 'pic_time');
          if (value > 0) {
            picTime = value;
            console.log(`Found 2018 PIC time in field '${field}': ${picTime}`);
            break;
          }
        }
      }
      
      // For 2018 flights, if we have total time but no PIC/SIC breakdown, assume it's PIC time (solo training)
      if (totalTime > 0 && picTime === 0 && sicTime === 0) {
        picTime = totalTime;
        console.log(`2018 flight: Setting PIC time to total time (${totalTime}) - assuming solo training`);
      }
      
      console.log(`Final 2018 flight times - Total: ${totalTime}, PIC: ${picTime}, SIC: ${sicTime}`);
      
      return {
        ...base,
        total_time: totalTime,
        pic_time: picTime,
        sic_time: sicTime,
        cross_country_time: parseNumericField(flight.CrossCountry || flight['Cross Country'] || flight.XC, 'cross_country_time'),
        night_time: parseNumericField(flight.Night, 'night_time'),
        instrument_time: parseNumericField(flight.IFR || flight.Instrument, 'instrument_time'),
        actual_instrument: parseNumericField(flight.ActualInstrument || flight['Actual Instrument'], 'actual_instrument'),
        simulated_instrument: parseNumericField(flight.SimulatedInstrument || flight['Simulated Instrument'], 'simulated_instrument'),
        solo_time: parseNumericField(flight.Solo, 'solo_time'),
        dual_given: parseNumericField(flight.DualGiven || flight['Dual Given'], 'dual_given'),
        dual_received: dualReceived,
        holds: parseNumericField(flight.Holds, 'holds'),
        approaches: (flight.Approach1 || flight.Approaches || '0').toString(),
        landings: parseNumericField(flight.AllLandings || flight.Landings || flight.DayLandingsFullStop || 1, 'landings'), // Default to 1 if missing
        day_takeoffs: parseNumericField(flight.DayTakeoffs || 1, 'day_takeoffs'), // Default to 1 if missing
        day_landings: parseNumericField(flight.DayLandingsFullStop || flight.DayLandings || 1, 'day_landings'), // Default to 1 if missing
        night_takeoffs: parseNumericField(flight.NightTakeoffs, 'night_takeoffs'),
        night_landings: parseNumericField(flight.NightLandingsFullStop || flight.NightLandings, 'night_landings'),
        simulated_flight: parseNumericField(flight.SimulatedFlight, 'simulated_flight'),
        ground_training: parseNumericField(flight.GroundTraining, 'ground_training'),
      };
    }
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
      // Process flights in smaller batches
      const entries = [];
      for (const flight of batch) {
        // Log the flight data for debugging
        console.log(`Processing flight: date=${flight.date}, reg=${flight.aircraft_registration || flight.AircraftID}`)
        
        // Enhanced validation and logging for failed flights
        if (!flight.date || flight.date === '' || flight.date === 'null' || flight.date === 'undefined') {
          logRejectedFlight(flight, 'Missing date');
          failureCount++;
          continue;
        }

        // Detect flight format and normalize data
        const format = detectFlightFormat(flight);
        const normalizedFlight = normalizeFlightData(flight, format);
        
        console.log(`Flight format: ${format} for date ${flight.date}`);
        
        // Ensure all required fields have valid values from normalized data
        const aircraftReg = normalizedFlight.aircraft_registration?.toString().trim();
        const aircraftType = normalizedFlight.aircraft_type?.toString().trim(); 
        const depAirport = normalizedFlight.departure_airport?.toString().trim();
        const arrAirport = normalizedFlight.arrival_airport?.toString().trim();

        if (!aircraftReg || aircraftReg === '' || aircraftReg === 'null') {
          logRejectedFlight(flight, 'Missing aircraft_registration');
          failureCount++;
          continue;
        }

        if (!depAirport || depAirport === '' || depAirport === 'null') {
          logRejectedFlight(flight, 'Missing departure_airport');
          failureCount++;
          continue;
        }

        // Allow missing arrival airport but log it - use departure airport as fallback
        const finalArrAirport = (!arrAirport || arrAirport === '' || arrAirport === 'null') ? depAirport : arrAirport;
        if (finalArrAirport !== arrAirport) {
          console.log(`Using departure airport as arrival for flight on ${flight.date} with aircraft ${aircraftReg}`);
        }

        const entry = {
          user_id: userId,
          date: normalizedFlight.date,
          aircraft_registration: aircraftReg,
          aircraft_type: aircraftType || aircraftReg, // Fallback to registration if no type
          departure_airport: depAirport,
          arrival_airport: finalArrAirport, // Use the final arrival airport (with fallback)
          total_time: normalizedFlight.total_time,
          pic_time: normalizedFlight.pic_time,
          cross_country_time: normalizedFlight.cross_country_time,
          night_time: normalizedFlight.night_time,
          instrument_time: normalizedFlight.instrument_time,
          approaches: (normalizedFlight.approaches?.toString() || '0').substring(0, 10), // Limit length
          landings: normalizedFlight.landings,
          sic_time: normalizedFlight.sic_time,
          solo_time: normalizedFlight.solo_time,
          day_takeoffs: normalizedFlight.day_takeoffs,
          day_landings: normalizedFlight.day_landings,
          night_takeoffs: normalizedFlight.night_takeoffs,
          night_landings: normalizedFlight.night_landings,
          actual_instrument: normalizedFlight.actual_instrument,
          simulated_instrument: normalizedFlight.simulated_instrument,
          holds: normalizedFlight.holds,
          dual_given: normalizedFlight.dual_given,
          dual_received: normalizedFlight.dual_received,
          simulated_flight: normalizedFlight.simulated_flight,
          ground_training: normalizedFlight.ground_training,
          route: normalizedFlight.route?.toString()?.substring(0, 255) || null, // Limit length
          remarks: normalizedFlight.remarks?.toString()?.substring(0, 1000) || null, // Limit length
          start_time: normalizedFlight.start_time || null,
          end_time: normalizedFlight.end_time || null,
        };

        entries.push(entry);
      }

      // Insert valid entries in batch
      if (entries.length > 0) {
        console.log(`Inserting ${entries.length} valid flights from batch`)
        
        // Use regular INSERT instead of UPSERT to preserve all flights, even apparent duplicates
        const { data, error } = await supabaseClient
          .from('flight_entries')
          .insert(entries)

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
                .insert([singleEntry])
              
              if (singleError) {
                console.error(`Individual insert failed for flight ${singleEntry.date} ${singleEntry.aircraft_registration}:`, singleError.message)
                console.error(`Failed flight data:`, JSON.stringify(singleEntry, null, 2))
                logRejectedFlight(singleEntry, `Database error: ${singleError.message}`);
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