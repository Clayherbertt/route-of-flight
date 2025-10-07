import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, Download, Plane, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AddFlightDialog } from "@/components/forms/AddFlightDialog";

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
  const [showAddFlightDialog, setShowAddFlightDialog] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightEntry | null>(null);
  const [deletingFlight, setDeletingFlight] = useState<FlightEntry | null>(null);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  const fetchFlights = useCallback(async () => {
    try {
      setIsLoadingFlights(true);
      const pageSize = 1000;
      let from = 0;
      let collected: FlightEntry[] = [];

      while (true) {
        const { data, error } = await supabase
          .from('flight_entries')
          .select('*')
          .order('date', { ascending: false })
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

      setFlights(collected);
    } catch (error) {
      console.error('Error fetching flights:', error);
      toast({
        title: "Error",
        description: "Failed to load flight entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFlights(false);
    }
  }, [toast]);

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
    setEditingFlight(flight);
    setShowAddFlightDialog(true);
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

      // Refresh the flights list
      fetchFlights();
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
      const { error } = await supabase
        .from('flight_entries')
        .delete()
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      toast({
        title: "All flights cleared",
        description: "All flight entries have been successfully deleted.",
      });

      // Refresh the flights list
      fetchFlights();
    } catch (error) {
      console.error('Error clearing flights:', error);
      toast({
        title: "Error",
        description: "Failed to clear flight entries. Please try again.",
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
  const totalInstrument = flights.reduce((sum, flight) => {
    const actual = Number(flight.actual_instrument) || 0;
    const simulated = Number(flight.simulated_instrument) || 0;
    return sum + actual + simulated;
  }, 0);
  const totalSIC = flights.reduce((sum, flight) => {
    const time = Number(flight.sic_time) || 0;
    return sum + time;
  }, 0);
  
  // Multi-Engine time (assuming aircraft with "twin", "multi", numbers in type, or specific models)
  const totalMultiEngine = flights.reduce((sum, flight) => {
    const aircraftType = flight.aircraft_type.toLowerCase();
    const isMultiEngine = aircraftType.includes('twin') || 
                         aircraftType.includes('multi') || 
                         aircraftType.includes('baron') ||
                         aircraftType.includes('seneca') ||
                         aircraftType.includes('aztec') ||
                         aircraftType.includes('duchess') ||
                         aircraftType.includes('310') ||
                         aircraftType.includes('414') ||
                         aircraftType.includes('421') ||
                         aircraftType.includes('340') ||
                         /\d{3}/.test(aircraftType); // Contains 3-digit numbers (often jets/turboprops)
    const time = Number(flight.total_time) || 0;
    return isMultiEngine ? sum + time : sum;
  }, 0);
  
  // PIC Turbine time (assuming turbine aircraft based on type)
  const totalPICTurbine = flights.reduce((sum, flight) => {
    const aircraftType = flight.aircraft_type.toLowerCase();
    const isTurbine = aircraftType.includes('jet') ||
                     aircraftType.includes('turbine') ||
                     aircraftType.includes('king air') ||
                     aircraftType.includes('citation') ||
                     aircraftType.includes('learjet') ||
                     aircraftType.includes('falcon') ||
                     aircraftType.includes('challenger') ||
                     aircraftType.includes('gulfstream') ||
                     aircraftType.includes('phenom') ||
                     aircraftType.includes('embraer') ||
                     /\d{3}/.test(aircraftType); // Contains 3-digit numbers (often jets)
    const time = Number(flight.pic_time) || 0;
    return isTurbine ? sum + time : sum;
  }, 0);

  const summaryMetrics = [
    { label: "Total Flight Time", value: `${totalHours.toFixed(1)} hrs` },
    { label: "Pilot in Command", value: `${totalPIC.toFixed(1)} hrs` },
    { label: "Cross Country", value: `${totalXC.toFixed(1)} hrs` },
    { label: "Night Time", value: `${totalNight.toFixed(1)} hrs` },
    { label: "Instrument", value: `${totalInstrument.toFixed(1)} hrs` },
    { label: "Multi-Engine", value: `${totalMultiEngine.toFixed(1)} hrs` },
    { label: "SIC Time", value: `${totalSIC.toFixed(1)} hrs` },
    { label: "PIC Turbine", value: `${totalPICTurbine.toFixed(1)} hrs` },
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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentHours = flights.reduce((sum, flight) => {
    const parsedDate = flight.date ? new Date(flight.date) : null;
    if (parsedDate && !Number.isNaN(parsedDate.getTime()) && parsedDate >= thirtyDaysAgo) {
      return sum + (Number(flight.total_time) || 0);
    }
    return sum;
  }, 0);

  const lastFlight = flights[0];

  const totalApproaches = flights.reduce((sum, flight) => sum + (Number(flight.approaches) || 0), 0);
  const totalNightFullStops = flights.reduce((sum, flight) => sum + (Number(flight.night_landings_full_stop) || 0), 0);
  const totalDualGiven = flights.reduce((sum, flight) => sum + (Number(flight.dual_given) || 0), 0);

  let tableRows: React.ReactNode;

  if (flights.length === 0) {
    tableRows = (
      <TableRow>
        <TableCell colSpan={38} className="h-32 text-center">
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
      <TableRow key={flight.id} className="hover:bg-muted/50">
        <TableCell className="font-medium">{flight.date}</TableCell>
        <TableCell>
          <Badge variant="outline">{flight.aircraft_registration}</Badge>
        </TableCell>
        <TableCell>{flight.aircraft_type}</TableCell>
        <TableCell>{flight.departure_airport}</TableCell>
        <TableCell>{flight.arrival_airport}</TableCell>
        <TableCell>{flight.route || '-'}</TableCell>
        <TableCell className="font-medium">{flight.total_time}</TableCell>
        <TableCell>{flight.pic_time}</TableCell>
        <TableCell>{flight.sic_time ?? 0}</TableCell>
        <TableCell>{flight.solo_time ?? 0}</TableCell>
        <TableCell>{flight.night_time}</TableCell>
        <TableCell>{flight.cross_country_time}</TableCell>
        <TableCell>{flight.actual_instrument ?? 0}</TableCell>
        <TableCell>{flight.simulated_instrument ?? 0}</TableCell>
        <TableCell>{flight.holds ?? 0}</TableCell>
        <TableCell>{flight.approaches || '-'}</TableCell>
        <TableCell>{flight.day_takeoffs ?? 0}</TableCell>
        <TableCell>{flight.day_landings ?? 0}</TableCell>
        <TableCell>{flight.day_landings_full_stop ?? 0}</TableCell>
        <TableCell>{flight.night_takeoffs ?? 0}</TableCell>
        <TableCell>{flight.night_landings ?? 0}</TableCell>
        <TableCell>{flight.night_landings_full_stop ?? 0}</TableCell>
        <TableCell>{flight.dual_given ?? 0}</TableCell>
        <TableCell>{flight.dual_received ?? 0}</TableCell>
        <TableCell>{flight.simulated_flight ?? 0}</TableCell>
        <TableCell>{flight.ground_training ?? 0}</TableCell>
        <TableCell>{flight.time_out || flight.start_time || '-'}</TableCell>
        <TableCell>{flight.time_off || '-'}</TableCell>
        <TableCell>{flight.time_on || '-'}</TableCell>
        <TableCell>{flight.time_in || flight.end_time || '-'}</TableCell>
        <TableCell>{flight.on_duty || '-'}</TableCell>
        <TableCell>{flight.off_duty || '-'}</TableCell>
        <TableCell>{flight.hobbs_start ?? '-'}</TableCell>
        <TableCell>{flight.hobbs_end ?? '-'}</TableCell>
        <TableCell>{flight.tach_start ?? '-'}</TableCell>
        <TableCell>{flight.tach_end ?? '-'}</TableCell>
        <TableCell className="max-w-xs truncate">{flight.remarks || '-'}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => handleEditFlight(flight)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Flight
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeletingFlight(flight)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Flight
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
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

          <div className="relative container mx-auto px-6 py-12 lg:py-20">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-aviation-sky backdrop-blur">
                  Logbook Hub
                </span>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Flight Logbook</h1>
                  <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                    Track and manage your flight hours, currency, and experience with a cockpit-ready dashboard designed for working pilots.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button size="lg" className="rounded-full px-6" onClick={() => setShowAddFlightDialog(true)}>
                    <Plus className="mr-2 h-5 w-5" />
                    Add Flight
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-destructive/70 text-destructive hover:bg-destructive/10"
                    onClick={() => setShowClearAllDialog(true)}
                  >
                    <Trash2 className="mr-2 h-5 w-5" />
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="w-full max-w-sm rounded-3xl border border-white/50 bg-white/30 p-6 shadow-2xl shadow-aviation-navy/20 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Snapshot</p>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Flights logged</span>
                    <span className="text-lg font-semibold text-foreground">{flights.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Hours past 30 days</span>
                    <span className="text-lg font-semibold text-foreground">{recentHours.toFixed(1)}</span>
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-card/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Most recent flight</p>
                    {lastFlight ? (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-semibold text-foreground">{lastFlight.departure_airport} → {lastFlight.arrival_airport}</p>
                        <p className="text-xs text-muted-foreground">
                          {lastFlight.date} · {lastFlight.aircraft_type} · {lastFlight.total_time} hrs
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">Log your first flight to see insights here.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-3xl border border-white/40 bg-white/40 p-5 shadow-lg backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{metric.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative -mt-10">
          <div className="container mx-auto px-6 pt-12 space-y-8">
            <div className="rounded-3xl border border-border/60 bg-card/90 shadow-xl shadow-aviation-navy/15 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-6 py-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">Search &amp; Filter</p>
                  <p className="text-xs text-muted-foreground">Fine-tune your logbook view or prepare an export in seconds</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr),220px] lg:items-end">
                  <div>
                    <Label htmlFor="search">Search flights</Label>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by aircraft, route, or remarks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 rounded-2xl border-border/50 bg-background/70 pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="aircraft-filter">Aircraft type</Label>
                    <Select>
                      <SelectTrigger className="mt-2 h-12 rounded-2xl border-border/50 bg-background/70">
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
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Quick insight</p>
                    <p className="mt-2 text-sm text-muted-foreground">{recentHours.toFixed(1)} hrs logged in the last 30 days</p>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Total approaches</p>
                    <p className="mt-2 text-sm text-muted-foreground">{totalApproaches}</p>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Night landings</p>
                    <p className="mt-2 text-sm text-muted-foreground">{totalNightFullStops}</p>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Dual given</p>
                    <p className="mt-2 text-sm text-muted-foreground">{totalDualGiven} hrs</p>
                  </div>
                </div>
              </div>
            </div>

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
                      <TableHead>Date</TableHead>
                      <TableHead>Aircraft ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Total Time</TableHead>
                      <TableHead>PIC</TableHead>
                      <TableHead>SIC</TableHead>
                      <TableHead>Solo</TableHead>
                      <TableHead>Night</TableHead>
                      <TableHead>Cross Country</TableHead>
                      <TableHead>Actual Instrument</TableHead>
                      <TableHead>Sim Instrument</TableHead>
                      <TableHead>Holds</TableHead>
                      <TableHead>Approaches</TableHead>
                      <TableHead>Day TO</TableHead>
                      <TableHead>Day LDG</TableHead>
                      <TableHead>Day Full Stop</TableHead>
                      <TableHead>Night TO</TableHead>
                      <TableHead>Night LDG</TableHead>
                      <TableHead>Night Full Stop</TableHead>
                      <TableHead>Dual Given</TableHead>
                      <TableHead>Dual Received</TableHead>
                      <TableHead>Sim Flight</TableHead>
                      <TableHead>Ground Training</TableHead>
                      <TableHead>Time Out</TableHead>
                      <TableHead>Time Off</TableHead>
                      <TableHead>Time On</TableHead>
                      <TableHead>Time In</TableHead>
                      <TableHead>On Duty</TableHead>
                      <TableHead>Off Duty</TableHead>
                      <TableHead>Hobbs Start</TableHead>
                      <TableHead>Hobbs End</TableHead>
                      <TableHead>Tach Start</TableHead>
                      <TableHead>Tach End</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
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
        onFlightAdded={fetchFlights}
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
              Are you sure you want to delete ALL flight entries in your logbook? This action cannot be undone.
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <strong>Total flights to be deleted:</strong> {flights.length}<br />
                <strong>Total flight time:</strong> {totalHours.toFixed(1)} hours
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

    </div>
  );
};

export default Logbook;
