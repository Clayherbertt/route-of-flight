import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, Download, Plane, Upload, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AddFlightDialog } from "@/components/forms/AddFlightDialog";
import { CSVImportDialog } from "@/components/forms/CSVImportDialog";

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
  const [showCSVImportDialog, setShowCSVImportDialog] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightEntry | null>(null);
  const [deletingFlight, setDeletingFlight] = useState<FlightEntry | null>(null);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

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
  }, [user]);

  const fetchFlights = async () => {
    try {
      setIsLoadingFlights(true);
      const { data, error } = await supabase
        .from('flight_entries')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setFlights(data || []);
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
  };

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
  
  // Calculate totals from actual flight data with comprehensive debugging
  console.log('DEBUG: Calculating totals for', flights.length, 'flights');
  
  // Debug first few flights to see their data structure
  const firstFiveFlights = flights.slice(0, 5).map(flight => ({
    date: flight.date,
    total_time: flight.total_time,
    parsed: Number(flight.total_time) || 0
  }));
  console.log('DEBUG: First 5 flights total_time values:', firstFiveFlights);
  
  const totalHours = flights.reduce((sum, flight, index) => {
    const originalValue = flight.total_time;
    const parsedValue = Number(flight.total_time) || 0;
    const newSum = sum + parsedValue;
    
    // Debug first few flights
    if (index < 5) {
      console.log(`DEBUG: Flight ${index + 1}: ${originalValue} -> ${parsedValue}, running sum: ${newSum}`);
    }
    
    return newSum;
  }, 0);
  
  console.log('DEBUG: Final total hours calculated:', totalHours);
  
  // Manual verification - let's also check if we can sum the first 5 manually
  const manualSum = flights.slice(0, 5).reduce((sum, flight) => sum + (Number(flight.total_time) || 0), 0);
  console.log('DEBUG: Manual verification - sum of first 5:', manualSum);
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

  // Show loading state
  if (loading || isLoadingFlights) {
    return (
      <div className="min-h-screen bg-background">
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Flight Logbook</h1>
            <p className="text-muted-foreground">Track and manage your flight hours and experience</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCSVImportDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setShowClearAllDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={() => setShowAddFlightDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Flight
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Flight Time</CardDescription>
              <CardTitle className="text-2xl text-primary">{totalHours.toFixed(1)} hrs</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pilot in Command</CardDescription>
              <CardTitle className="text-2xl text-primary">{totalPIC.toFixed(1)} hrs</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Cross Country</CardDescription>
              <CardTitle className="text-2xl text-primary">{totalXC.toFixed(1)} hrs</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Night Time</CardDescription>
              <CardTitle className="text-2xl text-primary">{totalNight.toFixed(1)} hrs</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Instrument</CardDescription>
              <CardTitle className="text-2xl text-primary">{totalInstrument.toFixed(1)} hrs</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Multi-Engine</CardDescription>
              <CardTitle className="text-2xl text-primary">{totalMultiEngine.toFixed(1)} hrs</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>SIC Time</CardDescription>
              <CardTitle className="text-2xl text-primary">{totalSIC.toFixed(1)} hrs</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>PIC Turbine</CardDescription>
              <CardTitle className="text-2xl text-primary">{totalPICTurbine.toFixed(1)} hrs</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search flights</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by aircraft, route, or remarks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Label htmlFor="aircraft-filter">Aircraft Type</Label>
                <Select>
                  <SelectTrigger>
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
              <div className="flex items-end gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flight Log Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Flight Log Entries
            </CardTitle>
            <CardDescription>
              {flights.length} flights recorded
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Aircraft</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Total Time</TableHead>
                    <TableHead>PIC</TableHead>
                    <TableHead>XC</TableHead>
                    <TableHead>Night</TableHead>
                    <TableHead>Instrument</TableHead>
                    <TableHead>Approaches</TableHead>
                    <TableHead>Landings</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flights.length > 0 ? (
                    flights.map((flight) => (
                      <TableRow key={flight.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{flight.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{flight.aircraft_registration}</Badge>
                        </TableCell>
                        <TableCell>{flight.aircraft_type}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {flight.departure_airport} → {flight.arrival_airport}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{flight.total_time}</TableCell>
                        <TableCell>{flight.pic_time}</TableCell>
                        <TableCell>{flight.cross_country_time}</TableCell>
                        <TableCell>{flight.night_time}</TableCell>
                        <TableCell>{flight.instrument_time}</TableCell>
                        <TableCell>{flight.approaches}</TableCell>
                        <TableCell>{flight.landings}</TableCell>
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={13} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Plane className="h-8 w-8 mb-2 opacity-50" />
                          <p className="text-lg font-medium">No flights recorded yet</p>
                          <p className="text-sm">Click "Add Flight" to log your first flight</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <AddFlightDialog
        open={showAddFlightDialog}
        onOpenChange={handleCloseDialog}
        onFlightAdded={fetchFlights}
        editingFlight={editingFlight}
      />

      <CSVImportDialog
        open={showCSVImportDialog}
        onOpenChange={setShowCSVImportDialog}
        onImportComplete={fetchFlights}
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