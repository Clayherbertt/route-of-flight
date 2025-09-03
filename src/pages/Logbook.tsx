import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download, Plane } from "lucide-react";
import { useState } from "react";

const Logbook = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample flight data
  const flights = [
    {
      id: 1,
      date: "2024-01-15",
      aircraft: "N123AB",
      type: "C172",
      departure: "KORD",
      arrival: "KMDW",
      totalTime: "2.3",
      picTime: "2.3",
      crossCountry: "0.0",
      night: "0.0",
      instrument: "0.0",
      approaches: 0,
      landings: 3,
      remarks: "Pattern work"
    },
    {
      id: 2,
      date: "2024-01-18",
      aircraft: "N456CD",
      type: "PA28",
      departure: "KMDW",
      arrival: "KDPA",
      totalTime: "1.8",
      picTime: "1.8",
      crossCountry: "45.2",
      night: "0.0",
      instrument: "0.5",
      approaches: 1,
      landings: 2,
      remarks: "Cross country flight"
    },
    {
      id: 3,
      date: "2024-01-22",
      aircraft: "N789EF",
      type: "C152",
      departure: "KDPA",
      arrival: "KORD",
      totalTime: "1.5",
      picTime: "0.0",
      crossCountry: "0.0",
      night: "1.5",
      instrument: "0.0",
      approaches: 0,
      landings: 2,
      remarks: "Night currency training"
    }
  ];

  const totalHours = flights.reduce((sum, flight) => sum + parseFloat(flight.totalTime), 0);
  const totalPIC = flights.reduce((sum, flight) => sum + parseFloat(flight.picTime), 0);
  const totalXC = flights.reduce((sum, flight) => sum + parseFloat(flight.crossCountry), 0);
  const totalNight = flights.reduce((sum, flight) => sum + parseFloat(flight.night), 0);

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
          <Button className="w-fit">
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
                  {flights.map((flight) => (
                    <TableRow key={flight.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{flight.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{flight.aircraft}</Badge>
                      </TableCell>
                      <TableCell>{flight.type}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {flight.departure} → {flight.arrival}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{flight.totalTime}</TableCell>
                      <TableCell>{flight.picTime}</TableCell>
                      <TableCell>{flight.crossCountry}</TableCell>
                      <TableCell>{flight.night}</TableCell>
                      <TableCell>{flight.instrument}</TableCell>
                      <TableCell>{flight.approaches}</TableCell>
                      <TableCell>{flight.landings}</TableCell>
                      <TableCell className="max-w-xs truncate">{flight.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Logbook;