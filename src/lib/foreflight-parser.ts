/**
 * Robust ForeFlight CSV Parser
 * Handles the complex multi-section CSV format from ForeFlight exports
 */

import Papa from "papaparse";

type RawValue = string | number | null | undefined;
type RawRow = Record<string, RawValue>;

export interface ForeFlightRow {
  date: string;
  aircraft_registration: string;
  aircraft_type?: string;
  departure_airport: string;
  arrival_airport: string;
  total_time: number;
  pic_time: number;
  sic_time: number;
  cross_country_time: number;
  night_time: number;
  instrument_time: number;
  actual_instrument: number;
  simulated_instrument: number;
  solo_time: number;
  dual_given: number;
  dual_received: number;
  holds: number;
  approaches: string;
  landings: number;
  day_takeoffs: number;
  day_landings: number;
  night_takeoffs: number;
  night_landings: number;
  simulated_flight: number;
  ground_training: number;
  route?: string;
  remarks?: string;
  start_time?: string;
  end_time?: string;
  time_out?: string;
  time_off?: string;
  time_on?: string;
  time_in?: string;
  on_duty?: string;
  off_duty?: string;
  hobbs_start?: number;
  hobbs_end?: number;
  tach_start?: number;
  tach_end?: number;
  day_landings_full_stop?: number;
  night_landings_full_stop?: number;
  // Raw data for debugging
  _raw?: RawRow;
  _format?: 'modern' | 'legacy2019' | 'legacy2018';
}

export interface ParseReport {
  totalRows: number;
  validFlights: number;
  invalidFlights: number;
  zeroTimeFlights: number;
  aircraftCount: number;
  dateRange: {
    earliest?: string;
    latest?: string;
  };
  totalHours: number;
  formatBreakdown: {
    modern: number;
    legacy2019: number;
    legacy2018: number;
  };
  warnings: string[];
  sampleFlight?: ForeFlightRow;
}

/**
 * Parse a number field with multiple fallback strategies
 */
function parseDurationLike(value: string): number | null {
  const normalized = value.trim();
  if (!normalized) return null;

  // Handle HH:MM[:SS] formats
  const colonParts = normalized.split(':');
  if (colonParts.length >= 2 && colonParts.length <= 3) {
    const numericParts = colonParts.map(part => Number(part));
    if (numericParts.every(part => !Number.isNaN(part))) {
      const [hours, minutes = 0, seconds = 0] = numericParts;
      return hours + minutes / 60 + seconds / 3600;
    }
  }

  // Handle H+MM format (common in some logbooks)
  if (normalized.includes('+')) {
    const [hoursPart, minutesPart] = normalized.split('+');
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      return hours + minutes / 60;
    }
  }

  // Handle formats like "1h 30m" or "45 min"
  const hourMatch = normalized.match(/(-?\d+(?:\.\d+)?)\s*h(?:ours?)?/i);
  const minuteMatch = normalized.match(/(\d+(?:\.\d+)?)\s*m(?:in(?:utes?)?)?/i);
  if (hourMatch || minuteMatch) {
    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      return hours + minutes / 60;
    }
  }

  return null;
}

export function coerceNumber(raw: RawValue): number | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;

  const str = raw.toString().trim();
  if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return null;
  }

  const duration = parseDurationLike(str);
  if (duration !== null) {
    return duration;
  }

  const dotted = str.includes('.')
    ? str.replace(/,/g, '')
    : str.replace(',', '.');

  const parsed = parseFloat(dotted);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  return null;
}

function parseNumber(value: RawValue, fallbacks: RawValue[] = []): number {
  const primary = coerceNumber(value);
  if (primary !== null) return primary;

  for (const fallback of fallbacks) {
    const coerced = coerceNumber(fallback);
    if (coerced !== null) return coerced;
  }

  return 0;
}

/**
 * Calculate flight time from TimeOut/TimeIn strings
 */
function calculateFlightTime(timeOut?: RawValue, timeIn?: RawValue): number {
  if (!timeOut || !timeIn) return 0;

  try {
    const parseTime = (timeStr: string): number => {
      if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + minutes / 60;
      }
      return parseFloat(timeStr) || 0;
    };

    const outTime = parseTime(timeOut.toString());
    const inTime = parseTime(timeIn.toString());
    
    // Handle day rollover
    if (inTime < outTime) {
      return (24 - outTime) + inTime;
    }
    
    return inTime - outTime;
  } catch (e) {
    return 0;
  }
}

/**
 * Detect flight data format based on date and available columns
 */
function detectFormat(row: RawRow): 'modern' | 'legacy2019' | 'legacy2018' {
  const date = new Date(row.Date || row.date);
  const year = date.getFullYear();
  
  // Check for specific modern format indicators
  if (year >= 2020 && (row.total_time !== undefined || row.TotalTime !== undefined)) {
    return 'modern';
  }
  
  // 2019 format usually has more structured columns
  if (year === 2019) {
    return 'legacy2019';
  }
  
  // 2018 and earlier - may have different column structure
  return 'legacy2018';
}

/**
 * Normalize a single flight row from ForeFlight CSV
 */
function normalizeFlightRow(row: RawRow): ForeFlightRow | null {
  const format = detectFormat(row);
  
  // Extract basic info
  const date = row.Date || row.date;
  if (!date || date === '' || date === 'null') {
    return null; // Skip rows without dates
  }
  
  const aircraftReg = (
    row.AircraftID ||
    row.aircraft_registration ||
    row.Aircraft ||
    row['Aircraft Registration'] ||
    row['Aircraft Tail Number'] ||
    row['Tail Number'] ||
    row['Aircraft Number'] ||
    row['N-Number'] ||
    row['Aircraft No'] ||
    row['Aircraft Reg'] ||
    row.aircraft ||
    ''
  ).toString().trim();
  const depAirport = (
    row.From ||
    row.departure_airport ||
    row['Departure Airport'] ||
    row['Departure'] ||
    row['From Airport'] ||
    ''
  ).toString().trim();
  const arrAirport = (
    row.To ||
    row.arrival_airport ||
    row['Arrival Airport'] ||
    row['Arrival'] ||
    row['To Airport'] ||
    depAirport ||
    ''
  ).toString().trim();
  
  if (!aircraftReg || !depAirport) {
    return null; // Skip rows without essential data
  }
  
  let totalTime = 0;
  let picTime = 0;
  let sicTime = 0;
  
  if (format === 'modern') {
    // Modern format (2020+)
    totalTime = parseNumber(row.total_time, [row.TotalTime]);
    picTime = parseNumber(row.pic_time, [row.PIC]);
    sicTime = parseNumber(row.sic_time, [row.SIC]);
  } else if (format === 'legacy2019') {
    // 2019 format
    totalTime = parseNumber(row.TotalTime);
    picTime = parseNumber(row.PIC);
    sicTime = parseNumber(row.SIC);
  } else {
    // 2018 format - more aggressive parsing
    totalTime = parseNumber(row.TotalTime, [
      row.Total, 
      row['Total Time'], 
      row.FlightTime,
      row.Duration
    ]);
    
    picTime = parseNumber(row.PIC, [
      row.PilotInCommand,
      row['PIC Time'],
      row.Captain
    ]);
    
    sicTime = parseNumber(row.SIC, [
      row.SecondInCommand,
      row['SIC Time'],
      row.FirstOfficer
    ]);
    
    // If still no total time, try calculating from TimeOut/TimeIn
    if (totalTime === 0) {
      totalTime = calculateFlightTime(row.TimeOut, row.TimeIn);
    }
    
    // For 2018, if we have total time but no PIC/SIC breakdown, assume PIC (solo training)
    if (totalTime > 0 && picTime === 0 && sicTime === 0) {
      picTime = totalTime;
    }
  }
  
  return {
    date,
    aircraft_registration: aircraftReg,
    aircraft_type: row.aircraft_type || row.Type || row['Aircraft Type'] || aircraftReg,
    departure_airport: depAirport,
    arrival_airport: arrAirport,
    total_time: totalTime,
    pic_time: picTime,
    sic_time: sicTime,
    cross_country_time: parseNumber(row.CrossCountry, [row['Cross Country'], row.XC]),
    night_time: parseNumber(row.Night),
    instrument_time: parseNumber(row.IFR, [row.Instrument]),
    actual_instrument: parseNumber(row.ActualInstrument, [row['Actual Instrument']]),
    simulated_instrument: parseNumber(row.SimulatedInstrument, [row['Simulated Instrument']]),
    solo_time: parseNumber(row.Solo),
    dual_given: parseNumber(row.DualGiven, [row['Dual Given']]),
    dual_received: parseNumber(row.DualReceived, [row['Dual Received']]),
    holds: parseNumber(row.Holds),
    approaches: (row.Approach1 || row.Approaches || '0').toString(),
    landings: parseNumber(row.AllLandings, [row.Landings, row.DayLandingsFullStop, 1]),
    day_takeoffs: parseNumber(row.DayTakeoffs, [1]),
    day_landings: parseNumber(row.DayLandings, [row.DayLandingsFullStop, 1]),
    day_landings_full_stop: parseNumber(row.DayLandingsFullStop, [row['Day Landings Full Stop'], row.DayLandings, 0]),
    night_takeoffs: parseNumber(row.NightTakeoffs),
    night_landings: parseNumber(row.NightLandings, [row.NightLandingsFullStop]),
    night_landings_full_stop: parseNumber(row.NightLandingsFullStop, [row['Night Landings Full Stop'], row.NightLandings, 0]),
    simulated_flight: parseNumber(row.SimulatedFlight),
    ground_training: parseNumber(row.GroundTraining),
    route: row.Route || row['Route of Flight'] || row.RouteOfFlight || row.route,
    remarks: row.PilotComments || row.Remarks || row.Comments || row.remarks,
    time_out: row.TimeOut || row['Time Out'] || row.start_time,
    time_off: row.TimeOff || row['Time Off'] || row.time_off,
    time_on: row.TimeOn || row['Time On'] || row.time_on,
    time_in: row.TimeIn || row['Time In'] || row.end_time,
    on_duty: row.OnDuty || row['On Duty'] || row.on_duty,
    off_duty: row.OffDuty || row['Off Duty'] || row.off_duty,
    hobbs_start: parseNumber(row.HobbsStart),
    hobbs_end: parseNumber(row.HobbsEnd),
    tach_start: parseNumber(row.TachStart),
    tach_end: parseNumber(row.TachEnd),
    start_time: row.TimeOut || row['Time Out'] || row.start_time,
    end_time: row.TimeIn || row['Time In'] || row.end_time,
    _raw: row,
    _format: format
  };
}

/**
 * Load and parse ForeFlight CSV file
 */
export async function loadForeFlightCsv(file: File): Promise<ForeFlightRow[]> {
  const text = await file.text();
  const { data } = Papa.parse<string[]>(text, {
    skipEmptyLines: false,
  });

  const rows = (data as string[][]).map(row =>
    (row ?? []).map(cell => (cell ?? '').toString().trim())
  );

  const flights: ForeFlightRow[] = [];
  const aircraftLookup = new Map<string, { typeCode?: string; make?: string; model?: string }>();
  let currentSection: 'none' | 'aircraft' | 'flights' = 'none';
  let flightHeaders: string[] = [];

  for (const row of rows) {
    const firstCell = row[0]?.toLowerCase?.() || '';

    if (!row.some(cell => cell && cell.trim())) {
      continue;
    }

    if (firstCell.includes('foreflight logbook import')) {
      currentSection = 'none';
      flightHeaders = [];
      continue;
    }

    if (firstCell === 'aircraft table') {
      currentSection = 'aircraft';
      continue;
    }

    if (firstCell === 'flights table') {
      currentSection = 'flights';
      flightHeaders = [];
      continue;
    }

    if (currentSection === 'aircraft') {
      if (!row[0] || row[0] === 'AircraftID') continue;

      const aircraftId = row[0];
      if (aircraftId) {
        aircraftLookup.set(aircraftId, {
          typeCode: row[1] || row[3],
          make: row[3],
          model: row[4],
        });
      }
      continue;
    }

    if (currentSection === 'flights') {
      if (flightHeaders.length === 0) {
        if (firstCell === 'date') {
          flightHeaders = row.map(header => header.replace(/"/g, '').trim());
        }
        continue;
      }

      if (!row[0]) {
        continue;
      }

      const rowObj: RawRow = {};
      flightHeaders.forEach((header, index) => {
        const cellValue = row[index];
        if (cellValue !== undefined) {
          rowObj[header] = cellValue;
        }
      });

      const rawAircraftId = rowObj.AircraftID ?? rowObj.aircraft_registration;
      const aircraftId = typeof rawAircraftId === 'string'
        ? rawAircraftId.trim()
        : rawAircraftId !== undefined && rawAircraftId !== null
          ? rawAircraftId.toString().trim()
          : '';
      if (aircraftId && aircraftLookup.has(aircraftId)) {
        const aircraft = aircraftLookup.get(aircraftId)!;
        rowObj.aircraft_type = aircraft.typeCode || aircraft.model || aircraft.make;
      }

      const normalizedFlight = normalizeFlightRow(rowObj);
      if (normalizedFlight) {
        flights.push(normalizedFlight);
      }
    }
  }

  if (flights.length === 0) {
    throw new Error('Could not find flight data section in CSV');
  }

  return flights;
}

/**
 * Analyze flight data and generate report
 */
export function analyze(flights: ForeFlightRow[]): ParseReport {
  const warnings: string[] = [];
  let zeroTimeFlights = 0;
  let totalHours = 0;
  const aircraftSet = new Set<string>();
  const formatCounts = { modern: 0, legacy2019: 0, legacy2018: 0 };
  
  let earliest: string | undefined;
  let latest: string | undefined;
  
  flights.forEach(flight => {
    // Count formats
    if (flight._format) {
      formatCounts[flight._format]++;
    }
    
    // Track aircraft
    aircraftSet.add(flight.aircraft_registration);
    
    // Track dates
    if (!earliest || flight.date < earliest) earliest = flight.date;
    if (!latest || flight.date > latest) latest = flight.date;
    
    // Track zero time flights
    if (flight.total_time === 0) {
      zeroTimeFlights++;
    } else {
      totalHours += flight.total_time;
    }
  });
  
  // Generate warnings
  if (zeroTimeFlights > 0) {
    warnings.push(`${zeroTimeFlights} flights have zero total time - may indicate parsing issues`);
  }
  
  if (formatCounts.legacy2018 > 0 && zeroTimeFlights > 0) {
    warnings.push(`2018 flights detected with zero times - check TimeOut/TimeIn columns`);
  }
  
  return {
    totalRows: flights.length,
    validFlights: flights.length - zeroTimeFlights,
    invalidFlights: zeroTimeFlights,
    zeroTimeFlights,
    aircraftCount: aircraftSet.size,
    dateRange: { earliest, latest },
    totalHours,
    formatBreakdown: formatCounts,
    warnings,
    sampleFlight: flights.find(f => f.total_time > 0)
  };
}

/**
 * Filter out flights with zero total time
 */
export function filterOutZeroRows(flights: ForeFlightRow[]): ForeFlightRow[] {
  return flights.filter(flight => flight.total_time > 0);
}

/**
 * Convert flights back to CSV format
 */
export function toCsv(flights: ForeFlightRow[]): string {
  if (flights.length === 0) return '';
  
  const headers = [
    'date', 'aircraft_registration', 'aircraft_type', 'departure_airport', 'arrival_airport',
    'total_time', 'pic_time', 'sic_time', 'cross_country_time', 'night_time', 'instrument_time',
    'actual_instrument', 'simulated_instrument', 'solo_time', 'dual_given', 'dual_received',
    'holds', 'approaches', 'landings', 'day_takeoffs', 'day_landings', 'night_takeoffs', 
    'night_landings', 'simulated_flight', 'ground_training', 'route', 'remarks', 
    'start_time', 'end_time'
  ];
  
  const csvRows = [headers.join(',')];
  
  flights.forEach(flight => {
    const row = headers.map(header => {
      const value = flight[header as keyof ForeFlightRow];
      return value !== undefined ? `"${value}"` : '';
    });
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Download helper for browser
 */
export function download(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
