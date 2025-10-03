import { useMemo, useState } from "react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { parseLogbookCsv } from "@/lib/logbook-csv";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

type ImportStep = "upload" | "mapping" | "preview" | "importing" | "complete";
type CsvFormat = "standard";

type CsvRow = Record<string, string> & { __raw?: string[] };

type FlightField = keyof FlightPayload;

interface FieldDefinition {
  key: FlightField;
  label: string;
  required?: boolean;
  type: "string" | "number";
  aliases: string[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const VALIDATION_DISPLAY_LIMIT = 30;

interface ParseResult {
  headers: string[];
  rows: CsvRow[];
  format: CsvFormat;
}

interface FlightPayload {
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

const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    key: "date",
    label: "Date *",
    required: true,
    type: "string",
    aliases: ["date", "flight date", "log date"],
  },
  {
    key: "aircraft_registration",
    label: "Aircraft Registration *",
    required: true,
    type: "string",
    aliases: [
      "aircraft registration",
      "registration",
      "aircraftid",
      "aircraft id",
      "tail number",
      "tailnumber",
      "aircraft",
    ],
  },
  {
    key: "aircraft_type",
    label: "Aircraft Type",
    required: false,
    type: "string",
    aliases: ["type", "aircraft type", "model", "aircraft model", "typecode"],
  },
  {
    key: "departure_airport",
    label: "From (Airport) *",
    required: true,
    type: "string",
    aliases: [
      "from",
      "from airport",
      "departure",
      "departure airport",
      "origin",
      "origin airport",
    ],
  },
  {
    key: "arrival_airport",
    label: "To (Airport) *",
    required: true,
    type: "string",
    aliases: [
      "to",
      "to airport",
      "arrival",
      "arrival airport",
      "destination",
      "destination airport",
    ],
  },
  {
    key: "route",
    label: "Route",
    required: false,
    type: "string",
    aliases: ["route", "flight path"],
  },
  {
    key: "total_time",
    label: "Total Time *",
    required: true,
    type: "number",
    aliases: [
      "total time",
      "total",
      "tot",
      "flight time",
      "duration",
      "block time",
      "totaltime",
      "total_time",
    ],
  },
  {
    key: "pic_time",
    label: "PIC",
    required: false,
    type: "number",
    aliases: ["pic", "pilot in command", "pic time", "p1"],
  },
  {
    key: "sic_time",
    label: "SIC",
    required: false,
    type: "number",
    aliases: ["sic", "second in command", "sic time", "fo", "copilot"],
  },
  {
    key: "solo_time",
    label: "Solo",
    required: false,
    type: "number",
    aliases: ["solo", "solo time"],
  },
  {
    key: "night_time",
    label: "Night",
    required: false,
    type: "number",
    aliases: ["night", "night time"],
  },
  {
    key: "cross_country_time",
    label: "Cross Country",
    required: false,
    type: "number",
    aliases: ["cross country", "xc", "crosscountry"],
  },
  {
    key: "instrument_time",
    label: "Instrument Time",
    required: false,
    type: "number",
    aliases: ["instrument", "ifr", "instrument time"],
  },
  {
    key: "actual_instrument",
    label: "Actual Instrument",
    required: false,
    type: "number",
    aliases: ["actual instrument", "actual ifr", "actual"],
  },
  {
    key: "simulated_instrument",
    label: "Simulated Instrument",
    required: false,
    type: "number",
    aliases: ["simulated instrument", "sim instrument", "simulated ifr"],
  },
  {
    key: "holds",
    label: "Holds",
    required: false,
    type: "number",
    aliases: ["holds", "holding"],
  },
  {
    key: "landings",
    label: "Total Landings",
    required: false,
    type: "number",
    aliases: ["landings", "total landings", "all landings"],
  },
  {
    key: "day_takeoffs",
    label: "Day Takeoffs",
    required: false,
    type: "number",
    aliases: ["day takeoffs", "takeoffs day", "daytakeoffs"],
  },
  {
    key: "day_landings",
    label: "Day Landings",
    required: false,
    type: "number",
    aliases: ["day landings", "day landings full stop", "daylandings"],
  },
  {
    key: "day_landings_full_stop",
    label: "Day Landings (Full Stop)",
    required: false,
    type: "number",
    aliases: ["day landings full stop", "day full stop"],
  },
  {
    key: "night_takeoffs",
    label: "Night Takeoffs",
    required: false,
    type: "number",
    aliases: ["night takeoffs", "nighttakeoffs"],
  },
  {
    key: "night_landings",
    label: "Night Landings",
    required: false,
    type: "number",
    aliases: ["night landings", "nightlandings"],
  },
  {
    key: "night_landings_full_stop",
    label: "Night Landings (Full Stop)",
    required: false,
    type: "number",
    aliases: ["night landings full stop", "night full stop"],
  },
  {
    key: "approaches",
    label: "Approaches",
    required: false,
    type: "number",
    aliases: ["approaches", "approach count"],
  },
  {
    key: "dual_given",
    label: "Dual Given",
    required: false,
    type: "number",
    aliases: ["dual given", "instruction given"],
  },
  {
    key: "dual_received",
    label: "Dual Received",
    required: false,
    type: "number",
    aliases: ["dual received", "instruction received"],
  },
  {
    key: "simulated_flight",
    label: "Simulated Flight",
    required: false,
    type: "number",
    aliases: ["simulated flight", "simulator", "simulated"],
  },
  {
    key: "ground_training",
    label: "Ground Training",
    required: false,
    type: "number",
    aliases: ["ground training", "ground"],
  },
  {
    key: "remarks",
    label: "Remarks",
    required: false,
    type: "string",
    aliases: ["remarks", "comments", "pilotcomments"],
  },
  {
    key: "time_out",
    label: "Time Out",
    required: false,
    type: "string",
    aliases: ["time out", "timeout"],
  },
  {
    key: "time_off",
    label: "Time Off",
    required: false,
    type: "string",
    aliases: ["time off", "timeoff"],
  },
  {
    key: "time_on",
    label: "Time On",
    required: false,
    type: "string",
    aliases: ["time on", "timeon"],
  },
  {
    key: "time_in",
    label: "Time In",
    required: false,
    type: "string",
    aliases: ["time in", "timein"],
  },
  {
    key: "on_duty",
    label: "On Duty",
    required: false,
    type: "string",
    aliases: ["on duty", "onduty"],
  },
  {
    key: "off_duty",
    label: "Off Duty",
    required: false,
    type: "string",
    aliases: ["off duty", "offduty"],
  },
  {
    key: "start_time",
    label: "Legacy Start Time",
    required: false,
    type: "string",
    aliases: ["start time", "legacy start time", "start"],
  },
  {
    key: "end_time",
    label: "Legacy End Time",
    required: false,
    type: "string",
    aliases: ["end time", "legacy end time", "end"],
  },
  {
    key: "hobbs_start",
    label: "Hobbs Start",
    required: false,
    type: "number",
    aliases: ["hobbs start", "hobbsstart"],
  },
  {
    key: "hobbs_end",
    label: "Hobbs End",
    required: false,
    type: "number",
    aliases: ["hobbs end", "hobbsend"],
  },
  {
    key: "tach_start",
    label: "Tach Start",
    required: false,
    type: "number",
    aliases: ["tach start", "tachstart"],
  },
  {
    key: "tach_end",
    label: "Tach End",
    required: false,
    type: "number",
    aliases: ["tach end", "tachend"],
  },
];

const REQUIRED_FIELDS = FIELD_DEFINITIONS.filter((field) => field.required).map(
  (field) => field.key
);

const REQUIRED_NUMERIC_FIELDS = new Set(
  FIELD_DEFINITIONS.filter((field) => field.required && field.type === "number").map(
    (field) => field.key
  )
);

interface FieldSelections {
  [header: string]: FlightField | "__skip__";
}

interface ImportResultSummary {
  success: number;
  failed: number;
  message?: string;
}

const PREVIEW_COLUMNS: { key: FlightField; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "aircraft_registration", label: "Aircraft" },
  { key: "aircraft_type", label: "Type" },
  { key: "departure_airport", label: "From" },
  { key: "arrival_airport", label: "To" },
  { key: "total_time", label: "Total Time" },
  { key: "pic_time", label: "PIC" },
  { key: "night_time", label: "Night" },
  { key: "approaches", label: "Approaches" },
];

const SAMPLE_CSV = `Date,Aircraft,Type,From,To,Total Time,PIC,Night,Approaches,Landings,Remarks\n2024-01-15,N12345,C172,KJFK,KLGA,1.2,1.2,0,2,1,Pattern work\n2024-01-20,N67890,PA28,KLGA,KBDR,2.1,1.9,0.5,1,1,Cross country flight`;

const FOREFLIGHT_SAMPLE_CSV = `ForeFlight Logbook Import,This row is required for importing into ForeFlight. Do not delete or modify.\n\nFlights Table\nDate,AircraftID,From,To,Route,TimeOut,TimeOff,TimeOn,TimeIn,OnDuty,OffDuty,TotalTime,PIC,SIC,Night,Solo,CrossCountry,Distance,ActualInstrument,SimulatedInstrument,Holds,Approach1,Approach2,DualGiven,DualReceived,DayTakeoffs,DayLandingsFullStop,NightTakeoffs,NightLandingsFullStop,AllLandings,PilotComments\n2024-01-15,N12345,KJFK,KLGA,,,,,,,,1.2,1.2,0,0,0,0,147,0,0,0,ILS,VOR,0,0,2,1,0,0,1,Pattern work\n2024-01-20,N67890,KLGA,KBDR,,,,,,,,2.1,2.1,0,0,0,2.1,173,0,0,0,,,0,0,1,1,0,0,1,Cross country flight`;

function normalizeToken(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[\s_/-]+/g, " ")
    .trim()
    .toLowerCase();
}

const lc = (value: unknown) => String(value ?? "").trim().toLowerCase();

function findHeaderRow(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 200); i++) {
    if (rows[i].some((cell) => lc(cell) === "date")) {
      return i;
    }
  }
  return 0;
}

function toHours(value: unknown): number {
  if (value === undefined || value === null) return 0;
  const raw = String(value).trim().replace(/^"+|"+$/g, "");
  if (!raw) return 0;
  if (raw.toLowerCase() === 'nan') return 0;

  const hhmm = raw.match(/^(-?\d{1,2}):([0-5]?\d)$/);
  if (hhmm) {
    const hours = Number(hhmm[1]);
    const minutes = Number(hhmm[2]);
    if (Number.isFinite(hours) && Number.isFinite(minutes)) {
      return Number((hours + minutes / 60).toFixed(2));
    }
  }

  const normalized = raw.includes(",") && !raw.includes(".")
    ? raw.replace(/,/g, ".")
    : raw.replace(/,/g, "");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : 0;
}

function parseWithPapa(csv: string): { headers: string[]; rows: CsvRow[] } {
  const result = Papa.parse<string[]>(csv, {
    header: false,
    skipEmptyLines: "greedy",
  });

  if (result.errors.length > 0) {
    throw new Error(result.errors[0].message || "Failed to parse CSV file");
  }

  const rawRows = (result.data as string[][]).map((row) => (row ?? []).map((cell) => cell?.toString() ?? ""));
  const headerIndex = findHeaderRow(rawRows);
  const headerRow = rawRows[headerIndex] ?? [];
  const headers = headerRow.map((header) => header?.toString().trim());

  const rows: CsvRow[] = rawRows
    .slice(headerIndex + 1)
    .map((row) => {
      const normalizedRow: CsvRow = { __raw: row };
      headers.forEach((header, index) => {
        if (!header) return;
        const cell = row[index];
        normalizedRow[header] = cell?.toString().trim() ?? "";
      });
      return normalizedRow;
    })
    .filter((row) => headers.some((header) => header && row[header] && row[header].trim().length > 0));

  return { headers, rows };
}

function parseCsvText(text: string): ParseResult {
  const normalized = text.replace(/\r\n/g, "\n");
  const lower = normalized.toLowerCase();

  if (lower.includes("flights table")) {
    const sectionStart = lower.indexOf("flights table");
    const flightsSection = normalized.slice(sectionStart);
    const lines = flightsSection.split(/\n/);
    const headerIndex = lines.findIndex((line) =>
      line.trim().toLowerCase().startsWith("date,")
    );

    if (headerIndex === -1) {
      throw new Error("Could not locate ForeFlight flights table header");
    }

    const relevantLines = lines.slice(headerIndex);
    const csv = relevantLines.join("\n");
    const parsed = parseWithPapa(csv);
    return { ...parsed, format: "foreflight" };
  }

  const parsed = parseWithPapa(normalized);
  return { ...parsed, format: "standard" };
}

function buildInitialSelections(headers: string[]): FieldSelections {
  const selections: FieldSelections = {};
  const assigned = new Set<FlightField>();

  headers.forEach((header) => {
    const normalizedHeader = normalizeToken(header);
    const match = FIELD_DEFINITIONS.find((field) => {
      if (assigned.has(field.key)) return false;
      return field.aliases.some((alias) => normalizeToken(alias) === normalizedHeader);
    });

    if (match) {
      selections[header] = match.key;
      assigned.add(match.key);
    } else {
      selections[header] = "__skip__";
    }
  });

  return selections;
}

function invertSelections(selections: FieldSelections) {
  const fieldToHeader: Partial<Record<FlightField, string>> = {};
  Object.entries(selections).forEach(([header, field]) => {
    if (field && field !== "__skip__") {
      fieldToHeader[field] = header;
    }
  });
  return fieldToHeader;
}

function normalizeDate(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoCandidate = new Date(trimmed);
  if (!Number.isNaN(isoCandidate.getTime())) {
    return isoCandidate.toISOString().slice(0, 10);
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slashMatch) {
    const [, first, second, yearRaw] = slashMatch;
    let year = parseInt(yearRaw, 10);
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }
    const month = parseInt(first, 10);
    const day = parseInt(second, 10);

    if (month <= 12 && day <= 31) {
      const date = new Date(year, month - 1, day);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
      }
    }

    const altMonth = parseInt(second, 10);
    const altDay = parseInt(first, 10);
    if (altMonth <= 12 && altDay <= 31) {
      const date = new Date(year, altMonth - 1, altDay);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
      }
    }
  }

  const compactMatch = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compactMatch) {
    const year = parseInt(compactMatch[1], 10);
    const month = parseInt(compactMatch[2], 10);
    const day = parseInt(compactMatch[3], 10);
    const date = new Date(year, month - 1, day);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }

  return null;
}

function parseNumeric(value?: string): number | null {
  if (value === undefined || value === null) return null;
  const hours = toHours(value);
  return hours === 0 ? null : hours;
}

function safeNumber(value?: string): number {
  const parsed = toHours(value);
  return Number(Number(parsed).toFixed(2));
}

function countApproaches(row: CsvRow): number {
  const approachKeys = Object.keys(row).filter((key) =>
    normalizeToken(key).startsWith("approach")
  );

  return approachKeys.reduce((count, key) => {
    const value = row[key];
    return value && value.trim().length > 0 ? count + 1 : count;
  }, 0);
}

function mapRows(
  rows: CsvRow[],
  selections: FieldSelections,
  headers: string[]
): FlightPayload[] {
  const fieldToHeader = invertSelections(selections);

  return rows
    .map((row) => {
      const getValue = (field: FlightField): string => {
        const header = fieldToHeader[field];
        if (!header) return "";
        const value = row[header];
        if (!value) return "";
        if (value === "-" || value === "--") return "";
        return value;
      };

      const getNumber = (field: FlightField): number => {
        const header = fieldToHeader[field];
        if (!header) return 0;
        const value = row[header];
        if (!value || value === "-" || value === "--") return 0;
        return safeNumber(value);
      };

      const rawDate = getValue("date");
      const normalizedDate = normalizeDate(rawDate);
      const date = normalizedDate ?? rawDate ?? "";

      const totalTimeHeader = fieldToHeader.total_time;
      const totalTimeRaw = totalTimeHeader ? row[totalTimeHeader] : "";

      const totalTimeFallbackKeys = [
        "TotalTime",
        "Total Time",
        "Total_Time",
        "FlightTime",
        "Flight Time",
        "Flight_Time",
        "Flight Time (Decimal)",
        "Duration",
        "Flight Duration",
        "BlockTime",
        "Block Time",
        "Block_Hours",
        "ElapsedTime",
        "Elapsed Time",
        "Total",
        "Total Hours",
      ];

      let totalTimeNumeric = parseNumeric(totalTimeRaw ?? "");
      if (totalTimeNumeric === null) {
        for (const key of totalTimeFallbackKeys) {
          if (key in row) {
            const candidate = parseNumeric(row[key]);
            if (candidate !== null) {
              totalTimeNumeric = candidate;
              break;
            }
          }
        }
      }

      if (totalTimeNumeric === null) {
        const dynamicCandidate = Object.entries(row).find(([header, value]) => {
          if (value === undefined || value === null) return false;
          const trimmed = value.toString().trim();
          if (!trimmed || trimmed === '-' || trimmed === '--') return false;
          const token = normalizeToken(header);
          const looksLikeTotalTime = /total|duration|block/.test(token);
          if (!looksLikeTotalTime) return false;
          const numeric = parseNumeric(trimmed);
          return numeric !== null && numeric > 0;
        });

        if (dynamicCandidate) {
          totalTimeNumeric = parseNumeric(dynamicCandidate[1].toString().trim()) ?? null;
        }
      }

      if (totalTimeNumeric === null) {
        const timeOutHeader = fieldToHeader.time_out;
        const timeInHeader = fieldToHeader.time_in;
        const timeOut = timeOutHeader ? row[timeOutHeader] : undefined;
        const timeIn = timeInHeader ? row[timeInHeader] : undefined;
        const durationFromTimes = calculateDurationFromTimes(timeOut, timeIn);
        if (durationFromTimes !== null) {
          totalTimeNumeric = durationFromTimes;
        }
      }

      if (totalTimeNumeric === null) {
        const keywords = /(time|pic|sic|solo|night|cross|instrument|dual|sim|ground|hobbs|tach|total)/i;
        const dynamicCandidates = Object.entries(row).map(([header, value]) => {
          if (!value) return 0;
          const trimmed = value.toString().trim();
          if (!trimmed || trimmed === '-' || trimmed === '--') return 0;
          if (!keywords.test(normalizeToken(header))) return 0;
          const parsed = parseNumeric(trimmed);
          return parsed !== null && parsed > 0 ? parsed : 0;
        });
        const bestCandidate = Math.max(...dynamicCandidates, 0);
        if (bestCandidate > 0 && bestCandidate <= 24) {
          totalTimeNumeric = bestCandidate;
        }
      }

      if (totalTimeNumeric === null && Array.isArray(row.__raw)) {
      const rawValues = row.__raw.map((value) => {
        const trimmed = value?.toString().trim();
        if (!trimmed || trimmed === '-' || trimmed === '--') return 0;
        const numeric = parseNumeric(trimmed);
        return numeric !== null ? numeric : 0;
      });
      const filteredRawValues = rawValues.filter((value) => value > 0 && value <= 48);
      const bestCandidate = filteredRawValues.length ? Math.max(...filteredRawValues) : 0;
      if (bestCandidate > 0) {
        totalTimeNumeric = bestCandidate;
      }
      }

      const totalTime = Number((totalTimeNumeric ?? 0).toFixed(2));

      const aircraftRegistration = getValue("aircraft_registration");
      const departure = getValue("departure_airport");
      const arrival = getValue("arrival_airport");

      const flight: FlightPayload = {
        date,
        aircraft_registration: aircraftRegistration,
        aircraft_type: getValue("aircraft_type") || aircraftRegistration,
        departure_airport: departure,
        arrival_airport: arrival,
        total_time: totalTime,
        pic_time: getNumber("pic_time"),
        sic_time: getNumber("sic_time"),
        solo_time: getNumber("solo_time"),
        night_time: getNumber("night_time"),
        cross_country_time: getNumber("cross_country_time"),
        instrument_time: getNumber("instrument_time"),
        actual_instrument: getNumber("actual_instrument"),
        simulated_instrument: getNumber("simulated_instrument"),
        holds: getNumber("holds"),
        landings: getNumber("landings"),
        day_takeoffs: getNumber("day_takeoffs"),
        day_landings: getNumber("day_landings"),
        night_takeoffs: getNumber("night_takeoffs"),
        night_landings: getNumber("night_landings"),
        day_landings_full_stop: getNumber("day_landings_full_stop"),
        night_landings_full_stop: getNumber("night_landings_full_stop"),
        approaches: getNumber("approaches"),
        dual_given: getNumber("dual_given"),
        dual_received: getNumber("dual_received"),
        simulated_flight: getNumber("simulated_flight"),
        ground_training: getNumber("ground_training"),
        route: getValue("route") || undefined,
        remarks: getValue("remarks") || undefined,
        time_out: getValue("time_out") || undefined,
        time_off: getValue("time_off") || undefined,
        time_on: getValue("time_on") || undefined,
        time_in: getValue("time_in") || undefined,
        on_duty: getValue("on_duty") || undefined,
        off_duty: getValue("off_duty") || undefined,
        start_time: getValue("start_time") || undefined,
        end_time: getValue("end_time") || undefined,
        hobbs_start: getNumber("hobbs_start"),
        hobbs_end: getNumber("hobbs_end"),
        tach_start: getNumber("tach_start"),
        tach_end: getNumber("tach_end"),
      };

      if (!flight.approaches || flight.approaches === 0) {
        const computedApproaches = countApproaches(row);
        if (computedApproaches > 0) {
          flight.approaches = computedApproaches;
        }
      }

      if (!flight.landings || flight.landings === 0) {
        const landingAliases = [
          "landings",
          "all landings",
          "total landings",
          "day landings full stop",
          "night landings full stop",
        ];
        for (const header of headers) {
          const token = normalizeToken(header);
          if (landingAliases.includes(token)) {
            const value = safeNumber(row[header]);
            if (value > 0) {
              flight.landings = value;
              break;
            }
          }
        }
      }

      if (!flight.total_time || flight.total_time === 0) {
        const fallbackTotal = deriveTotalTimeFallback(flight);
        if (fallbackTotal !== null) {
          flight.total_time = fallbackTotal;
        }
      }

      const timeComponents = [
        flight.total_time,
        flight.pic_time,
        flight.sic_time,
        flight.solo_time,
        flight.dual_given,
        flight.dual_received,
        flight.cross_country_time,
        flight.actual_instrument,
        flight.simulated_instrument,
        flight.simulated_flight,
        flight.ground_training,
      ].filter((value): value is number => typeof value === 'number' && value > 0 && value <= 48);

      if (timeComponents.length > 0) {
        flight.total_time = Number(Math.max(...timeComponents).toFixed(2));
      }

      return flight;
    })
    .filter((flight): flight is FlightPayload => flight !== null);
}

function calculateDurationFromTimes(
  timeOut?: string,
  timeIn?: string
): number | null {
  if (!timeOut || !timeIn) return null;

  const toMinutes = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;

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

    return null;
  };

  const outMinutes = toMinutes(timeOut);
  const inMinutes = toMinutes(timeIn);
  if (outMinutes === null || inMinutes === null) return null;

  let duration = inMinutes - outMinutes;
  if (duration < 0) {
    duration += 24 * 60;
  }

  return Number((duration / 60).toFixed(2));
}

function deriveTotalTimeFallback(flight: FlightPayload): number | null {
  const diffs: number[] = [];

  if (
    typeof flight.hobbs_start === "number" &&
    typeof flight.hobbs_end === "number" &&
    flight.hobbs_end > flight.hobbs_start
  ) {
    diffs.push(Number((flight.hobbs_end - flight.hobbs_start).toFixed(2)));
  }

  if (
    typeof flight.tach_start === "number" &&
    typeof flight.tach_end === "number" &&
    flight.tach_end > flight.tach_start
  ) {
    diffs.push(Number((flight.tach_end - flight.tach_start).toFixed(2)));
  }

  const candidateTimeValues = [
    flight.pic_time,
    flight.sic_time,
    flight.solo_time,
    flight.dual_given,
    flight.dual_received,
    flight.simulated_flight,
    flight.ground_training,
  ].filter((value): value is number => typeof value === "number" && value > 0);

  const candidates = [...diffs, ...candidateTimeValues];
  if (candidates.length === 0) {
    return null;
  }

  const maxCandidate = Math.max(...candidates);
  if (maxCandidate <= 0 || !Number.isFinite(maxCandidate)) {
    return null;
  }
  return Number(maxCandidate.toFixed(2));
}

function downloadTemplate(template: "standard" | "foreflight") {
  const csvContent = template === "foreflight" ? FOREFLIGHT_SAMPLE_CSV : SAMPLE_CSV;
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `logbook-template-${template}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

const getFieldLabel = (field: string) =>
  FIELD_DEFINITIONS.find((definition) => definition.key === field)?.label || field;

const previewValue = (flight: FlightPayload, key: FlightField) => {
  const value = flight[key];
  if (value === undefined || value === null) return "-";
  if (typeof value === "number") {
    return value.toFixed(1);
  }
  return value;
};

export function CSVImportDialog({
  open,
  onOpenChange,
  onImportComplete,
}: CSVImportDialogProps) {
  const { toast } = useToast();
  const { user, session } = useAuth();

  const [step, setStep] = useState<ImportStep>("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [format, setFormat] = useState<CsvFormat>("standard");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fieldSelections, setFieldSelections] = useState<FieldSelections>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [missingRequiredFields, setMissingRequiredFields] = useState<FlightField[]>([]);
  const [importResult, setImportResult] = useState<ImportResultSummary | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [autoFlights, setAutoFlights] = useState<FlightPayload[] | null>(null);
  const [autoWarnings, setAutoWarnings] = useState<string[]>([]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Unsupported file",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileText = await file.text();

      const autoResult = parseLogbookCsv(fileText);
      if (autoResult.flights.length > 0) {
        setAutoFlights(autoResult.flights);
        setAutoWarnings(autoResult.warnings);
        setCsvHeaders([]);
        setCsvRows([]);
        setFormat("standard");
        setFileName(file.name);
        setFieldSelections({});
        setValidationErrors([]);
        setMissingRequiredFields([]);
        setImportResult(null);
        setStep("preview");
        toast({
          title: "CSV parsed",
          description: `Detected ${autoResult.flights.length} flights${autoResult.warnings.length ? ` (${autoResult.warnings.length} notes)` : ""}.`,
        });
        return;
      }

      const parsed = parseCsvText(fileText);

      if (parsed.rows.length === 0) {
        toast({
          title: "Empty file",
          description: "We couldn't find any rows in that CSV",
          variant: "destructive",
        });
        return;
      }

      setAutoFlights(null);
      setAutoWarnings([]);
      setCsvHeaders(parsed.headers);
      setCsvRows(parsed.rows);
      setFormat(parsed.format);
      setFileName(file.name);
      setFieldSelections(buildInitialSelections(parsed.headers));
      setValidationErrors([]);
      setMissingRequiredFields([]);
      setImportResult(null);
      setStep("mapping");

      toast({
        title: "File ready",
        description: `Detected ${parsed.rows.length} flights (${parsed.format === "foreflight" ? "ForeFlight" : "Standard"} format)`,
      });
    } catch (error) {
      toast({
        title: "Parsing failed",
        description:
          error instanceof Error ? error.message : "Unable to read that CSV file",
        variant: "destructive",
      });
    }
  };

  const handleMappingChange = (header: string, value: FlightField | "__skip__") => {
    setFieldSelections((prev) => {
      const next: FieldSelections = { ...prev, [header]: value };

      if (value !== "__skip__") {
        Object.entries(next).forEach(([otherHeader, currentField]) => {
          if (otherHeader !== header && currentField === value) {
            next[otherHeader] = "__skip__";
          }
        });
      }

      return next;
    });
    setMissingRequiredFields([]);
    setValidationErrors([]);
  };

  const validateBeforePreview = () => {
    if (foreflightFlights) {
      setValidationErrors([]);
      setMissingRequiredFields([]);
      return true;
    }

    const errors: ValidationError[] = [];
    const fieldToHeader = invertSelections(fieldSelections);

    const missingFields = REQUIRED_FIELDS.filter((field) => !fieldToHeader[field]);
    if (missingFields.length > 0) {
      setMissingRequiredFields(missingFields);
      setValidationErrors([]);
      toast({
        title: "Missing required fields",
        description: `Map these fields before continuing: ${missingFields
          .map((field) =>
            FIELD_DEFINITIONS.find((def) => def.key === field)?.label ?? field
          )
          .join(", ")}`,
        variant: "destructive",
      });
      return false;
    }

    setMissingRequiredFields([]);

    csvRows.forEach((row, index) => {
      REQUIRED_FIELDS.forEach((field) => {
        const header = fieldToHeader[field];
        const value = header ? row[header] : "";
        const isNumericField = REQUIRED_NUMERIC_FIELDS.has(field);
        if (!value || value.trim().length === 0) {
          if (isNumericField) {
            return;
          }
          errors.push({
            row: index + 1,
            field,
            message: "Required field is empty",
          });
        }
      });

      const dateValue = fieldToHeader.date ? row[fieldToHeader.date] : "";
      if (!normalizeDate(dateValue)) {
        errors.push({
          row: index + 1,
          field: "date",
          message: "Invalid date format",
        });
      }

      const totalTimeHeader = fieldToHeader.total_time;
      const totalTimeValue = totalTimeHeader ? row[totalTimeHeader] : "";
      const parsedTotal = parseNumeric(totalTimeValue);
      if (parsedTotal !== null && parsedTotal < 0) {
        errors.push({
          row: index + 1,
          field: "total_time",
          message: "Total time must be zero or greater",
        });
      }
    });

    setValidationErrors(errors);

    if (errors.length > 0) {
      toast({
        title: "Validation warnings",
        description: `We found ${errors.length} data issues. They are highlighted for review.`,
      });
    }

    return true;
  };

  const handlePreview = () => {
    if (validateBeforePreview()) {
      setStep("preview");
    }
  };

  const previewFlights = useMemo(() => {
    if (step !== "preview" && step !== "importing" && step !== "complete") {
      return [];
    }
    if (autoFlights) {
      return autoFlights.slice(0, 10);
    }
    return mapRows(csvRows.slice(0, 10), fieldSelections, csvHeaders);
  }, [step, autoFlights, csvRows, fieldSelections, csvHeaders]);

  const startImport = async () => {
    if (!user || !session) {
      toast({
        title: "Sign in required",
        description: "Please sign in before importing flights",
        variant: "destructive",
      });
      return;
    }

    const flights = autoFlights ?? mapRows(csvRows, fieldSelections, csvHeaders);
    if (flights.length === 0) {
      toast({
        title: "Nothing to import",
        description: "No valid flights were detected with the current mapping",
        variant: "destructive",
      });
      return;
    }

    console.debug("Prepared flights for import", flights.slice(0, 5));
    const zeroTotalFlights = flights.filter((flight) => !flight.total_time || flight.total_time === 0);
    if (zeroTotalFlights.length > 0) {
      console.warn("Flights with zero total time before import", zeroTotalFlights.slice(0, 5));
    }

    setStep("importing");
    setProgress(30);

    try {
      const { data, error } = await supabase.functions.invoke(
        "import-csv-flights",
        {
          body: { flights },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        throw new Error(
          error.message || "There was an error importing your flights"
        );
      }

      setProgress(100);
      setImportResult(data as ImportResultSummary);
      setStep("complete");
      onImportComplete();

      toast({
        title: "Import complete",
        description: data?.message || `Imported ${data?.success ?? flights.length} flights`,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description:
          error instanceof Error ? error.message : "Unable to import your flights",
        variant: "destructive",
      });
      setStep("preview");
    }
  };

  const resetDialog = () => {
    setStep("upload");
    setCsvHeaders([]);
    setCsvRows([]);
    setFormat("standard");
    setFileName(null);
    setFieldSelections({});
    setValidationErrors([]);
    setMissingRequiredFields([]);
    setImportResult(null);
    setProgress(0);
    setForeflightFlights(null);
    setForeflightReport(null);
  };

  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialog();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Import CSV Logbook
          </DialogTitle>
          <DialogDescription>
            Upload your CSV file and map the columns to import every flight entry
            into your logbook.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload CSV File</CardTitle>
                <CardDescription>
                  Supports ForeFlight, LogTen Pro, and custom CSV exports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center">
                  <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="text-lg font-medium">Choose CSV file</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Drag and drop or click to browse
                    </p>
                  </Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate("standard")}
                    >
                      <Download className="h-4 w-4 mr-2" /> Standard Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate("foreflight")}
                    >
                      <Download className="h-4 w-4 mr-2" /> ForeFlight Template
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Need a starting point? Download a sample file to see the
                    expected format.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "mapping" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Map CSV Columns</CardTitle>
                    <CardDescription>
                      {fileName ? `${fileName} • ` : ""}
                      {csvRows.length} flights detected • {format === "foreflight" ? "ForeFlight" : "Standard"} format
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Step 2 of 4</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {missingRequiredFields.length > 0 && (
                  <Alert className="border-destructive/40 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">Map these required fields before continuing:</div>
                      <ul className="mt-2 space-y-1 text-sm">
                        {missingRequiredFields.map((field) => {
                          const label =
                            FIELD_DEFINITIONS.find((definition) => definition.key === field)?.label || field;
                          return <li key={field}>{label}</li>;
                        })}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {validationErrors.length > 0 && missingRequiredFields.length === 0 && (
                  <Alert className="border-destructive/40 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">Fix the highlighted data issues before previewing:</div>
                      <div className="mt-2 max-h-48 overflow-y-auto pr-2 space-y-1 text-sm">
                        {validationErrors.slice(0, VALIDATION_DISPLAY_LIMIT).map((error, index) => (
                          <div key={`${error.row}-${error.field}-${index}`}>
                            Row {error.row}: {getFieldLabel(error.field)} — {error.message}
                          </div>
                        ))}
                        {validationErrors.length > VALIDATION_DISPLAY_LIMIT && (
                          <div>Showing first {VALIDATION_DISPLAY_LIMIT} of {validationErrors.length} issues.</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {csvHeaders.map((header) => (
                    <div key={header} className="space-y-2">
                      <Label className="text-sm font-medium">{header}</Label>
                      <Select
                        value={fieldSelections[header] ?? "__skip__"}
                        onValueChange={(value) =>
                          handleMappingChange(header, value as FlightField | "__skip__")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__skip__">Don't import</SelectItem>
                          {FIELD_DEFINITIONS.map((field) => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.label}
                              {field.required ? " (required)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
                  <Button onClick={handlePreview}>Preview Data</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Preview Flights</CardTitle>
                    <CardDescription>
                      Review the first few flights before importing. All {foreflightFlights ? foreflightFlights.length : csvRows.length} entries will be added.
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Step 3 of 4</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {foreflightReport && foreflightReport.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">ForeFlight warnings</div>
                      <div className="mt-2 space-y-1 text-sm">
                        {foreflightReport.warnings.map((warning, index) => (
                          <div key={index}>{warning}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {validationErrors.length > 0 && !foreflightFlights && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">
                        Found {validationErrors.length} validation issues. Fix them in the mapping step before importing.
                      </div>
                      <div className="mt-2 max-h-48 overflow-y-auto pr-2 space-y-1 text-sm">
                        {validationErrors.slice(0, VALIDATION_DISPLAY_LIMIT).map((error, index) => (
                          <div key={`${error.row}-${error.field}-preview-${index}`}>
                            Row {error.row}: {getFieldLabel(error.field)} — {error.message}
                          </div>
                        ))}
                        {validationErrors.length > VALIDATION_DISPLAY_LIMIT && (
                          <div>Showing first {VALIDATION_DISPLAY_LIMIT} of {validationErrors.length} issues.</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {previewFlights.length > 0 ? (
                  <div className="rounded-2xl border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          {PREVIEW_COLUMNS.map((column) => (
                            <TableHead key={column.key}>{column.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewFlights.map((flight, index) => (
                          <TableRow key={`${flight.date}-${flight.aircraft_registration}-${index}`}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            {PREVIEW_COLUMNS.map((column) => (
                              <TableCell key={column.key}>
                                {previewValue(flight, column.key)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      We couldn't render a preview. Check your mappings and try again.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    All {foreflightFlights ? foreflightFlights.length : csvRows.length} flights will be imported. Existing flights in
                    your logbook remain untouched.
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (foreflightFlights) {
                          setForeflightFlights(null);
                          setForeflightReport(null);
                          setStep("upload");
                        } else {
                          setStep("mapping");
                        }
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={startImport}
                      disabled={!foreflightFlights && validationErrors.length > 0}
                    >
                      Import {foreflightFlights ? foreflightFlights.length : csvRows.length} Flights
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "importing" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Importing Flights...</CardTitle>
                <CardDescription>
                  Please wait while we add your flights to the logbook.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="w-full" />
                <p className="text-center text-sm text-muted-foreground">
                  Importing {foreflightFlights ? foreflightFlights.length : csvRows.length} flights...
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "complete" && importResult && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> Import complete
                </CardTitle>
                <CardDescription>
                  {importResult.message || "All set! Your flights are now in the logbook."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {importResult.success}
                    </div>
                    <div className="text-sm text-muted-foreground">Imported</div>
                  </div>
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center">
                    <div className="text-3xl font-bold text-destructive">
                      {importResult.failed}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleDialogChange(false)}>Close</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
