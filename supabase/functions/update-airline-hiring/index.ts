import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to check if airline is hiring by scraping their careers page
async function checkHiringStatus(airlineName: string, applicationUrl: string | null): Promise<boolean> {
  try {
    // If no application URL, we can't check
    if (!applicationUrl) {
      console.log(`[CHECK-HIRING] No application URL for ${airlineName}`);
      return false;
    }

    // Fetch the careers/application page
    const response = await fetch(applicationUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.log(`[CHECK-HIRING] Failed to fetch ${airlineName} careers page: ${response.status}`);
      return false;
    }

    const html = await response.text();
    
    // Common indicators of hiring status
    const hiringIndicators = [
      /now hiring/i,
      /we're hiring/i,
      /we are hiring/i,
      /join our team/i,
      /careers/i,
      /apply now/i,
      /open positions/i,
      /pilot.*opportunit/i,
      /first officer/i,
      /captain.*position/i,
      /pilot.*career/i,
      /hiring.*pilot/i,
      /pilot.*job/i,
    ];

    const notHiringIndicators = [
      /no.*open.*position/i,
      /not.*currently.*hiring/i,
      /closed/i,
      /position.*filled/i,
      /no.*vacancies/i,
      /hiring.*closed/i,
    ];

    // Check for not hiring indicators first
    for (const indicator of notHiringIndicators) {
      if (indicator.test(html)) {
        console.log(`[CHECK-HIRING] ${airlineName} shows not hiring indicators`);
        return false;
      }
    }

    // Check for hiring indicators
    for (const indicator of hiringIndicators) {
      if (indicator.test(html)) {
        console.log(`[CHECK-HIRING] ${airlineName} shows hiring indicators`);
        return true;
      }
    }

    // If page exists and is accessible but no clear indicators,
    // return false (conservative - don't assume hiring)
    console.log(`[CHECK-HIRING] ${airlineName} page accessible but no clear hiring indicators`);
    return false;
  } catch (error) {
    console.error(`[CHECK-HIRING] Error checking hiring status for ${airlineName}:`, error);
    return false;
  }
}

// Airline-specific hiring check functions
// Add custom logic here for airlines that need special handling
const airlineHiringChecks: Record<string, (url: string) => Promise<boolean>> = {
  // Example: 'Delta Air Lines': async (url) => { /* custom logic */ }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use service role key for admin operations
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    console.log("[UPDATE-AIRLINE-HIRING] Function started");

    // Fetch all active airlines
    const { data: airlines, error: fetchError } = await supabaseClient
      .from("airlines")
      .select("id, name, application_url, is_hiring")
      .eq("active", true);

    if (fetchError) {
      throw new Error(`Failed to fetch airlines: ${fetchError.message}`);
    }

    if (!airlines || airlines.length === 0) {
      console.log("[UPDATE-AIRLINE-HIRING] No active airlines found");
      return new Response(JSON.stringify({ message: "No airlines to check", updated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`[UPDATE-AIRLINE-HIRING] Checking ${airlines.length} airlines`);

    let updatedCount = 0;
    const updates: Array<{ id: string; name: string; oldStatus: boolean; newStatus: boolean }> = [];

    // Check each airline's hiring status
    for (const airline of airlines) {
      try {
        // Use airline-specific check if available, otherwise use generic check
        const checkFunction = airlineHiringChecks[airline.name];
        const isHiring = checkFunction
          ? await checkFunction(airline.application_url || "")
          : await checkHiringStatus(airline.name, airline.application_url);

        // Only update if status changed
        if (isHiring !== airline.is_hiring) {
          const { error: updateError } = await supabaseClient
            .from("airlines")
            .update({ 
              is_hiring: isHiring,
              updated_at: new Date().toISOString()
            })
            .eq("id", airline.id);

          if (updateError) {
            console.error(`[UPDATE-AIRLINE-HIRING] Failed to update ${airline.name}:`, updateError);
          } else {
            updatedCount++;
            updates.push({
              id: airline.id,
              name: airline.name,
              oldStatus: airline.is_hiring,
              newStatus: isHiring,
            });
            console.log(`[UPDATE-AIRLINE-HIRING] Updated ${airline.name}: ${airline.is_hiring} -> ${isHiring}`);
          }
        } else {
          console.log(`[UPDATE-AIRLINE-HIRING] ${airline.name} status unchanged: ${isHiring}`);
        }

        // Add a small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[UPDATE-AIRLINE-HIRING] Error processing ${airline.name}:`, error);
        // Continue with next airline
      }
    }

    console.log(`[UPDATE-AIRLINE-HIRING] Completed. Updated ${updatedCount} airlines`);

    return new Response(
      JSON.stringify({
        message: "Hiring status update completed",
        totalAirlines: airlines.length,
        updated: updatedCount,
        updates: updates,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[UPDATE-AIRLINE-HIRING] ERROR:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

