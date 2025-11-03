import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plane, Plus, Search } from "lucide-react";
import { AddAircraftDialog } from "@/components/forms/AddAircraftDialog";
import { Badge } from "@/components/ui/badge";

type Aircraft = {
  id: string;
  aircraft_id: string;
  type_code: string | null;
  year: number | null;
  make: string;
  model: string;
  gear_type: string | null;
  engine_type: string | null;
  equipment_type: string;
  category_class: string;
  complex: boolean | null;
  taa: boolean | null;
  high_performance: boolean | null;
  pressurized: boolean | null;
  created_at: string;
  updated_at: string;
};

export default function AircraftPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchAircraft = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("aircraft_logbook")
        .select("*")
        .eq("user_id", user.id)
        .order("aircraft_id");

      if (error) throw error;
      setAircraft(data || []);
    } catch (error) {
      console.error("Error fetching aircraft:", error);
      toast({
        title: "Error",
        description: "Failed to load aircraft",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAircraft();
  }, [user]);

  const filteredAircraft = aircraft.filter(
    (ac) =>
      ac.aircraft_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ac.type_code && ac.type_code.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleAircraftAdded = () => {
    fetchAircraft();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Aircraft Library</h1>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Aircraft
            </Button>
          </div>
          <p className="text-muted-foreground">
            Manage your aircraft library. Aircraft are automatically added when importing flights or creating flight entries.
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by registration, make, model, or type code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/95 shadow-xl">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading aircraft...</p>
              </div>
            ) : filteredAircraft.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No aircraft found matching your search." : "No aircraft in your library yet."}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add aircraft manually or import flights to automatically add them.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Aircraft ID</TableHead>
                      <TableHead className="min-w-[100px]">Type Code</TableHead>
                      <TableHead className="min-w-[80px]">Year</TableHead>
                      <TableHead className="min-w-[120px]">Make</TableHead>
                      <TableHead className="min-w-[150px]">Model</TableHead>
                      <TableHead className="min-w-[100px]">Gear Type</TableHead>
                      <TableHead className="min-w-[120px]">Engine Type</TableHead>
                      <TableHead className="min-w-[120px]">Equip Type (FAA)</TableHead>
                      <TableHead className="min-w-[120px]">Aircraft Class (FAA)</TableHead>
                      <TableHead className="min-w-[100px]">Complex</TableHead>
                      <TableHead className="min-w-[80px]">TAA</TableHead>
                      <TableHead className="min-w-[120px]">High Performance</TableHead>
                      <TableHead className="min-w-[100px]">Pressurized</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAircraft.map((ac) => (
                      <TableRow key={ac.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {ac.aircraft_id}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {ac.type_code || "-"}
                        </TableCell>
                        <TableCell>{ac.year || "-"}</TableCell>
                        <TableCell>{ac.make}</TableCell>
                        <TableCell>{ac.model}</TableCell>
                        <TableCell>{ac.gear_type || "-"}</TableCell>
                        <TableCell>{ac.engine_type || "-"}</TableCell>
                        <TableCell>{ac.equipment_type}</TableCell>
                        <TableCell>{ac.category_class}</TableCell>
                        <TableCell>
                          {ac.complex ? (
                            <Badge variant="secondary">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ac.taa ? (
                            <Badge variant="secondary">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ac.high_performance ? (
                            <Badge variant="secondary">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ac.pressurized ? (
                            <Badge variant="secondary">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {aircraft.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {filteredAircraft.length} of {aircraft.length} aircraft
          </div>
        )}
      </main>

      <AddAircraftDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAircraftAdded={handleAircraftAdded}
      />
    </div>
  );
}

