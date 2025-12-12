import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use the service role key to perform admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the user making the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !requestingUser) {
      throw new Error("Authentication failed");
    }

    // Check if requesting user is an admin
    const { data: adminCheck } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .single();

    if (!adminCheck) {
      return new Response(
        JSON.stringify({ error: "Only administrators can delete users" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403 
        }
      );
    }

    // Get the user ID to delete from request body
    const { userId } = await req.json();
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Delete all user data
    // 1. Delete from subscribers (cancels subscription)
    await supabaseAdmin.from("subscribers").delete().eq("user_id", userId);
    
    // 2. Delete from user_routes
    await supabaseAdmin.from("user_routes").delete().eq("user_id", userId);
    
    // 3. Delete from flight_entries
    await supabaseAdmin.from("flight_entries").delete().eq("user_id", userId);
    
    // 4. Delete from aircraft_logbook
    await supabaseAdmin.from("aircraft_logbook").delete().eq("user_id", userId);
    
    // 5. Delete from user_endorsements (if exists)
    try {
      await supabaseAdmin.from("user_endorsements").delete().eq("user_id", userId);
    } catch (e) {
      // Table might not exist, ignore
    }
    
    // 6. Delete from profiles
    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    
    // 7. Delete from auth.users (this requires admin access)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      throw new Error(`Failed to delete user from auth: ${deleteError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "User and all data deleted successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

