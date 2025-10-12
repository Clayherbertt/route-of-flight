import fs from "fs";
import Papa from "papaparse";

const HEADER_BOM = /^\uFEFF/;

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

const sanitizeHeader = (header) => header.replace(HEADER_BOM, "").trim();

const extractFlightsFromCsv = (csvText) => {
  const text = csvText.replace(/\r\n?/g, "\n");
  const lines = text.split("\n").map((line) => line.replace(/\uFEFF/g, ""));

  const sliceFlightSection = (sourceLines) => {
    const normalized = sourceLines.map((line) =>
      line.replace(/"/g, "").replace(/,/g, "").trim().toLowerCase(),
    );

    const findSectionFromIndex = (startIndex) => {
      let headerIdx = -1;
      for (let i = startIndex + 1; i < sourceLines.length; i++) {
        if (!normalized[i]) continue;
        headerIdx = i;
        break;
      }
      if (headerIdx === -1) return null;

      let endIdx = headerIdx + 1;
      for (; endIdx < sourceLines.length; endIdx++) {
        const trimmed = normalized[endIdx];
        if (!trimmed) break;
        if (trimmed.endsWith("table") && endIdx > headerIdx + 1) break;
      }

      return [sourceLines[headerIdx], ...sourceLines.slice(headerIdx + 1, endIdx)].join("\n");
    };

    const tableIdx = normalized.findIndex((line) => line === "flights table");
    if (tableIdx !== -1) {
      const section = findSectionFromIndex(tableIdx);
      if (section) return section;
    }

    return null;
  };

  const section = sliceFlightSection(lines) ?? text;

  const parsed = Papa.parse(section, {
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
    }),
  );
};

const dateFromValue = (value) => {
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

const normalizeAirport = (value) => {
  if (typeof value === "string") {
    return value.trim().toUpperCase();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value).trim().toUpperCase();
  }
  return "";
};

const normalizeHoursPrecision = (hours) => {
  if (!Number.isFinite(hours)) {
    return NaN;
  }
  return Math.round(hours * 1000) / 1000;
};

const parseTotalTime = (value) => {
  if (value === null || value === undefined) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return normalizeHoursPrecision(value);
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/\u00A0/g, " ").replace(/[–—]/g, "-").trim();

  const parseFromHoursMinutes = (hours, minutes = 0, seconds = 0) => {
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

const collapseKey = (key) => key.replace(/\s+|[_-]/g, "").toLowerCase();

const findField = (row, candidates) => {
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

const findFieldByKeywords = (row, include, exclude = []) => {
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

const mapRow = (row) => {
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
  const routeRaw = findField(row, ["Route", "Flight Route", "Route Of Flight"]);

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

  const normalizedDate = dateFromValue(dateRaw);
  let registration =
    typeof aircraftRaw === "string"
      ? aircraftRaw.trim().toUpperCase()
      : typeof aircraftRaw === "number"
      ? String(aircraftRaw).trim().toUpperCase()
      : "";
  let departure = normalizeAirport(departureRaw);
  let arrival = normalizeAirport(arrivalRaw);
  const warnings = [];

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

  const missingFields = [];
  if (!normalizedDate) missingFields.push("date");

  const matchedRequiredCount = [hasDateHeader, hasAircraftHeader, hasDepartureHeader, hasArrivalHeader].filter(Boolean).length;

  if (missingFields.length > 0) {
    if (matchedRequiredCount < 2) {
      return { status: "non-flight" };
    }
    return { status: "missing-required", missingFields, row };
  }

  const totalTime = parseTotalTime(totalTimeRaw);

  return {
    status: "success",
    flight: {
      date: normalizedDate,
      aircraft_registration: registration,
      departure_airport: departure,
      arrival_airport: arrival,
      total_time: totalTime,
    },
    warnings,
  };
};

const main = () => {
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: node tmp/debug-import.mjs <csv-path>");
    process.exit(1);
  }
  const csv = fs.readFileSync(path, "utf8");
  const rows = extractFlightsFromCsv(csv);
  let total = 0;
  let totalCount = 0;
  const inferenceCounts = { aircraft: 0, departure: 0, arrival: 0 };
  const totals = {
    total_time: 0,
    actual_instrument: 0,
    simulated_instrument: 0,
    pic: 0,
  };
  const skipped = [];
  const nonFlights = [];
  for (const row of rows) {
    const mapped = mapRow(row);
    if (mapped.status === "success") {
      const hours = mapped.flight.total_time ?? 0;
      total += hours;
      totalCount += 1;
      totals.total_time += mapped.flight.total_time ?? 0;
      totals.actual_instrument += mapped.flight.actual_instrument ?? 0;
      totals.simulated_instrument += mapped.flight.simulated_instrument ?? 0;
      totals.pic += mapped.flight.pic_time ?? 0;
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
      skipped.push({ missing: mapped.missingFields, row });
    } else {
      nonFlights.push(row);
    }
  }
  console.log("Mapped flights:", totalCount);
  console.log("Total time:", total.toFixed(2));
  console.log("Actual instrument:", totals.actual_instrument.toFixed(2));
  console.log("Sim instrument:", totals.simulated_instrument.toFixed(2));
  console.log("Inferred fields:", inferenceCounts);
  console.log("Skipped (missing required):", skipped.length);
  console.log("Non-flight rows:", nonFlights.length);
  if (skipped.length) {
    console.log("Skipped detail:");
    for (const sample of skipped) {
      console.log(
        JSON.stringify({
          date: sample.row.Date,
          aircraft: sample.row.AircraftID,
          from: sample.row.From,
          to: sample.row.To,
          total: sample.row.TotalTime,
          missing: sample.missing,
        }),
      );
    }
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
