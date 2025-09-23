/**
 * Robust ForeFlight CSV Parser
 * Handles the complex multi-section CSV format from ForeFlight exports
 */

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
  // Raw data for debugging
  _raw?: Record<string, any>;
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
function parseNumber(value: any, fallbacks: any[] = []): number {
  // Try the primary value first
  if (value !== undefined && value !== null && value !== '' && value !== 'null') {
    const parsed = parseFloat(value.toString());
    if (!isNaN(parsed)) return parsed;
  }
  
  // Try fallback values
  for (const fallback of fallbacks) {
    if (fallback !== undefined && fallback !== null && fallback !== '' && fallback !== 'null') {
      const parsed = parseFloat(fallback.toString());
      if (!isNaN(parsed)) return parsed;
    }
  }
  
  return 0;
}

/**
 * Calculate flight time from TimeOut/TimeIn strings
 */
function calculateFlightTime(timeOut?: string, timeIn?: string): number {
  if (!timeOut || !timeIn) return 0;
  
  try {
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
    return 0;
  }
}

/**
 * Detect flight data format based on date and available columns
 */
function detectFormat(row: Record<string, any>): 'modern' | 'legacy2019' | 'legacy2018' {
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
function normalizeFlightRow(row: Record<string, any>): ForeFlightRow | null {
  const format = detectFormat(row);
  
  // Extract basic info
  const date = row.Date || row.date;
  if (!date || date === '' || date === 'null') {
    return null; // Skip rows without dates
  }
  
  const aircraftReg = (row.AircraftID || row.aircraft_registration || '').toString().trim();
  const depAirport = (row.From || row.departure_airport || '').toString().trim();
  const arrAirport = (row.To || row.arrival_airport || depAirport || '').toString().trim();
  
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
    aircraft_type: row.aircraft_type || aircraftReg,
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
    day_landings: parseNumber(row.DayLandingsFullStop, [row.DayLandings, 1]),
    night_takeoffs: parseNumber(row.NightTakeoffs),
    night_landings: parseNumber(row.NightLandingsFullStop, [row.NightLandings]),
    simulated_flight: parseNumber(row.SimulatedFlight),
    ground_training: parseNumber(row.GroundTraining),
    route: row.Route || row.route,
    remarks: row.PilotComments || row.remarks,
    start_time: row.TimeOut || row.start_time,
    end_time: row.TimeIn || row.end_time,
    _raw: row,
    _format: format
  };
}

/**
 * Load and parse ForeFlight CSV file
 */
export async function loadForeFlightCsv(file: File): Promise<ForeFlightRow[]> {
  const text = await file.text();
  const lines = text.split('\n');
  
  let flightSectionStart = -1;
  let flightHeaders: string[] = [];
  const flights: ForeFlightRow[] = [];
  
  // Find the flights section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for common flight table indicators
    if (line.includes('Date') && (line.includes('AircraftID') || line.includes('Aircraft'))) {
      flightSectionStart = i;
      flightHeaders = line.split(',').map(h => h.trim().replace(/"/g, ''));
      break;
    }
  }
  
  if (flightSectionStart === -1) {
    throw new Error('Could not find flight data section in CSV');
  }
  
  // Parse flight data
  for (let i = flightSectionStart + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === ','.repeat(line.length)) continue; // Skip empty lines
    
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    
    // Create row object
    const row: Record<string, any> = {};
    flightHeaders.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    const normalizedFlight = normalizeFlightRow(row);
    if (normalizedFlight) {
      flights.push(normalizedFlight);
    }
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