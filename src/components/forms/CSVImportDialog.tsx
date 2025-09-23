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
import { loadForeFlightCsv, analyze, filterOutZeroRows, type ForeFlightRow, type ParseReport } from "@/lib/foreflight-parser";

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
  const [parsedFlights, setParsedFlights] = useState<ForeFlightRow[]>([]);
  const [parseReport, setParseReport] = useState<ParseReport | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const [isForeFlight, setIsForeFlight] = useState(false);
  const [aircraftLookup, setAircraftLookup] = useState<Map<string, AircraftInfo>>(new Map());
  const [useRobustParser, setUseRobustParser] = useState(true);

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
        
        // Parse flight data rows - MORE PERMISSIVE APPROACH
        if (headerRowFound && firstCell && row.length >= 5) {
          // Check if this looks like a date - MUCH more permissive patterns
          const datePatterns = [
            /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD or YYYY-M-D
            /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY or M/D/YYYY  
            /^\d{1,2}-\d{1,2}-\d{4}$/, // MM-DD-YYYY or M-D-YYYY
            /^\d{4}\/\d{1,2}\/\d{1,2}$/, // YYYY/MM/DD or YYYY/M/D
          ];
          
          const looksLikeDate = datePatterns.some(pattern => pattern.test(firstCell)) || 
                              firstCell.includes('2018') || 
                              firstCell.includes('2019') || 
                              firstCell.includes('2020') || 
                              firstCell.includes('2021') || 
                              firstCell.includes('2022') || 
                              firstCell.includes('2023') || 
                              firstCell.includes('2024') || 
                              firstCell.includes('2025');
          
          if (looksLikeDate) {
            const rowObj: CSVRow = {};
            flightHeaders.forEach((header, index) => {
              if (header && row[index] !== undefined && row[index] !== null) {
                const cellValue = row[index]?.toString().trim() || '';
                if (cellValue !== '') {
                  rowObj[header] = cellValue;
                }
              }
            });
            
            // Add aircraft type if we have it in our lookup
            const aircraftId = rowObj['AircraftID']?.toString().trim();
            if (aircraftId && aircraftLookupMap.has(aircraftId)) {
              rowObj['aircraft_type'] = aircraftLookupMap.get(aircraftId)?.typeCode || aircraftId;
            } else if (aircraftId) {
              rowObj['aircraft_type'] = aircraftId; // Fallback to aircraft ID
            }
            
            // ACCEPT ALL FLIGHTS - only require date and aircraft
            const hasAircraftId = rowObj['AircraftID']?.toString().trim() !== '';
            const hasDate = rowObj['Date']?.toString().trim() !== '';
            
            // Only skip if missing absolutely essential data - accept ALL entries with date and aircraft
            if (!hasDate) {
              console.log(`Skipping row ${i}: Missing date`);
              continue;
            }
            if (!hasAircraftId) {
              console.log(`Skipping row ${i}: Missing aircraft ID`);
              continue; 
            }
            // Accept ALL flights with date and aircraft, even if they have 0 time
            
            // For missing airports, use fallback values
            if (!rowObj['From'] || rowObj['From'].toString().trim() === '') {
              rowObj['From'] = 'UNK'; // Use unknown airport code
              console.log(`Flight ${firstCell}: Using fallback departure airport`);
            }
            if (!rowObj['To'] || rowObj['To'].toString().trim() === '') {
              rowObj['To'] = rowObj['From'] || 'UNK'; // Use departure or unknown
              console.log(`Flight ${firstCell}: Using fallback arrival airport`);
            }
            
            flightRows.push(rowObj);
            
            // Log progress every 50 flights
            if (flightRows.length % 50 === 0) {
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

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      if (useRobustParser) {
        // Use the robust ForeFlight parser
        console.log("Using robust ForeFlight parser...");
        const flights = await loadForeFlightCsv(file);
        const report = analyze(flights);
        
        console.log("Parse report:", report);
        
        setParsedFlights(flights);
        setParseReport(report);
        setIsForeFlight(true);
        
        // Show detailed report
        toast({
          title: "CSV Parsed Successfully",
          description: `Found ${report.validFlights} valid flights (${report.zeroTimeFlights} with zero time). ${report.formatBreakdown.legacy2018} from 2018.`,
        });
        
        // Skip mapping step - go directly to preview for robust parser
        setStep('preview');
        
      } else {
        // Fallback to original Papa Parse logic
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
            setStep('mapping');
          }
        });
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: "Parsing Error",
        description: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [toast, useRobustParser]);

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
      let mappedData;
      
      if (useRobustParser && parsedFlights.length > 0) {
        // Use robust parser data - already normalized
        mappedData = parsedFlights.map(flight => ({
          date: flight.date,
          aircraft_registration: flight.aircraft_registration,
          aircraft_type: flight.aircraft_type,
          departure_airport: flight.departure_airport,
          arrival_airport: flight.arrival_airport,
          total_time: flight.total_time,
          pic_time: flight.pic_time,
          sic_time: flight.sic_time,
          cross_country_time: flight.cross_country_time,
          night_time: flight.night_time,
          instrument_time: flight.instrument_time,
          actual_instrument: flight.actual_instrument,
          simulated_instrument: flight.simulated_instrument,
          solo_time: flight.solo_time,
          dual_given: flight.dual_given,
          dual_received: flight.dual_received,
          holds: flight.holds,
          approaches: flight.approaches,
          landings: flight.landings,
          day_takeoffs: flight.day_takeoffs,
          day_landings: flight.day_landings,
          night_takeoffs: flight.night_takeoffs,
          night_landings: flight.night_landings,
          simulated_flight: flight.simulated_flight,
          ground_training: flight.ground_training,
          route: flight.route,
          remarks: flight.remarks,
          start_time: flight.start_time,
          end_time: flight.end_time
        }));
      } else {
        // Fallback to original mapping logic
        mappedData = csvData.map(row => {
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
      }

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
                  {useRobustParser && parseReport ? (
                    <>
                      Review your flight data before importing. {parseReport.validFlights} valid flights detected 
                      {parseReport.zeroTimeFlights > 0 && ` (${parseReport.zeroTimeFlights} flights with zero time will be skipped)`}.
                      {parseReport.formatBreakdown.legacy2018 > 0 && (
                        <> {parseReport.formatBreakdown.legacy2018} flights from 2018 detected.</>
                      )}
                    </>
                  ) : (
                    <>Review your flight data before importing. {csvData.length} flights detected.</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parseReport && parseReport.warnings.length > 0 && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {parseReport.warnings.map((warning, index) => (
                          <div key={index}>{warning}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {validationErrors.length > 0 && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Found {validationErrors.length} validation errors. Please fix them before importing.
                    </AlertDescription>
                  </Alert>
                )}

                {useRobustParser && parseReport && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{parseReport.validFlights}</div>
                      <div className="text-sm text-muted-foreground">Valid Flights</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{parseReport.totalHours.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Total Hours</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{parseReport.aircraftCount}</div>
                      <div className="text-sm text-muted-foreground">Aircraft</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{parseReport.formatBreakdown.legacy2018}</div>
                      <div className="text-sm text-muted-foreground">2018 Flights</div>
                    </div>
                  </div>
                )}
                
                <div className="max-h-96 overflow-x-auto overflow-y-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="sticky left-0 bg-muted/50 border-r min-w-16">Row</TableHead>
                        <TableHead className="min-w-28">Date</TableHead>
                        <TableHead className="min-w-32">Aircraft</TableHead>
                        <TableHead className="min-w-24">From</TableHead>
                        <TableHead className="min-w-24">To</TableHead>
                        <TableHead className="min-w-20">Total</TableHead>
                        <TableHead className="min-w-20">PIC</TableHead>
                        <TableHead className="min-w-20">Format</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {useRobustParser && parsedFlights.length > 0 ? (
                        // Show robust parser data
                        parsedFlights.slice(0, 10).map((flight, index) => (
                          <TableRow key={index} className={flight.total_time === 0 ? 'opacity-50' : ''}>
                            <TableCell className="sticky left-0 bg-background border-r font-medium">{index + 1}</TableCell>
                            <TableCell>{flight.date}</TableCell>
                            <TableCell>{flight.aircraft_registration}</TableCell>
                            <TableCell>{flight.departure_airport}</TableCell>
                            <TableCell>{flight.arrival_airport}</TableCell>
                            <TableCell className={flight.total_time === 0 ? 'text-red-500 font-medium' : 'font-medium'}>
                              {flight.total_time.toFixed(1)}
                            </TableCell>
                            <TableCell>{flight.pic_time.toFixed(1)}</TableCell>
                            <TableCell>
                              <Badge variant={flight._format === 'legacy2018' ? 'destructive' : 'secondary'}>
                                {flight._format}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        // Fallback to original CSV preview
                        csvData.slice(0, 10).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="sticky left-0 bg-background border-r font-medium">{index + 1}</TableCell>
                            {fieldMappings.slice(0, 7).map(mapping => {
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
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={() => setStep(useRobustParser ? 'upload' : 'mapping')} className="w-full sm:w-auto">
                    Back
                  </Button>
                  <Button 
                    onClick={startImport} 
                    disabled={validationErrors.length > 0 || (useRobustParser && parseReport?.validFlights === 0)}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                  >
                    Import {useRobustParser && parseReport ? parseReport.validFlights : csvData.length} Flights
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