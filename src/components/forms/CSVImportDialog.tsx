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
};

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
  if (typeof value !== "string") return "";
  return value.trim().toUpperCase();
};

const parseTotalTime = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return Number(value.toFixed(2));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const colonCandidate = trimmed.includes(":")
      ? trimmed.replace(/[^0-9:]/g, "")
      : trimmed;

    const hm = colonCandidate.match(/^(\d+):([0-5]\d)(?::([0-5]\d))?$/);
    if (hm) {
      const hours = Number(hm[1]);
      const minutes = Number(hm[2]);
      const seconds = hm[3] ? Number(hm[3]) : 0;
      const decimal = hours + minutes / 60 + seconds / 3600;
      return Number(decimal.toFixed(2));
    }

    const normalized = trimmed.replace(/[,\u00A0]/g, "");
    const numeric = Number.parseFloat(normalized);
    if (Number.isFinite(numeric)) {
      return Number(numeric.toFixed(2));
    }
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

const mapRowToMinimalFlight = (
  row: Record<string, unknown>,
): MinimalFlight | null => {
  const dateRaw = findField(row, [
    "Date",
    "Flight Date",
    "Log Date",
    "DATE",
    "FlightDate",
    "Date (Local)",
    "DateLocal",
  ]);

  const aircraftRaw = findField(row, [
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
  ]);

  const departureRaw = findField(row, [
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
  ]);

  const arrivalRaw = findField(row, [
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
  ]);

  const totalTimeRaw = findField(row, [
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
  ]);

  const normalizedDate = dateFromValue(dateRaw);
  const registration =
    typeof aircraftRaw === "string"
      ? aircraftRaw.trim().toUpperCase()
      : typeof aircraftRaw === "number"
      ? String(aircraftRaw).trim().toUpperCase()
      : "";
  const departure = normalizeAirport(departureRaw);
  const arrival = normalizeAirport(arrivalRaw);

  if (!normalizedDate || !registration || !departure || !arrival) {
    return null;
  }

  return {
    date: normalizedDate,
    aircraft_registration: registration,
    aircraft_type: registration,
    departure_airport: departure,
    arrival_airport: arrival,
    total_time: parseTotalTime(totalTimeRaw),
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

      const flights: MinimalFlight[] = [];
      let skipped = 0;

      for (const row of rows) {
        const mapped = mapRowToMinimalFlight(row);
        if (mapped) {
          flights.push(mapped);
        } else {
          skipped += 1;
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

      const totalImportedTime = flights.reduce(
        (sum, flight) => sum + (flight.total_time ?? 0),
        0,
      );

      const insertPayload = flights.map((flight) => ({
        user_id: user.id,
        date: flight.date,
        aircraft_registration: flight.aircraft_registration,
        aircraft_type: flight.aircraft_type,
        departure_airport: flight.departure_airport,
        arrival_airport: flight.arrival_airport,
        total_time: flight.total_time ?? 0,
      }));

      const { error } = await supabase.from("flight_entries").insert(insertPayload);

      if (error) {
        throw error;
      }

      setSkippedRows(skipped);
      toast({
        title: "Import complete",
        description: `Added ${flights.length} flights totaling ${totalImportedTime.toFixed(
          2,
        )} hours${skipped > 0 ? ` (skipped ${skipped} incomplete rows)` : ""}.`,
      });

      onImportComplete();
      handleClose();
    } catch (error) {
      console.error("CSV import failed", error);
      toast({
        title: "Import failed",
        description: "Something went wrong while importing the CSV. Please verify the file and try again.",
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
