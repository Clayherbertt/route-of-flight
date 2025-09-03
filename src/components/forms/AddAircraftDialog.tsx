import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const addAircraftSchema = z.object({
  equipment_type: z.enum(["Aircraft", "BATD", "AATD", "FTD"]),
  aircraft_id: z.string().min(1, "Aircraft ID is required"),
  type_code: z.string().optional(),
  category_class: z.enum(["ASEL", "AMEL", "ASES", "AMES", "RH", "RG", "Glider", "LA", "LB", "PLIFT", "PL", "PS", "WL", "WS"]),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  gear_type: z.enum(["AM", "FC", "FT", "FL", "RC", "RT", "Skids", "Skis"]).optional(),
  engine_type: z.enum(["Diesel", "Electric", "Non-Powered", "Piston", "Radial", "TurboFan", "Turbojet", "TurboProp", "Turboshaft"]).optional(),
  complex: z.boolean().default(false),
  taa: z.boolean().default(false),
  high_performance: z.boolean().default(false),
  pressurized: z.boolean().default(false),
});

type AddAircraftForm = z.infer<typeof addAircraftSchema>;

interface AddAircraftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAircraftAdded: (aircraftId: string) => void;
}

const equipmentTypes = [
  { value: "Aircraft", label: "Aircraft" },
  { value: "BATD", label: "Basic Aircraft Training Device (BATD)" },
  { value: "AATD", label: "Advanced Aircraft Training Device (AATD)" },
  { value: "FTD", label: "Flight Training Device (FTD)" },
];

const categoryClasses = [
  { value: "ASEL", label: "Airplane Single Engine Land (ASEL)" },
  { value: "AMEL", label: "Airplane Multi-Engine Land (AMEL)" },
  { value: "ASES", label: "Airplane Single Engine Sea (ASES)" },
  { value: "AMES", label: "Airplane Multi-Engine Sea (AMES)" },
  { value: "RH", label: "Rotocraft Helicopter (RH)" },
  { value: "RG", label: "Rotocraft Gyroplane (RG)" },
  { value: "Glider", label: "Glider" },
  { value: "LA", label: "Lighter than Air (LA)" },
  { value: "LB", label: "Lighter than Balloon (LB)" },
  { value: "PLIFT", label: "Powered Lift (PLIFT)" },
  { value: "PL", label: "Powered Parachute Land (PL)" },
  { value: "PS", label: "Powered Parachute Sea (PS)" },
  { value: "WL", label: "Weight Shift Control Land (WL)" },
  { value: "WS", label: "Weight Shift Control Sea (WS)" },
];

const gearTypes = [
  { value: "AM", label: "Amphibian (AM)" },
  { value: "FC", label: "Fixed Tailwheel (FC)" },
  { value: "FT", label: "Fixed Tricycle (FT)" },
  { value: "FL", label: "Floats (FL)" },
  { value: "RC", label: "Retractible Tailwheel (RC)" },
  { value: "RT", label: "Retractible Tricycle (RT)" },
  { value: "Skids", label: "Skids" },
  { value: "Skis", label: "Skis" },
];

const engineTypes = [
  { value: "Diesel", label: "Diesel" },
  { value: "Electric", label: "Electric" },
  { value: "Non-Powered", label: "Non-Powered" },
  { value: "Piston", label: "Piston" },
  { value: "Radial", label: "Radial" },
  { value: "TurboFan", label: "TurboFan" },
  { value: "Turbojet", label: "Turbojet" },
  { value: "TurboProp", label: "TurboProp" },
  { value: "Turboshaft", label: "Turboshaft" },
];

export const AddAircraftDialog = ({ open, onOpenChange, onAircraftAdded }: AddAircraftDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddAircraftForm>({
    resolver: zodResolver(addAircraftSchema),
    defaultValues: {
      complex: false,
      taa: false,
      high_performance: false,
      pressurized: false,
    },
  });

  const onSubmit = async (values: AddAircraftForm) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('aircraft_logbook')
        .insert({
          user_id: user.id,
          equipment_type: values.equipment_type,
          aircraft_id: values.aircraft_id.toUpperCase(),
          type_code: values.type_code || null,
          category_class: values.category_class,
          year: values.year || null,
          make: values.make,
          model: values.model,
          gear_type: values.gear_type || null,
          engine_type: values.engine_type || null,
          complex: values.complex,
          taa: values.taa,
          high_performance: values.high_performance,
          pressurized: values.pressurized,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Aircraft added successfully!",
      });

      form.reset();
      onOpenChange(false);
      onAircraftAdded(values.aircraft_id.toUpperCase());
    } catch (error) {
      console.error('Error adding aircraft:', error);
      toast({
        title: "Error",
        description: "Failed to add aircraft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Aircraft</DialogTitle>
          <DialogDescription>
            Add a new aircraft to your personal aircraft database
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="equipment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select equipment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aircraft_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aircraft ID</FormLabel>
                    <FormControl>
                      <Input placeholder="N123AB" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type Code</FormLabel>
                    <FormControl>
                      <Input placeholder="C172" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category/Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category/class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryClasses.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="2024"
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
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="Cessna" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="172" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gear_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gear Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gear type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gearTypes.map((gear) => (
                          <SelectItem key={gear.value} value={gear.value}>
                            {gear.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engine_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engine Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select engine type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {engineTypes.map((engine) => (
                          <SelectItem key={engine.value} value={engine.value}>
                            {engine.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Boolean fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="complex"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input 
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Complex</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taa"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input 
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>TAA</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="high_performance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input 
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>High Performance</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pressurized"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input 
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Pressurized</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Aircraft"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};