import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CalendarIcon, Plus, Plane } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AddAircraftDialog } from "./AddAircraftDialog";

const addFlightSchema = z.object({
  date: z.date({
    required_error: "Flight date is required.",
  }),
  aircraft_registration: z.string().min(1, "Aircraft registration is required"),
  aircraft_type: z.string().min(1, "Aircraft type is required"),
  departure_airport: z.string().min(3, "Departure airport code is required (3+ characters)"),
  arrival_airport: z.string().min(3, "Arrival airport code is required (3+ characters)"),
  route: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  total_time: z.number().min(0).optional().transform(val => val ?? 0),
  pic_time: z.number().min(0).optional().transform(val => val ?? 0),
  sic_time: z.number().min(0).optional().transform(val => val ?? 0),
  solo_time: z.number().min(0).optional().transform(val => val ?? 0),
  night_time: z.number().min(0).optional().transform(val => val ?? 0),
  cross_country_time: z.number().min(0).optional().transform(val => val ?? 0),
  day_takeoffs: z.number().int().min(0).optional().transform(val => val ?? 0),
  day_landings: z.number().int().min(0).optional().transform(val => val ?? 0),
  night_takeoffs: z.number().int().min(0).optional().transform(val => val ?? 0),
  night_landings: z.number().int().min(0).optional().transform(val => val ?? 0),
  actual_instrument: z.number().min(0).optional().transform(val => val ?? 0),
  simulated_instrument: z.number().min(0).optional().transform(val => val ?? 0),
  holds: z.number().int().min(0).optional().transform(val => val ?? 0),
  approaches: z.string().optional(),
  dual_given: z.number().min(0).optional().transform(val => val ?? 0),
  dual_received: z.number().min(0).optional().transform(val => val ?? 0),
  simulated_flight: z.number().min(0).optional().transform(val => val ?? 0),
  ground_training: z.number().min(0).optional().transform(val => val ?? 0),
  remarks: z.string().optional(),
});

type AddFlightForm = z.infer<typeof addFlightSchema>;

interface AddFlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlightAdded: () => void;
}

interface Aircraft {
  aircraft_id: string;
  type_code: string | null;
  make: string;
  model: string;
  category_class: string;
}

export const AddFlightDialog = ({ open, onOpenChange, onFlightAdded }: AddFlightDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [showAircraftDialog, setShowAircraftDialog] = useState(false);
  const [aircraftSearchOpen, setAircraftSearchOpen] = useState(false);

  const form = useForm<AddFlightForm>({
    resolver: zodResolver(addFlightSchema),
    defaultValues: {
      total_time: undefined,
      pic_time: undefined,
      sic_time: undefined,
      solo_time: undefined,
      night_time: undefined,
      cross_country_time: undefined,
      day_takeoffs: undefined,
      day_landings: undefined,
      night_takeoffs: undefined,
      night_landings: undefined,
      actual_instrument: undefined,
      simulated_instrument: undefined,
      holds: undefined,
      dual_given: undefined,
      dual_received: undefined,
      simulated_flight: undefined,
      ground_training: undefined,
    },
  });

  // Fetch user's aircraft on component mount and dialog open
  useEffect(() => {
    if (open && user) {
      fetchAircraft();
    }
  }, [open, user]);

  const fetchAircraft = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('aircraft_logbook')
        .select('aircraft_id, type_code, make, model, category_class')
        .eq('user_id', user.id)
        .order('aircraft_id');

      if (error) throw error;
      setAircraft(data || []);
    } catch (error) {
      console.error('Error fetching aircraft:', error);
    }
  };

  const handleAircraftAdded = (aircraftId: string) => {
    fetchAircraft();
    form.setValue('aircraft_registration', aircraftId);
    // Auto-fill aircraft type if available
    const newAircraft = aircraft.find(a => a.aircraft_id === aircraftId);
    if (newAircraft && newAircraft.type_code) {
      form.setValue('aircraft_type', newAircraft.type_code);
    }
  };

  const handleAircraftSelection = (aircraftId: string) => {
    form.setValue('aircraft_registration', aircraftId);
    const selectedAircraft = aircraft.find(a => a.aircraft_id === aircraftId);
    if (selectedAircraft && selectedAircraft.type_code) {
      form.setValue('aircraft_type', selectedAircraft.type_code);
    }
    setAircraftSearchOpen(false);
  };

  const onSubmit = async (values: AddFlightForm) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('flight_entries')
        .insert({
          user_id: user.id,
          date: format(values.date, 'yyyy-MM-dd'),
          aircraft_registration: values.aircraft_registration,
          aircraft_type: values.aircraft_type,
          departure_airport: values.departure_airport.toUpperCase(),
          arrival_airport: values.arrival_airport.toUpperCase(),
          route: values.route || null,
          start_time: values.start_time || null,
          end_time: values.end_time || null,
          total_time: values.total_time,
          pic_time: values.pic_time,
          sic_time: values.sic_time,
          solo_time: values.solo_time,
          night_time: values.night_time,
          cross_country_time: values.cross_country_time,
          day_takeoffs: values.day_takeoffs,
          day_landings: values.day_landings,
          night_takeoffs: values.night_takeoffs,
          night_landings: values.night_landings,
          actual_instrument: values.actual_instrument,
          simulated_instrument: values.simulated_instrument,
          holds: values.holds,
          approaches: values.approaches || null,
          dual_given: values.dual_given,
          dual_received: values.dual_received,
          simulated_flight: values.simulated_flight,
          ground_training: values.ground_training,
          instrument_time: values.actual_instrument + values.simulated_instrument,
          landings: values.day_landings + values.night_landings,
          remarks: values.remarks || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flight entry added successfully!",
      });

      form.reset();
      onOpenChange(false);
      onFlightAdded();
    } catch (error) {
      console.error('Error adding flight:', error);
      toast({
        title: "Error",
        description: "Failed to add flight entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Flight Entry</DialogTitle>
          <DialogDescription>
            Record your flight details in your logbook
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Flight Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Flight Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aircraft_registration"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Aircraft Registration</FormLabel>
                    <div className="flex gap-2">
                      <Popover open={aircraftSearchOpen} onOpenChange={setAircraftSearchOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "flex-1 justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value || "Select aircraft..."}
                              <Plane className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Search aircraft..."
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Auto-fill type if exact match found
                                const matchedAircraft = aircraft.find(a => a.aircraft_id === value.toUpperCase());
                                if (matchedAircraft && matchedAircraft.type_code) {
                                  form.setValue('aircraft_type', matchedAircraft.type_code);
                                }
                              }}
                            />
                            <CommandList>
                              <CommandEmpty>No aircraft found.</CommandEmpty>
                              <CommandGroup>
                                {aircraft.map((ac) => (
                                  <CommandItem
                                    key={ac.aircraft_id}
                                    value={ac.aircraft_id}
                                    onSelect={() => handleAircraftSelection(ac.aircraft_id)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{ac.aircraft_id}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {ac.make} {ac.model} • {ac.category_class}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowAircraftDialog(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aircraft_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aircraft Type</FormLabel>
                    <FormControl>
                      <Input placeholder="C172" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departure_airport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From (Airport Code)</FormLabel>
                    <FormControl>
                      <Input placeholder="KJFK" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="arrival_airport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To (Airport Code)</FormLabel>
                    <FormControl>
                      <Input placeholder="KLGA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="route"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route</FormLabel>
                    <FormControl>
                      <Input placeholder="Direct, via waypoints..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Time Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Flight Times</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="total_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pic_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIC Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sic_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SIC Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="solo_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solo Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="night_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Night Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cross_country_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cross Country</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Takeoffs and Landings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Takeoffs & Landings</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="day_takeoffs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day Takeoffs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="day_landings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day Landings</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="night_takeoffs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Night Takeoffs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="night_landings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Night Landings</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Instrument and Training */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Instrument & Training</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="actual_instrument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Instrument</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="simulated_instrument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Simulated Instrument</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="holds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Holds</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approaches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approaches</FormLabel>
                      <FormControl>
                        <Input placeholder="ILS, VOR, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dual_given"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dual Given</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dual_received"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dual Received</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="simulated_flight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Simulated Flight</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ground_training"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ground Training</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about the flight..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Flight"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <AddAircraftDialog
        open={showAircraftDialog}
        onOpenChange={setShowAircraftDialog}
        onAircraftAdded={handleAircraftAdded}
      />
    </Dialog>
  );
};