import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download, Plane } from "lucide-react";
import { useState, useEffect } from "react";
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
}

const Logbook = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [flights, setFlights] = useState<FlightEntry[]>([]);
  const [isLoadingFlights, setIsLoadingFlights] = useState(true);
  const [showAddFlightDialog, setShowAddFlightDialog] = useState(false);

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

  // Calculate totals from actual flight data
  const totalHours = flights.reduce((sum, flight) => sum + Number(flight.total_time), 0);
  const totalPIC = flights.reduce((sum, flight) => sum + Number(flight.pic_time), 0);
  const totalXC = flights.reduce((sum, flight) => sum + Number(flight.cross_country_time), 0);
  const totalNight = flights.reduce((sum, flight) => sum + Number(flight.night_time), 0);

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
          <Button className="w-fit" onClick={() => setShowAddFlightDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Flight
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="h-32 text-center">
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
        onOpenChange={setShowAddFlightDialog}
        onFlightAdded={fetchFlights}
      />
    </div>
  );
};

export default Logbook;