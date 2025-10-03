"use strict";
/**
 * Robust ForeFlight CSV Parser
 * Handles the complex multi-section CSV format from ForeFlight exports
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coerceNumber = coerceNumber;
exports.loadForeFlightCsv = loadForeFlightCsv;
exports.analyze = analyze;
exports.filterOutZeroRows = filterOutZeroRows;
exports.toCsv = toCsv;
exports.download = download;
var papaparse_1 = require("papaparse");
/**
 * Parse a number field with multiple fallback strategies
 */
function parseDurationLike(value) {
    var normalized = value.trim();
    if (!normalized)
        return null;
    // Handle HH:MM[:SS] formats
    var colonParts = normalized.split(':');
    if (colonParts.length >= 2 && colonParts.length <= 3) {
        var numericParts = colonParts.map(function (part) { return Number(part); });
        if (numericParts.every(function (part) { return !Number.isNaN(part); })) {
            var hours = numericParts[0], _a = numericParts[1], minutes = _a === void 0 ? 0 : _a, _b = numericParts[2], seconds = _b === void 0 ? 0 : _b;
            return hours + minutes / 60 + seconds / 3600;
        }
    }
    // Handle H+MM format (common in some logbooks)
    if (normalized.includes('+')) {
        var _c = normalized.split('+'), hoursPart = _c[0], minutesPart = _c[1];
        var hours = Number(hoursPart);
        var minutes = Number(minutesPart);
        if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
            return hours + minutes / 60;
        }
    }
    // Handle formats like "1h 30m" or "45 min"
    var hourMatch = normalized.match(/(-?\d+(?:\.\d+)?)\s*h(?:ours?)?/i);
    var minuteMatch = normalized.match(/(\d+(?:\.\d+)?)\s*m(?:in(?:utes?)?)?/i);
    if (hourMatch || minuteMatch) {
        var hours = hourMatch ? Number(hourMatch[1]) : 0;
        var minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
        if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
            return hours + minutes / 60;
        }
    }
    return null;
}
function coerceNumber(raw) {
    if (raw === undefined || raw === null)
        return null;
    if (typeof raw === 'number' && !Number.isNaN(raw))
        return raw;
    var str = raw.toString().trim();
    if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
        return null;
    }
    var duration = parseDurationLike(str);
    if (duration !== null) {
        return duration;
    }
    var dotted = str.includes('.')
        ? str.replace(/,/g, '')
        : str.replace(',', '.');
    var parsed = parseFloat(dotted);
    if (!Number.isNaN(parsed)) {
        return parsed;
    }
    return null;
}
function parseNumber(value, fallbacks) {
    if (fallbacks === void 0) { fallbacks = []; }
    var primary = coerceNumber(value);
    if (primary !== null)
        return primary;
    for (var _i = 0, fallbacks_1 = fallbacks; _i < fallbacks_1.length; _i++) {
        var fallback = fallbacks_1[_i];
        var coerced = coerceNumber(fallback);
        if (coerced !== null)
            return coerced;
    }
    return 0;
}
/**
 * Calculate flight time from TimeOut/TimeIn strings
 */
function calculateFlightTime(timeOut, timeIn) {
    if (!timeOut || !timeIn)
        return 0;
    try {
        var parseTime = function (timeStr) {
            if (timeStr.includes(':')) {
                var _a = timeStr.split(':').map(Number), hours = _a[0], minutes = _a[1];
                return hours + minutes / 60;
            }
            return parseFloat(timeStr) || 0;
        };
        var outTime = parseTime(timeOut.toString());
        var inTime = parseTime(timeIn.toString());
        // Handle day rollover
        if (inTime < outTime) {
            return (24 - outTime) + inTime;
        }
        return inTime - outTime;
    }
    catch (e) {
        return 0;
    }
}
/**
 * Detect flight data format based on date and available columns
 */
function detectFormat(row) {
    var date = new Date(row.Date || row.date);
    var year = date.getFullYear();
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
function normalizeFlightRow(row) {
    var format = detectFormat(row);
    // Extract basic info
    var date = row.Date || row.date;
    if (!date || date === '' || date === 'null') {
        return null; // Skip rows without dates
    }
    var aircraftReg = (row.AircraftID ||
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
        '').toString().trim();
    var depAirport = (row.From ||
        row.departure_airport ||
        row['Departure Airport'] ||
        row['Departure'] ||
        row['From Airport'] ||
        '').toString().trim();
    var arrAirport = (row.To ||
        row.arrival_airport ||
        row['Arrival Airport'] ||
        row['Arrival'] ||
        row['To Airport'] ||
        depAirport ||
        '').toString().trim();
    if (!aircraftReg) {
        aircraftReg = 'UNKNOWN';
    }
    if (!depAirport) {
        depAirport = 'UNK';
    }
    if (!arrAirport) {
        arrAirport = depAirport;
    }
    var totalTime = 0;
    var picTime = 0;
    var sicTime = 0;
    if (format === 'modern') {
        // Modern format (2020+)
        totalTime = parseNumber(row.total_time, [row.TotalTime]);
        picTime = parseNumber(row.pic_time, [row.PIC]);
        sicTime = parseNumber(row.sic_time, [row.SIC]);
    }
    else if (format === 'legacy2019') {
        // 2019 format
        totalTime = parseNumber(row.TotalTime);
        picTime = parseNumber(row.PIC);
        sicTime = parseNumber(row.SIC);
    }
    else {
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
        if (totalTime === 0) {
            var candidate = Object.entries(row).find(function (_a) {
                var header = _a[0], value = _a[1];
                if (value === undefined || value === null || value === '')
                    return false;
                var normalizedHeader = header.toString().replace(/_/g, ' ').toLowerCase();
                if (!/(total|duration|block)/.test(normalizedHeader))
                    return false;
                var parsed = coerceNumber(value);
                return parsed !== null && parsed > 0;
            });
            if (candidate) {
                var parsed = coerceNumber(candidate[1]);
                if (parsed !== null && parsed > 0) {
                    totalTime = parsed;
                }
            }
        }
        // For 2018, if we have total time but no PIC/SIC breakdown, assume PIC (solo training)
        if (totalTime > 0 && picTime === 0 && sicTime === 0) {
            picTime = totalTime;
        }
    }
    return {
        date: date,
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
function loadForeFlightCsv(file) {
    return __awaiter(this, void 0, void 0, function () {
        var text, data, rows, flights, aircraftLookup, currentSection, flightHeaders, _loop_1, _i, rows_1, row;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, file.text()];
                case 1:
                    text = _d.sent();
                    data = papaparse_1.default.parse(text, {
                        skipEmptyLines: false,
                    }).data;
                    rows = data.map(function (row) {
                        return (row !== null && row !== void 0 ? row : []).map(function (cell) { return (cell !== null && cell !== void 0 ? cell : '').toString().trim(); });
                    });
                    flights = [];
                    aircraftLookup = new Map();
                    currentSection = 'none';
                    flightHeaders = [];
                    _loop_1 = function (row) {
                        var firstCell = ((_b = (_a = row[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase) === null || _b === void 0 ? void 0 : _b.call(_a)) || '';
                        if (!row.some(function (cell) { return cell && cell.trim(); })) {
                            return "continue";
                        }
                        if (firstCell.includes('foreflight logbook import')) {
                            currentSection = 'none';
                            flightHeaders = [];
                            return "continue";
                        }
                        if (firstCell === 'aircraft table') {
                            currentSection = 'aircraft';
                            return "continue";
                        }
                        if (firstCell === 'flights table') {
                            currentSection = 'flights';
                            flightHeaders = [];
                            return "continue";
                        }
                        if (currentSection === 'aircraft') {
                            if (!row[0] || row[0] === 'AircraftID')
                                return "continue";
                            var aircraftId = row[0];
                            if (aircraftId) {
                                aircraftLookup.set(aircraftId, {
                                    typeCode: row[1] || row[3],
                                    make: row[3],
                                    model: row[4],
                                });
                            }
                            return "continue";
                        }
                        if (currentSection === 'flights') {
                            if (flightHeaders.length === 0) {
                                if (firstCell === 'date') {
                                    flightHeaders = row.map(function (header) { return header.replace(/"/g, '').trim(); });
                                }
                                return "continue";
                            }
                            if (!row[0]) {
                                return "continue";
                            }
                            var rowObj_1 = {};
                            flightHeaders.forEach(function (header, index) {
                                var cellValue = row[index];
                                if (cellValue !== undefined) {
                                    rowObj_1[header] = cellValue;
                                }
                            });
                            var rawAircraftId = (_c = rowObj_1.AircraftID) !== null && _c !== void 0 ? _c : rowObj_1.aircraft_registration;
                            var aircraftId = typeof rawAircraftId === 'string'
                                ? rawAircraftId.trim()
                                : rawAircraftId !== undefined && rawAircraftId !== null
                                    ? rawAircraftId.toString().trim()
                                    : '';
                            if (aircraftId && aircraftLookup.has(aircraftId)) {
                                var aircraft = aircraftLookup.get(aircraftId);
                                rowObj_1.aircraft_type = aircraft.typeCode || aircraft.model || aircraft.make;
                            }
                            var normalizedFlight = normalizeFlightRow(rowObj_1);
                            if (normalizedFlight) {
                                flights.push(normalizedFlight);
                            }
                        }
                    };
                    for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                        row = rows_1[_i];
                        _loop_1(row);
                    }
                    if (flights.length === 0) {
                        throw new Error('Could not find flight data section in CSV');
                    }
                    return [2 /*return*/, flights];
            }
        });
    });
}
/**
 * Analyze flight data and generate report
 */
function analyze(flights) {
    var warnings = [];
    var zeroTimeFlights = 0;
    var totalHours = 0;
    var aircraftSet = new Set();
    var formatCounts = { modern: 0, legacy2019: 0, legacy2018: 0 };
    var earliest;
    var latest;
    flights.forEach(function (flight) {
        // Count formats
        if (flight._format) {
            formatCounts[flight._format]++;
        }
        // Track aircraft
        aircraftSet.add(flight.aircraft_registration);
        // Track dates
        if (!earliest || flight.date < earliest)
            earliest = flight.date;
        if (!latest || flight.date > latest)
            latest = flight.date;
        // Track zero time flights
        if (flight.total_time === 0) {
            zeroTimeFlights++;
        }
        else {
            totalHours += flight.total_time;
        }
    });
    // Generate warnings
    if (zeroTimeFlights > 0) {
        warnings.push("".concat(zeroTimeFlights, " flights have zero total time - may indicate parsing issues"));
    }
    if (formatCounts.legacy2018 > 0 && zeroTimeFlights > 0) {
        warnings.push("2018 flights detected with zero times - check TimeOut/TimeIn columns");
    }
    return {
        totalRows: flights.length,
        validFlights: flights.length - zeroTimeFlights,
        invalidFlights: zeroTimeFlights,
        zeroTimeFlights: zeroTimeFlights,
        aircraftCount: aircraftSet.size,
        dateRange: { earliest: earliest, latest: latest },
        totalHours: totalHours,
        formatBreakdown: formatCounts,
        warnings: warnings,
        sampleFlight: flights.find(function (f) { return f.total_time > 0; })
    };
}
/**
 * Filter out flights with zero total time
 */
function filterOutZeroRows(flights) {
    return flights.filter(function (flight) { return flight.total_time > 0; });
}
/**
 * Convert flights back to CSV format
 */
function toCsv(flights) {
    if (flights.length === 0)
        return '';
    var headers = [
        'date', 'aircraft_registration', 'aircraft_type', 'departure_airport', 'arrival_airport',
        'total_time', 'pic_time', 'sic_time', 'cross_country_time', 'night_time', 'instrument_time',
        'actual_instrument', 'simulated_instrument', 'solo_time', 'dual_given', 'dual_received',
        'holds', 'approaches', 'landings', 'day_takeoffs', 'day_landings', 'night_takeoffs',
        'night_landings', 'simulated_flight', 'ground_training', 'route', 'remarks',
        'start_time', 'end_time'
    ];
    var csvRows = [headers.join(',')];
    flights.forEach(function (flight) {
        var row = headers.map(function (header) {
            var value = flight[header];
            return value !== undefined ? "\"".concat(value, "\"") : '';
        });
        csvRows.push(row.join(','));
    });
    return csvRows.join('\n');
}
/**
 * Download helper for browser
 */
function download(content, filename) {
    var blob = new Blob([content], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
