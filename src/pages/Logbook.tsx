import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Filter, Download, Plane, Upload, Edit, Trash2, Clock, Calculator } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AddFlightDialog } from "@/components/forms/AddFlightDialog";
import { CSVImportDialog } from "@/components/forms/CSVImportDialog";
import { FlightHoursPredictionsDialog } from "@/components/dialogs/FlightHoursPredictionsDialog";
import { subMonths, format, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FlightMap } from "@/components/FlightMap";
import { EndorsementCarousel } from "@/components/EndorsementCarousel";

interface FlightEntry {
  id: string;
  date: string;
  aircraft_registration: string;
  aircraft_type: string;
  departure_airport: string;
  arrival_airport: string;
  total_time: number;
  pic_time: number;
  cross_country_time: number;
  night_time: number;
  instrument_time: number;
  approaches: string;
  landings: number;
  remarks: string | null;
  route?: string;
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
  sic_time?: number;
  solo_time?: number;
  day_takeoffs?: number;
  day_landings?: number;
  night_takeoffs?: number;
  night_landings?: number;
  actual_instrument?: number;
  simulated_instrument?: number;
  holds?: number;
  dual_given?: number;
  dual_received?: number;
  simulated_flight?: number;
  ground_training?: number;
}

const Logbook = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [flights, setFlights] = useState<FlightEntry[]>([]);
  const [isLoadingFlights, setIsLoadingFlights] = useState(true);
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [showAddFlightDialog, setShowAddFlightDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightEntry | null>(null);
  const [deletingFlight, setDeletingFlight] = useState<FlightEntry | null>(null);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [viewingFlight, setViewingFlight] = useState<FlightEntry | null>(null);
  const [showPredictionsDialog, setShowPredictionsDialog] = useState(false);
  const [aircraftMap, setAircraftMap] = useState<Map<string, { type_code: string | null; make: string; model: string }>>(new Map());

  // Shared function to fetch and process flights
  const fetchAndProcessFlights = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setIsLoadingFlights(true);
      }
      const pageSize = 1000;
      let from = 0;
      let collected: FlightEntry[] = [];

      while (true) {
        const { data, error } = await supabase
          .from('flight_entries')
          .select('*')
          .order('date', { ascending: false })
          .order('start_time', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .range(from, from + pageSize - 1);

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          break;
        }

        collected = [...collected, ...data];

        if (data.length < pageSize) {
          break;
        }

        from += pageSize;
      }

      // Client-side sort to ensure proper chronological order
      // Sort by date DESC, then by start_time DESC (later times first), then created_at DESC
      collected.sort((a, b) => {
        // First, compare dates
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) {
          return dateB - dateA; // DESC order
        }

        // If same date, compare start_time
        // Parse time strings (HH:MM:SS or HH:MM) - handle null/undefined
        const parseTime = (timeStr: string | null | undefined): number => {
          if (!timeStr) return -1; // Null times sort last
          const parts = timeStr.split(':').map(Number);
          return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
        };
        
        const timeA = parseTime(a.start_time);
        const timeB = parseTime(b.start_time);
        
        // If both have times, compare them
        if (timeA >= 0 && timeB >= 0) {
          if (timeA !== timeB) {
            return timeB - timeA; // DESC order (later times first)
          }
        } else if (timeA >= 0 && timeB < 0) {
          return -1; // Flights with time come before flights without time
        } else if (timeA < 0 && timeB >= 0) {
          return 1; // Flights without time come after flights with time
        }
        // If both are null, continue to created_at comparison

        // If same date and time (or both null), use created_at as tiebreaker
        const createdA = new Date(a.created_at).getTime();
        const createdB = new Date(b.created_at).getTime();
        return createdB - createdA; // DESC order
      });

      setFlights(collected);

      // Fetch aircraft data to get type information
      const { data: aircraftData, error: aircraftError } = await supabase
        .from("aircraft_logbook")
        .select("aircraft_id, type_code, make, model")
        .eq("user_id", user?.id);

      if (!aircraftError && aircraftData) {
        const map = new Map<string, { type_code: string | null; make: string; model: string }>();
        for (const aircraft of aircraftData) {
          map.set(aircraft.aircraft_id.toUpperCase(), {
            type_code: aircraft.type_code,
            make: aircraft.make,
            model: aircraft.model,
          });
        }
        setAircraftMap(map);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
      toast({
        title: "Error",
        description: "Failed to load flight entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (showLoading) {
        setIsLoadingFlights(false);
      }
    }
  }, [user, toast]);

  // Regular fetch with loading state (for initial load)
  const fetchFlights = useCallback(() => {
    return fetchAndProcessFlights(true);
  }, [fetchAndProcessFlights]);

  // Silent refresh without loading state (for after save/edit/delete)
  const silentRefreshFlights = useCallback(() => {
    return fetchAndProcessFlights(false);
  }, [fetchAndProcessFlights]);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    }
  }, [user, loading, navigate]);

  // Fetch flight entries from database
  useEffect(() => {
    if (user) {
      fetchFlights();
    }
  }, [user, fetchFlights]);

  const handleEditFlight = (flight: FlightEntry) => {
    setViewingFlight(null);
    setEditingFlight(flight);
    setShowAddFlightDialog(true);
  };

  const handleViewFlight = (flight: FlightEntry) => {
    setViewingFlight(flight);
  };

  const handleCloseDialog = (open: boolean) => {
    setShowAddFlightDialog(open);
    if (!open) {
      setEditingFlight(null);
    }
  };

  const handleDeleteFlight = async () => {
    if (!deletingFlight) return;

    try {
      const { error } = await supabase
        .from('flight_entries')
        .delete()
        .eq('id', deletingFlight.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Flight deleted",
        description: "Flight entry has been successfully deleted.",
      });

      // Refresh the flights list silently (no white screen)
      silentRefreshFlights();
    } catch (error) {
      console.error('Error deleting flight:', error);
      toast({
        title: "Error",
        description: "Failed to delete flight entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingFlight(null);
    }
  };

  const handleClearAllFlights = async () => {
    try {
      // Delete all flight entries
      const { error: flightsError } = await supabase
        .from('flight_entries')
        .delete()
        .eq('user_id', user?.id);

      if (flightsError) {
        throw flightsError;
      }

      // Delete all aircraft associated with the user
      const { error: aircraftError } = await supabase
        .from('aircraft_logbook')
        .delete()
        .eq('user_id', user?.id);

      if (aircraftError) {
        throw aircraftError;
      }

      toast({
        title: "All flights and aircraft cleared",
        description: "All flight entries and aircraft have been successfully deleted.",
      });

      // Refresh the flights list silently (no white screen)
      silentRefreshFlights();
    } catch (error) {
      console.error('Error clearing flights and aircraft:', error);
      toast({
        title: "Error",
        description: "Failed to clear flight entries and aircraft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowClearAllDialog(false);
    }
  };
  
  // Calculate totals from flight data
  const totalHours = flights.reduce((sum, flight) => sum + (Number(flight.total_time) || 0), 0);
  const totalPIC = flights.reduce((sum, flight) => {
    const time = Number(flight.pic_time) || 0;
    return sum + time;
  }, 0);
  const totalXC = flights.reduce((sum, flight) => {
    const time = Number(flight.cross_country_time) || 0;
    return sum + time;
  }, 0);
  const totalNight = flights.reduce((sum, flight) => {
    const time = Number(flight.night_time) || 0;
    return sum + time;
  }, 0);
  const totalActualInstrument = flights.reduce(
    (sum, flight) => sum + (Number(flight.actual_instrument) || 0),
    0,
  );
  const totalSimInstrument = flights.reduce(
    (sum, flight) => sum + (Number(flight.simulated_instrument) || 0),
    0,
  );
  const totalInstrument = totalActualInstrument + totalSimInstrument;
  const totalSIC = flights.reduce((sum, flight) => {
    const time = Number(flight.sic_time) || 0;
    return sum + time;
  }, 0);
  const totalSolo = flights.reduce((sum, flight) => {
    const time = Number(flight.solo_time) || 0;
    return sum + time;
  }, 0);

  const formatHours = (value: number) => {
    const rounded = Math.round(value * 100) / 100;
    return rounded.toFixed(2).replace(/\.?0+$/, "");
  };

  const totalDualGiven = flights.reduce(
    (sum, flight) => sum + (Number(flight.dual_given) || 0),
    0,
  );
  const totalDualReceived = flights.reduce(
    (sum, flight) => sum + (Number(flight.dual_received) || 0),
    0,
  );
  const totalSimulatedFlight = flights.reduce(
    (sum, flight) => sum + (Number(flight.simulated_flight) || 0),
    0,
  );
  const totalGroundTraining = flights.reduce(
    (sum, flight) => sum + (Number(flight.ground_training) || 0),
    0,
  );
  // Helper function to parse approaches value (only numeric values, ignores text)
  const parseApproaches = (value: string | null | undefined): number => {
    if (!value) return 0;
    const trimmed = String(value).trim();
    if (!trimmed) return 0;
    
    // Only parse as integer, ignore text descriptions
    const numeric = Number.parseInt(trimmed, 10);
    if (!Number.isNaN(numeric) && numeric >= 0) {
      return numeric;
    }
    
    return 0;
  };

  const totalApproaches = flights.reduce(
    (sum, flight) => sum + parseApproaches(flight.approaches),
    0,
  );
  const totalApproachCount = totalApproaches;
  const totalDayTO = flights.reduce(
    (sum, flight) => sum + (Number(flight.day_takeoffs) || 0),
    0,
  );
  const totalDayLandings = flights.reduce(
    (sum, flight) => sum + (Number(flight.day_landings) || 0),
    0,
  );
  const totalDayFullStop = flights.reduce(
    (sum, flight) => sum + (Number(flight.day_landings_full_stop) || 0),
    0,
  );
  const totalNightTO = flights.reduce(
    (sum, flight) => sum + (Number(flight.night_takeoffs) || 0),
    0,
  );
  const totalNightLandings = flights.reduce(
    (sum, flight) => sum + (Number(flight.night_landings) || 0),
    0,
  );
  const totalNightFullStops = flights.reduce(
    (sum, flight) => sum + (Number(flight.night_landings_full_stop) || 0),
    0,
  );
  const totalHolds = flights.reduce(
    (sum, flight) => sum + (Number(flight.holds) || 0),
    0,
  );
  // Calculate total landings
  // Priority: Use the 'landings' field first (from AllLandings in CSV = complete total)
  // Fallback: Sum individual fields if landings field is not available
  const totalLandings = flights.reduce(
    (sum, flight) => {
      // Safely convert to numbers, handling null/undefined
      const legacyLandings = flight.landings != null ? Number(flight.landings) || 0 : 0;
      const dayLandings = flight.day_landings != null ? Number(flight.day_landings) || 0 : 0;
      const dayFullStop = flight.day_landings_full_stop != null ? Number(flight.day_landings_full_stop) || 0 : 0;
      const nightLandings = flight.night_landings != null ? Number(flight.night_landings) || 0 : 0;
      const nightFullStop = flight.night_landings_full_stop != null ? Number(flight.night_landings_full_stop) || 0 : 0;
      
      // Priority: Use landings field (from AllLandings in CSV) - this is the most accurate total
      // The landings field contains the complete count from AllLandings column
      if (legacyLandings > 0) {
        return sum + legacyLandings;
      }
      
      // Fallback: Sum individual fields if landings field is not set
      const sumOfIndividualFields = dayLandings + dayFullStop + nightLandings + nightFullStop;
      return sum + sumOfIndividualFields;
    },
    0,
  );

  const formatMetric = (value: number, type: "hours" | "count") =>
    type === "hours" ? `${formatHours(value)} hrs` : `${value}`;

  const masterTotals = [
    { key: "total-time", label: "Total Time", value: totalHours, type: "hours" as const },
    { key: "pic-time", label: "PIC", value: totalPIC, type: "hours" as const },
    { key: "sic-time", label: "SIC", value: totalSIC, type: "hours" as const },
    { key: "solo-time", label: "Solo", value: totalSolo, type: "hours" as const },
    { key: "night-time", label: "Night", value: totalNight, type: "hours" as const },
    { key: "instrument-time", label: "Instrument (Total)", value: totalInstrument, type: "hours" as const },
    { key: "actual-instrument", label: "Actual Instrument", value: totalActualInstrument, type: "hours" as const },
    { key: "sim-instrument", label: "Sim Instrument", value: totalSimInstrument, type: "hours" as const },
    { key: "xc-time", label: "Cross Country", value: totalXC, type: "hours" as const },
    { key: "holds", label: "Holds", value: totalHolds, type: "count" as const },
    { key: "approaches", label: "Approaches", value: totalApproachCount, type: "count" as const },
    { key: "landings", label: "Landings", value: totalLandings, type: "count" as const },
    { key: "dual-given", label: "Dual Given", value: totalDualGiven, type: "hours" as const },
    { key: "dual-received", label: "Dual Received", value: totalDualReceived, type: "hours" as const },
    { key: "sim-flight", label: "Sim Flight", value: totalSimulatedFlight, type: "hours" as const },
    { key: "ground-training", label: "Ground Training", value: totalGroundTraining, type: "hours" as const },
  ];

  // Show loading state
  if (loading || isLoadingFlights) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-aviation-light/40 to-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Plane className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading your logbook...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixMonthsAgo = subMonths(now, 6);
  const twelveMonthsAgo = subMonths(now, 12);
  const twentyFourMonthsAgo = subMonths(now, 24);

  let last30DaysHours = 0;
  let last6MonthsHours = 0;
  let last12MonthsHours = 0;
  let last24MonthsHours = 0;

  flights.forEach((flight) => {
    const parsedDate = flight.date ? new Date(flight.date) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      return;
    }

    const totalTime = Number(flight.total_time) || 0;

    if (parsedDate >= twentyFourMonthsAgo) {
      last24MonthsHours += totalTime;
      if (parsedDate >= twelveMonthsAgo) {
        last12MonthsHours += totalTime;
        if (parsedDate >= sixMonthsAgo) {
          last6MonthsHours += totalTime;
          if (parsedDate >= thirtyDaysAgo) {
            last30DaysHours += totalTime;
          }
        }
      }
    }
  });

  const recentHours = last30DaysHours;
  const timeWindowInsights = [
    {
      key: "last-30-days",
      label: "Last 30 days",
      value: `${formatHours(last30DaysHours)} hrs`,
    },
    {
      key: "last-6-months",
      label: "Last 6 months",
      value: `${formatHours(last6MonthsHours)} hrs`,
    },
    {
      key: "last-12-months",
      label: "Last 12 months",
      value: `${formatHours(last12MonthsHours)} hrs`,
    },
    {
      key: "last-24-months",
      label: "Last 24 months",
      value: `${formatHours(last24MonthsHours)} hrs`,
    },
  ];

  // Calculate flight hours per month for the last 12 months
  const calculateMonthlyHours = () => {
    const now = new Date();
    const twelveMonthsAgo = subMonths(now, 11);
    const months = eachMonthOfInterval({
      start: startOfMonth(twelveMonthsAgo),
      end: endOfMonth(now),
    });

    const monthlyData = months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const hoursInMonth = flights.reduce((sum, flight) => {
        const flightDate = flight.date ? new Date(flight.date) : null;
        if (!flightDate || Number.isNaN(flightDate.getTime())) {
          return sum;
        }
        
        if (flightDate >= monthStart && flightDate <= monthEnd) {
          return sum + (Number(flight.total_time) || 0);
        }
        return sum;
      }, 0);

      return {
        month: format(month, "MMMM"),
        monthShort: format(month, "MMM"),
        hours: Math.round(hoursInMonth * 100) / 100,
      };
    });

    return monthlyData;
  };

  const monthlyHoursData = calculateMonthlyHours();

  const lastFlight = flights.length > 0 ? flights[0] : null;

  let tableRows: React.ReactNode;

  if (flights.length === 0) {
    tableRows = (
      <TableRow>
        <TableCell colSpan={8} className="h-32 text-center">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Plane className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-lg font-medium">No flights recorded yet</p>
            <p className="text-sm">Click "Add Flight" to log your first flight</p>
          </div>
        </TableCell>
      </TableRow>
    );
  } else {
    tableRows = flights.map((flight) => (
      <TableRow 
        key={flight.id} 
        className="hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={() => handleViewFlight(flight)}
      >
        <TableCell className="min-w-[110px] whitespace-nowrap font-medium">{flight.date}</TableCell>
        <TableCell>
          <Badge variant="outline">{flight.aircraft_registration}</Badge>
        </TableCell>
        <TableCell>{flight.departure_airport}</TableCell>
        <TableCell>{flight.arrival_airport}</TableCell>
        <TableCell className="font-medium text-center">{formatHours(Number(flight.total_time) || 0)}</TableCell>
        <TableCell className="text-center">{formatHours(Number(flight.pic_time) || 0)}</TableCell>
        <TableCell className="text-center">{formatHours(Number(flight.sic_time) || 0)}</TableCell>
        <TableCell className="text-center">{formatHours(Number(flight.cross_country_time) || 0)}</TableCell>
      </TableRow>
    ));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-aviation-light/40 to-background">
      <Header />

      <main className="relative pb-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-aviation-sky/10 to-aviation-navy/20" />
          <div className="absolute -top-20 right-[-10%] h-64 w-64 rounded-full bg-aviation-sky/30 blur-3xl opacity-70" />
          <div className="absolute bottom-[-35%] left-[-15%] h-[420px] w-[420px] rounded-full bg-aviation-navy/30 blur-3xl opacity-60" />
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, index) => (
              <span
                key={index}
                className="absolute h-2 w-2 rounded-full bg-aviation-sky/20"
                style={{
                  left: `${10 + index * 15}%`,
                  top: `${25 + (index % 3) * 20}%`,
                }}
              />
            ))}
          </div>

          <div className="relative container mx-auto px-6 py-8 lg:py-12">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6 mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Flight Logbook</h1>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Manage your flight records and track your aviation experience
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="default" 
                    onClick={() => setShowAddFlightDialog(true)}
                    className="shadow-sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                  Add Flight
                </Button>
                <Button
                    size="default"
                  variant="outline"
                  onClick={() => setShowImportDialog(true)}
                    className="shadow-sm"
                >
                    <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
                <Button
                    size="default"
                  variant="outline"
                  onClick={() => setShowClearAllDialog(true)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Flights</p>
                      <p className="text-2xl font-bold text-foreground">{flights.length}</p>
                    </div>
                    <Plane className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Last 30 Days</p>
                      <p className="text-2xl font-bold text-foreground">{recentHours.toFixed(1)} hrs</p>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Hours</p>
                      <p className="text-2xl font-bold text-foreground">{formatHours(totalHours)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                </div>
                {lastFlight && (
                  <div className="rounded-lg border bg-card p-4 shadow-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Last Flight</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {lastFlight.departure_airport} → {lastFlight.arrival_airport}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {lastFlight.date}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              </div>

              <div className="rounded-3xl border border-white/50 bg-white/45 shadow-2xl shadow-aviation-navy/20 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/40 px-6 py-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Master Flight Log</p>
                    <p className="text-sm text-muted-foreground">High-level totals across your entire logbook</p>
                  </div>
                  <p className="text-sm font-medium text-foreground/80">
                    {flights.length} flights logged
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <div className="flex min-w-max gap-3 px-6 py-4">
                    {masterTotals.map((item) => (
                      <div
                        key={item.key}
                        className="min-w-[160px] rounded-2xl border border-white/50 bg-background/70 px-4 py-3 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {formatMetric(item.value, item.type)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative -mt-10">
          <div className="container mx-auto px-6 pt-12 space-y-8">
            {/* Flight Hours Chart */}
            <div className="rounded-3xl border border-border/60 bg-card/95 shadow-xl shadow-aviation-navy/15 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-6 py-5">
                <div>
                  <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Clock className="h-5 w-5 text-primary" />
                    Flight Hours - Last 12 Months
                  </p>
                  <p className="text-sm text-muted-foreground">Monthly flight hours breakdown</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPredictionsDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Predictions
                </Button>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyHoursData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '11px' }}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      domain={[0, 150]}
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                      formatter={(value: number) => [`${value.toFixed(1)} hrs`, 'Hours']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Flight Map */}
            <FlightMap 
              flights={flights} 
              onDateRangeChange={(dateRange) => setDateRangeFilter(dateRange)}
            />

            <div className="rounded-3xl border border-border/60 bg-card/95 shadow-xl shadow-aviation-navy/15 backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 px-6 py-6">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Search &amp; Filter</p>
                  <p className="text-xs text-muted-foreground">Fine-tune your logbook view or prepare an export in seconds</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-white/40 bg-white/20 text-foreground hover:bg-white/40"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-white/40 bg-white/20 text-foreground hover:bg-white/40"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),280px]">
                  <div className="rounded-3xl border border-border/50 bg-background/70 p-5 shadow-inner">
                    <Label htmlFor="search" className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
                      Search flights
                    </Label>
                    <div className="relative mt-4">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by aircraft, route, or remarks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-14 rounded-2xl border-border/40 bg-card pl-12 text-base"
                      />
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {timeWindowInsights.map((insight) => (
                        <div key={insight.key} className="rounded-2xl border border-border/40 bg-background/80 p-4">
                          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/80">{insight.label}</p>
                          <p className="mt-2 text-base font-semibold text-foreground">{insight.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 rounded-3xl border border-border/50 bg-background/70 p-5 shadow-inner">
                    <div>
                      <Label htmlFor="aircraft-filter" className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
                        Aircraft type
                      </Label>
                      <Select>
                        <SelectTrigger className="mt-3 h-12 rounded-2xl border-border/40 bg-card">
                          <SelectValue placeholder="All aircraft" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Aircraft</SelectItem>
                          <SelectItem value="c172">Cessna 172</SelectItem>
                          <SelectItem value="pa28">Piper Cherokee</SelectItem>
                          <SelectItem value="c152">Cessna 152</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-2xl border border-dashed border-border/40 bg-background/60 p-4 text-center text-xs text-muted-foreground">
                      Additional filters coming soon — use the search or aircraft selector above to narrow your logbook.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Endorsement Carousel */}
            <EndorsementCarousel />

            <div className="rounded-3xl border border-border/60 bg-card/95 shadow-xl shadow-aviation-navy/15 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-6 py-5">
                <div>
                  <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Plane className="h-5 w-5 text-aviation-sky" />
                    Flight Log Entries
                  </p>
                  <p className="text-sm text-muted-foreground">{flights.length} flights recorded</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setShowAddFlightDialog(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Flight
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[110px] whitespace-nowrap">Date</TableHead>
                      <TableHead>Aircraft ID</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead className="text-center">Total Time</TableHead>
                      <TableHead className="text-center">PIC</TableHead>
                      <TableHead className="text-center">SIC</TableHead>
                      <TableHead className="text-center">Cross Country</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{tableRows}</TableBody>
                </Table>
              </div>
            </div>
          </div>
        </section>

      </main>

      <AddFlightDialog
        open={showAddFlightDialog}
        onOpenChange={handleCloseDialog}
        onFlightAdded={silentRefreshFlights}
        editingFlight={editingFlight}
      />

      <AlertDialog open={!!deletingFlight} onOpenChange={() => setDeletingFlight(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flight Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this flight entry? This action cannot be undone.
              {deletingFlight && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Date:</strong> {deletingFlight.date}<br />
                  <strong>Aircraft:</strong> {deletingFlight.aircraft_registration}<br />
                  <strong>Route:</strong> {deletingFlight.departure_airport} → {deletingFlight.arrival_airport}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFlight} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Flight Entries</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ALL flight entries and ALL aircraft in your logbook? This action cannot be undone.
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <strong>Total flights to be deleted:</strong> {flights.length}<br />
                <strong>Total flight time:</strong> {totalHours.toFixed(1)} hours<br />
                <strong>All aircraft will also be deleted.</strong>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllFlights} className="bg-destructive hover:bg-destructive/90">
              Clear All Flights
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CSVImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportComplete={() => {
          silentRefreshFlights();
        }}
      />

      <FlightHoursPredictionsDialog
        open={showPredictionsDialog}
        onOpenChange={setShowPredictionsDialog}
        monthlyHoursData={monthlyHoursData}
        currentTotalHours={totalHours}
      />

      {/* Flight Detail Dialog */}
      <Dialog open={!!viewingFlight} onOpenChange={(open) => !open && setViewingFlight(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          {viewingFlight && (
            <>
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b px-6 py-6">
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <DialogTitle className="text-2xl font-bold">Flight Details</DialogTitle>
                      <DialogDescription className="text-base">
                        {viewingFlight.date} • {viewingFlight.aircraft_registration}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Flight Overview Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Route</p>
                    <p className="text-2xl font-bold text-foreground">
                      {viewingFlight.departure_airport} → {viewingFlight.arrival_airport}
                    </p>
                    {viewingFlight.route && (
                      <p className="text-sm text-muted-foreground mt-1">{viewingFlight.route}</p>
                    )}
                  </div>
                  
                  <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Aircraft</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm font-semibold">
                        {viewingFlight.aircraft_registration}
                      </Badge>
                      <span className="text-lg font-semibold text-foreground">
                        {(() => {
                          const aircraft = aircraftMap.get(viewingFlight.aircraft_registration.toUpperCase());
                          if (aircraft) {
                            return aircraft.type_code || `${aircraft.make} ${aircraft.model}`;
                          }
                          return viewingFlight.aircraft_type || '—';
                        })()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Total Time</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatHours(Number(viewingFlight.total_time) || 0)} hrs
                    </p>
                  </div>
                </div>

                {/* Flight Times Section */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Flight Times
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "PIC", value: formatHours(Number(viewingFlight.pic_time) || 0) },
                      { label: "SIC", value: formatHours(Number(viewingFlight.sic_time) || 0) },
                      { label: "Solo", value: formatHours(Number(viewingFlight.solo_time) || 0) },
                      { label: "Night", value: formatHours(Number(viewingFlight.night_time) || 0) },
                      { label: "Cross Country", value: formatHours(Number(viewingFlight.cross_country_time) || 0) },
                      { label: "Actual Instrument", value: formatHours(Number(viewingFlight.actual_instrument) || 0) },
                      { label: "Sim Instrument", value: formatHours(Number(viewingFlight.simulated_instrument) || 0) },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          {item.label}
                        </p>
                        <p className="text-lg font-semibold text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Details & Landings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Additional Details */}
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Holds", value: viewingFlight.holds ?? 0 },
                        { label: "Approaches", value: viewingFlight.approaches || '—' },
                        { label: "Dual Given", value: formatHours(Number(viewingFlight.dual_given) || 0) },
                        { label: "Dual Received", value: formatHours(Number(viewingFlight.dual_received) || 0) },
                        { label: "Sim Flight", value: formatHours(Number(viewingFlight.simulated_flight) || 0) },
                        { label: "Ground Training", value: formatHours(Number(viewingFlight.ground_training) || 0) },
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {item.label}
                          </p>
                          <p className="text-base font-semibold text-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Landings & Takeoffs */}
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Landings & Takeoffs</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Day Takeoffs", value: viewingFlight.day_takeoffs ?? 0 },
                        { label: "Day Landings", value: viewingFlight.day_landings ?? 0 },
                        { label: "Day Full Stop", value: viewingFlight.day_landings_full_stop ?? 0 },
                        { label: "Total Landings", value: viewingFlight.landings ?? 0 },
                        { label: "Night Takeoffs", value: viewingFlight.night_takeoffs ?? 0 },
                        { label: "Night Landings", value: viewingFlight.night_landings ?? 0 },
                        { label: "Night Full Stop", value: viewingFlight.night_landings_full_stop ?? 0 },
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {item.label}
                          </p>
                          <p className="text-base font-semibold text-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time Tracking (if available) */}
                {(viewingFlight.time_out || viewingFlight.time_off || viewingFlight.time_on || viewingFlight.time_in || 
                  viewingFlight.start_time || viewingFlight.end_time || viewingFlight.on_duty || viewingFlight.off_duty ||
                  viewingFlight.hobbs_start != null || viewingFlight.hobbs_end != null || viewingFlight.tach_start != null || viewingFlight.tach_end != null) && (
                  <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Time Tracking</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        viewingFlight.time_out && { label: "Time Out", value: viewingFlight.time_out },
                        viewingFlight.time_off && { label: "Time Off", value: viewingFlight.time_off },
                        viewingFlight.time_on && { label: "Time On", value: viewingFlight.time_on },
                        viewingFlight.time_in && { label: "Time In", value: viewingFlight.time_in },
                        viewingFlight.start_time && !viewingFlight.time_out && { label: "Start Time", value: viewingFlight.start_time },
                        viewingFlight.end_time && !viewingFlight.time_in && { label: "End Time", value: viewingFlight.end_time },
                        viewingFlight.on_duty && { label: "On Duty", value: viewingFlight.on_duty },
                        viewingFlight.off_duty && { label: "Off Duty", value: viewingFlight.off_duty },
                        viewingFlight.hobbs_start != null && { label: "Hobbs Start", value: viewingFlight.hobbs_start },
                        viewingFlight.hobbs_end != null && { label: "Hobbs End", value: viewingFlight.hobbs_end },
                        viewingFlight.tach_start != null && { label: "Tach Start", value: viewingFlight.tach_start },
                        viewingFlight.tach_end != null && { label: "Tach End", value: viewingFlight.tach_end },
                      ].filter(Boolean).map((item: any) => (
                        <div key={item.label} className="flex flex-col">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {item.label}
                          </p>
                          <p className="text-base font-semibold text-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remarks */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Remarks</h3>
                  {viewingFlight.remarks ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {viewingFlight.remarks}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No remarks recorded</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleEditFlight(viewingFlight)}
                    className="flex-1 h-11"
                    size="lg"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Flight
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setViewingFlight(null);
                      setDeletingFlight(viewingFlight);
                    }}
                    className="h-11"
                    size="lg"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Logbook;
