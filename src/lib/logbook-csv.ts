import Papa from "papaparse";

export interface ParsedLogbookFlight {
  date: string;
  aircraft_registration: string;
  aircraft_type?: string;
  departure_airport: string;
  arrival_airport: string;
  route?: string;
  total_time: number;
  pic_time: number;
  sic_time: number;
  dual_given: number;
  dual_received: number;
  solo_time: number;
  night_time: number;
  cross_country_time: number;
  actual_instrument: number;
  simulated_instrument: number;
  simulated_flight: number;
  ground_training: number;
  holds: number;
  approaches: number;
  day_takeoffs: number;
  day_landings: number;
  day_landings_full_stop: number;
  night_takeoffs: number;
  night_landings: number;
  night_landings_full_stop: number;
  remarks?: string;
  sourceRow?: string[];
}

export interface ParseLogbookResult {
  flights: ParsedLogbookFlight[];
  headerRowIndex: number;
  headers: string[];
  warnings: string[];
}

const headerAliases: Record<string, string> = {
  date: "date",
  flightdate: "date",
  aircraftid: "aircraft_registration",
  aircraft: "aircraft_registration",
  aircraftreg: "aircraft_registration",
  tailnumber: "aircraft_registration",
  tail: "aircraft_registration",
  aircrafttype: "aircraft_type",
  type: "aircraft_type",
  model: "aircraft_type",
  from: "departure_airport",
  departure: "departure_airport",
  departureairport: "departure_airport",
  to: "arrival_airport",
  arrival: "arrival_airport",
  arrivalairport: "arrival_airport",
  route: "route",
  routeofflight: "route",
  totaltime: "total_time",
  "total time": "total_time",
  total: "total_time",
  duration: "total_time",
  blocktime: "total_time",
  block: "total_time",
  flighttime: "total_time",
  "flight time": "total_time",
  pic: "pic_time",
  pilotincommand: "pic_time",
  picus: "pic_time",
  sic: "sic_time",
  secondincommand: "sic_time",
  copilot: "sic_time",
  dual: "dual_received",
  dualreceived: "dual_received",
  dualrec: "dual_received",
  dualgiven: "dual_given",
  dualgiv: "dual_given",
  solo: "solo_time",
  night: "night_time",
  nighttime: "night_time",
  crosscountry: "cross_country_time",
  "cross country": "cross_country_time",
  xc: "cross_country_time",
  actualinstrument: "actual_instrument",
  "actual instrument": "actual_instrument",
  actualinst: "actual_instrument",
  simulatedinstrument: "simulated_instrument",
  "simulated instrument": "simulated_instrument",
  siminst: "simulated_instrument",
  simulatedflight: "simulated_flight",
  "simulated flight": "simulated_flight",
  simflight: "simulated_flight",
  groundtraining: "ground_training",
  "ground training": "ground_training",
  holds: "holds",
  alllandings: "landings",
  landings: "landings",
  totallandings: "landings",
  approaches: "approaches",
  daytakeoffs: "day_takeoffs",
  daylandings: "day_landings",
  daylandingsfullstop: "day_landings_full_stop",
  nighttakeoffs: "night_takeoffs",
  nightlandings: "night_landings",
  nightlandingsfullstop: "night_landings_full_stop",
  remarks: "remarks",
  comments: "remarks",
};

const numericFields = new Set<keyof ParsedLogbookFlight>([
  "total_time",
  "pic_time",
  "sic_time",
  "dual_given",
  "dual_received",
  "solo_time",
  "night_time",
  "cross_country_time",
  "actual_instrument",
  "simulated_instrument",
  "simulated_flight",
  "ground_training",
  "holds",
  "approaches",
  "day_takeoffs",
  "day_landings",
  "day_landings_full_stop",
  "night_takeoffs",
  "night_landings",
  "night_landings_full_stop",
]);

const fallbackTimeFields: (keyof ParsedLogbookFlight)[] = [
  "pic_time",
  "sic_time",
  "dual_received",
  "dual_given",
  "solo_time",
  "cross_country_time",
  "night_time",
  "actual_instrument",
  "simulated_instrument",
  "simulated_flight",
  "ground_training",
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "").replace(/_/g, "");
}

function toHours(value: unknown): number {
  if (value === undefined || value === null) return 0;
  const raw = String(value).trim();
  if (!raw || raw.toLowerCase() === "nan" || raw.toLowerCase() === "null") return 0;

  const quoted = raw.replace(/^"+|"+$/g, "");
  const trimmed = quoted.trim();
  if (!trimmed || trimmed.toLowerCase() === "nan") return 0;

  const hhmm = trimmed.match(/^(-?\d{1,2}):([0-5]?\d)$/);
  if (hhmm) {
    const hours = Number(hhmm[1]);
    const minutes = Number(hhmm[2]);
    if (Number.isFinite(hours) && Number.isFinite(minutes)) {
      return Number((hours + minutes / 60).toFixed(2));
    }
  }

  const normalized = trimmed.includes(",") && !trimmed.includes(".")
    ? trimmed.replace(/,/g, ".")
    : trimmed.replace(/,/g, "");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : 0;
}

function findHeaderRow(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 500); i++) {
    if (rows[i].some((cell) => normalize(String(cell ?? "")) === "date")) {
      return i;
    }
  }
  return 0;
}

export function parseLogbookCsv(csvText: string): ParseLogbookResult {
  const { data, errors } = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: "greedy",
  });

  if (errors.length > 0) {
    throw new Error(errors[0].message || "Failed to parse CSV file");
  }

  const rows = (data as string[][]).map((row) => (row ?? []).map((cell) => cell ?? ""));
  if (rows.length === 0) {
    return { flights: [], headerRowIndex: 0, headers: [], warnings: ["No rows detected in CSV"] };
  }

  const headerRowIndex = findHeaderRow(rows);
  const headerRow = rows[headerRowIndex] ?? [];
  const normalizedHeaders = headerRow.map((header) => normalize(header));

  const headerMap: Record<number, keyof ParsedLogbookFlight> = {};
  normalizedHeaders.forEach((header, index) => {
    const mapped = headerAliases[header];
    if (mapped) {
      headerMap[index] = mapped as keyof ParsedLogbookFlight;
    }
  });

  const warnings: string[] = [];
  if (Object.keys(headerMap).length === 0) {
    warnings.push("No recognizable headers were found in the CSV file");
  }

  const dataRows = rows.slice(headerRowIndex + 1);
  const flights: ParsedLogbookFlight[] = [];

  dataRows.forEach((row, rowIndex) => {
    const record: ParsedLogbookFlight = {
      date: "",
      aircraft_registration: "",
      aircraft_type: "",
      departure_airport: "",
      arrival_airport: "",
      route: "",
      total_time: 0,
      pic_time: 0,
      sic_time: 0,
      dual_given: 0,
      dual_received: 0,
      solo_time: 0,
      night_time: 0,
      cross_country_time: 0,
      actual_instrument: 0,
      simulated_instrument: 0,
      simulated_flight: 0,
      ground_training: 0,
      holds: 0,
      approaches: 0,
      day_takeoffs: 0,
      day_landings: 0,
      day_landings_full_stop: 0,
      night_takeoffs: 0,
      night_landings: 0,
      night_landings_full_stop: 0,
      remarks: "",
      sourceRow: row,
    };

    row.forEach((value, index) => {
      const mappedKey = headerMap[index];
      if (!mappedKey) return;

      const isNumeric = numericFields.has(mappedKey);
      if (isNumeric) {
        (record as Record<string, number>)[mappedKey] = toHours(value);
      } else {
        (record as Record<string, string | undefined>)[mappedKey] = value?.toString().trim() ?? "";
      }
    });

    if (!record.date) {
      return;
    }

    if (!record.aircraft_registration) {
      record.aircraft_registration = "Unknown";
    }
    if (!record.departure_airport) {
      record.departure_airport = "UNK";
    }
    if (!record.arrival_airport) {
      record.arrival_airport = record.departure_airport;
    }

    // Promote other time values if total is missing
    if (!record.total_time || record.total_time === 0) {
      const candidates = fallbackTimeFields
        .map((field) => record[field])
        .filter((value) => value && value > 0 && value <= 48) as number[];
      if (candidates.length > 0) {
        record.total_time = Number(Math.max(...candidates).toFixed(2));
        warnings.push(`Row ${headerRowIndex + 1 + rowIndex}: used fallback total time (${record.total_time} hrs)`);
      }
    }

    flights.push(record);
  });

  return {
    flights,
    headerRowIndex,
    headers: headerRow,
    warnings,
  };
}
