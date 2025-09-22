import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface CSVRow {
  [key: string]: string;
}

interface FieldMapping {
  csvColumn: string;
  dbField: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const DATABASE_FIELDS = [
  { key: 'date', label: 'Date *', required: true },
  { key: 'aircraft_registration', label: 'Aircraft Registration *', required: true },
  { key: 'aircraft_type', label: 'Aircraft Type *', required: true },
  { key: 'departure_airport', label: 'Departure Airport *', required: true },
  { key: 'arrival_airport', label: 'Arrival Airport *', required: true },
  { key: 'total_time', label: 'Total Time *', required: true },
  { key: 'pic_time', label: 'PIC Time', required: false },
  { key: 'sic_time', label: 'SIC Time', required: false },
  { key: 'cross_country_time', label: 'Cross Country', required: false },
  { key: 'night_time', label: 'Night Time', required: false },
  { key: 'instrument_time', label: 'Instrument Time', required: false },
  { key: 'actual_instrument', label: 'Actual Instrument', required: false },
  { key: 'simulated_instrument', label: 'Simulated Instrument', required: false },
  { key: 'solo_time', label: 'Solo Time', required: false },
  { key: 'dual_given', label: 'Dual Given', required: false },
  { key: 'dual_received', label: 'Dual Received', required: false },
  { key: 'approaches', label: 'Approaches', required: false },
  { key: 'landings', label: 'Landings', required: false },
  { key: 'day_landings', label: 'Day Landings', required: false },
  { key: 'night_landings', label: 'Night Landings', required: false },
  { key: 'holds', label: 'Holds', required: false },
  { key: 'route', label: 'Route', required: false },
  { key: 'remarks', label: 'Remarks', required: false },
  { key: 'start_time', label: 'Start Time', required: false },
  { key: 'end_time', label: 'End Time', required: false },
];

const SAMPLE_CSV = `Date,Aircraft,Type,From,To,Total Time,PIC,Cross Country,Night,Approaches,Landings,Remarks
2024-01-15,N12345,C172,KJFK,KLGA,1.2,1.2,0,0,2,1,Pattern work
2024-01-20,N67890,PA28,KLGA,KBDR,2.1,2.1,2.1,0,1,1,Cross country flight`;

const FOREFLIGHT_SAMPLE_CSV = `ForeFlight Logbook Import,This row is required for importing into ForeFlight. Do not delete or modify.

Aircraft Table
AircraftID,TypeCode,Year,Make,Model,GearType,EngineType,equipType (FAA),aircraftClass (FAA)
N12345,C172,,Cessna,172S,fixed_tricycle,Piston,aircraft,airplane_single_engine_land
N67890,PA28,,Piper,Cherokee,fixed_tricycle,Piston,aircraft,airplane_single_engine_land

Flights Table
Date,AircraftID,From,To,Route,TimeOut,TimeOff,TimeOn,TimeIn,OnDuty,OffDuty,TotalTime,PIC,SIC,Night,Solo,CrossCountry,Distance,ActualInstrument,SimulatedInstrument,Holds,Approach1,Approach2,DualGiven,DualReceived,DayTakeoffs,DayLandingsFullStop,NightTakeoffs,NightLandingsFullStop,AllLandings,PilotComments
2024-01-15,N12345,KJFK,KLGA,,,,,,,,1.2,1.2,0.0,0.0,0.0,0.0,147.3,0.0,0.0,0,ILS,VOR,0.0,0.0,2,1,0,0,1,Pattern work
2024-01-20,N67890,KLGA,KBDR,,,,,,,,2.1,2.1,0.0,0.0,0.0,2.1,173.2,0.0,0.0,0,,,0.0,0.0,1,1,0,0,1,Cross country flight`;

interface AircraftInfo {
  aircraftId: string;
  typeCode: string;
  make: string;
  model: string;
}

export function CSVImportDialog({ open, onOpenChange, onImportComplete }: CSVImportDialogProps) {
  const { toast } = useToast();
  const { user, session } = useAuth();
  
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const [isForeFlight, setIsForeFlight] = useState(false);
  const [aircraftLookup, setAircraftLookup] = useState<Map<string, AircraftInfo>>(new Map());

  const parseForeFlight = (allRows: string[][]) => {
    const aircraftLookupMap = new Map<string, AircraftInfo>();
    let flightHeaders: string[] = [];
    let flightRows: CSVRow[] = [];
    
    let currentSection = '';
    let headerRowFound = false;
    
    console.log('Parsing ForeFlight CSV with', allRows.length, 'total rows');
    
    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      const firstCell = row[0]?.toString().trim();
      
      if (firstCell?.toLowerCase() === 'aircraft table') {
        currentSection = 'aircraft';
        headerRowFound = false;
        console.log('Found Aircraft Table at row', i);
        continue;
      } else if (firstCell?.toLowerCase() === 'flights table') {
        currentSection = 'flights';
        headerRowFound = false;
        console.log('Found Flights Table at row', i);
        continue;
      }
      
      // Parse aircraft data
      if (currentSection === 'aircraft' && row.length >= 5 && row[0] && row[0] !== 'AircraftID') {
        const aircraftId = row[0]?.toString().trim();
        const typeCode = row[1]?.toString().trim() || '';
        const make = row[3]?.toString().trim() || '';
        const model = row[4]?.toString().trim() || '';
        
        if (aircraftId && aircraftId !== '') {
          aircraftLookupMap.set(aircraftId, {
            aircraftId,
            typeCode: typeCode || model || 'Unknown',
            make: make || 'Unknown',
            model: model || 'Unknown'
          });
        }
      } 
      // Parse flight section
      else if (currentSection === 'flights') {
        // Look for the header row (first non-empty row with multiple columns)
        if (!headerRowFound && row.length > 10 && firstCell && firstCell.toLowerCase() === 'date') {
          flightHeaders = row.map(header => header?.toString().trim() || '');
          headerRowFound = true;
          console.log('Found flight headers at row', i, ':', flightHeaders.slice(0, 10));
          continue;
        }
        
        // Parse flight data rows
        if (headerRowFound && firstCell) {
          // Check if this looks like a date (YYYY-MM-DD format)
          const datePattern = /^\d{4}-\d{2}-\d{2}$/;
          if (datePattern.test(firstCell)) {
            const rowObj: CSVRow = {};
            flightHeaders.forEach((header, index) => {
              if (header && row[index] !== undefined && row[index] !== null && row[index] !== '') {
                rowObj[header] = row[index];
              }
            });
            
            // Add aircraft type if we have it in our lookup
            const aircraftId = rowObj['AircraftID']?.toString().trim();
            if (aircraftId && aircraftLookupMap.has(aircraftId)) {
              rowObj['aircraft_type'] = aircraftLookupMap.get(aircraftId)?.typeCode || aircraftId;
            } else if (aircraftId) {
              rowObj['aircraft_type'] = aircraftId; // Fallback to aircraft ID
            }
            
            // Ensure required fields have values (ForeFlight sometimes has empty cells)
            if (!rowObj['AircraftID'] || rowObj['AircraftID'].toString().trim() === '') {
              console.log(`Skipping flight on ${firstCell}: Missing Aircraft ID`);
              continue;
            }
            if (!rowObj['From'] || rowObj['From'].toString().trim() === '') {
              console.log(`Skipping flight on ${firstCell}: Missing departure airport`);
              continue;
            }
            if (!rowObj['To'] || rowObj['To'].toString().trim() === '') {
              console.log(`Skipping flight on ${firstCell}: Missing arrival airport`);
              continue;
            }
            
            flightRows.push(rowObj);
            
            // Log progress every 100 flights
            if (flightRows.length % 100 === 0) {
              console.log('Parsed', flightRows.length, 'flights so far');
            }
          }
        }
      }
    }
    
    console.log('ForeFlight parsing completed:', {
      aircraftCount: aircraftLookupMap.size,
      flightCount: flightRows.length,
      sampleFlightHeaders: flightHeaders.slice(0, 10),
      sampleFlight: flightRows[0],
      totalHoursInData: flightRows.reduce((sum, flight) => {
        const totalTime = parseFloat(flight['TotalTime']?.toString() || '0') || 0;
        return sum + totalTime;
      }, 0).toFixed(1)
    });
    
    setAircraftLookup(aircraftLookupMap);
    return { headers: flightHeaders, rows: flightRows, aircraftLookup: aircraftLookupMap };
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    Papa.parse(file, {
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: "CSV parsing error",
            description: "There was an error parsing your CSV file",
            variant: "destructive",
          });
          return;
        }

        const allRows = results.data as string[][];
        
        // Check if this is a ForeFlight export
        const isForeFlight = allRows[0]?.[0]?.toLowerCase().includes('foreflight logbook import');
        setIsForeFlight(isForeFlight);
        
        let headers: string[];
        let rows: CSVRow[];
        let aircraftLookupMap = new Map<string, AircraftInfo>();
        
        if (isForeFlight) {
          const parsed = parseForeFlight(allRows);
          headers = parsed.headers;
          rows = parsed.rows;
          aircraftLookupMap = parsed.aircraftLookup;
        } else {
          headers = allRows[0] as string[];
          rows = allRows.slice(1).filter(row => row.some(cell => cell?.trim())).map(row => {
            const rowObj: CSVRow = {};
            headers.forEach((header, index) => {
              rowObj[header] = row[index] || '';
            });
            return rowObj;
          });
        }
        
        setCsvHeaders(headers);
        setCsvData(rows);
        
        // Auto-map field names
        const autoMappings: FieldMapping[] = [];
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          let dbField = '';
          
          if (isForeFlight) {
            // ForeFlight-specific mappings - comprehensive set
            if (lowerHeader === 'date') dbField = 'date';
            else if (lowerHeader === 'aircraftid') dbField = 'aircraft_registration';
            else if (lowerHeader === 'from') dbField = 'departure_airport';
            else if (lowerHeader === 'to') dbField = 'arrival_airport';
            else if (lowerHeader === 'totaltime') dbField = 'total_time';
            else if (lowerHeader === 'pic') dbField = 'pic_time';
            else if (lowerHeader === 'sic') dbField = 'sic_time';
            else if (lowerHeader === 'crosscountry') dbField = 'cross_country_time';
            else if (lowerHeader === 'night') dbField = 'night_time';
            else if (lowerHeader === 'actualinstrument') dbField = 'actual_instrument';
            else if (lowerHeader === 'simulatedinstrument') dbField = 'simulated_instrument';
            else if (lowerHeader === 'solo') dbField = 'solo_time';
            else if (lowerHeader === 'dualreceived') dbField = 'dual_received';
            else if (lowerHeader === 'dualgiven') dbField = 'dual_given';
            else if (lowerHeader === 'holds') dbField = 'holds';
            else if (lowerHeader === 'alllandings') dbField = 'landings';
            else if (lowerHeader === 'daylandingsfullstop') dbField = 'day_landings';
            else if (lowerHeader === 'nightlandingsfullstop') dbField = 'night_landings';
            else if (lowerHeader === 'daytakeoffs') dbField = 'day_takeoffs';
            else if (lowerHeader === 'nighttakeoffs') dbField = 'night_takeoffs';
            else if (lowerHeader === 'route') dbField = 'route';
            else if (lowerHeader === 'pilotcomments') dbField = 'remarks';
            else if (lowerHeader === 'timeout') dbField = 'start_time';
            else if (lowerHeader === 'timein') dbField = 'end_time';
            else if (lowerHeader === 'simulatedflight') dbField = 'simulated_flight';
            else if (lowerHeader === 'groundtraining') dbField = 'ground_training';
            else if (lowerHeader === 'ifr') dbField = 'instrument_time'; // Additional mapping
          } else {
            // Standard mappings - including specific logbook software column names
            if (lowerHeader === 'date') dbField = 'date';
            else if (lowerHeader === 'aircraftid') dbField = 'aircraft_registration';
            else if (lowerHeader === 'from') dbField = 'departure_airport';
            else if (lowerHeader === 'to') dbField = 'arrival_airport';
            else if (lowerHeader === 'route') dbField = 'route';
            else if (lowerHeader === 'totaltime') dbField = 'total_time';
            else if (lowerHeader === 'pic') dbField = 'pic_time';
            else if (lowerHeader === 'sic') dbField = 'sic_time';
            else if (lowerHeader === 'night') dbField = 'night_time';
            else if (lowerHeader === 'solo') dbField = 'solo_time';
            else if (lowerHeader === 'crosscountry') dbField = 'cross_country_time';
            else if (lowerHeader === 'actualinstrument') dbField = 'actual_instrument';
            else if (lowerHeader === 'simulated') dbField = 'simulated_instrument';
            else if (lowerHeader === 'simulatedinstrument') dbField = 'simulated_instrument';
            else if (lowerHeader === 'dualgiven') dbField = 'dual_given';
            else if (lowerHeader === 'dualreceived') dbField = 'dual_received';
            else if (lowerHeader === 'holds') dbField = 'holds';
            else if (lowerHeader === 'alllandings' || lowerHeader === 'alllandings') dbField = 'landings';
            else if (lowerHeader === 'daylanding' || lowerHeader === 'daylandings') dbField = 'day_landings';
            else if (lowerHeader === 'nightlanding' || lowerHeader === 'nightlandings') dbField = 'night_landings';
            else if (lowerHeader === 'daytakeoff' || lowerHeader === 'daytakeoffs') dbField = 'day_takeoffs';
            else if (lowerHeader === 'nighttakeoff' || lowerHeader === 'nighttakeoffs') dbField = 'night_takeoffs';
            // Generic pattern matching for other formats
            else if (lowerHeader.includes('date')) dbField = 'date';
            else if (lowerHeader.includes('aircraft') && (lowerHeader.includes('reg') || lowerHeader.includes('tail') || lowerHeader.includes('n-'))) dbField = 'aircraft_registration';
            else if (lowerHeader.includes('aircraft') && lowerHeader.includes('type')) dbField = 'aircraft_type';
            else if (lowerHeader.includes('type') && !lowerHeader.includes('aircraft')) dbField = 'aircraft_type';
            else if (lowerHeader.includes('from') || lowerHeader.includes('departure') || lowerHeader.includes('origin')) dbField = 'departure_airport';
            else if (lowerHeader.includes('to') || lowerHeader.includes('arrival') || lowerHeader.includes('destination')) dbField = 'arrival_airport';
            else if (lowerHeader.includes('total') && lowerHeader.includes('time')) dbField = 'total_time';
            else if (lowerHeader.includes('pic') || lowerHeader === 'pilot in command') dbField = 'pic_time';
            else if (lowerHeader.includes('sic') || lowerHeader.includes('second in command')) dbField = 'sic_time';
            else if (lowerHeader.includes('cross') && lowerHeader.includes('country')) dbField = 'cross_country_time';
            else if (lowerHeader.includes('night')) dbField = 'night_time';
            else if (lowerHeader.includes('instrument')) dbField = 'instrument_time';
            else if (lowerHeader.includes('approach')) dbField = 'approaches';
            else if (lowerHeader.includes('landing')) dbField = 'landings';
            else if (lowerHeader.includes('route')) dbField = 'route';
            else if (lowerHeader.includes('remarks') || lowerHeader.includes('notes') || lowerHeader.includes('comment')) dbField = 'remarks';
          }
          
          if (dbField) {
            autoMappings.push({ csvColumn: header, dbField });
          }
        });
        
        // For ForeFlight, add aircraft_type as a virtual mapping since it's derived from AircraftID
        if (isForeFlight && aircraftLookupMap.size > 0) {
          autoMappings.push({ csvColumn: 'AircraftID', dbField: 'aircraft_type' });
        }
        
        setFieldMappings(autoMappings);
        
        // Check if we have all required fields
        const requiredFields = DATABASE_FIELDS.filter(f => f.required).map(f => f.key);
        const mappedFields = autoMappings.map(m => m.dbField);
        const missingRequired = requiredFields.filter(field => !mappedFields.includes(field));
        
        if (missingRequired.length > 0) {
          toast({
            title: "Missing required fields",
            description: `Could not automatically map these required fields: ${missingRequired.join(', ')}. Please use the manual mapping.`,
            variant: "destructive",
          });
          setStep('mapping');
        } else {
          // Auto-proceed to preview if all required fields are mapped
          toast({
            title: "File processed successfully",
            description: `${isForeFlight ? 'ForeFlight' : 'CSV'} format detected. ${rows.length} flights ready to import.`,
          });
          setStep('preview');
        }
      },
      header: false,
      skipEmptyLines: true
    });
  }, [toast]);

  const handleMappingChange = (csvColumn: string, dbField: string) => {
    setFieldMappings(prev => {
      const existing = prev.find(m => m.csvColumn === csvColumn);
      if (existing) {
        if (dbField === '__skip__' || dbField === '') {
          return prev.filter(m => m.csvColumn !== csvColumn);
        }
        return prev.map(m => m.csvColumn === csvColumn ? { ...m, dbField } : m);
      } else if (dbField !== '' && dbField !== '__skip__') {
        return [...prev, { csvColumn, dbField }];
      }
      return prev;
    });
  };

  const validateData = () => {
    const errors: ValidationError[] = [];
    const requiredFields = DATABASE_FIELDS.filter(f => f.required).map(f => f.key);
    
    console.log('=== VALIDATION DEBUG START ===');
    console.log('Required fields:', requiredFields);
    console.log('Field mappings:', fieldMappings);
    console.log('Is ForeFlight:', isForeFlight);
    console.log('CSV data length:', csvData.length);
    
    // Check if all required fields are mapped
    const mappedFields = fieldMappings.map(m => m.dbField);
    const missingRequired = requiredFields.filter(field => !mappedFields.includes(field));
    
    console.log('Mapped fields:', mappedFields);
    console.log('Missing required fields:', missingRequired);
    
    if (missingRequired.length > 0) {
      console.log('ERROR: Missing required fields detected');
      toast({
        title: "Missing required fields",
        description: `Please map the following required fields: ${missingRequired.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    // Skip validation if no data
    if (!csvData || csvData.length === 0) {
      console.log('ERROR: No CSV data to validate');
      return false;
    }

    // Validate data in each row
    csvData.forEach((row, index) => {
      console.log(`\n--- Validating Row ${index + 1} ---`);
      console.log('Row data:', row);
      
      fieldMappings.forEach(mapping => {
        let value: string;
        if (isForeFlight) {
          value = (row as Record<string, string>)[mapping.csvColumn];
        } else {
          value = (row as unknown as string[])[csvHeaders.indexOf(mapping.csvColumn)];
        }
        
        value = value?.trim?.() || '';
        const field = DATABASE_FIELDS.find(f => f.key === mapping.dbField);
        
        console.log(`  Field: ${mapping.dbField} (${field?.required ? 'REQUIRED' : 'optional'}) = "${value}"`);
        
        // Check required fields
        if (field?.required && !value) {
          console.log(`  ❌ VALIDATION ERROR: Required field ${mapping.dbField} is empty`);
          errors.push({
            row: index + 1,
            field: mapping.dbField,
            message: 'Required field is empty'
          });
        }
        
        // Validate date format
        if (mapping.dbField === 'date' && value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            console.log(`  ❌ VALIDATION ERROR: Invalid date "${value}"`);
            errors.push({
              row: index + 1,
              field: mapping.dbField,
              message: 'Invalid date format'
            });
          } else {
            console.log(`  ✅ Date "${value}" is valid`);
          }
        }
        
        // Validate time fields
        if (mapping.dbField.includes('time') && value) {
          const numValue = parseFloat(value);
          if (isNaN(numValue) || numValue < 0) {
            console.log(`  ❌ VALIDATION ERROR: Invalid time "${value}" (parsed as ${numValue})`);
            errors.push({
              row: index + 1,
              field: mapping.dbField,
              message: 'Invalid time format (must be a positive number)'
            });
          } else {
            console.log(`  ✅ Time "${value}" is valid (${numValue})`);
          }
        }
        
        // Validate numeric fields
        if (['approaches', 'landings', 'day_landings', 'night_landings', 'holds'].includes(mapping.dbField) && value) {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 0) {
            console.log(`  ❌ VALIDATION ERROR: Invalid number "${value}" (parsed as ${numValue})`);
            errors.push({
              row: index + 1,
              field: mapping.dbField,
              message: 'Invalid number format (must be a positive integer)'
            });
          } else {
            console.log(`  ✅ Number "${value}" is valid (${numValue})`);
          }
        }
      });
    });

    console.log('\n=== VALIDATION SUMMARY ===');
    console.log(`Total validation errors found: ${errors.length}`);
    if (errors.length > 0) {
      console.log('Errors:', errors);
    }
    console.log('=== VALIDATION DEBUG END ===\n');

    setValidationErrors(errors);
    
    if (errors.length > 0) {
      toast({
        title: "Validation errors found",
        description: `Found ${errors.length} validation errors. Please review and fix them.`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const proceedToPreview = () => {
    if (validateData()) {
      setStep('preview');
    }
  };

  const startImport = async () => {
    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to import flights. Please sign in and try again.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting import with user:', user.id);
    console.log('Session access token present:', !!session.access_token);
    
    setStep('importing');
    setImportProgress(0);
    
    try {
      const mappedData = csvData.map(row => {
        const flightEntry: any = {};
        let approachCount = 0;
        
        fieldMappings.forEach(mapping => {
          const value = row[mapping.csvColumn]?.trim();
          if (value) {
            if (mapping.dbField === 'date') {
              flightEntry[mapping.dbField] = new Date(value).toISOString().split('T')[0];
            } else if (mapping.dbField.includes('time') || mapping.dbField === 'landings' || mapping.dbField === 'approaches') {
              flightEntry[mapping.dbField] = Number(value) || 0;
            } else {
              flightEntry[mapping.dbField] = value;
            }
          }
        });
        
        // Handle ForeFlight approach columns
        if (isForeFlight) {
          for (let i = 1; i <= 6; i++) {
            const approachValue = row[`Approach${i}`]?.trim();
            if (approachValue) {
              approachCount++;
            }
          }
          if (approachCount > 0) {
            flightEntry.approaches = approachCount;
          }
          
          // Get aircraft type from lookup if aircraftid is provided
          const aircraftId = flightEntry.aircraft_registration || row['AircraftID'];
          if (aircraftId && aircraftLookup.has(aircraftId)) {
            const aircraftInfo = aircraftLookup.get(aircraftId)!;
            // Use TypeCode if available, otherwise combine Make and Model
            if (aircraftInfo.typeCode) {
              flightEntry.aircraft_type = aircraftInfo.typeCode;
            } else if (aircraftInfo.make && aircraftInfo.model) {
              flightEntry.aircraft_type = `${aircraftInfo.make} ${aircraftInfo.model}`;
            } else {
              flightEntry.aircraft_type = aircraftInfo.make || aircraftInfo.model || 'Unknown';
            }
          }
        }
        
        return flightEntry;
      });

      console.log('About to call edge function with data:', { 
        flights: mappedData.slice(0, 2),
        userLoggedIn: !!user,
        sessionExists: !!session,
        accessToken: session.access_token ? 'present' : 'missing'
      });
      
      // Call edge function with explicit authorization header
      const { data, error } = await supabase.functions.invoke('import-csv-flights', {
        body: { flights: mappedData },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      setImportResults(data);
      setImportProgress(100);
      setStep('complete');
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${data.success} flights${data.failed > 0 ? `, ${data.failed} failed` : ''}`,
      });
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message || "There was an error importing your flights. Please try again.",
        variant: "destructive",
      });
      setStep('preview');
    }
  };

  const downloadTemplate = (templateType: 'standard' | 'foreflight' = 'standard') => {
    const csvContent = templateType === 'foreflight' ? FOREFLIGHT_SAMPLE_CSV : SAMPLE_CSV;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logbook-template-${templateType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetDialog = () => {
    setStep('upload');
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMappings([]);
    setValidationErrors([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0 });
    setIsForeFlight(false);
    setAircraftLookup(new Map());
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetDialog();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import CSV Logbook
          </DialogTitle>
          <DialogDescription>
            Upload your CSV file and we'll automatically detect the format and import your flights. Supports ForeFlight, LogTen Pro, and standard CSV formats.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload CSV File</CardTitle>
                <CardDescription>
                  Upload your CSV file - we'll automatically detect the format and map the fields for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="text-lg font-medium">Choose CSV file</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports ForeFlight, LogTen Pro, and standard CSV formats
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
                    <Button variant="outline" onClick={() => downloadTemplate('standard')} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Standard Template
                    </Button>
                    <Button variant="outline" onClick={() => downloadTemplate('foreflight')} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      ForeFlight Template
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Need a template? Download a sample file to see the expected format
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Map CSV Columns</CardTitle>
                <CardDescription>
                  {isForeFlight ? 'ForeFlight format detected! ' : ''}Match your CSV columns to the logbook fields. Required fields are marked with *
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {csvHeaders.map(header => (
                    <div key={header} className="space-y-2">
                      <Label className="text-sm font-medium">{header}</Label>
                        <Select
                          value={fieldMappings.find(m => m.csvColumn === header)?.dbField || '__skip__'}
                          onValueChange={(value) => handleMappingChange(header, value)}
                        >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__skip__">Don't import</SelectItem>
                          {DATABASE_FIELDS.map(field => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    Back
                  </Button>
                  <Button onClick={proceedToPreview}>
                    Preview Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview Import Data</CardTitle>
              <CardDescription>
                Review your flight data before importing. {csvData.length} flights detected.
              </CardDescription>
              </CardHeader>
              <CardContent>
                {validationErrors.length > 0 && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Found {validationErrors.length} validation errors. Please fix them before importing.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="max-h-96 overflow-x-auto overflow-y-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="sticky left-0 bg-muted/50 border-r min-w-16">Row</TableHead>
                        {fieldMappings.slice(0, 8).map(mapping => (
                          <TableHead key={mapping.dbField} className="min-w-32">
                            {DATABASE_FIELDS.find(f => f.key === mapping.dbField)?.label}
                          </TableHead>
                        ))}
                        {fieldMappings.length > 8 && (
                          <TableHead className="min-w-20">...</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {csvData.slice(0, 10).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="sticky left-0 bg-background border-r font-medium">{index + 1}</TableCell>
                          {fieldMappings.slice(0, 8).map(mapping => {
                            // Handle both object-based data (ForeFlight) and array-based data (standard CSV)
                            let value: string;
                            if (isForeFlight) {
                              // ForeFlight rows are objects
                              value = (row as Record<string, string>)[mapping.csvColumn];
                            } else {
                              // Standard CSV rows are arrays
                              value = (row as unknown as string[])[csvHeaders.indexOf(mapping.csvColumn)];
                            }
                            const hasError = validationErrors.some(e => e.row === index + 1 && e.field === mapping.dbField);
                            return (
                              <TableCell key={mapping.dbField} className={hasError ? 'bg-destructive/10 text-destructive' : ''}>
                                {value || '-'}
                              </TableCell>
                            );
                          })}
                          {fieldMappings.length > 8 && (
                            <TableCell className="text-muted-foreground">+{fieldMappings.length - 8} more</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {fieldMappings.length > 8 && (
                  <div className="text-sm text-muted-foreground">
                    Showing first 8 columns. All {fieldMappings.length} columns will be imported.
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={() => setStep('mapping')} className="w-full sm:w-auto">
                    Back to Mapping
                  </Button>
                  <Button 
                    onClick={startImport} 
                    disabled={validationErrors.length > 0}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                  >
                    Import {csvData.length} Flights
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Importing Flights...</CardTitle>
                <CardDescription>
                  Please wait while we import your flight entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={importProgress} className="w-full" />
                  <p className="text-center text-muted-foreground">
                    Importing {csvData.length} flights...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Import Complete
                </CardTitle>
                <CardDescription>
                  Your flight entries have been imported successfully
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{importResults.success}</div>
                    <div className="text-sm text-muted-foreground">Successfully imported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">{importResults.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed to import</div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => {
                    onImportComplete();
                    onOpenChange(false);
                  }}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}