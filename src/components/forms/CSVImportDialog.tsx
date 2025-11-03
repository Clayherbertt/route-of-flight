import { useState } from "react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type CSVImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
};

type MinimalFlight = {
  date: string;
  aircraft_registration: string;
  aircraft_type: string;
  departure_airport: string;
  arrival_airport: string;
  total_time: number | null;
  pic_time: number | null;
  sic_time: number | null;
  solo_time: number | null;
  night_time: number | null;
  cross_country_time: number | null;
  actual_instrument: number | null;
  simulated_instrument: number | null;
  holds: number | null;
  approaches: number | null;
  day_takeoffs: number | null;
  day_landings: number | null;
  day_landings_full_stop: number | null;
  night_takeoffs: number | null;
  night_landings: number | null;
  night_landings_full_stop: number | null;
  all_landings: number | null;
  dual_given: number | null;
  dual_received: number | null;
};

type FlightMappingResult =
  | { status: "success"; flight: MinimalFlight; warnings: string[] }
  | { status: "missing-required"; missingFields: string[]; row: Record<string, unknown> }
  | { status: "non-flight" };

const DATE_FIELD_KEYS = [
  "Date",
  "Flight Date",
  "Log Date",
  "DATE",
  "FlightDate",
  "Date (Local)",
  "DateLocal",
];

const AIRCRAFT_FIELD_KEYS = [
  "AircraftID",
  "Aircraft ID",
  "Aircraft",
  "Aircraft Registration",
  "Aircraft Registration ID",
  "Aircraft Name",
  "Aircraft Ident",
  "Tail Number",
  "Tail",
  "Registration",
  "Aircraft Tail Number",
];

const DEPARTURE_FIELD_KEYS = [
  "From",
  "FROM",
  "Departure",
  "Departure Airport",
  "DepartureAirport",
  "Departure Airport Name",
  "Dept",
  "Origin",
  "Origin Airport",
  "OriginAirport",
  "Departure Airport ID",
  "From Airport",
  "FromAirport",
];

const ARRIVAL_FIELD_KEYS = [
  "To",
  "TO",
  "Arrival",
  "Arrival Airport",
  "ArrivalAirport",
  "Arrival Airport Name",
  "Dest",
  "Destination",
  "Destination Airport",
  "DestinationAirport",
  "Arrival Airport ID",
  "To Airport",
  "ToAirport",
];

const HEADER_BOM = /^\uFEFF/;

const sanitizeHeader = (header: string) => header.replace(HEADER_BOM, "").trim();

const looksLikeFlightsHeader = (line: string): boolean => {
  const columns = line
    .split(",")
    .map((column) => column.replace(/"/g, "").trim().toLowerCase())
    .filter(Boolean);

  if (columns.length < 2) return false;

  const hasDate = columns.some((column) => column.includes("date"));
  const hasAircraft = columns.some(
    (column) =>
      column.includes("aircraft") ||
      column.includes("tail") ||
      column.includes("registration")
  );
  const hasFrom = columns.some(
    (column) =>
      column === "from" ||
      column.includes("departure") ||
      column.includes("origin")
  );
  const hasTo = columns.some(
    (column) =>
      column === "to" ||
      column.includes("arrival") ||
      column.includes("destination")
  );

  return hasDate && hasAircraft && (hasFrom || hasTo);
};

// Parse boolean values from CSV - "TRUE" means true, anything else is false
const parseBooleanFromCSV = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return false; // Empty string is false
    const upper = trimmed.toUpperCase();
    return upper === "TRUE" || upper === "YES" || upper === "1";
  }
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return false;
};

// Map gear type from CSV to database-allowed values
// Allowed: 'AM', 'FC', 'FT', 'FL', 'RC', 'RT', 'Skids', 'Skis'
const mapGearType = (value: unknown): string | null => {
  if (!value || typeof value !== "string") return null;
  
  const normalized = value.trim().toLowerCase().replace(/[_\s-]/g, "");
  
  // Direct matches
  const directMap: Record<string, string> = {
    "am": "AM",
    "fc": "FC",
    "ft": "FT",
    "fl": "FL",
    "rc": "RC",
    "rt": "RT",
    "skids": "Skids",
    "skis": "Skis",
  };
  
  if (directMap[normalized]) {
    return directMap[normalized];
  }
  
  // Pattern matching for common variations
  if (normalized.includes("amphibian")) return "AM";
  if (normalized.includes("fixed") && normalized.includes("tailwheel")) return "FC";
  if (normalized.includes("fixed") && normalized.includes("tricycle")) return "FT";
  if (normalized.includes("float")) return "FL";
  if ((normalized.includes("retract") || normalized.includes("retractible")) && normalized.includes("tailwheel")) return "RC";
  if ((normalized.includes("retract") || normalized.includes("retractible")) && normalized.includes("tricycle")) return "RT";
  if (normalized.includes("skid")) return "Skids";
  if (normalized.includes("ski") && !normalized.includes("skid")) return "Skis";
  
  return null;
};

// Map engine type from CSV to database-allowed values
// Allowed: 'Diesel', 'Electric', 'Non-Powered', 'Piston', 'Radial', 'TurboFan', 'Turbojet', 'TurboProp', 'Turboshaft'
const mapEngineType = (value: unknown): string | null => {
  if (!value || typeof value !== "string") return null;
  
  const normalized = value.trim();
  const lower = normalized.toLowerCase();
  
  // Direct matches (case-sensitive for exact matches)
  const exactMatches: Record<string, string> = {
    "Diesel": "Diesel",
    "Electric": "Electric",
    "Non-Powered": "Non-Powered",
    "Piston": "Piston",
    "Radial": "Radial",
    "TurboFan": "TurboFan",
    "Turbojet": "Turbojet",
    "TurboProp": "TurboProp",
    "Turboshaft": "Turboshaft",
  };
  
  if (exactMatches[normalized]) {
    return exactMatches[normalized];
  }
  
  // Case-insensitive matching
  if (lower === "diesel") return "Diesel";
  if (lower === "electric") return "Electric";
  if (lower === "non-powered" || lower === "nonpowered" || lower === "non powered") return "Non-Powered";
  if (lower === "piston") return "Piston";
  if (lower === "radial") return "Radial";
  if (lower === "turbofan" || lower === "turbo-fan" || lower === "turbo fan") return "TurboFan";
  if (lower === "turbojet" || lower === "turbo-jet" || lower === "turbo jet") return "Turbojet";
  if (lower === "turboprop" || lower === "turbo-prop" || lower === "turbo prop") return "TurboProp";
  if (lower === "turboshaft" || lower === "turbo-shaft" || lower === "turbo shaft") return "Turboshaft";
  
  return null;
};

// Extract aircraft data from the Aircraft Table section
const extractAircraftDataFromCsv = (csvText: string): Map<string, {
  aircraft_id: string;
  type_code: string | null;
  year: number | null;
  make: string;
  model: string;
  gear_type: string | null;
  engine_type: string | null;
  equipment_type: string;
  category_class: string;
  complex: boolean;
  taa: boolean;
  high_performance: boolean;
  pressurized: boolean;
}> => {
  const aircraftMap = new Map();
  const text = csvText.replace(/\r\n?/g, "\n");
  const lines = text.split("\n").map((line) => line.replace(/\uFEFF/g, ""));

  // Find the Aircraft Table section
  let aircraftSectionStart = -1;
  let aircraftHeaderLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes("Aircraft Table") || line.toLowerCase().includes("aircraftid")) {
      aircraftSectionStart = i;
      // Look for the header row (usually the next non-empty line)
      for (let j = i + 1; j < lines.length && j < i + 5; j++) {
        if (lines[j].trim() && lines[j].includes("AircraftID")) {
          aircraftHeaderLine = j;
          break;
        }
      }
      break;
    }
  }

  if (aircraftSectionStart === -1 || aircraftHeaderLine === -1) {
    return aircraftMap;
  }

  // Parse the header row to find column indices
  const headerLine = lines[aircraftHeaderLine];
  const headers = headerLine.split(",").map((h) => h.trim());
  
  const aircraftIdIdx = headers.findIndex((h) => 
    /^aircraftid$/i.test(h.replace(/\s+/g, ""))
  );
  const typeCodeIdx = headers.findIndex((h) => 
    /^typecode$/i.test(h.replace(/\s+/g, ""))
  );
  const yearIdx = headers.findIndex((h) => 
    /^year$/i.test(h.replace(/\s+/g, ""))
  );
  const makeIdx = headers.findIndex((h) => 
    /^make$/i.test(h.replace(/\s+/g, ""))
  );
  const modelIdx = headers.findIndex((h) => 
    /^model$/i.test(h.replace(/\s+/g, ""))
  );
  const gearTypeIdx = headers.findIndex((h) => 
    /^geartype$/i.test(h.replace(/\s+/g, ""))
  );
  const engineTypeIdx = headers.findIndex((h) => 
    /^enginetype$/i.test(h.replace(/\s+/g, ""))
  );
  const equipTypeIdx = headers.findIndex((h) => 
    /^equiptype\(faa\)$/i.test(h.replace(/\s+/g, ""))
  );
  const aircraftClassIdx = headers.findIndex((h) => 
    /^aircraftclass\(faa\)$/i.test(h.replace(/\s+/g, ""))
  );
  const complexIdx = headers.findIndex((h) => 
    /^complexaircraft\(faa\)$/i.test(h.replace(/\s+/g, ""))
  );
  const taaIdx = headers.findIndex((h) => 
    /^taa\(faa\)$/i.test(h.replace(/\s+/g, ""))
  );
  const highPerfIdx = headers.findIndex((h) => 
    /^highperformance\(faa\)$/i.test(h.replace(/\s+/g, ""))
  );
  const pressurizedIdx = headers.findIndex((h) => 
    /^pressurized\(faa\)$/i.test(h.replace(/\s+/g, ""))
  );

  // Parse aircraft rows (stop at first flight entry or empty section)
  for (let i = aircraftHeaderLine + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Stop if we hit the flight entries section
    if (line.includes("Date") && line.includes("AircraftID") && line.includes("From")) {
      break;
    }
    
    if (!line || !line.includes(",")) continue;
    
    const columns = line.split(",");
    if (aircraftIdIdx === -1 || columns.length <= aircraftIdIdx) continue;
    
    const aircraftId = columns[aircraftIdIdx]?.trim();
    if (!aircraftId || aircraftId === "AircraftID") continue; // Skip header row if duplicated
    
    // Map FAA aircraft class to our category_class format
    const aircraftClassRaw = aircraftClassIdx >= 0 ? columns[aircraftClassIdx]?.trim() : "";
    let categoryClass = "ASEL"; // Default
    if (aircraftClassRaw) {
      const normalized = aircraftClassRaw.toLowerCase();
      if (normalized.includes("single") && normalized.includes("land")) categoryClass = "ASEL";
      else if (normalized.includes("multi") && normalized.includes("land")) categoryClass = "AMEL";
      else if (normalized.includes("single") && normalized.includes("sea")) categoryClass = "ASES";
      else if (normalized.includes("multi") && normalized.includes("sea")) categoryClass = "AMES";
      // Keep the raw value as fallback if it matches our enum
      else if (["ASEL", "AMEL", "ASES", "AMES", "RH", "RG", "Glider", "LA", "LB", "PLIFT", "PL", "PS", "WL", "WS"].includes(aircraftClassRaw.toUpperCase())) {
        categoryClass = aircraftClassRaw.toUpperCase();
      }
    }

    const year = yearIdx >= 0 && columns[yearIdx]?.trim() 
      ? Number.parseInt(columns[yearIdx].trim(), 10) || null 
      : null;

    aircraftMap.set(aircraftId.toUpperCase(), {
      aircraft_id: aircraftId.toUpperCase(),
      type_code: typeCodeIdx >= 0 && columns[typeCodeIdx]?.trim() ? columns[typeCodeIdx].trim() : null,
      year: Number.isNaN(year) ? null : year,
      // Make and model are required (NOT NULL), so use aircraft_id as fallback if empty
      make: makeIdx >= 0 && columns[makeIdx]?.trim() 
        ? columns[makeIdx].trim() 
        : (aircraftId || "Unknown"),
      model: modelIdx >= 0 && columns[modelIdx]?.trim() 
        ? columns[modelIdx].trim() 
        : (aircraftId || "Unknown"),
      gear_type: gearTypeIdx >= 0 ? mapGearType(columns[gearTypeIdx]) : null,
      engine_type: engineTypeIdx >= 0 ? mapEngineType(columns[engineTypeIdx]) : null,
      // Map equipment type - normalize to match database enum values
      equipment_type: (() => {
        const equipTypeRaw = equipTypeIdx >= 0 && columns[equipTypeIdx]?.trim() 
          ? columns[equipTypeIdx].trim().toLowerCase() 
          : "";
        if (equipTypeRaw === "aatd") return "AATD";
        if (equipTypeRaw === "batd") return "BATD";
        if (equipTypeRaw === "ftd") return "FTD";
        if (equipTypeRaw === "aircraft" || equipTypeRaw === "") return "Aircraft";
        return "Aircraft"; // Default fallback
      })(),
      category_class: categoryClass,
      complex: parseBooleanFromCSV(complexIdx >= 0 ? columns[complexIdx] : null),
      taa: parseBooleanFromCSV(taaIdx >= 0 ? columns[taaIdx] : null),
      high_performance: parseBooleanFromCSV(highPerfIdx >= 0 ? columns[highPerfIdx] : null),
      pressurized: parseBooleanFromCSV(pressurizedIdx >= 0 ? columns[pressurizedIdx] : null),
    });
  }

  return aircraftMap;
};

const sliceFlightSection = (lines: string[]): string | null => {
  const normalized = lines.map((line) =>
    line.replace(/"/g, "").replace(/,/g, "").trim().toLowerCase(),
  );

  const findSectionFromIndex = (startIndex: number) => {
    let headerIdx = -1;
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (!normalized[i]) continue;
      headerIdx = i;
      break;
    }
    if (headerIdx === -1) return null;

    let endIdx = headerIdx + 1;
    for (; endIdx < lines.length; endIdx++) {
      const trimmed = normalized[endIdx];
      if (!trimmed) break;
      if (trimmed.endsWith("table") && endIdx > headerIdx + 1) break;
    }

    return [lines[headerIdx], ...lines.slice(headerIdx + 1, endIdx)].join("\n");
  };

  const tableIdx = normalized.findIndex((line) => line === "flights table");
  if (tableIdx !== -1) {
    const section = findSectionFromIndex(tableIdx);
    if (section) return section;
  }

  for (let i = 0; i < lines.length; i++) {
    const candidate = lines[i].replace(/"/g, "").trim();
    if (!candidate) continue;
    if (looksLikeFlightsHeader(candidate)) {
      let endIdx = i + 1;
      for (; endIdx < lines.length; endIdx++) {
        const trimmed = normalized[endIdx];
        if (!trimmed) break;
        if (trimmed.endsWith("table") && endIdx > i + 1) break;
      }
      return [lines[i], ...lines.slice(i + 1, endIdx)].join("\n");
    }
  }

  return null;
};

const extractFlightsFromCsv = (csvText: string): Record<string, unknown>[] => {
  const text = csvText.replace(/\r\n?/g, "\n");
  const lines = text.split("\n").map((line) => line.replace(/\uFEFF/g, ""));

  const section = sliceFlightSection(lines) ?? text;

  const parsed = Papa.parse<Record<string, unknown>>(section, {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
    transformHeader: sanitizeHeader,
    transform: (value) => (typeof value === "string" ? value.trim() : value),
  });

  return parsed.data.filter((row) =>
    Object.values(row).some((value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim().length > 0;
      return true;
    })
  );
};

const dateFromValue = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const ms = value * 86400000;
    const parsed = new Date(excelEpoch.getTime() + ms);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const direct = new Date(trimmed);
    if (!Number.isNaN(direct.getTime())) {
      return direct.toISOString().slice(0, 10);
    }

    const mmdd = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (mmdd) {
      let month = Number(mmdd[1]);
      let day = Number(mmdd[2]);
      let year = Number(mmdd[3]);
      if (year < 100) year += year < 50 ? 2000 : 1900;
      if (month > 12) [month, day] = [day, month];
      const parsed = new Date(Date.UTC(year, month - 1, day));
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
    }

    if (/^\d{4,5}$/.test(trimmed)) {
      const serial = Number(trimmed);
      if (Number.isFinite(serial)) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const ms = serial * 86400000;
        const parsed = new Date(excelEpoch.getTime() + ms);
        if (!Number.isNaN(parsed.getTime())) {
          return parsed.toISOString().slice(0, 10);
        }
      }
    }
  }

  return null;
};

const normalizeAirport = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim().toUpperCase();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value).trim().toUpperCase();
  }
  return "";
};

const normalizeHoursPrecision = (hours: number): number => {
  if (!Number.isFinite(hours)) {
    return NaN;
  }
  return Math.round(hours * 1000) / 1000;
};

const parseTotalTime = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return normalizeHoursPrecision(value);
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/\u00A0/g, " ").replace(/[–—]/g, "-").trim();

  const parseFromHoursMinutes = (hours: number, minutes = 0, seconds = 0) => {
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
      return null;
    }
    const decimal = hours + minutes / 60 + seconds / 3600;
    return normalizeHoursPrecision(decimal);
  };

  if (cleaned.includes(":")) {
    const colonCandidate = cleaned.replace(/[^0-9:]/g, "");
    const hm = colonCandidate.match(/^(\d+):([0-5]\d)(?::([0-5]\d))?$/);
    if (hm) {
      const hours = Number.parseInt(hm[1], 10);
      const minutes = Number.parseInt(hm[2], 10);
      const seconds = hm[3] ? Number.parseInt(hm[3], 10) : 0;
      return parseFromHoursMinutes(hours, minutes, seconds);
    }
  }

  const plusMatch = cleaned.match(/^(\d+)\s*\+\s*(\d{1,2})$/);
  if (plusMatch) {
    const hours = Number.parseInt(plusMatch[1], 10);
    const minutes = Number.parseInt(plusMatch[2], 10);
    return parseFromHoursMinutes(hours, minutes);
  }

  const lower = cleaned.toLowerCase();

  const hourWordMatch = lower.match(/^(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)(.*)$/);
  if (hourWordMatch) {
    const hours = Number.parseFloat(hourWordMatch[1]);
    let minutes = 0;
    const remainder = hourWordMatch[2].trim();
    if (remainder) {
      const minuteMatch = remainder.match(/(\d{1,2})(?:\s*(?:m|min|mins|minute|minutes))?/);
      if (minuteMatch) {
        minutes = Number.parseInt(minuteMatch[1], 10);
      }
    }
    return parseFromHoursMinutes(hours, minutes);
  }

  const compact = lower.replace(/\s+/g, "");
  const compactHmMatch = compact.match(
    /^(\d+)(?:h|hr|hrs|hour|hours)(\d{1,2})?(?:m|min|mins|minute|minutes)?$/,
  );
  if (compactHmMatch) {
    const hours = Number.parseInt(compactHmMatch[1], 10);
    const minutes = compactHmMatch[2] ? Number.parseInt(compactHmMatch[2], 10) : 0;
    return parseFromHoursMinutes(hours, minutes);
  }

  const minutesOnlyMatch = lower.match(/^(\d+)\s*(?:m|min|mins|minute|minutes)$/);
  if (minutesOnlyMatch) {
    const minutes = Number.parseInt(minutesOnlyMatch[1], 10);
    return parseFromHoursMinutes(0, minutes);
  }

  const normalizedNumeric = (() => {
    const withoutSpaces = cleaned.replace(/\s+/g, "");
    if (withoutSpaces.includes(",") && !withoutSpaces.includes(".")) {
      return withoutSpaces.replace(",", ".");
    }
    return withoutSpaces.replace(/,/g, "");
  })();

  const numeric = Number.parseFloat(normalizedNumeric);
  if (Number.isFinite(numeric)) {
    return normalizeHoursPrecision(numeric);
  }

  return null;
};

const collapseKey = (key: string) =>
  key.replace(/\s+|[_-]/g, "").toLowerCase();

const findField = (
  row: Record<string, unknown>,
  candidates: string[],
): unknown => {
  const indexed = Object.entries(row)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ({
      raw: key,
      normalized: key.trim().toLowerCase(),
      collapsed: collapseKey(key),
      value,
    }));

  for (const candidate of candidates) {
    const normalizedCandidate = candidate.trim().toLowerCase();
    const collapsedCandidate = collapseKey(candidate);

    for (const entry of indexed) {
      if (
        entry.raw === candidate ||
        entry.normalized === normalizedCandidate ||
        entry.collapsed === collapsedCandidate
      ) {
        return entry.value;
      }
    }
  }

  return undefined;
};

const findFieldByKeywords = (
  row: Record<string, unknown>,
  include: string[],
  exclude: string[] = [],
): unknown => {
  const includeCollapsed = include.map(collapseKey);
  const excludeCollapsed = exclude.map(collapseKey);

  for (const [key, value] of Object.entries(row)) {
    const collapsed = collapseKey(key);
    if (
      includeCollapsed.every((keyword) => collapsed.includes(keyword)) &&
      !excludeCollapsed.some((keyword) => collapsed.includes(keyword))
    ) {
      return value;
    }
  }

  return undefined;
};

const mapRowToMinimalFlight = (row: Record<string, unknown>): FlightMappingResult => {
  const rowKeySet = new Set(
    Object.keys(row)
      .filter((key) => typeof key === "string")
      .map((key) => collapseKey(key)),
  );

  const hasDateHeader = DATE_FIELD_KEYS.some((key) => rowKeySet.has(collapseKey(key)));
  const hasAircraftHeader = AIRCRAFT_FIELD_KEYS.some((key) => rowKeySet.has(collapseKey(key)));
  const hasDepartureHeader = DEPARTURE_FIELD_KEYS.some((key) => rowKeySet.has(collapseKey(key)));
  const hasArrivalHeader = ARRIVAL_FIELD_KEYS.some((key) => rowKeySet.has(collapseKey(key)));

  const dateRaw = findField(row, DATE_FIELD_KEYS);
  const aircraftRaw = findField(row, AIRCRAFT_FIELD_KEYS);
  const departureRaw = findField(row, DEPARTURE_FIELD_KEYS);
  const arrivalRaw = findField(row, ARRIVAL_FIELD_KEYS);
  const routeRaw = findField(row, [
    "Route",
    "Flight Route",
    "Path",
    "Flight Path",
    "Route of Flight",
  ]);

  const totalTimeRaw =
    findField(row, [
      "TotalTime",
      "Total Time",
      "Total Flight Time",
      "Flight Time",
      "Total Hours",
      "TotalTime (Hours)",
      "TotalFlightTime",
      "FlightTime",
      "Total",
      "Block Time",
      "BlockTime",
    ]) ??
    findFieldByKeywords(row, ["total", "time"], [
      "night",
      "day",
      "pic",
      "sic",
      "country",
      "actual",
      "sim",
      "dual",
      "ground",
      "solo",
      "approach",
      "land",
      "hold",
    ]);

  const picTimeRaw = findField(row, [
    "PIC",
    "P.I.C.",
    "Pilot In Command",
    "PilotInCommand",
    "Pilot in Command Time",
    "PIC Time",
    "Pilot Command",
    "Pilot Command Time",
    "PilotInCmd",
    "PIC Hours",
  ]);

  const sicTimeRaw = findField(row, [
    "SIC",
    "S.I.C.",
    "Second In Command",
    "SecondInCommand",
    "Second in Command Time",
    "SIC Time",
    "Co-Pilot",
    "CoPilot",
    "Copilot Time",
    "First Officer",
    "FO Time",
    "SIC Hours",
  ]);

  const soloTimeRaw = findField(row, [
    "Solo",
    "Solo Time",
    "Solo Hours",
    "SoloTime",
    "Solo Flight Time",
    "SoloFlightTime",
  ]);

  const nightTimeRaw =
    findField(row, [
      "Night",
      "Night Time",
      "NightHours",
      "Night Flight Time",
      "NightFlightTime",
      "Night Hours",
    ]) ??
    findFieldByKeywords(row, ["night", "time"], ["land", "takeoff", "approach"]);

  const crossCountryRaw =
    findField(row, [
      "CrossCountry",
      "Cross Country",
      "Cross Country Time",
      "CrossCountryTime",
      "CrossCountryHours",
      "Cross Country Hours",
      "Cross-Country",
      "XC",
      "XC Time",
      "XC Hours",
      "X-C",
    ]) ??
    findFieldByKeywords(row, ["cross", "country"]);

  const actualInstrumentRaw =
    findField(row, [
      "ActualInstrument",
      "Actual Instrument",
      "Actual Instrument Time",
      "ActualInstrumentTime",
      "Actual Instrument Hours",
      "Actual IFR",
      "Actual IFR Time",
    ]) ??
    findFieldByKeywords(row, ["actual", "instrument"]);

  const simulatedInstrumentRaw =
    findField(row, [
      "SimulatedInstrument",
      "Simulated Instrument",
      "Simulated Instrument Time",
      "SimInstrument",
      "Sim Instrument Hours",
      "Sim IFR",
      "Sim IFR Time",
      "Hood Time",
    ]) ??
    findFieldByKeywords(row, ["sim", "instrument"]);

  const holdsRaw = findField(row, [
    "Holds",
    "Hold",
    "Instrument Holds",
    "Holding",
  ]);

  // ForeFlight CSV uses Approach1, Approach2, Approach3, Approach4, Approach5, Approach6 columns
  // Each column contains format like "1;ILS OR LOC RWY 30C;30C;KIWA;;" where the first number is the count
  const approach1Raw = findField(row, ["Approach1"]);
  const approach2Raw = findField(row, ["Approach2"]);
  const approach3Raw = findField(row, ["Approach3"]);
  const approach4Raw = findField(row, ["Approach4"]);
  const approach5Raw = findField(row, ["Approach5"]);
  const approach6Raw = findField(row, ["Approach6"]);
  
  // Also check for single "Approaches" column (fallback for other CSV formats)
  const approachesRaw =
    findField(row, [
      "Approaches",
      "Approach",
      "Instrument Approaches",
      "Approach Count",
      "Approaches Count",
      "IFR Approaches",
      "Instrument Approach",
    ]) ??
    findFieldByKeywords(row, ["approach"], ["time", "hours", "1", "2", "3", "4", "5", "6"]);

  const dualGivenRaw =
    findField(row, [
      "DualGiven",
      "Dual Given",
      "Instruction Given",
      "Dual Gave",
      "CFI Time",
      "Instructor",
    ]) ?? findFieldByKeywords(row, ["dual", "given"]);

  const dualReceivedRaw =
    findField(row, [
      "DualReceived",
      "Dual Received",
      "Instruction Received",
      "Dual Recv",
      "Student Time",
      "Dual Recieved",
    ]) ?? findFieldByKeywords(row, ["dual", "received"]);

  // Parse takeoff and landing fields from CSV
  const dayTakeoffsRaw =
    findField(row, [
      "DayTakeoffs",
      "Day Takeoffs",
      "Day TO",
      "DayTO",
      "Day Takeoff",
    ]) ??
    findFieldByKeywords(row, ["day", "takeoff"], ["night", "landing"]);
  
  // ForeFlight CSV structure: DayLandingsFullStop contains day landings (full stop)
  // But we also need to check for AllLandings which contains total landings
  const allLandingsRaw = findField(row, [
    "AllLandings",
    "All Landings",
    "Total Landings",
    "Landings",
  ]);
  
  const dayLandingsRaw =
    findField(row, [
      "DayLandings",
      "Day Landings",
      "Day LDG",
      "DayLDG",
      "Day Landing",
    ]) ??
    findFieldByKeywords(row, ["day", "landing"], ["night", "takeoff", "full", "stop"]);
  
  // In ForeFlight CSV, DayLandingsFullStop IS the day landings column (not separate)
  const dayLandingsFullStopRaw =
    findField(row, [
      "DayLandingsFullStop",
      "Day Landings Full Stop",
      "Day Full Stop",
      "DayLandingsFull",
      "Day Landings (Full Stop)",
    ]) ??
    findFieldByKeywords(row, ["day", "full", "stop"], ["night"]);
  
  const nightTakeoffsRaw =
    findField(row, [
      "NightTakeoffs",
      "Night Takeoffs",
      "Night TO",
      "NightTO",
      "Night Takeoff",
    ]) ??
    findFieldByKeywords(row, ["night", "takeoff"], ["day", "landing"]);
  
  // In ForeFlight CSV, NightLandingsFullStop IS the night landings column (not separate)
  const nightLandingsRaw =
    findField(row, [
      "NightLandings",
      "Night Landings",
      "Night LDG",
      "NightLDG",
      "Night Landing",
    ]) ??
    findFieldByKeywords(row, ["night", "landing"], ["day", "takeoff", "full", "stop"]);
  
  const nightLandingsFullStopRaw =
    findField(row, [
      "NightLandingsFullStop",
      "Night Landings Full Stop",
      "Night Full Stop",
      "NightLandingsFull",
      "Night Landings (Full Stop)",
    ]) ??
    findFieldByKeywords(row, ["night", "full", "stop"], ["day"]);

  const normalizedDate = dateFromValue(dateRaw);
  let registration =
    typeof aircraftRaw === "string"
      ? aircraftRaw.trim().toUpperCase()
      : typeof aircraftRaw === "number"
      ? String(aircraftRaw).trim().toUpperCase()
      : "";
  let departure = normalizeAirport(departureRaw);
  let arrival = normalizeAirport(arrivalRaw);
  const warnings: string[] = [];

  if (!departure || !arrival) {
    if (typeof routeRaw === "string" && routeRaw.trim()) {
      const normalizedRoute = routeRaw
        .toUpperCase()
        .replace(/[^A-Z0-9\s>-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (normalizedRoute) {
        const routeTokens = normalizedRoute
          .split(/[\s>-]+/)
          .map((token) => token.trim())
          .filter((token) => /^[A-Z0-9]{3,4}$/.test(token));
        if (!departure && routeTokens.length > 0) {
          departure = routeTokens[0];
        }
        if (!arrival && routeTokens.length > 0) {
          arrival = routeTokens[routeTokens.length - 1];
        }
      }
    }
  }

  if (!departure && arrival) {
    departure = arrival;
  } else if (!arrival && departure) {
    arrival = departure;
  }

  if (!registration) {
    registration = "UNKNOWN";
    warnings.push("inferred-aircraft");
  }

  if (!departure) {
    departure = "UNKNOWN";
    warnings.push("inferred-departure");
  }

  if (!arrival) {
    arrival = departure || "UNKNOWN";
    warnings.push("inferred-arrival");
  }

  const missingFields: string[] = [];
  if (!normalizedDate) missingFields.push("date");

  const matchedRequiredCount = [hasDateHeader, hasAircraftHeader, hasDepartureHeader, hasArrivalHeader].filter(Boolean).length;

  if (missingFields.length > 0) {
    if (matchedRequiredCount < 2) {
      return { status: "non-flight" };
    }
    return { status: "missing-required", missingFields, row };
  }

  const totalTime = parseTotalTime(totalTimeRaw);
  const picTime = parseTotalTime(picTimeRaw);
  const sicTime = parseTotalTime(sicTimeRaw);
  const soloTime = parseTotalTime(soloTimeRaw);
  const nightTime = parseTotalTime(nightTimeRaw);
  const crossCountryTime = parseTotalTime(crossCountryRaw);
  const actualInstrument = parseTotalTime(actualInstrumentRaw);
  const simulatedInstrument = parseTotalTime(simulatedInstrumentRaw);
  const dualGiven = parseTotalTime(dualGivenRaw);
  const dualReceived = parseTotalTime(dualReceivedRaw);

  let holds: number | null = null;
  if (typeof holdsRaw === "number" && Number.isFinite(holdsRaw)) {
    holds = holdsRaw;
  } else if (typeof holdsRaw === "string" && holdsRaw.trim()) {
    const parsed = Number.parseInt(holdsRaw.trim(), 10);
    if (!Number.isNaN(parsed)) {
      holds = parsed;
    }
  }

  // Helper function to extract approach count from ForeFlight format like "1;ILS OR LOC RWY 30C;30C;KIWA;;"
  const parseApproachValue = (value: unknown): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      // Extract the first number (count) from format like "1;ILS OR LOC RWY 30C;30C;KIWA;;"
      const match = value.trim().match(/^(\d+)/);
      if (match) {
        return Number.parseInt(match[1], 10);
      }
    }
    return 0;
  };

  // Sum up approaches from Approach1-6 columns (ForeFlight format)
  let approaches: number | null = null;
  const approach1Count = parseApproachValue(approach1Raw);
  const approach2Count = parseApproachValue(approach2Raw);
  const approach3Count = parseApproachValue(approach3Raw);
  const approach4Count = parseApproachValue(approach4Raw);
  const approach5Count = parseApproachValue(approach5Raw);
  const approach6Count = parseApproachValue(approach6Raw);
  
  const totalFromColumns = approach1Count + approach2Count + approach3Count + approach4Count + approach5Count + approach6Count;
  
  if (totalFromColumns > 0) {
    approaches = totalFromColumns;
  } else if (approachesRaw) {
    // Fallback to single "Approaches" column if Approach1-6 not found
    if (typeof approachesRaw === "number" && Number.isFinite(approachesRaw)) {
      approaches = approachesRaw;
    } else if (typeof approachesRaw === "string" && approachesRaw.trim()) {
      const parsed = Number.parseInt(approachesRaw.trim(), 10);
      if (!Number.isNaN(parsed)) {
        approaches = parsed;
      }
    }
  }

  // Helper function to parse integer counts (for takeoffs and landings)
  const parseCount = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.floor(value);
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number.parseInt(value.trim(), 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return null;
  };

  const dayTakeoffs = parseCount(dayTakeoffsRaw);
  const dayLandingsFullStop = parseCount(dayLandingsFullStopRaw);
  const nightTakeoffs = parseCount(nightTakeoffsRaw);
  const nightLandingsFullStop = parseCount(nightLandingsFullStopRaw);
  const allLandings = parseCount(allLandingsRaw);
  
  // In ForeFlight CSV structure:
  // - DayLandingsFullStop contains day landings (they're all full stop in this CSV)
  // - NightLandingsFullStop contains night landings (they're all full stop in this CSV)
  // - AllLandings contains the total of all landings
  // So we use DayLandingsFullStop as day_landings and also as day_landings_full_stop
  const dayLandings = dayLandingsFullStop; // In this CSV, day landings = day landings full stop
  const nightLandings = nightLandingsFullStop; // In this CSV, night landings = night landings full stop
  
  // Use AllLandings to verify/calculate if available, otherwise sum individual values
  const calculatedTotalLandings = (dayLandings ?? 0) + (nightLandings ?? 0);
  const totalLandings = allLandings ?? calculatedTotalLandings;

  return {
    status: "success",
    flight: {
      date: normalizedDate,
      aircraft_registration: registration,
      aircraft_type: registration,
      departure_airport: departure,
      arrival_airport: arrival,
      total_time: totalTime,
      pic_time: picTime,
      sic_time: sicTime,
      solo_time: soloTime,
      night_time: nightTime,
      cross_country_time: crossCountryTime,
      actual_instrument: actualInstrument,
      simulated_instrument: simulatedInstrument,
      holds,
      approaches,
      day_takeoffs: dayTakeoffs,
      day_landings: dayLandings,
      day_landings_full_stop: dayLandingsFullStop,
      night_takeoffs: nightTakeoffs,
      night_landings: nightLandings,
      night_landings_full_stop: nightLandingsFullStop,
      all_landings: totalLandings,
      dual_given: dualGiven,
      dual_received: dualReceived,
    },
    warnings,
  };
};

export const CSVImportDialog = ({ open, onOpenChange, onImportComplete }: CSVImportDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [skippedRows, setSkippedRows] = useState<number>(0);

  const handleClose = () => {
    if (isImporting) return;
    setFile(null);
    setSkippedRows(0);
    onOpenChange(false);
  };

  const handleImport = async () => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Please sign in before importing flights.",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "No file selected",
        description: "Choose a CSV file to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      const rows = extractFlightsFromCsv(text);

      // Debug: Log column names from first row to help diagnose mapping issues
      if (rows.length > 0) {
        const columnNames = Object.keys(rows[0]);
        console.debug("[CSV Import] Available columns:", columnNames.filter((name) => 
          /day|night|takeoff|landing|to|ldg/i.test(name)
        ));
      }

      const flights: MinimalFlight[] = [];
      const inferenceCounts = { aircraft: 0, departure: 0, arrival: 0 };
      let skipped = 0;
      let nonFlightRows = 0;
      const skippedSamples: Array<{ missingFields: string[]; row: Record<string, unknown> }> = [];

      for (const row of rows) {
        const mapped = mapRowToMinimalFlight(row);
        if (mapped.status === "success") {
          flights.push(mapped.flight);
          if (mapped.warnings.includes("inferred-aircraft")) {
            inferenceCounts.aircraft += 1;
          }
          if (mapped.warnings.includes("inferred-departure")) {
            inferenceCounts.departure += 1;
          }
          if (mapped.warnings.includes("inferred-arrival")) {
            inferenceCounts.arrival += 1;
          }
        } else if (mapped.status === "missing-required") {
          skipped += 1;
          if (skippedSamples.length < 5) {
            skippedSamples.push({ missingFields: mapped.missingFields, row: mapped.row });
          }
        } else {
          nonFlightRows += 1;
        }
      }

      if (flights.length === 0) {
        setSkippedRows(skipped);
        toast({
          title: "No flights imported",
          description: "We couldn't find any rows with a date, tail number, and both airports.",
          variant: "destructive",
        });
        return;
      }

      if (skipped > 0 || nonFlightRows > 0) {
        console.debug("[CSV Import] Skipped rows", {
          missingRequired: skipped,
          nonFlightRows,
          samples: skippedSamples,
        });
      }

      if (inferenceCounts.aircraft > 0 || inferenceCounts.departure > 0 || inferenceCounts.arrival > 0) {
        console.debug("[CSV Import] Inferred fields", inferenceCounts);
      }

      const totalImportedTime = flights.reduce((sum, flight) => sum + (flight.total_time ?? 0), 0);
      const totalImportedPic = flights.reduce((sum, flight) => sum + (flight.pic_time ?? 0), 0);
      const totalImportedSic = flights.reduce((sum, flight) => sum + (flight.sic_time ?? 0), 0);
      const totalImportedSolo = flights.reduce((sum, flight) => sum + (flight.solo_time ?? 0), 0);
      const totalImportedNight = flights.reduce((sum, flight) => sum + (flight.night_time ?? 0), 0);
      const totalImportedCrossCountry = flights.reduce(
        (sum, flight) => sum + (flight.cross_country_time ?? 0),
        0,
      );
      const totalImportedActualInstrument = flights.reduce(
        (sum, flight) => sum + (flight.actual_instrument ?? 0),
        0,
      );
      const totalImportedSimInstrument = flights.reduce(
        (sum, flight) => sum + (flight.simulated_instrument ?? 0),
        0,
      );
      const totalDualGiven = flights.reduce((sum, flight) => sum + (flight.dual_given ?? 0), 0);
      const totalDualReceived = flights.reduce((sum, flight) => sum + (flight.dual_received ?? 0), 0);
      const totalHolds = flights.reduce((sum, flight) => sum + (flight.holds ?? 0), 0);
      const totalApproaches = flights.reduce((sum, flight) => sum + (flight.approaches ?? 0), 0);
      const totalDayTakeoffs = flights.reduce((sum, flight) => sum + (flight.day_takeoffs ?? 0), 0);
      const totalDayLandings = flights.reduce((sum, flight) => sum + (flight.day_landings ?? 0), 0);
      const totalDayLandingsFullStop = flights.reduce((sum, flight) => sum + (flight.day_landings_full_stop ?? 0), 0);
      const totalNightTakeoffs = flights.reduce((sum, flight) => sum + (flight.night_takeoffs ?? 0), 0);
      const totalNightLandings = flights.reduce((sum, flight) => sum + (flight.night_landings ?? 0), 0);
      const totalNightLandingsFullStop = flights.reduce((sum, flight) => sum + (flight.night_landings_full_stop ?? 0), 0);

      const missingTotalTime = flights.filter(
        (flight) => flight.total_time === null || flight.total_time === undefined || flight.total_time <= 0,
      ).length;

      console.debug("[CSV Import] Sample flight values", {
        totalTime: flights.slice(0, 5).map((f) => f.total_time),
        pic: flights.slice(0, 5).map((f) => f.pic_time),
        sic: flights.slice(0, 5).map((f) => f.sic_time),
        solo: flights.slice(0, 5).map((f) => f.solo_time),
        night: flights.slice(0, 5).map((f) => f.night_time),
        crossCountry: flights.slice(0, 5).map((f) => f.cross_country_time),
        actualInstrument: flights.slice(0, 5).map((f) => f.actual_instrument),
        simulatedInstrument: flights.slice(0, 5).map((f) => f.simulated_instrument),
        holds: flights.slice(0, 5).map((f) => f.holds),
        approaches: flights.slice(0, 5).map((f) => f.approaches),
        dayTakeoffs: flights.slice(0, 5).map((f) => f.day_takeoffs),
        dayLandings: flights.slice(0, 5).map((f) => f.day_landings),
        dayLandingsFullStop: flights.slice(0, 5).map((f) => f.day_landings_full_stop),
        nightTakeoffs: flights.slice(0, 5).map((f) => f.night_takeoffs),
        nightLandings: flights.slice(0, 5).map((f) => f.night_landings),
        nightLandingsFullStop: flights.slice(0, 5).map((f) => f.night_landings_full_stop),
        missingTotalTime,
      });

      const inferenceMessages: string[] = [];
      if (inferenceCounts.departure > 0) {
        inferenceMessages.push(
          `filled missing departure airport on ${inferenceCounts.departure} flight${inferenceCounts.departure === 1 ? "" : "s"}`,
        );
      }
      if (inferenceCounts.arrival > 0) {
        inferenceMessages.push(
          `filled missing arrival airport on ${inferenceCounts.arrival} flight${inferenceCounts.arrival === 1 ? "" : "s"}`,
        );
      }
      if (inferenceCounts.aircraft > 0) {
        inferenceMessages.push(
          `filled missing aircraft on ${inferenceCounts.aircraft} flight${inferenceCounts.aircraft === 1 ? "" : "s"}`,
        );
      }

      // Extract aircraft data from the Aircraft Table section in CSV
      const aircraftDataMap = extractAircraftDataFromCsv(text);

      // First, create/update aircraft records for all unique aircraft in the import
      const uniqueAircraft = new Map<string, { registration: string; type: string }>();
      for (const flight of flights) {
        const key = flight.aircraft_registration.toUpperCase();
        if (!uniqueAircraft.has(key)) {
          uniqueAircraft.set(key, {
            registration: flight.aircraft_registration.toUpperCase(),
            type: flight.aircraft_type,
          });
        }
      }

      // Upsert aircraft records (create if doesn't exist, update if it does)
      for (const [_, aircraft] of uniqueAircraft) {
        try {
          // Check if aircraft already exists
          const { data: existingAircraft } = await supabase
            .from("aircraft_logbook")
            .select("id")
            .eq("user_id", user.id)
            .eq("aircraft_id", aircraft.registration)
            .single();

          // Get aircraft data from CSV if available, otherwise use defaults
          const csvAircraftData = aircraftDataMap.get(aircraft.registration);
          
          if (!existingAircraft) {
            // Create new aircraft record
            const aircraftPayload = csvAircraftData ? {
              user_id: user.id,
              equipment_type: csvAircraftData.equipment_type,
              aircraft_id: aircraft.registration,
              type_code: csvAircraftData.type_code,
              category_class: csvAircraftData.category_class,
              year: csvAircraftData.year,
              make: csvAircraftData.make,
              model: csvAircraftData.model,
              gear_type: csvAircraftData.gear_type,
              engine_type: csvAircraftData.engine_type,
              complex: csvAircraftData.complex,
              taa: csvAircraftData.taa,
              high_performance: csvAircraftData.high_performance,
              pressurized: csvAircraftData.pressurized,
            } : {
              // Fallback to minimal data if not in Aircraft Table
              user_id: user.id,
              equipment_type: "Aircraft",
              aircraft_id: aircraft.registration,
              type_code: null,
              category_class: "ASEL",
              year: null,
              // Make and model are required (NOT NULL), so provide defaults
              // Try to parse from aircraft type, or use registration as fallback
              make: aircraft.type && aircraft.type.trim() 
                ? (aircraft.type.split(" ")[0] || aircraft.registration)
                : aircraft.registration,
              model: aircraft.type && aircraft.type.trim() 
                ? aircraft.type 
                : aircraft.registration,
              gear_type: null,
              engine_type: null,
              complex: false,
              taa: false,
              high_performance: false,
              pressurized: false,
            };

            await supabase.from("aircraft_logbook").insert(aircraftPayload);
          } else if (csvAircraftData) {
            // Update existing aircraft with CSV data if available
            await supabase
              .from("aircraft_logbook")
              .update({
                type_code: csvAircraftData.type_code,
                year: csvAircraftData.year,
                make: csvAircraftData.make,
                model: csvAircraftData.model,
                gear_type: csvAircraftData.gear_type,
                engine_type: csvAircraftData.engine_type,
                equipment_type: csvAircraftData.equipment_type,
                category_class: csvAircraftData.category_class,
                complex: csvAircraftData.complex,
                taa: csvAircraftData.taa,
                high_performance: csvAircraftData.high_performance,
                pressurized: csvAircraftData.pressurized,
              })
              .eq("id", existingAircraft.id);
          }
        } catch (error) {
          // Log but don't fail the import if aircraft creation fails
          console.warn(`[CSV Import] Failed to create/update aircraft ${aircraft.registration}:`, error);
        }
      }

      const insertPayload = flights.map((flight) => ({
        user_id: user.id,
        date: flight.date,
        aircraft_registration: flight.aircraft_registration,
        aircraft_type: flight.aircraft_type,
        departure_airport: flight.departure_airport,
        arrival_airport: flight.arrival_airport,
        total_time: flight.total_time ?? 0,
        pic_time: flight.pic_time ?? 0,
        sic_time: flight.sic_time ?? 0,
        solo_time: flight.solo_time ?? 0,
        night_time: flight.night_time ?? 0,
        cross_country_time: flight.cross_country_time ?? 0,
        actual_instrument: flight.actual_instrument ?? 0,
        simulated_instrument: flight.simulated_instrument ?? 0,
        dual_given: flight.dual_given ?? 0,
        dual_received: flight.dual_received ?? 0,
        holds: flight.holds ?? 0,
        approaches: String(flight.approaches ?? 0),
        day_takeoffs: flight.day_takeoffs != null ? flight.day_takeoffs : 0,
        day_landings: flight.day_landings != null ? flight.day_landings : 0,
        day_landings_full_stop: flight.day_landings_full_stop != null ? flight.day_landings_full_stop : 0,
        night_takeoffs: flight.night_takeoffs != null ? flight.night_takeoffs : 0,
        night_landings: flight.night_landings != null ? flight.night_landings : 0,
        night_landings_full_stop: flight.night_landings_full_stop != null ? flight.night_landings_full_stop : 0,
        // Use AllLandings as the primary source - it contains the total of ALL landings
        // In ForeFlight CSV, AllLandings includes all landing types, not just day/night full stops
        // This is the accurate total landing count
        landings: flight.all_landings != null ? flight.all_landings : ((flight.day_landings ?? 0) + (flight.night_landings ?? 0)),
      }));

      // Try inserting with all columns first
      let result = await supabase.from("flight_entries").insert(insertPayload);

      // If there's an error, check if it's due to missing columns
      if (result.error) {
        const errorMsg = result.error.message || "";
        const hasColumnError = 
          errorMsg.includes("day_takeoffs") ||
          errorMsg.includes("day_landings") ||
          errorMsg.includes("night_takeoffs") ||
          errorMsg.includes("night_landings") ||
          errorMsg.includes("day_landings_full_stop") ||
          errorMsg.includes("night_landings_full_stop") ||
          errorMsg.includes("column") && errorMsg.includes("does not exist");
        
        if (hasColumnError) {
          console.warn("[CSV Import] Schema mismatch detected, retrying without landing/takeoff columns");
          console.warn("[CSV Import] Error details:", result.error);
          
          // Create fallback payload without landing/takeoff columns
          const fallbackPayload = insertPayload.map((flight) => {
            const { 
              day_takeoffs, 
              day_landings, 
              day_landings_full_stop, 
              night_takeoffs, 
              night_landings, 
              night_landings_full_stop, 
              ...rest 
            } = flight;
            return rest;
          });
          
          result = await supabase.from("flight_entries").insert(fallbackPayload);
          
          if (!result.error) {
            console.warn("[CSV Import] Successfully imported without landing/takeoff columns");
            toast({
              title: "Import completed with limitations",
              description: "Flights imported successfully, but landing/takeoff data was not saved. Please apply database migrations to enable full import.",
              variant: "default",
            });
          }
        }
      }

      if (result.error) {
        console.error("[CSV Import] Database error:", result.error);
        throw result.error;
      }

      setSkippedRows(skipped);
      toast({
        title: "Import complete",
        description: [
          `Added ${flights.length} flights totaling ${totalImportedTime.toFixed(2)} hours`,
          totalImportedPic > 0 ? `${totalImportedPic.toFixed(2)} PIC` : null,
          totalImportedSic > 0 ? `${totalImportedSic.toFixed(2)} SIC` : null,
          totalImportedSolo > 0 ? `${totalImportedSolo.toFixed(2)} solo` : null,
          totalImportedNight > 0 ? `${totalImportedNight.toFixed(2)} night` : null,
          totalImportedCrossCountry > 0 ? `${totalImportedCrossCountry.toFixed(2)} cross-country` : null,
          totalImportedActualInstrument > 0 ? `${totalImportedActualInstrument.toFixed(2)} actual instrument` : null,
          totalImportedSimInstrument > 0 ? `${totalImportedSimInstrument.toFixed(2)} simulated instrument` : null,
          totalDualGiven > 0 ? `${totalDualGiven.toFixed(2)} dual given` : null,
          totalDualReceived > 0 ? `${totalDualReceived.toFixed(2)} dual received` : null,
          totalHolds > 0 ? `${totalHolds} holds` : null,
          totalApproaches > 0 ? `${totalApproaches} approaches` : null,
          totalDayTakeoffs > 0 ? `${totalDayTakeoffs} day takeoffs` : null,
          totalDayLandings > 0 ? `${totalDayLandings} day landings` : null,
          totalNightTakeoffs > 0 ? `${totalNightTakeoffs} night takeoffs` : null,
          totalNightLandings > 0 ? `${totalNightLandings} night landings` : null,
          ...inferenceMessages,
          skipped > 0 ? `skipped ${skipped} incomplete row${skipped === 1 ? "" : "s"}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
      });

      onImportComplete();
      handleClose();
    } catch (error) {
      console.error("CSV import failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Import failed",
        description: errorMessage.includes("duplicate") 
          ? "Some flights already exist in your logbook. Remove duplicates or update existing entries."
          : errorMessage.length > 100 
          ? `Error: ${errorMessage.substring(0, 100)}...` 
          : errorMessage || "Something went wrong while importing the CSV. Please verify the file and try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? handleClose() : onOpenChange(true))}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Flights from CSV</DialogTitle>
          <DialogDescription>
            Upload a ForeFlight or similar logbook export. We'll add each flight with its date, tail number, and route. Flight time
            values will be left blank for now.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">CSV File</label>
            <Input
              type="file"
              accept=".csv,text/csv"
              disabled={isImporting}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setSkippedRows(0);
              }}
            />
          </div>

          <Alert>
            <AlertDescription className="text-sm text-muted-foreground">
              Required columns: <strong>Date</strong>, <strong>AircraftID</strong> (tail number), and either{" "}
              <strong>From/To</strong> or <strong>Departure/Arrival</strong>. Any rows missing one of these values will be skipped.
            </AlertDescription>
          </Alert>

          {skippedRows > 0 ? (
            <p className="text-sm text-muted-foreground">Skipped {skippedRows} incomplete row{skippedRows === 1 ? "" : "s"}.</p>
          ) : null}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !file}>
            {isImporting ? "Importing…" : "Import Flights"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CSVImportDialog;
