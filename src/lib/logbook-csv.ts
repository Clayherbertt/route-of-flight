import Papa from "papaparse";

export interface FlightPayload {
  date: string;
  aircraft_registration: string;
  aircraft_type: string;
  departure_airport: string;
  arrival_airport: string;
  total_time: number;
  pic_time?: number;
  sic_time?: number;
  solo_time?: number;
  night_time?: number;
  cross_country_time?: number;
  instrument_time?: number;
  actual_instrument?: number;
  simulated_instrument?: number;
  holds?: number;
  landings?: number;
  day_takeoffs?: number;
  day_landings?: number;
  night_takeoffs?: number;
  night_landings?: number;
  day_landings_full_stop?: number;
  night_landings_full_stop?: number;
  approaches?: number;
  dual_given?: number;
  dual_received?: number;
  simulated_flight?: number;
  ground_training?: number;
  route?: string;
  remarks?: string;
  time_out?: string;
  time_off?: string;
  time_on?: string;
  time_in?: string;
  on_duty?: string;
  off_duty?: string;
  start_time?: string;
  end_time?: string;
  hobbs_start?: number;
  hobbs_end?: number;
  tach_start?: number;
  tach_end?: number;
}

export interface ParseLogbookCsvResult {
  flights: FlightPayload[];
  warnings: string[];
}

type FieldMap = Partial<Record<keyof FlightPayload, string>>;

interface FieldMatcher {
  key: keyof FlightPayload;
  aliases: string[];
}

const REQUIRED_FIELDS: Array<keyof FlightPayload> = [
  "date",
  "aircraft_registration",
  "departure_airport",
  "arrival_airport",
  "total_time",
];

const FIELD_MATCHERS: FieldMatcher[] = [
  { key: "date", aliases: ["date", "flight date", "log date"] },
  {
    key: "aircraft_registration",
    aliases: ["aircraft", "aircraft registration", "registration", "tail number", "tailnumber", "aircraft id"],
  },
  {
    key: "aircraft_type",
    aliases: ["type", "aircraft type", "model"],
  },
  {
    key: "departure_airport",
    aliases: ["from", "from airport", "departure", "origin", "origin airport"],
  },
  {
    key: "arrival_airport",
    aliases: ["to", "to airport", "arrival", "destination", "destination airport"],
  },
  {
    key: "route",
    aliases: ["route", "flight path"],
  },
  {
    key: "total_time",
    aliases: ["total time", "totaltime", "flight time", "duration", "block time"],
  },
  { key: "pic_time", aliases: ["pic", "pilot in command", "pic time"] },
  { key: "sic_time", aliases: ["sic", "co pilot", "sic time"] },
  { key: "solo_time", aliases: ["solo", "solo time"] },
  { key: "night_time", aliases: ["night", "night time"] },
  { key: "cross_country_time", aliases: ["cross country", "xc", "cross country time"] },
  { key: "instrument_time", aliases: ["instrument", "instrument time"] },
  { key: "actual_instrument", aliases: ["actual instrument"] },
  { key: "simulated_instrument", aliases: ["simulated instrument", "hood", "hood time"] },
  { key: "approaches", aliases: ["approaches", "approach count"] },
  { key: "landings", aliases: ["landings", "all landings", "landings total"] },
  { key: "day_takeoffs", aliases: ["day takeoffs"] },
  { key: "day_landings", aliases: ["day landings"] },
  { key: "night_takeoffs", aliases: ["night takeoffs"] },
  { key: "night_landings", aliases: ["night landings"] },
  { key: "day_landings_full_stop", aliases: ["day landings full stop"] },
  { key: "night_landings_full_stop", aliases: ["night landings full stop"] },
  { key: "dual_given", aliases: ["dual given"] },
  { key: "dual_received", aliases: ["dual received"] },
  { key: "simulated_flight", aliases: ["simulated flight", "sim"] },
  { key: "ground_training", aliases: ["ground training", "ground"] },
  { key: "holds", aliases: ["holds"] },
  { key: "remarks", aliases: ["remarks", "comments", "notes", "pilot comments"] },
  { key: "time_out", aliases: ["time out", "timeout"] },
  { key: "time_off", aliases: ["time off", "timeoff", "departure time"] },
  { key: "time_on", aliases: ["time on", "arrival time"] },
  { key: "time_in", aliases: ["time in", "timein"] },
  { key: "on_duty", aliases: ["on duty", "onduty"] },
  { key: "off_duty", aliases: ["off duty", "offduty"] },
  { key: "start_time", aliases: ["start time"] },
  { key: "end_time", aliases: ["end time"] },
  { key: "hobbs_start", aliases: ["hobbs start"] },
  { key: "hobbs_end", aliases: ["hobbs end"] },
  { key: "tach_start", aliases: ["tach start"] },
  { key: "tach_end", aliases: ["tach end"] },
];

const WARNING_LIMIT = 25;

export function parseLogbookCsv(text: string): ParseLogbookCsvResult {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const trimmed = normalized.trim();
  if (!trimmed) {
    return { flights: [], warnings: [] };
  }

  const csvPayload = extractRelevantCsvSection(normalized);

  const parsed = Papa.parse<Record<string, string>>(csvPayload, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header?.trim() ?? "",
    transform: (value) => (typeof value === "string" ? value.trim() : value),
    dynamicTyping: false,
  });

  const headers = (parsed.meta.fields ?? []).filter(Boolean) as string[];
  if (headers.length === 0) {
    return { flights: [], warnings: [] };
  }

  const fieldMap = buildFieldMap(headers);
  const hasRequiredFields = REQUIRED_FIELDS.every((field) => fieldMap[field]);
  if (!hasRequiredFields) {
    return { flights: [], warnings: [] };
  }

  const warnings: string[] = [];

  const nonEmptyRows = parsed.data.filter((row) => {
    if (!row) return false;
    return Object.values(row).some((value) => {
      if (value === null || value === undefined) return false;
      const trimmed = value.toString().trim();
      return trimmed.length > 0;
    });
  });

  const flights: FlightPayload[] = nonEmptyRows
    .map((row, index) => {
      const lineNumber = index + 2; // account for header row

      const rawDate = getValue(row, fieldMap, "date");
      const normalizedDate = normalizeDate(rawDate);
      if (!normalizedDate) {
        registerWarning(warnings, `Row ${lineNumber}: invalid date "${rawDate}"`);
        return null;
      }

      const registration = getValue(row, fieldMap, "aircraft_registration");
      if (!registration) {
        registerWarning(warnings, `Row ${lineNumber}: missing aircraft registration`);
        return null;
      }

      const departure = getValue(row, fieldMap, "departure_airport");
      if (!departure) {
        registerWarning(warnings, `Row ${lineNumber}: missing departure airport`);
        return null;
      }

      const arrival = getValue(row, fieldMap, "arrival_airport");
      if (!arrival) {
        registerWarning(warnings, `Row ${lineNumber}: missing arrival airport`);
        return null;
      }

      const totalRaw = getValue(row, fieldMap, "total_time");
      let totalTime = parseNumeric(totalRaw);
      if (totalTime === undefined || totalTime <= 0) {
        totalTime = deriveTotalTimeFromRow(row, fieldMap);
      }
      if (totalTime === undefined || totalTime <= 0) {
        registerWarning(warnings, `Row ${lineNumber}: invalid total time "${totalRaw}"`);
        return null;
      }

      const flight: FlightPayload = {
        date: normalizedDate,
        aircraft_registration: registration,
        aircraft_type: getValue(row, fieldMap, "aircraft_type") || registration,
        departure_airport: departure,
        arrival_airport: arrival,
        total_time: Number(totalTime.toFixed(2)),
      };

      assignOptionalNumber(row, fieldMap, flight, "pic_time");
      assignOptionalNumber(row, fieldMap, flight, "sic_time");
      assignOptionalNumber(row, fieldMap, flight, "solo_time");
      assignOptionalNumber(row, fieldMap, flight, "night_time");
      assignOptionalNumber(row, fieldMap, flight, "cross_country_time");
      assignOptionalNumber(row, fieldMap, flight, "instrument_time");
      assignOptionalNumber(row, fieldMap, flight, "actual_instrument");
      assignOptionalNumber(row, fieldMap, flight, "simulated_instrument");
      assignOptionalNumber(row, fieldMap, flight, "dual_given");
      assignOptionalNumber(row, fieldMap, flight, "dual_received");
      assignOptionalNumber(row, fieldMap, flight, "simulated_flight");
      assignOptionalNumber(row, fieldMap, flight, "ground_training");
      assignOptionalNumber(row, fieldMap, flight, "holds");
      assignOptionalNumber(row, fieldMap, flight, "day_takeoffs");
      assignOptionalNumber(row, fieldMap, flight, "day_landings");
      assignOptionalNumber(row, fieldMap, flight, "night_takeoffs");
      assignOptionalNumber(row, fieldMap, flight, "night_landings");
      assignOptionalNumber(row, fieldMap, flight, "day_landings_full_stop");
      assignOptionalNumber(row, fieldMap, flight, "night_landings_full_stop");

      assignOptionalInteger(row, fieldMap, flight, "approaches");
      assignOptionalInteger(row, fieldMap, flight, "landings");

      assignOptionalString(row, fieldMap, flight, "route");
      assignOptionalString(row, fieldMap, flight, "remarks");
      assignOptionalString(row, fieldMap, flight, "time_out");
      assignOptionalString(row, fieldMap, flight, "time_off");
      assignOptionalString(row, fieldMap, flight, "time_on");
      assignOptionalString(row, fieldMap, flight, "time_in");
      assignOptionalString(row, fieldMap, flight, "on_duty");
      assignOptionalString(row, fieldMap, flight, "off_duty");
      assignOptionalString(row, fieldMap, flight, "start_time");
      assignOptionalString(row, fieldMap, flight, "end_time");

      assignOptionalNumber(row, fieldMap, flight, "hobbs_start");
      assignOptionalNumber(row, fieldMap, flight, "hobbs_end");
      assignOptionalNumber(row, fieldMap, flight, "tach_start");
      assignOptionalNumber(row, fieldMap, flight, "tach_end");

      enhanceDerivedValues(flight, row);

      return flight;
    })
    .filter((flight): flight is FlightPayload => flight !== null);

  if (flights.length === 0) {
    return { flights: [], warnings: [] };
  }

  return { flights, warnings };
}

function buildFieldMap(headers: string[]): FieldMap {
  const map: FieldMap = {};
  headers.forEach((header) => {
    const normalized = normalizeHeader(header);
    const matcher = FIELD_MATCHERS.find(
      (candidate) =>
        candidate.aliases.some((alias) => normalizeHeader(alias) === normalized) &&
        !map[candidate.key]
    );
    if (matcher) {
      map[matcher.key] = header;
    }
  });
  return map;
}

function normalizeHeader(value: string): string {
  return value
    .replace(/[_/-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getValue(
  row: Record<string, unknown>,
  fieldMap: FieldMap,
  key: keyof FlightPayload
): string {
  const header = fieldMap[key];
  if (!header) return "";
  const value = row[header];
  if (value === null || value === undefined) return "";
  return value.toString().trim();
}

function normalizeDate(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (match) {
    const [, firstRaw, secondRaw, yearRaw] = match;
    let first = Number.parseInt(firstRaw, 10);
    let second = Number.parseInt(secondRaw, 10);
    let year = Number.parseInt(yearRaw, 10);

    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }

    if (first > 12) {
      [first, second] = [second, first];
    }

    if (first >= 1 && first <= 12 && second >= 1 && second <= 31) {
      const date = new Date(Date.UTC(year, first - 1, second));
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
      }
    }
  }

  const compact = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) {
    const year = Number.parseInt(compact[1], 10);
    const month = Number.parseInt(compact[2], 10);
    const day = Number.parseInt(compact[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const date = new Date(Date.UTC(year, month - 1, day));
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
      }
    }
  }

  return null;
}

function extractRelevantCsvSection(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("flights table")) {
    const sectionStart = lower.indexOf("flights table");
    const flightsSection = text.slice(sectionStart);
    const lines = flightsSection.split(/\n/);
    const headerIndex = lines.findIndex((line) =>
      line.trim().toLowerCase().startsWith("date,")
    );
    if (headerIndex !== -1) {
      return lines.slice(headerIndex).join("\n");
    }
  }
  return text;
}

function getHeaderForField(
  row: Record<string, unknown>,
  fieldMap: FieldMap,
  key: keyof FlightPayload
): string | undefined {
  if (fieldMap[key]) {
    return fieldMap[key];
  }

  const matcher = FIELD_MATCHERS.find((candidate) => candidate.key === key);
  const aliasSources = matcher ? matcher.aliases : [];
  const normalizedAliases = new Set(
    [...aliasSources, String(key)].map((alias) => normalizeHeader(alias))
  );

  return Object.keys(row).find((header) =>
    normalizedAliases.has(normalizeHeader(header))
  );
}

function valueFromHeader(row: Record<string, unknown>, header?: string): string {
  if (!header) return "";
  const value = row[header];
  if (value === null || value === undefined) return "";
  return value.toString().trim();
}

function getCellValue(
  row: Record<string, unknown>,
  fieldMap: FieldMap,
  key: keyof FlightPayload
): string {
  return valueFromHeader(row, getHeaderForField(row, fieldMap, key));
}

function parseNumeric(value: string): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed === "-" || trimmed === "--") return undefined;

  const hhmm = trimmed.match(/^(-?\d{1,2}):([0-5]?\d)$/);
  if (hhmm) {
    const hours = Number.parseInt(hhmm[1], 10);
    const minutes = Number.parseInt(hhmm[2], 10);
    if (Number.isFinite(hours) && Number.isFinite(minutes)) {
      return Number((hours + minutes / 60).toFixed(2));
    }
  }

  const normalized = trimmed.replace(/,/g, "");
  const parsed = Number.parseFloat(normalized);
  if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
    return Number(parsed.toFixed(2));
  }

  return undefined;
}

function parseInteger(value: string): number | undefined {
  const numeric = parseNumeric(value);
  if (numeric === undefined) return undefined;
  const rounded = Math.round(numeric);
  return Number.isFinite(rounded) ? rounded : undefined;
}

function assignOptionalNumber(
  row: Record<string, unknown>,
  fieldMap: FieldMap,
  target: FlightPayload,
  key: keyof FlightPayload
) {
  const header = getHeaderForField(row, fieldMap, key);
  if (!header) return;
  const raw = row[header];
  const value =
    typeof raw === "number"
      ? Number(raw.toFixed(2))
      : parseNumeric(raw?.toString() ?? "");
  if (value === undefined) return;
  (target as Record<string, unknown>)[key] = value;
}

function assignOptionalInteger(
  row: Record<string, unknown>,
  fieldMap: FieldMap,
  target: FlightPayload,
  key: keyof FlightPayload
) {
  const header = getHeaderForField(row, fieldMap, key);
  if (!header) return;
  const raw = row[header];
  const value = parseInteger(raw?.toString() ?? "");
  if (value === undefined) return;
  (target as Record<string, unknown>)[key] = value;
}

function assignOptionalString(
  row: Record<string, unknown>,
  fieldMap: FieldMap,
  target: FlightPayload,
  key: keyof FlightPayload
) {
  const header = getHeaderForField(row, fieldMap, key);
  if (!header) return;
  const raw = row[header];
  if (raw === null || raw === undefined) return;
  const value = raw.toString().trim();
  if (!value) return;
  (target as Record<string, unknown>)[key] = value;
}

function deriveTotalTimeFromRow(
  row: Record<string, unknown>,
  fieldMap: FieldMap
): number | undefined {
  const durationFromTimes = calculateDurationFromTimes(
    getCellValue(row, fieldMap, "time_out"),
    getCellValue(row, fieldMap, "time_in")
  );
  if (durationFromTimes !== undefined && durationFromTimes > 0) {
    return durationFromTimes;
  }

  const candidates: number[] = [];

  const hobbsStart = parseNumeric(getCellValue(row, fieldMap, "hobbs_start"));
  const hobbsEnd = parseNumeric(getCellValue(row, fieldMap, "hobbs_end"));
  if (
    hobbsStart !== undefined &&
    hobbsEnd !== undefined &&
    hobbsEnd > hobbsStart
  ) {
    candidates.push(Number((hobbsEnd - hobbsStart).toFixed(2)));
  }

  const tachStart = parseNumeric(getCellValue(row, fieldMap, "tach_start"));
  const tachEnd = parseNumeric(getCellValue(row, fieldMap, "tach_end"));
  if (
    tachStart !== undefined &&
    tachEnd !== undefined &&
    tachEnd > tachStart
  ) {
    candidates.push(Number((tachEnd - tachStart).toFixed(2)));
  }

  const timeFields: Array<keyof FlightPayload> = [
    "pic_time",
    "sic_time",
    "solo_time",
    "night_time",
    "cross_country_time",
    "instrument_time",
    "actual_instrument",
    "simulated_instrument",
    "dual_given",
    "dual_received",
    "simulated_flight",
    "ground_training",
  ];

  timeFields.forEach((field) => {
    const value = parseNumeric(getCellValue(row, fieldMap, field));
    if (value !== undefined && value > 0 && value <= 48) {
      candidates.push(value);
    }
  });

  if (candidates.length === 0) {
    candidates.push(...extractTimeCandidates(row));
  }

  if (candidates.length === 0) {
    return undefined;
  }

  const best = Math.max(...candidates);
  if (!Number.isFinite(best) || best <= 0) {
    return undefined;
  }

  return Number(best.toFixed(2));
}

function calculateDurationFromTimes(
  timeOut: string,
  timeIn: string
): number | undefined {
  if (!timeOut || !timeIn) return undefined;

  const toMinutes = (value: string): number | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const colonParts = trimmed.split(":");
    if (colonParts.length >= 2) {
      const hours = Number.parseInt(colonParts[0] ?? "", 10);
      const minutes = Number.parseInt(colonParts[1] ?? "", 10);
      if (Number.isFinite(hours) && Number.isFinite(minutes)) {
        return hours * 60 + minutes;
      }
    }

    const decimal = Number.parseFloat(trimmed);
    if (Number.isFinite(decimal)) {
      return Math.round(decimal * 60);
    }

    return undefined;
  };

  const outMinutes = toMinutes(timeOut);
  const inMinutes = toMinutes(timeIn);
  if (outMinutes === undefined || inMinutes === undefined) return undefined;

  let duration = inMinutes - outMinutes;
  if (duration < 0) {
    duration += 24 * 60;
  }

  if (duration <= 0) {
    return undefined;
  }

  return Number((duration / 60).toFixed(2));
}

function enhanceDerivedValues(
  flight: FlightPayload,
  row: Record<string, unknown>
) {
  if (!flight.approaches || flight.approaches <= 0) {
    const approaches = countApproachValues(row);
    if (approaches > 0) {
      flight.approaches = approaches;
    }
  }

  if (!flight.landings || flight.landings <= 0) {
    const landings = extractLandingValue(row);
    if (landings !== undefined) {
      flight.landings = landings;
    }
  }

  if (!flight.total_time || flight.total_time <= 0) {
    const candidates = extractTimeCandidates(row);
    if (candidates.length > 0) {
      const best = Math.max(...candidates);
      if (Number.isFinite(best) && best > 0) {
        flight.total_time = Number(best.toFixed(2));
      }
    }
  }
}

function countApproachValues(row: Record<string, unknown>): number {
  return Object.entries(row).reduce((count, [header, value]) => {
    if (value === null || value === undefined) return count;
    const trimmed = value.toString().trim();
    if (!trimmed) return count;
    const normalizedHeader = normalizeHeader(header);
    if (!normalizedHeader.startsWith("approach")) return count;
    return count + 1;
  }, 0);
}

const LANDING_HEADERS = new Set([
  "landings",
  "all landings",
  "total landings",
  "all landings total",
  "total all landings",
]);

function extractLandingValue(row: Record<string, unknown>): number | undefined {
  let best: number | undefined;
  Object.entries(row).forEach(([header, value]) => {
    if (value === null || value === undefined) return;
    const normalizedHeader = normalizeHeader(header);
    if (!LANDING_HEADERS.has(normalizedHeader)) return;
    const parsed = parseNumeric(value.toString());
    if (parsed === undefined || parsed <= 0) return;
    best = best === undefined ? parsed : Math.max(best, parsed);
  });
  return best;
}

function extractTimeCandidates(row: Record<string, unknown>): number[] {
  const keywords =
    /(total|time|pic|sic|solo|night|cross|instrument|dual|sim|ground|hobbs|tach)/i;
  const candidates: number[] = [];
  Object.entries(row).forEach(([header, value]) => {
    if (value === null || value === undefined) return;
    const trimmed = value.toString().trim();
    if (!trimmed || trimmed === "-" || trimmed === "--") return;
    const normalizedHeader = normalizeHeader(header);
    if (!keywords.test(normalizedHeader)) return;
    const parsed = parseNumeric(trimmed);
    if (parsed !== undefined && parsed > 0 && parsed <= 48) {
      candidates.push(parsed);
    }
  });
  return candidates;
}

function registerWarning(warnings: string[], warning: string) {
  if (warnings.length >= WARNING_LIMIT) return;
  warnings.push(warning);
}
