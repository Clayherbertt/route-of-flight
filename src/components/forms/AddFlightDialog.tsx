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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AddAircraftDialog } from "./AddAircraftDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { hasFeature, FeatureKey } from "@/lib/featureGates";
import { useNavigate } from "react-router-dom";

// Helper function to convert time formats to HHMM
const convertTimeToHHMM = (time: string | null | undefined): string => {
  if (!time) return "";
  
  // If already in HHMM format (4 digits), return as is
  if (/^\d{4}$/.test(time)) {
    return time;
  }
  
  // If in HH:MM:SS or HH:MM format, extract HH and MM
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    const hours = match[1].padStart(2, '0');
    const minutes = match[2];
    return hours + minutes;
  }
  
  // If in any other format, try to extract digits
  const digits = time.replace(/\D/g, '');
  if (digits.length >= 4) {
    return digits.slice(0, 4);
  }
  
  return "";
};

// Helper component for 4-digit Zulu time input (HHMM format)
const ZuluTimeInput = ({ 
  value, 
  onChange, 
  placeholder = "____"
}: { 
  value: string | undefined; 
  onChange: (value: string) => void; 
  placeholder?: string;
}) => {
  const [localValue, setLocalValue] = useState<string>(
    value || ""
  );
  const [isFocused, setIsFocused] = useState(false);

  // Sync when value changes externally AND we're not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value || "");
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 4 digits
    if (input.length > 4) {
      input = input.slice(0, 4);
    }
    
    setLocalValue(input);
    
    // Validate and format
    if (input.length === 4) {
      const hours = parseInt(input.slice(0, 2), 10);
      const minutes = parseInt(input.slice(2, 4), 10);
      
      // Validate hours (00-23) and minutes (00-59)
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        onChange(input); // Store as HHMM format (e.g., "1230")
      } else {
        // Invalid time, but still update local value for user feedback
        onChange(input);
      }
    } else if (input.length > 0) {
      // Partial input, still update
      onChange(input);
    } else {
      onChange("");
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format on blur if we have a valid 4-digit time
    if (localValue.length === 4) {
      const hours = parseInt(localValue.slice(0, 2), 10);
      const minutes = parseInt(localValue.slice(2, 4), 10);
      
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        // Value is valid, keep it
        onChange(localValue);
      } else {
        // Invalid, clear it
        setLocalValue("");
        onChange("");
      }
    }
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      maxLength={4}
      className="font-mono text-center"
    />
  );
};

// Helper component for editable number inputs that allows free editing
const EditableNumberInput = ({ 
  value, 
  onChange, 
  placeholder, 
  isInteger = false 
}: { 
  value: number | undefined; 
  onChange: (value: number | undefined) => void; 
  placeholder: string;
  isInteger?: boolean;
}) => {
  const [localValue, setLocalValue] = useState<string>(
    value != null ? value.toString() : ""
  );
  const [isFocused, setIsFocused] = useState(false);

  // Only sync when value changes externally AND we're not focused (to avoid conflicts during editing)
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value != null ? value.toString() : "");
    }
  }, [value, isFocused]);

  return (
    <Input
      type="text"
      inputMode={isInteger ? "numeric" : "decimal"}
      placeholder={placeholder}
      value={localValue}
      onFocus={() => {
        setIsFocused(true);
      }}
      onChange={(e) => {
        const newVal = e.target.value;
        // Always update local state immediately - no restrictions
        setLocalValue(newVal);
        // Don't update form field during typing - only on blur
        // This allows complete freedom to edit
      }}
      onBlur={() => {
        setIsFocused(false);
        // Finalize on blur - validate and update form field
        const trimmed = localValue.trim();
        if (trimmed === '' || trimmed === '.' || trimmed === '-') {
          onChange(undefined);
          setLocalValue('');
        } else {
          const num = isInteger ? parseInt(trimmed, 10) : parseFloat(trimmed);
          if (isNaN(num) || !isFinite(num)) {
            // Invalid input - reset to empty
            onChange(undefined);
            setLocalValue('');
          } else {
            // Valid number - update form field and normalize display
            onChange(num);
            setLocalValue(num.toString());
          }
        }
      }}
    />
  );
};

const addFlightSchema = z.object({
  date: z.date({
    required_error: "Flight date is required.",
  }),
  aircraft_registration: z.string().min(1, "Aircraft registration is required"),
  aircraft_type: z.string().min(1, "Aircraft type is required"),
  departure_airport: z.string().min(3, "Departure airport code is required (3+ characters)"),
  arrival_airport: z.string().min(3, "Arrival airport code is required (3+ characters)"),
  route: z.string().optional(),
  type_of_operation: z.enum(["FAR 91", "FAR 91k", "FAR 135", "FAR 121"]).optional(),
  time_out: z.string().optional(),
  time_off: z.string().optional(),
  time_on: z.string().optional(),
  time_in: z.string().optional(),
  on_duty: z.string().optional(),
  off_duty: z.string().optional(),
  hobbs_start: z.number().min(0).optional().transform(val => val ?? 0),
  hobbs_end: z.number().min(0).optional().transform(val => val ?? 0),
  tach_start: z.number().min(0).optional().transform(val => val ?? 0),
  tach_end: z.number().min(0).optional().transform(val => val ?? 0),
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
  day_landings_full_stop: z.number().int().min(0).optional().transform(val => val ?? 0),
  night_takeoffs: z.number().int().min(0).optional().transform(val => val ?? 0),
  night_landings: z.number().int().min(0).optional().transform(val => val ?? 0),
  night_landings_full_stop: z.number().int().min(0).optional().transform(val => val ?? 0),
  actual_instrument: z.number().min(0).optional().transform(val => val ?? 0),
  simulated_instrument: z.number().min(0).optional().transform(val => val ?? 0),
  holds: z.number().int().min(0).optional().transform(val => val ?? 0),
  approaches: z.number().int().min(0).optional().transform(val => val ?? 0),
  selected_approaches: z.array(z.string()).optional(),
  approach_circle_to_land: z.record(z.boolean()).optional(),
  dual_given: z.number().min(0).optional().transform(val => val ?? 0),
  dual_received: z.number().min(0).optional().transform(val => val ?? 0),
  simulated_flight: z.number().min(0).optional().transform(val => val ?? 0),
  ground_training: z.number().min(0).optional().transform(val => val ?? 0),
  remarks: z.string().optional(),
});

type AddFlightForm = z.infer<typeof addFlightSchema>;

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
  selected_approaches?: string[] | null;
  approach_circle_to_land?: Record<string, boolean> | null;
  landings: number;
  remarks: string | null;
  route?: string | null;
  type_of_operation?: string | null;
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

interface AddFlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlightAdded: () => void;
  editingFlight?: FlightEntry | null;
}

interface Aircraft {
  aircraft_id: string;
  type_code: string | null;
  make: string;
  model: string;
  category_class: string;
}

export const AddFlightDialog = ({ open, onOpenChange, onFlightAdded, editingFlight }: AddFlightDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const { isAdmin } = useIsAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [showAircraftDialog, setShowAircraftDialog] = useState(false);
  const [aircraftSearchOpen, setAircraftSearchOpen] = useState(false);
  const [supportsFullStopLandings, setSupportsFullStopLandings] = useState<boolean>(true);
  const [availableApproaches, setAvailableApproaches] = useState<Array<{
    id: string;
    approach_name: string;
    approach_type: string;
    runway: string | null;
  }>>([]);

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
      day_landings_full_stop: undefined,
      night_takeoffs: undefined,
      night_landings: undefined,
      night_landings_full_stop: undefined,
      actual_instrument: undefined,
      simulated_instrument: undefined,
      holds: undefined,
      dual_given: undefined,
      dual_received: undefined,
      simulated_flight: undefined,
      ground_training: undefined,
      hobbs_start: undefined,
      hobbs_end: undefined,
      tach_start: undefined,
      tach_end: undefined,
    },
  });

  // Fetch user's aircraft on component mount and dialog open
  useEffect(() => {
    if (open && user) {
      fetchAircraft();
      checkFullStopSupport();
    }
  }, [open, user]);

  // Fetch available approaches when arrival airport changes
  const arrivalAirport = form.watch('arrival_airport');
  useEffect(() => {
    const fetchApproaches = async () => {
      if (arrivalAirport && arrivalAirport.length >= 3) {
        try {
          const { data, error } = await supabase
            .from('instrument_approaches')
            .select('id, approach_name, approach_type, runway')
            .eq('airport_code', arrivalAirport.toUpperCase())
            .eq('active', true)
            .order('approach_name');
          
          if (!error && data) {
            setAvailableApproaches(data);
          } else {
            setAvailableApproaches([]);
          }
        } catch (error) {
          console.error('Error fetching approaches:', error);
          setAvailableApproaches([]);
        }
      } else {
        setAvailableApproaches([]);
      }
    };
    
    if (open) {
      fetchApproaches();
    }
  }, [arrivalAirport, open, form]);

  const checkFullStopSupport = async () => {
    try {
      const { error } = await supabase
        .from("flight_entries")
        .select("id, day_landings_full_stop, night_landings_full_stop")
        .limit(1);

      if (error) {
        if (
          typeof error.message === "string" &&
          error.message.toLowerCase().includes("day_landings_full_stop")
        ) {
          setSupportsFullStopLandings(false);
          console.warn(
            "[AddFlightDialog] flight_entries table missing full stop landing columns; values will be ignored.",
          );
        } else {
          console.error("Failed to inspect flight_entries schema", error);
        }
      } else {
        setSupportsFullStopLandings(true);
      }
    } catch (error) {
      console.error("Failed to inspect flight_entries schema", error);
    }
  };

  // Populate form when editing a flight
  useEffect(() => {
    if (editingFlight && open) {
      form.reset({
        date: new Date(editingFlight.date),
        aircraft_registration: editingFlight.aircraft_registration,
        aircraft_type: editingFlight.aircraft_type,
        departure_airport: editingFlight.departure_airport,
        arrival_airport: editingFlight.arrival_airport,
        route: editingFlight.route || "",
        type_of_operation: editingFlight.type_of_operation || undefined,
        time_out: convertTimeToHHMM(editingFlight.time_out || editingFlight.start_time),
        time_off: convertTimeToHHMM(editingFlight.time_off),
        time_on: convertTimeToHHMM(editingFlight.time_on),
        time_in: convertTimeToHHMM(editingFlight.time_in || editingFlight.end_time),
        on_duty: convertTimeToHHMM(editingFlight.on_duty),
        off_duty: convertTimeToHHMM(editingFlight.off_duty),
        hobbs_start: editingFlight.hobbs_start ?? 0,
        hobbs_end: editingFlight.hobbs_end ?? 0,
        tach_start: editingFlight.tach_start ?? 0,
        tach_end: editingFlight.tach_end ?? 0,
        start_time: editingFlight.start_time || "",
        end_time: editingFlight.end_time || "",
        total_time: editingFlight.total_time,
        pic_time: editingFlight.pic_time,
        sic_time: editingFlight.sic_time || 0,
        solo_time: editingFlight.solo_time || 0,
        night_time: editingFlight.night_time,
        cross_country_time: editingFlight.cross_country_time,
        day_takeoffs: editingFlight.day_takeoffs || 0,
        day_landings: editingFlight.day_landings || 0,
        day_landings_full_stop: editingFlight.day_landings_full_stop || 0,
        night_takeoffs: editingFlight.night_takeoffs || 0,
        night_landings: editingFlight.night_landings || 0,
        night_landings_full_stop: editingFlight.night_landings_full_stop || 0,
        actual_instrument: editingFlight.actual_instrument || 0,
        simulated_instrument: editingFlight.simulated_instrument || 0,
        holds: editingFlight.holds || 0,
        approaches: editingFlight.approaches ? Number(editingFlight.approaches) : 0,
        selected_approaches: Array.isArray(editingFlight.selected_approach) 
          ? editingFlight.selected_approach 
          : (editingFlight.selected_approach && typeof editingFlight.selected_approach === 'string' 
            ? [editingFlight.selected_approach] 
            : undefined),
        approach_circle_to_land: editingFlight.approach_circle_to_land || undefined,
        dual_given: editingFlight.dual_given || 0,
        dual_received: editingFlight.dual_received || 0,
        simulated_flight: editingFlight.simulated_flight || 0,
        ground_training: editingFlight.ground_training || 0,
        remarks: editingFlight.remarks || "",
      });
    } else if (!editingFlight && open) {
      form.reset({
        time_out: undefined,
        time_off: undefined,
        time_on: undefined,
        time_in: undefined,
        on_duty: undefined,
        off_duty: undefined,
        hobbs_start: undefined,
        hobbs_end: undefined,
        tach_start: undefined,
        tach_end: undefined,
        start_time: undefined,
        end_time: undefined,
        total_time: undefined,
        pic_time: undefined,
        sic_time: undefined,
        solo_time: undefined,
        night_time: undefined,
        cross_country_time: undefined,
        day_takeoffs: undefined,
        day_landings: undefined,
        day_landings_full_stop: undefined,
        night_takeoffs: undefined,
        night_landings: undefined,
        night_landings_full_stop: undefined,
        actual_instrument: undefined,
        simulated_instrument: undefined,
        holds: undefined,
        selected_approaches: undefined,
        dual_given: undefined,
        dual_received: undefined,
        simulated_flight: undefined,
        ground_training: undefined,
      });
    }
  }, [editingFlight, open, form]);

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
    console.log('onSubmit called with values:', values);
    
    if (!user) {
      console.error('No user found, cannot submit');
      return;
    }

    console.log('Starting flight submission...');
    setIsSubmitting(true);
    try {
      const flightData = {
        user_id: user.id,
        date: format(values.date, 'yyyy-MM-dd'),
        aircraft_registration: values.aircraft_registration,
        aircraft_type: values.aircraft_type,
        departure_airport: values.departure_airport.toUpperCase(),
        arrival_airport: values.arrival_airport.toUpperCase(),
        route: values.route || null,
        type_of_operation: values.type_of_operation || null,
        time_out: values.time_out || null,
        time_off: values.time_off || null,
        time_on: values.time_on || null,
        time_in: values.time_in || null,
        on_duty: values.on_duty || null,
        off_duty: values.off_duty || null,
        hobbs_start: values.hobbs_start,
        hobbs_end: values.hobbs_end,
        tach_start: values.tach_start,
        tach_end: values.tach_end,
        start_time: values.time_out || values.start_time || null,
        end_time: values.time_in || values.end_time || null,
        total_time: values.total_time,
        pic_time: values.pic_time,
        sic_time: values.sic_time,
        solo_time: values.solo_time,
        night_time: values.night_time,
        cross_country_time: values.cross_country_time,
        day_takeoffs: values.day_takeoffs,
        day_landings: values.day_landings,
        day_landings_full_stop: values.day_landings_full_stop,
        night_takeoffs: values.night_takeoffs,
        night_landings: values.night_landings,
        night_landings_full_stop: values.night_landings_full_stop,
        actual_instrument: values.actual_instrument,
        simulated_instrument: values.simulated_instrument,
        holds: values.holds,
        approaches: String(values.selected_approaches && values.selected_approaches.length > 0 ? values.selected_approaches.length : (values.approaches ?? 0)),
        selected_approach: values.selected_approaches && values.selected_approaches.length > 0 ? values.selected_approaches : null,
        approach_circle_to_land: values.approach_circle_to_land || null,
        dual_given: values.dual_given,
        dual_received: values.dual_received,
        simulated_flight: values.simulated_flight,
        ground_training: values.ground_training,
        instrument_time: values.actual_instrument + values.simulated_instrument,
        landings: values.day_landings + values.night_landings,
        remarks: values.remarks || null,
      };

      if (!supportsFullStopLandings) {
        delete (flightData as Partial<typeof flightData>).day_landings_full_stop;
        delete (flightData as Partial<typeof flightData>).night_landings_full_stop;

        if ((values.day_landings_full_stop ?? 0) > 0 || (values.night_landings_full_stop ?? 0) > 0) {
          flightData.remarks = [
            values.remarks?.trim(),
            `Full-stop landings — Day: ${values.day_landings_full_stop ?? 0}, Night: ${
              values.night_landings_full_stop ?? 0
            }`,
          ]
            .filter(Boolean)
            .join("\n");
        }
      }

      // Helper function to remove time tracking columns if they don't exist
      const removeTimeTrackingColumns = (data: typeof flightData) => {
        const timeTrackingColumns = [
          'time_out', 'time_off', 'time_on', 'time_in',
          'on_duty', 'off_duty',
          'hobbs_start', 'hobbs_end', 'tach_start', 'tach_end'
        ];
        const cleaned = { ...data };
        timeTrackingColumns.forEach(col => {
          delete (cleaned as Record<string, unknown>)[col];
        });
        return cleaned;
      };

      let error;
      if (editingFlight) {
        // Update existing flight
        let result = await supabase
          .from('flight_entries')
          .update(flightData)
          .eq('id', editingFlight.id);

        // Retry without columns that might not exist
        if (result.error && (
          result.error.message?.includes("day_landings_full_stop") ||
          result.error.message?.includes("hobbs_end") ||
          result.error.message?.includes("hobbs_start") ||
          result.error.message?.includes("tach_start") ||
          result.error.message?.includes("tach_end") ||
          result.error.message?.includes("time_out") ||
          result.error.message?.includes("time_off") ||
          result.error.message?.includes("time_on") ||
          result.error.message?.includes("time_in") ||
          result.error.message?.includes("on_duty") ||
          result.error.message?.includes("off_duty") ||
          result.error.message?.includes("approach_circle_to_land")
        )) {
          const fallbackData = { ...flightData };
          delete (fallbackData as Record<string, unknown>).day_landings_full_stop;
          delete (fallbackData as Record<string, unknown>).night_landings_full_stop;
          delete (fallbackData as Record<string, unknown>).approach_circle_to_land;
          const cleanedData = removeTimeTrackingColumns(fallbackData);
          result = await supabase
            .from('flight_entries')
            .update(cleanedData)
            .eq('id', editingFlight.id);
          if (!result.error) {
            console.warn("[AddFlight] Retried update without missing columns due to schema mismatch.");
          }
        }

        error = result.error;
      } else {
        // Check logbook entry limit for Basic users (admins have unlimited access)
        const hasUnlimitedEntries = hasFeature(subscription, FeatureKey.LOGBOOK_UNLIMITED_ENTRIES, isAdmin);
        
        if (!hasUnlimitedEntries) {
          // Count existing entries for Basic users
          const { count, error: countError } = await supabase
            .from('flight_entries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          if (countError) {
            console.error('Error counting flights:', countError);
          } else if (count !== null && count >= 3) {
            toast({
              title: "Entry Limit Reached",
              description: "Basic plan allows up to 3 logbook entries. Upgrade to Pro or Pro Plus for unlimited entries.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            onOpenChange(false);
            navigate('/subscription');
            return;
          }
        }

        // Insert new flight
        let result = await supabase
          .from('flight_entries')
          .insert(flightData);

        // Retry without columns that might not exist
        if (result.error && (
          result.error.message?.includes("day_landings_full_stop") ||
          result.error.message?.includes("hobbs_end") ||
          result.error.message?.includes("hobbs_start") ||
          result.error.message?.includes("tach_start") ||
          result.error.message?.includes("tach_end") ||
          result.error.message?.includes("time_out") ||
          result.error.message?.includes("time_off") ||
          result.error.message?.includes("time_on") ||
          result.error.message?.includes("time_in") ||
          result.error.message?.includes("on_duty") ||
          result.error.message?.includes("off_duty") ||
          result.error.message?.includes("approach_circle_to_land")
        )) {
          const fallbackData = { ...flightData };
          delete (fallbackData as Record<string, unknown>).day_landings_full_stop;
          delete (fallbackData as Record<string, unknown>).night_landings_full_stop;
          delete (fallbackData as Record<string, unknown>).approach_circle_to_land;
          const cleanedData = removeTimeTrackingColumns(fallbackData);
          result = await supabase
            .from('flight_entries')
            .insert(cleanedData);
          if (!result.error) {
            console.warn("[AddFlight] Retried insert without missing columns due to schema mismatch.");
          }
        }

        error = result.error;
      }

      if (error) throw error;

      // Create/update aircraft record after successful flight entry
      try {
        const aircraftRegistration = values.aircraft_registration.toUpperCase();
        const { data: existingAircraft } = await supabase
          .from("aircraft_logbook")
          .select("id")
          .eq("user_id", user.id)
          .eq("aircraft_id", aircraftRegistration)
          .single();

        if (!existingAircraft) {
          // Create new aircraft record with minimal data (can be updated later)
          await supabase.from("aircraft_logbook").insert({
            user_id: user.id,
            equipment_type: "Aircraft",
            aircraft_id: aircraftRegistration,
            type_code: null,
            category_class: "ASEL", // Default, can be updated manually
            year: null,
            make: values.aircraft_type.split(" ")[0] || "Unknown", // Try to extract make from type
            model: values.aircraft_type || "Unknown",
            gear_type: null,
            engine_type: null,
            complex: false,
            taa: false,
            high_performance: false,
            pressurized: false,
          });
        }
      } catch (aircraftError) {
        // Log but don't fail the flight entry if aircraft creation fails
        console.warn(`[AddFlight] Failed to create/update aircraft ${values.aircraft_registration}:`, aircraftError);
      }

      toast({
        title: "Success",
        description: editingFlight ? "Flight entry updated successfully!" : "Flight entry added successfully!",
      });

      form.reset();
      onOpenChange(false);
      onFlightAdded();
    } catch (error) {
      console.error('Error saving flight:', error);
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: string }).message)
          : undefined;
      toast({
        title: "Error",
        description:
          message ??
          (editingFlight
            ? "Failed to update flight entry. Please try again."
            : "Failed to add flight entry. Please try again."),
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
          <DialogTitle>{editingFlight ? "Edit Flight Entry" : "Add Flight Entry"}</DialogTitle>
          <DialogDescription>
            {editingFlight ? "Update your flight details" : "Record your flight details in your logbook"}
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
                    <FormLabel>Date</FormLabel>
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
                    <FormLabel>Aircraft ID</FormLabel>
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
                  <input type="hidden" {...field} />
                )}
              />

              <FormField
                control={form.control}
                name="departure_airport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="KJFK" 
                        {...field}
                        onChange={(e) => {
                          const upperValue = e.target.value.toUpperCase();
                          field.onChange(upperValue);
                        }}
                        value={field.value || ''}
                      />
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
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="KLGA" 
                        {...field}
                        onChange={(e) => {
                          const upperValue = e.target.value.toUpperCase();
                          field.onChange(upperValue);
                        }}
                        value={field.value || ''}
                      />
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

              <FormField
                control={form.control}
                name="type_of_operation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Operation</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type of operation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FAR 91">FAR 91</SelectItem>
                        <SelectItem value="FAR 91k">FAR 91k</SelectItem>
                        <SelectItem value="FAR 135">FAR 135</SelectItem>
                        <SelectItem value="FAR 121">FAR 121</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Time Tracking */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Time Tracking</h3>
                <p className="text-sm text-muted-foreground">All times in Zulu</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="time_out"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Out</FormLabel>
                      <FormControl>
                        <ZuluTimeInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="____"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time_off"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Off</FormLabel>
                      <FormControl>
                        <ZuluTimeInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="____"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time_on"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time On</FormLabel>
                      <FormControl>
                        <ZuluTimeInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="____"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time_in"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time In</FormLabel>
                      <FormControl>
                        <ZuluTimeInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="____"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="on_duty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>On Duty</FormLabel>
                      <FormControl>
                        <ZuluTimeInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="____"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="off_duty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Off Duty</FormLabel>
                      <FormControl>
                        <ZuluTimeInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="____"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="hobbs_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hobbs Start</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hobbs_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hobbs End</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tach_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tach Start</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tach_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tach End</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Flight Totals */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Flight Totals</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="total_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Time</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
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
                      <FormLabel>PIC</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
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
                      <FormLabel>SIC</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
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
                      <FormLabel>Solo</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
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
                      <FormLabel>Night</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
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
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="day_takeoffs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day Takeoffs</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                          isInteger={true}
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
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                          isInteger={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="day_landings_full_stop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day Landings (Full Stop)</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                          isInteger={true}
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
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                          isInteger={true}
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
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                          isInteger={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="night_landings_full_stop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Night Landings (Full Stop)</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                          isInteger={true}
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
              <h3 className="text-lg font-semibold">Instrument</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="actual_instrument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Instrument</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
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
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
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
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0"
                          isInteger={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              {/* Approach Selection */}
              <FormField
                control={form.control}
                name="selected_approaches"
                render={({ field }) => {
                  const selectedIds = field.value || [];
                  const selectedCount = selectedIds.length;
                  
                  return (
                    <FormItem>
                      <FormLabel>Approaches Flown</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !selectedIds.length && "text-muted-foreground"
                              )}
                              disabled={!form.watch('arrival_airport') || form.watch('arrival_airport')?.length < 3 || availableApproaches.length === 0}
                            >
                              {!form.watch('arrival_airport') || form.watch('arrival_airport')?.length < 3
                                ? "Select arrival airport first"
                                : availableApproaches.length === 0
                                ? "No approaches found for this airport"
                                : selectedCount === 0
                                ? "Select approaches"
                                : selectedCount === 1
                                ? "1 approach selected"
                                : `${selectedCount} approaches selected`}
                              <Plane className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search approaches..." />
                            <CommandList>
                              <CommandEmpty>No approaches found.</CommandEmpty>
                              <CommandGroup>
                                {availableApproaches.map((approach) => {
                                  const isSelected = selectedIds.includes(approach.id);
                                  return (
                                    <CommandItem
                                      key={approach.id}
                                      onSelect={() => {
                                        const newSelected = isSelected
                                          ? selectedIds.filter((id) => id !== approach.id)
                                          : [...selectedIds, approach.id];
                                        field.onChange(newSelected);
                                      }}
                                    >
                                      <div className="flex items-center space-x-2 flex-1">
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={(checked) => {
                                            const newSelected = checked
                                              ? [...selectedIds, approach.id]
                                              : selectedIds.filter((id) => id !== approach.id);
                                            field.onChange(newSelected);
                                          }}
                                        />
                                        <div className="flex-1">
                                          <span className="font-medium">
                                            {approach.approach_name}
                                          </span>
                                          {approach.runway && (
                                            <span className="text-muted-foreground ml-2">
                                              ({approach.runway})
                                            </span>
                                          )}
                                          <span className="text-xs text-muted-foreground ml-2">
                                            {approach.approach_type}
                                          </span>
                                        </div>
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                      {selectedCount > 0 && (
                        <div className="space-y-2 mt-2">
                          {selectedIds.map((id) => {
                            const approach = availableApproaches.find((a) => a.id === id);
                            if (!approach) return null;
                            
                            return (
                              <div
                                key={id}
                                className="flex items-center justify-between p-2 border rounded-md bg-muted/30"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-sm font-medium">
                                    {approach.approach_name}
                                    {approach.runway && ` (${approach.runway})`}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {approach.approach_type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`circle-to-land-${id}`} className="text-xs text-muted-foreground cursor-pointer">
                                    Circle to Land
                                  </Label>
                                  <FormField
                                    control={form.control}
                                    name="approach_circle_to_land"
                                    render={({ field: circleField }) => (
                                      <Switch
                                        id={`circle-to-land-${id}`}
                                        checked={circleField.value?.[id] || false}
                                        onCheckedChange={(checked) => {
                                          circleField.onChange({
                                            ...circleField.value,
                                            [id]: checked
                                          });
                                        }}
                                      />
                                    )}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Remove from selected approaches
                                      field.onChange(selectedIds.filter((selectedId) => selectedId !== id));
                                      // Remove from circle-to-land mapping
                                      const circleToLand = form.getValues('approach_circle_to_land') || {};
                                      const { [id]: removed, ...rest } = circleToLand;
                                      form.setValue('approach_circle_to_land', rest);
                                    }}
                                    className="ml-2 text-muted-foreground hover:text-destructive text-sm"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {availableApproaches.length === 0 && form.watch('arrival_airport') && form.watch('arrival_airport')?.length >= 3 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          No approaches in database for {form.watch('arrival_airport')?.toUpperCase()}.
                        </p>
                      )}
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Type of Instruction */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Type of Instruction</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="dual_given"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dual Given</FormLabel>
                      <FormControl>
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
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
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
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
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
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
                        <EditableNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.0"
                          isInteger={false}
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
              <Button 
                type="submit" 
                disabled={isSubmitting}
                onClick={(e) => {
                  // Debug: Log form state when button is clicked
                  console.log('Add Flight button clicked');
                  console.log('Form errors:', form.formState.errors);
                  console.log('Form values:', form.getValues());
                  console.log('Is form valid:', form.formState.isValid);
                  console.log('Is submitting:', isSubmitting);
                  
                  // Don't prevent default - let the form submit normally
                  // The form's onSubmit handler will handle validation
                }}
              >
                {isSubmitting ? (editingFlight ? "Updating..." : "Adding...") : (editingFlight ? "Update Flight" : "Add Flight")}
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
