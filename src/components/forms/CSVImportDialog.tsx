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

export function CSVImportDialog({ open, onOpenChange, onImportComplete }: CSVImportDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

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

        const headers = results.data[0] as string[];
        const rows = results.data.slice(1) as CSVRow[];
        
        setCsvHeaders(headers);
        setCsvData(rows.filter(row => Object.values(row).some(val => val?.trim())));
        
        // Auto-map common field names
        const autoMappings: FieldMapping[] = [];
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          let dbField = '';
          
          if (lowerHeader.includes('date')) dbField = 'date';
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
          
          if (dbField) {
            autoMappings.push({ csvColumn: header, dbField });
          }
        });
        
        setFieldMappings(autoMappings);
        setStep('mapping');
      },
      header: false,
      skipEmptyLines: true
    });
  }, [toast]);

  const handleMappingChange = (csvColumn: string, dbField: string) => {
    setFieldMappings(prev => {
      const existing = prev.find(m => m.csvColumn === csvColumn);
      if (existing) {
        if (dbField === '') {
          return prev.filter(m => m.csvColumn !== csvColumn);
        }
        return prev.map(m => m.csvColumn === csvColumn ? { ...m, dbField } : m);
      } else if (dbField !== '') {
        return [...prev, { csvColumn, dbField }];
      }
      return prev;
    });
  };

  const validateData = () => {
    const errors: ValidationError[] = [];
    const requiredFields = DATABASE_FIELDS.filter(f => f.required).map(f => f.key);
    
    // Check if all required fields are mapped
    const mappedFields = fieldMappings.map(m => m.dbField);
    const missingRequired = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingRequired.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please map the following required fields: ${missingRequired.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    // Validate data in each row
    csvData.forEach((row, index) => {
      fieldMappings.forEach(mapping => {
        const value = row[csvHeaders.indexOf(mapping.csvColumn)]?.trim();
        
        if (DATABASE_FIELDS.find(f => f.key === mapping.dbField)?.required && !value) {
          errors.push({
            row: index + 1,
            field: mapping.dbField,
            message: 'Required field is empty'
          });
        }
        
        // Validate specific field types
        if (mapping.dbField === 'date' && value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push({
              row: index + 1,
              field: mapping.dbField,
              message: 'Invalid date format'
            });
          }
        }
        
        if (mapping.dbField.includes('time') && value && isNaN(Number(value))) {
          errors.push({
            row: index + 1,
            field: mapping.dbField,
            message: 'Invalid number format'
          });
        }
      });
    });

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
    setStep('importing');
    setImportProgress(0);
    
    try {
      const mappedData = csvData.map(row => {
        const flightEntry: any = {};
        fieldMappings.forEach(mapping => {
          const value = row[csvHeaders.indexOf(mapping.csvColumn)]?.trim();
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
        return flightEntry;
      });

      const { data, error } = await supabase.functions.invoke('import-csv-flights', {
        body: { flights: mappedData }
      });

      if (error) throw error;

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
        description: "There was an error importing your flights. Please try again.",
        variant: "destructive",
      });
      setStep('preview');
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logbook-template.csv';
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
            Import flight entries from a CSV file. Supported formats include ForeFlight, LogTen Pro, and MyFlightbook exports.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload CSV File</CardTitle>
                <CardDescription>
                  Select a CSV file containing your flight logbook entries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="text-lg font-medium">Choose CSV file</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Or drag and drop your file here
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
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={downloadTemplate} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Need help? Download our template CSV file
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
                  Match your CSV columns to the logbook fields. Required fields are marked with *
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {csvHeaders.map(header => (
                    <div key={header} className="space-y-2">
                      <Label className="text-sm font-medium">{header}</Label>
                      <Select
                        value={fieldMappings.find(m => m.csvColumn === header)?.dbField || ''}
                        onValueChange={(value) => handleMappingChange(header, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Don't import</SelectItem>
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
                  Review the first 10 rows of your data before importing. Total rows to import: {csvData.length}
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
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        {fieldMappings.map(mapping => (
                          <TableHead key={mapping.dbField}>
                            {DATABASE_FIELDS.find(f => f.key === mapping.dbField)?.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.slice(0, 10).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          {fieldMappings.map(mapping => {
                            const value = row[csvHeaders.indexOf(mapping.csvColumn)];
                            const hasError = validationErrors.some(e => e.row === index + 1 && e.field === mapping.dbField);
                            return (
                              <TableCell key={mapping.dbField} className={hasError ? 'bg-destructive/10 text-destructive' : ''}>
                                {value || '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep('mapping')}>
                    Back to Mapping
                  </Button>
                  <Button onClick={startImport} disabled={validationErrors.length > 0}>
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