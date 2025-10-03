import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NumericLike = number | string | null | undefined;

type FlightPayload = {
  date: string;
  aircraft_registration: string;
  aircraft_type?: string;
  departure_airport: string;
  arrival_airport: string;
  total_time: NumericLike;
  pic_time?: NumericLike;
  sic_time?: NumericLike;
  solo_time?: NumericLike;
  night_time?: NumericLike;
  cross_country_time?: NumericLike;
  instrument_time?: NumericLike;
  actual_instrument?: NumericLike;
  simulated_instrument?: NumericLike;
  holds?: NumericLike;
  landings?: NumericLike;
  day_takeoffs?: NumericLike;
  day_landings?: NumericLike;
  night_takeoffs?: NumericLike;
  night_landings?: NumericLike;
  day_landings_full_stop?: NumericLike;
  night_landings_full_stop?: NumericLike;
  approaches?: NumericLike;
  dual_given?: NumericLike;
  dual_received?: NumericLike;
  simulated_flight?: NumericLike;
  ground_training?: NumericLike;
  route?: string | null;
  remarks?: string | null;
  time_out?: string | null;
  time_off?: string | null;
  time_on?: string | null;
  time_in?: string | null;
  on_duty?: string | null;
  off_duty?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  hobbs_start?: NumericLike;
  hobbs_end?: NumericLike;
  tach_start?: NumericLike;
  tach_end?: NumericLike;
};

type PreparedFlight = {
  user_id: string;
  date: string;
  aircraft_registration: string;
  aircraft_type: string;
  departure_airport: string;
  arrival_airport: string;
  total_time: number;
  pic_time: number;
  sic_time: number;
  solo_time: number;
  night_time: number;
  cross_country_time: number;
  instrument_time: number;
  actual_instrument: number;
  simulated_instrument: number;
  holds: number;
  landings: number;
  day_takeoffs: number;
  day_landings: number;
  day_landings_full_stop: number;
  night_takeoffs: number;
  night_landings: number;
  night_landings_full_stop: number;
  approaches: string;
  dual_given: number;
  dual_received: number;
  simulated_flight: number;
  ground_training: number;
  route: string | null;
  remarks: string | null;
  time_out: string | null;
  time_off: string | null;
  time_on: string | null;
  time_in: string | null;
  on_duty: string | null;
  off_duty: string | null;
  start_time: string | null;
  end_time: string | null;
  hobbs_start: number;
  hobbs_end: number;
  tach_start: number;
  tach_end: number;
};

const REQUIRED_FIELDS: Array<keyof FlightPayload> = [
  "date",
  "aircraft_registration",
  "departure_airport",
  "arrival_airport",
  "total_time",
];

function stringOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function roundNumber(value: NumericLike): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number(value.toFixed(2));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const normalized = trimmed.replace(/,/g, "");
    const parsed = Number.parseFloat(normalized);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return Number(parsed.toFixed(2));
    }
  }

  return 0;
}

function nonNegative(value: NumericLike): number {
  const rounded = roundNumber(value);
  if (!Number.isFinite(rounded)) return 0;
  return Math.max(0, rounded);
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (match) {
    const [, monthRaw, dayRaw, yearRaw] = match;
    let month = Number.parseInt(monthRaw, 10);
    let day = Number.parseInt(dayRaw, 10);
    let year = Number.parseInt(yearRaw, 10);

    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }

    if (month > 12) {
      [month, day] = [day, month];
    }

    try {
      const normalized = new Date(Date.UTC(year, month - 1, day));
      if (!Number.isNaN(normalized.getTime())) {
        return normalized.toISOString().slice(0, 10);
      }
    } catch (_error) {
      return null;
    }
  }

  return null;
}

function prepareFlight(
  flight: FlightPayload,
  userId: string
): { ok: true; entry: PreparedFlight } | { ok: false; reason: string } {
  const normalizedDate = normalizeDate(flight.date);
  let finalDate = normalizedDate ?? "";

  if (!finalDate && typeof flight.date === "string") {
    const fallback = new Date(flight.date);
    if (!Number.isNaN(fallback.getTime())) {
      finalDate = fallback.toISOString().slice(0, 10);
    }
  }

  if (!finalDate) {
    return { ok: false, reason: "Invalid date" };
  }

  const registrationRaw =
    typeof flight.aircraft_registration === "string"
      ? flight.aircraft_registration.trim()
      : "";
  const typeRaw =
    typeof flight.aircraft_type === "string" ? flight.aircraft_type.trim() : "";
  const departureRaw =
    typeof flight.departure_airport === "string"
      ? flight.departure_airport.trim()
      : "";
  const arrivalRaw =
    typeof flight.arrival_airport === "string" ? flight.arrival_airport.trim() : "";

  const prepared: PreparedFlight = {
    user_id: userId,
    date: finalDate,
    aircraft_registration: registrationRaw,
    aircraft_type: typeRaw || registrationRaw,
    departure_airport: departureRaw,
    arrival_airport: arrivalRaw,
    total_time: nonNegative(flight.total_time),
    pic_time: nonNegative(flight.pic_time),
    sic_time: nonNegative(flight.sic_time),
    solo_time: nonNegative(flight.solo_time),
    night_time: nonNegative(flight.night_time),
    cross_country_time: nonNegative(flight.cross_country_time),
    instrument_time: nonNegative(flight.instrument_time),
    actual_instrument: nonNegative(flight.actual_instrument),
    simulated_instrument: nonNegative(flight.simulated_instrument),
    holds: nonNegative(flight.holds),
    landings: nonNegative(flight.landings),
    day_takeoffs: nonNegative(flight.day_takeoffs),
    day_landings: nonNegative(flight.day_landings),
    day_landings_full_stop: nonNegative(flight.day_landings_full_stop),
    night_takeoffs: nonNegative(flight.night_takeoffs),
    night_landings: nonNegative(flight.night_landings),
    night_landings_full_stop: nonNegative(flight.night_landings_full_stop),
    approaches: String(Math.max(0, Math.round(nonNegative(flight.approaches)))),
    dual_given: nonNegative(flight.dual_given),
    dual_received: nonNegative(flight.dual_received),
    simulated_flight: nonNegative(flight.simulated_flight),
    ground_training: nonNegative(flight.ground_training),
    route: stringOrNull(flight.route),
    remarks: stringOrNull(flight.remarks),
    time_out: stringOrNull(flight.time_out),
    time_off: stringOrNull(flight.time_off),
    time_on: stringOrNull(flight.time_on),
    time_in: stringOrNull(flight.time_in),
    on_duty: stringOrNull(flight.on_duty),
    off_duty: stringOrNull(flight.off_duty),
    start_time: stringOrNull(flight.start_time),
    end_time: stringOrNull(flight.end_time),
    hobbs_start: nonNegative(flight.hobbs_start),
    hobbs_end: nonNegative(flight.hobbs_end),
    tach_start: nonNegative(flight.tach_start),
    tach_end: nonNegative(flight.tach_end),
  };

  if (!prepared.total_time || prepared.total_time === 0) {
    const fallback = deriveTotalFromAncillaryFields(prepared);
    if (fallback !== null) {
      prepared.total_time = fallback;
      console.log('Fallback total time applied', {
        date: prepared.date,
        aircraft: prepared.aircraft_registration,
        total_time: prepared.total_time,
      });
    }
  }

  const totalCandidates = [
    prepared.total_time,
    prepared.pic_time,
    prepared.sic_time,
    prepared.solo_time,
    prepared.dual_given,
    prepared.dual_received,
    prepared.cross_country_time,
    prepared.actual_instrument,
    prepared.simulated_instrument,
    prepared.simulated_flight,
    prepared.ground_training,
  ].filter((value): value is number => typeof value === 'number' && value > 0 && value <= 48);

  if (totalCandidates.length > 0) {
    prepared.total_time = Number(Math.max(...totalCandidates).toFixed(2));
  }

  if (!prepared.total_time || prepared.total_time === 0) {
    console.warn('Prepared flight still zero total time', {
      date: prepared.date,
      aircraft: prepared.aircraft_registration,
    });
  }

  return { ok: true, entry: prepared };
}

function deriveTotalFromAncillaryFields(flight: PreparedFlight): number | null {
  const candidates: number[] = [];

  if (flight.hobbs_start !== null && flight.hobbs_end !== null) {
    const diff = flight.hobbs_end - flight.hobbs_start;
    if (diff > 0) candidates.push(Number(diff.toFixed(2)));
  }

  if (flight.tach_start !== null && flight.tach_end !== null) {
    const diff = flight.tach_end - flight.tach_start;
    if (diff > 0) candidates.push(Number(diff.toFixed(2)));
  }

  [
    flight.pic_time,
    flight.sic_time,
    flight.solo_time,
    flight.dual_given,
    flight.dual_received,
    flight.simulated_flight,
    flight.ground_training,
  ].forEach((value) => {
    if (typeof value === "number" && value > 0) {
      candidates.push(Number(value.toFixed(2)));
    }
  });

  if (candidates.length === 0) {
    return null;
  }

  const maxCandidate = Math.max(...candidates);
  if (!Number.isFinite(maxCandidate) || maxCandidate <= 0) {
    return null;
  }

  return Number(maxCandidate.toFixed(2));
}

function buildResultMessage(success: number, failed: number) {
  if (failed === 0) {
    return `Imported ${success} flights successfully.`;
  }
  if (success === 0) {
    return `Failed to import ${failed} flights.`;
  }
  return `Imported ${success} flights. ${failed} flights failed.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 },
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing bearer token", success: 0, failed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
      );
    }

    const body = await req.json();
    const flights = (body?.flights || []) as FlightPayload[];

    if (!Array.isArray(flights) || flights.length === 0) {
      return new Response(
        JSON.stringify({ error: "No flights provided", success: 0, failed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const serviceClient = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token);

    if (!user || userError) {
      return new Response(
        JSON.stringify({ error: "Invalid token", success: 0, failed: flights.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
      );
    }

    const failures: { index: number; reason: string }[] = [];
    const preparedFlights: Array<{ entry: PreparedFlight; index: number }> = [];

    flights.forEach((flight, index) => {
      const result = prepareFlight(flight, user.id);
      if (result.ok) {
        preparedFlights.push({ entry: result.entry, index });
      } else {
        failures.push({ index, reason: result.reason });
      }
    });

    let successCount = 0;

    if (preparedFlights.length > 0) {
      const { error: bulkError } = await serviceClient
        .from("flight_entries")
        .insert(preparedFlights.map((item) => item.entry));

      if (!bulkError) {
        successCount = preparedFlights.length;
      } else {
        for (const item of preparedFlights) {
          const { error } = await serviceClient
            .from("flight_entries")
            .insert([item.entry]);

          if (error) {
            failures.push({
              index: item.index,
              reason: error.message || "Database error",
            });
          } else {
            successCount += 1;
          }
        }
      }
    }

    const responseBody = {
      success: successCount,
      failed: failures.length,
      message: buildResultMessage(successCount, failures.length),
      failures: failures.slice(0, 20),
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        success: 0,
        failed: 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
