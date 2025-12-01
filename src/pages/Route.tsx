import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRouteSteps } from "@/hooks/useRouteSteps";
import { RouteWizard } from "@/components/RouteWizard";
import { supabase } from "@/integrations/supabase/client";
import { CircularProgress } from "@/components/CircularProgress";
import { Check, Target, Compass, ChevronDown, ChevronRight, Plane, BookOpen, Sparkles, TrendingUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import React from "react";

interface StudentRoute {
  id: string;
  stepId: string;
  title: string;
  category: string;
  icon: string;
  completed: boolean;
  order: number;
  taskProgress: Record<string, boolean>;
}

interface RoutePhase {
  id: string;
  title: string;
  description: string;
  required: boolean;
  allowedCategories: string[];
  completed: boolean;
  unlocked: boolean;
  minSteps?: number;
  maxSteps?: number;
}

const ROUTE_PHASES: RoutePhase[] = [
  {
    id: "initial-tasks",
    title: "Initial Tasks",
    description: "Complete mandatory initial requirements",
    required: true,
    allowedCategories: ["Initial Tasks"],
    completed: false,
    unlocked: true,
    minSteps: 1
  },
  {
    id: "medical",
    title: "Medical Certification",
    description: "Obtain required medical certification",
    required: true,
    allowedCategories: ["Medical"],
    completed: false,
    unlocked: false,
    minSteps: 1,
    maxSteps: 1
  },
  {
    id: "initial-training",
    title: "Initial Training",
    description: "Private, Instrument, and Commercial certificates",
    required: true,
    allowedCategories: ["Primary Training", "Advanced Training"],
    completed: false,
    unlocked: false,
    minSteps: 3
  },
  {
    id: "career-path",
    title: "Career Path Choice",
    description: "Choose Flight Instructor or other route",
    required: false,
    allowedCategories: ["Flight Instructor", "Career Development"],
    completed: false,
    unlocked: false,
    minSteps: 1
  },
  {
    id: "cadet-program",
    title: "Cadet/Airline Program",
    description: "Select airline cadet or pathway program",
    required: false,
    allowedCategories: ["Airline Programs"],
    completed: false,
    unlocked: false,
    maxSteps: 1
  },
  {
    id: "regional",
    title: "Regional Airline",
    description: "Choose your regional airline",
    required: false,
    allowedCategories: ["Regional Airlines"],
    completed: false,
    unlocked: false,
    maxSteps: 1
  },
  {
    id: "major",
    title: "Major Airline",
    description: "Select your target major airline",
    required: false,
    allowedCategories: ["Major Airlines"],
    completed: false,
    unlocked: false,
    maxSteps: 1
  }
];

export default function RouteBuilder() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { routeSteps, loading, updateStepDetailChecked } = useRouteSteps();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);
  
  const [studentRoute, setStudentRoute] = useState<StudentRoute[]>([]);
  const [phases, setPhases] = useState<RoutePhase[]>(ROUTE_PHASES);
  const [activePhase, setActivePhase] = useState("initial-tasks");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  const [hasCompletedWizard, setHasCompletedWizard] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [hasCheckedForExistingRoute, setHasCheckedForExistingRoute] = useState(false);
  const [isManuallyUpdating, setIsManuallyUpdating] = useState(false); // Flag to prevent refresh during manual updates
  const hasCheckedPrivatePilotTaskRef = React.useRef(false); // Track if we've already auto-checked the Private Pilot Certificate task
  const manuallyUncheckedPrivatePilotRef = React.useRef(false); // Track if user has manually unchecked the Private Pilot Certificate task
  const [lastPracticeTestUpdate, setLastPracticeTestUpdate] = useState<number>(0); // Track when practice test task was manually updated
  const [flights, setFlights] = useState<any[]>([]); // Store flights for pie chart calculations
  const [aircraftMap, setAircraftMap] = useState<Map<string, any>>(new Map()); // Store aircraft data for complex/turbine/TAA calculations

  // Calculate task completion from flight log data
  const calculateTaskProgressFromFlights = async (step: any, flights: any[], aircraftMap?: Map<string, any>): Promise<Record<string, boolean>> => {
    const taskProgress: Record<string, boolean> = {};
    
    // Skip auto-checking for Medical Certification, Initial Training Preparation, and Cadet Programs steps
    // All tasks in these steps must be manually checked by the customer
    if (step.title === 'Medical Certification' || step.title === 'Initial Training Preparation' || step.category === 'Cadet Programs') {
      return taskProgress; // Return empty progress - all tasks must be manually checked
    }
    
    // Calculate totals from all flights
    const totals = flights.reduce((acc, flight) => {
      acc.totalTime += parseFloat(flight.total_time?.toString() || '0') || 0;
      acc.picTime += parseFloat(flight.pic_time?.toString() || '0') || 0;
      acc.sicTime += parseFloat(flight.sic_time?.toString() || '0') || 0;
      // Ensure solo_time is properly parsed - handle null, undefined, and string values
      const soloTimeValue = flight.solo_time;
      const soloTime = soloTimeValue != null ? parseFloat(soloTimeValue.toString()) : 0;
      if (!isNaN(soloTime)) {
        acc.soloTime += soloTime;
      }
      acc.nightTime += parseFloat(flight.night_time?.toString() || '0') || 0;
      acc.crossCountryTime += parseFloat(flight.cross_country_time?.toString() || '0') || 0;
      acc.actualInstrument += parseFloat(flight.actual_instrument?.toString() || '0') || 0;
      acc.simulatedInstrument += parseFloat(flight.simulated_instrument?.toString() || '0') || 0;
      acc.dualReceived += parseFloat(flight.dual_received?.toString() || '0') || 0;
      acc.dayTakeoffs += parseInt(flight.day_takeoffs?.toString() || '0') || 0;
      acc.dayLandings += parseInt(flight.day_landings?.toString() || '0') || 0;
      acc.nightTakeoffs += parseInt(flight.night_takeoffs?.toString() || '0') || 0;
      acc.nightLandings += parseInt(flight.night_landings?.toString() || '0') || 0;
      acc.holds += parseInt(flight.holds?.toString() || '0') || 0;
      acc.approaches += parseInt(flight.approaches?.toString() || '0') || 0;
      
      // Calculate cross-country PIC time: minimum of cross-country and PIC time for each flight
      // This represents time that was both cross-country AND as PIC
      const crossCountry = parseFloat(flight.cross_country_time?.toString() || '0') || 0;
      const pic = parseFloat(flight.pic_time?.toString() || '0') || 0;
      acc.crossCountryPICTime += Math.min(crossCountry, pic);
      
      // Calculate complex/turbine/TAA time and powered aircraft/airplane time - check aircraft features
      if (aircraftMap && flight.aircraft_registration) {
        const aircraftId = flight.aircraft_registration.toUpperCase();
        const aircraft = aircraftMap.get(aircraftId);
        if (aircraft) {
          const flightTime = parseFloat(flight.total_time?.toString() || '0') || 0;
          
          const isComplex = aircraft.complex === true;
          const isTAA = aircraft.taa === true;
          const isTurbine = aircraft.engine_type && 
            ['TurboFan', 'Turbojet', 'TurboProp', 'Turboshaft'].includes(aircraft.engine_type);
          
          // If aircraft has complex, TAA, or turbine features, add total time
          if (isComplex || isTAA || isTurbine) {
            acc.complexTurbineTAATime += flightTime;
          }
          
          // Calculate powered aircraft time (any aircraft with engine_type != 'Non-Powered' and not null)
          const isPowered = aircraft.engine_type && aircraft.engine_type !== 'Non-Powered';
          if (isPowered) {
            acc.poweredAircraftTime += flightTime;
            
            // Check if it's an airplane (category_class starts with 'A': ASEL, AMEL, ASES, AMES)
            const isAirplane = aircraft.category_class && aircraft.category_class.startsWith('A');
            if (isAirplane) {
              acc.airplaneTime += flightTime;
            }
          }
        }
      }
      
      return acc;
    }, {
      totalTime: 0,
      picTime: 0,
      sicTime: 0,
      soloTime: 0,
      nightTime: 0,
      crossCountryTime: 0,
      crossCountryPICTime: 0,
      actualInstrument: 0,
      simulatedInstrument: 0,
      dualReceived: 0,
      dayTakeoffs: 0,
      dayLandings: 0,
      nightTakeoffs: 0,
      nightLandings: 0,
      holds: 0,
      approaches: 0,
      complexTurbineTAATime: 0,
      poweredAircraftTime: 0,
      airplaneTime: 0
    });

    // Check each task against flight log totals
    step.details.forEach((detail: any) => {
      if (!detail.id) return;
      
      const title = detail.title.toLowerCase();
      
      // Skip tasks that should only be manually checked (cannot be auto-checked from logbook)
      // Specifically: "practice test within 60 days" tasks require manual verification
      if (title.includes('practice test') && title.includes('60 days')) {
        // Don't auto-check this task - it must be manually checked by the customer
        return;
      }
      
      // Skip "250 NM cross country with instructor, simulated instrument, IFR with 3 different approaches"
      // This task has too many specific requirements that can't be matched from flight log
      if (title.includes('250 nm') && title.includes('cross country') && 
          (title.includes('instructor') || title.includes('simulated instrument')) &&
          (title.includes('ifr') || title.includes('3 different') || title.includes('approaches'))) {
        // Don't auto-check this task - it must be manually checked by the customer
        return;
      }
      
      // Skip "night cross country over 100 NM" - distance requirement not tracked in flight log
      if (title.includes('night') && title.includes('cross country') && title.includes('100 nm')) {
        // Don't auto-check this task - it must be manually checked by the customer
        return;
      }
      
      // Skip "150 NM cross country, 3 points, 1 straight line distance leg of 50 NM" - specific route requirements not tracked
      if (title.includes('150 nm') && title.includes('cross country') && 
          (title.includes('3 points') || title.includes('50 nm') || title.includes('straight line'))) {
        // Don't auto-check this task - it must be manually checked by the customer
        return;
      }
      
      // Skip "take offs and landings at a controlled airport" - controlled airport status not tracked
      if ((title.includes('take off') || title.includes('takeoff') || title.includes('landing')) && 
          title.includes('controlled airport')) {
        // Don't auto-check this task - it must be manually checked by the customer
        return;
      }
      
      // Skip "day cross country (100 NM)" - distance requirement not tracked
      if (title.includes('day') && title.includes('cross country') && title.includes('100 nm')) {
        // Don't auto-check this task - it must be manually checked by the customer
        return;
      }
      
      // Skip "night cross country (100 NM)" - distance requirement not tracked
      if (title.includes('night') && title.includes('cross country') && title.includes('100 nm') && !title.includes('over')) {
        // Don't auto-check this task - it must be manually checked by the customer
        return;
      }
      
      // Skip "SOLO or with a instructor exercising PIC duties" - complex OR condition not trackable
      if (title.includes('solo') && (title.includes('instructor') || title.includes('pic duties') || title.includes('exercising'))) {
        // Don't auto-check this task - it must be manually checked by the customer
        return;
      }
      
      // Skip "300 NM cross country, 3 landing points, 1 leg straight line of 250 NM" - specific route requirements not tracked
      if (title.includes('300 nm') && title.includes('cross country') && 
          (title.includes('3 landing') || title.includes('landing points') || title.includes('250 nm'))) {
        // Don't auto-check this task - it must be manually checked by the customer
        return;
      }
      
      // Skip "night VFR with 10 take offs and landings (Controlled field)" - controlled field status not tracked
      if (title.includes('night') && title.includes('vfr') && 
          (title.includes('take off') || title.includes('landing')) && 
          title.includes('controlled')) {
        // Don't auto-check this task - it must be manually checked by the customer
        return;
      }
      
      // Skip "training for the practical test within 2 calendar months" - time window requirement not trackable
      if (title.includes('practical test') && (title.includes('2 calendar months') || title.includes('2 months') || title.includes('60 days'))) {
        // Don't auto-check this task - it must be manually checked by the customer
        return;
      }
      
      // Skip "flight training for the certificate within 2 calendar months of the check ride" - time window requirement not trackable
      if ((title.includes('flight training') || title.includes('training')) && 
          title.includes('certificate') && 
          (title.includes('2 calendar months') || title.includes('2 months')) && 
          title.includes('check ride')) {
        // Don't auto-check this task - it must be manually checked by the customer
        return;
      }
      
      let isComplete = false;

      // Match task titles to flight log data
      // Order matters - check more specific patterns first
      if ((title.includes('cross country') || title.includes('cross-country') || title.includes('xc')) && 
          (title.includes('pic') || title.includes('pilot in command') || title.includes('as pic'))) {
        // Match "cross country flight time as PIC" - requires both cross-country AND PIC
        const requiredHours = detail.flightHours || extractHours(title);
        isComplete = totals.crossCountryPICTime >= (requiredHours || 0);
      } else if (title.includes('solo')) {
        // Solo time - check before other time types to ensure correct matching
        const requiredHours = detail.flightHours || extractHours(title);
        isComplete = totals.soloTime >= (requiredHours || 0);
      } else if (title.includes('cross country') || title.includes('cross-country') || title.includes('xc')) {
        // General cross-country time (not specifically PIC)
        const requiredHours = detail.flightHours || extractHours(title);
        isComplete = totals.crossCountryTime >= (requiredHours || 0);
      } else if (title.includes('pic') || title.includes('pilot in command') || title.includes('pilot-in-command')) {
        // PIC time (not cross-country) - matches "PIC", "pilot in command", or "pilot-in-command"
        const requiredHours = detail.flightHours || extractHours(title);
        isComplete = totals.picTime >= (requiredHours || 0);
        
        // Debug logging for PIC time tasks
        if (title.includes('pilot') && title.includes('command')) {
          console.log('✈️ PIC time task check:', {
            title: detail.title,
            requiredHours,
            picTime: totals.picTime,
            isComplete
          });
        }
      } else if (title.includes('night')) {
        const requiredHours = detail.flightHours || extractHours(title);
        isComplete = totals.nightTime >= (requiredHours || 0);
      } else if (title.includes('instrument') && (title.includes('actual') || title.includes('simulated')) && 
                 (title.includes('and/or') || title.includes('and') || title.includes('or'))) {
        // "75 Hours Instrument (Actual and/or Simulated)" - combine actual and simulated instrument time
        const requiredHours = detail.flightHours || extractHours(title);
        const combinedInstrumentTime = totals.actualInstrument + totals.simulatedInstrument;
        isComplete = combinedInstrumentTime >= (requiredHours || 0);
        
        // Debug logging
        console.log('✈️ Combined instrument time task check:', {
          title: detail.title,
          requiredHours,
          actualInstrument: totals.actualInstrument,
          simulatedInstrument: totals.simulatedInstrument,
          combinedInstrumentTime,
          isComplete
        });
      } else if (title.includes('simulated instrument')) {
        // Check simulated instrument before general instrument
        const requiredHours = detail.flightHours || extractHours(title);
        isComplete = totals.simulatedInstrument >= (requiredHours || 0);
      } else if (title.includes('instrument') && !title.includes('simulated')) {
        const requiredHours = detail.flightHours || extractHours(title);
        isComplete = totals.actualInstrument >= (requiredHours || 0);
      } else if ((title.includes('flight training') && title.includes('instructor')) || 
                 (title.includes('training') && title.includes('instructor') && !title.includes('ground'))) {
        // Match "20 hours of flight training with an instructor" or similar patterns
        const requiredHours = detail.flightHours || extractHours(title);
        isComplete = totals.dualReceived >= (requiredHours || 0);
      } else if (title.includes('dual') && (title.includes('received') || title.includes('training'))) {
        const requiredHours = detail.flightHours || extractHours(title);
        isComplete = totals.dualReceived >= (requiredHours || 0);
      } else if ((title.includes('complex') && (title.includes('turbine') || title.includes('taa'))) ||
                 (title.includes('turbine') && (title.includes('complex') || title.includes('taa'))) ||
                 (title.includes('taa') && (title.includes('complex') || title.includes('turbine')))) {
        // Complex, turbine, or TAA time - requires aircraft data
        const requiredHours = detail.flightHours || extractHours(title);
        isComplete = totals.complexTurbineTAATime >= (requiredHours || 0);
      } else if (title.includes('powered aircraft') && (title.includes('airplane') || title.includes('airplanes'))) {
        // "100 hours in powered aircraft, of which 50 hours must be in airplanes"
        // Need both: total powered aircraft >= 100 AND airplane time >= 50
        const totalRequired = extractHours(title) || 100; // Extract first number (100)
        const airplaneRequired = extractHours(title.split('of which')[1] || '') || 50; // Extract from "of which" part (50)
        isComplete = totals.poweredAircraftTime >= totalRequired && totals.airplaneTime >= airplaneRequired;
        
        // Debug logging
        console.log('✈️ Powered aircraft task check:', {
          title: detail.title,
          totalRequired,
          airplaneRequired,
          poweredAircraftTime: totals.poweredAircraftTime,
          airplaneTime: totals.airplaneTime,
          isComplete
        });
      } else if ((title.includes('airplane') || title.includes('airplanes')) && !title.includes('powered aircraft')) {
        // "50 hours in airplanes" - just airplane time requirement (not powered aircraft)
        const requiredHours = detail.flightHours || extractHours(title);
        isComplete = totals.airplaneTime >= (requiredHours || 0);
        
        // Debug logging
        console.log('✈️ Airplane time task check:', {
          title: detail.title,
          requiredHours,
          airplaneTime: totals.airplaneTime,
          isComplete
        });
      } else if (title.includes('total time') || title.includes('hours total')) {
        // Total time - check last as it's the most general
        const requiredHours = detail.flightHours || extractHours(title);
        isComplete = totals.totalTime >= (requiredHours || 0);
      } else if (title.includes('takeoff') || title.includes('take-off')) {
        if (title.includes('night')) {
          const required = extractNumber(title);
          isComplete = totals.nightTakeoffs >= (required || 0);
        } else {
          const required = extractNumber(title);
          isComplete = totals.dayTakeoffs >= (required || 0);
        }
      } else if (title.includes('landing')) {
        if (title.includes('night')) {
          const required = extractNumber(title);
          isComplete = totals.nightLandings >= (required || 0);
        } else {
          const required = extractNumber(title);
          isComplete = totals.dayLandings >= (required || 0);
        }
      } else if (title.includes('hold')) {
        const required = extractNumber(title);
        isComplete = totals.holds >= (required || 0);
      } else if (title.includes('approach')) {
        const required = extractNumber(title);
        isComplete = totals.approaches >= (required || 0);
      }

      taskProgress[detail.id] = isComplete;
    });

    return taskProgress;
  };

  // Helper function to extract hours from task title
  const extractHours = (title: string): number | null => {
    const match = title.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)/i);
    return match ? parseFloat(match[1]) : null;
  };

  // Helper function to extract numbers from task title
  const extractNumber = (title: string): number | null => {
    const match = title.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  // Calculate current hours for a specific task based on flight log data
  const calculateCurrentHours = (detail: any, flights: any[], aircraftMap?: Map<string, any>): { current: number; required: number } => {
    if (!flights || flights.length === 0) {
      return { current: 0, required: 0 };
    }

    // Calculate totals from all flights (same logic as calculateTaskProgressFromFlights)
    const totals = flights.reduce((acc, flight) => {
      acc.totalTime += parseFloat(flight.total_time?.toString() || '0') || 0;
      acc.picTime += parseFloat(flight.pic_time?.toString() || '0') || 0;
      acc.sicTime += parseFloat(flight.sic_time?.toString() || '0') || 0;
      // Ensure solo_time is properly parsed - handle null, undefined, and string values
      const soloTimeValue = flight.solo_time;
      const soloTime = soloTimeValue != null ? parseFloat(soloTimeValue.toString()) : 0;
      if (isNaN(soloTime)) {
        console.warn('⚠️ Invalid solo_time value:', soloTimeValue, 'in flight:', flight.id);
      } else {
        acc.soloTime += soloTime;
      }
      acc.nightTime += parseFloat(flight.night_time?.toString() || '0') || 0;
      acc.crossCountryTime += parseFloat(flight.cross_country_time?.toString() || '0') || 0;
      acc.actualInstrument += parseFloat(flight.actual_instrument?.toString() || '0') || 0;
      acc.simulatedInstrument += parseFloat(flight.simulated_instrument?.toString() || '0') || 0;
      acc.dualReceived += parseFloat(flight.dual_received?.toString() || '0') || 0;
      
      const crossCountry = parseFloat(flight.cross_country_time?.toString() || '0') || 0;
      const pic = parseFloat(flight.pic_time?.toString() || '0') || 0;
      acc.crossCountryPICTime += Math.min(crossCountry, pic);
      
      // Calculate complex/turbine/TAA time - check aircraft features
      if (aircraftMap && flight.aircraft_registration) {
        const aircraftId = flight.aircraft_registration.toUpperCase();
        const aircraft = aircraftMap.get(aircraftId);
        if (aircraft) {
          const flightTime = parseFloat(flight.total_time?.toString() || '0') || 0;
          
          const isComplex = aircraft.complex === true;
          const isTAA = aircraft.taa === true;
          const isTurbine = aircraft.engine_type && 
            ['TurboFan', 'Turbojet', 'TurboProp', 'Turboshaft'].includes(aircraft.engine_type);
          
          // If aircraft has complex, TAA, or turbine features, add total time
          if (isComplex || isTAA || isTurbine) {
            acc.complexTurbineTAATime += flightTime;
          }
          
          // Calculate powered aircraft time (any aircraft with engine_type != 'Non-Powered' and not null)
          const isPowered = aircraft.engine_type && aircraft.engine_type !== 'Non-Powered';
          if (isPowered) {
            acc.poweredAircraftTime += flightTime;
            
            // Check if it's an airplane (category_class starts with 'A': ASEL, AMEL, ASES, AMES)
            const isAirplane = aircraft.category_class && aircraft.category_class.startsWith('A');
            if (isAirplane) {
              acc.airplaneTime += flightTime;
            }
          }
        }
      }
      
      return acc;
    }, {
      totalTime: 0,
      picTime: 0,
      sicTime: 0,
      soloTime: 0,
      nightTime: 0,
      crossCountryTime: 0,
      crossCountryPICTime: 0,
      actualInstrument: 0,
      simulatedInstrument: 0,
      dualReceived: 0,
      complexTurbineTAATime: 0,
      poweredAircraftTime: 0,
      airplaneTime: 0
    });

    const title = detail.title.toLowerCase();
    let requiredHours = detail.flightHours || extractHours(detail.title) || 0;
    let currentHours = 0;

    // Match task titles to flight log data (same logic as calculateTaskProgressFromFlights)
    // Order matters - check more specific patterns first
    if ((title.includes('cross country') || title.includes('cross-country') || title.includes('xc')) && 
        (title.includes('pic') || title.includes('pilot in command') || title.includes('as pic'))) {
      // Cross country PIC - most specific
      currentHours = totals.crossCountryPICTime;
    } else if (title.includes('solo')) {
      // Solo time - check before other time types
      currentHours = totals.soloTime;
      // Debug logging for solo time calculation
      console.log('🎯 Solo task calculation:', {
        taskTitle: detail.title,
        currentHours,
        requiredHours,
        totalSoloFromFlights: totals.soloTime,
        flightsCount: flights.length,
        soloTimeBreakdown: flights.map(f => ({
          id: f.id,
          solo_time: f.solo_time,
          parsed: f.solo_time != null ? parseFloat(f.solo_time.toString()) : 0
        })).filter(f => f.parsed > 0)
      });
    } else if (title.includes('cross country') || title.includes('cross-country') || title.includes('xc')) {
      // General cross-country (not PIC)
      currentHours = totals.crossCountryTime;
    } else if (title.includes('pic') || title.includes('pilot in command') || title.includes('pilot-in-command')) {
      // PIC time (not cross-country) - matches "PIC", "pilot in command", or "pilot-in-command"
      currentHours = totals.picTime;
    } else if (title.includes('night')) {
      currentHours = totals.nightTime;
    } else if (title.includes('instrument') && (title.includes('actual') || title.includes('simulated')) && 
               (title.includes('and/or') || title.includes('and') || title.includes('or'))) {
      // "75 Hours Instrument (Actual and/or Simulated)" - combine actual and simulated instrument time
      currentHours = totals.actualInstrument + totals.simulatedInstrument;
    } else if (title.includes('simulated instrument')) {
      // Check simulated instrument before general instrument
      currentHours = totals.simulatedInstrument;
    } else if (title.includes('instrument') && !title.includes('simulated')) {
      currentHours = totals.actualInstrument;
    } else if ((title.includes('flight training') && title.includes('instructor')) || 
               (title.includes('training') && title.includes('instructor') && !title.includes('ground'))) {
      // Flight training with instructor
      currentHours = totals.dualReceived;
    } else if (title.includes('dual') && (title.includes('received') || title.includes('training'))) {
      currentHours = totals.dualReceived;
    } else if ((title.includes('complex') && (title.includes('turbine') || title.includes('taa'))) ||
               (title.includes('turbine') && (title.includes('complex') || title.includes('taa'))) ||
               (title.includes('taa') && (title.includes('complex') || title.includes('turbine')))) {
      // Complex, turbine, or TAA time - requires aircraft data
      currentHours = totals.complexTurbineTAATime;
    } else if (title.includes('powered aircraft') && title.includes('airplane')) {
      // "100 hours in powered aircraft, of which 50 hours must be in airplanes"
      // For display, show the minimum progress (both requirements must be met)
      const totalRequired = extractHours(detail.title) || 100; // Extract first number (100)
      const airplaneRequired = extractHours((detail.title.split('of which')[1] || '')) || 50; // Extract from "of which" part (50)
      
      // Calculate progress based on the limiting factor
      const poweredProgress = totals.poweredAircraftTime / totalRequired;
      const airplaneProgress = totals.airplaneTime / airplaneRequired;
      
      // Use the minimum progress (both must be met)
      const minProgress = Math.min(poweredProgress, airplaneProgress);
      currentHours = minProgress * totalRequired; // Show as percentage of total requirement
      requiredHours = totalRequired;
    } else if ((title.includes('airplane') || title.includes('airplanes')) && !title.includes('powered aircraft')) {
      // "50 hours in airplanes" - just airplane time requirement (not powered aircraft)
      currentHours = totals.airplaneTime;
    } else if (title.includes('total time') || title.includes('hours total')) {
      // Total time - check last as it's the most general
      currentHours = totals.totalTime;
    }

    return { current: currentHours, required: requiredHours };
  };

  // Circular progress ring component for task progress
  const TaskProgressPieChart = ({ current, required }: { current: number; required: number }) => {
    if (required === 0) return null;

    const percentage = Math.min(100, Math.round((current / required) * 100));
    const circumference = 2 * Math.PI * 18; // radius = 18
    const offset = circumference - (percentage / 100) * circumference;
    const isComplete = current >= required;

    return (
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative w-10 h-10 shrink-0">
          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
            {/* Background circle */}
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted/30"
            />
            {/* Progress circle */}
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${
                isComplete 
                  ? 'text-green-500' 
                  : percentage >= 75 
                  ? 'text-blue-500' 
                  : percentage >= 50 
                  ? 'text-yellow-500' 
                  : 'text-primary'
              }`}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-foreground">
              {percentage}%
            </span>
          </div>
        </div>
        {/* Hours text */}
        <div className="flex flex-col items-start min-w-[60px]">
          <span className="text-xs font-medium text-foreground">
            {current.toFixed(1)}h
          </span>
          <span className="text-[10px] text-muted-foreground">
            / {required.toFixed(1)}h
          </span>
        </div>
      </div>
    );
  };

  // Load existing user route on component mount
  useEffect(() => {
    if (!user) return;
    
    const loadUserRoute = async () => {
      console.log('🔄 Loading user route for user:', user.id);
      try {
        // Fetch user routes
        const { data: userRoutes, error } = await supabase
          .from('user_routes')
          .select('*')
          .eq('user_id', user.id)
          .order('order_number');

        if (error) {
          console.error('❌ Error loading user route:', error);
          setHasCheckedForExistingRoute(true);
          return;
        }

        console.log('📊 Loaded user routes from database:', userRoutes);
        
        // Reset the refs when loading a new route
        hasCheckedPrivatePilotTaskRef.current = false;
        manuallyUncheckedPrivatePilotRef.current = false;

        // Fetch ALL flight entries for progress calculation (with pagination)
        let allFlights: any[] = [];
        const pageSize = 1000;
        let from = 0;
        
        while (true) {
          const { data: flightsPage, error: flightsError } = await supabase
            .from('flight_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .range(from, from + pageSize - 1);

          if (flightsError) {
            console.warn('⚠️ Error fetching flights for progress calculation:', flightsError);
            break;
          }

          if (!flightsPage || flightsPage.length === 0) {
            break;
          }

          allFlights = [...allFlights, ...flightsPage];

          if (flightsPage.length < pageSize) {
            break;
          }

          from += pageSize;
        }

        console.log('📊 Loaded flights for progress calculation:', {
          totalFlights: allFlights.length,
          totalSoloTime: allFlights.reduce((sum, f) => {
            const solo = f.solo_time != null ? parseFloat(f.solo_time.toString()) : 0;
            return sum + (isNaN(solo) ? 0 : solo);
          }, 0)
        });

        // Store flights in state for pie chart calculations
        setFlights(allFlights);

        // Fetch aircraft data for complex/turbine/TAA/powered aircraft calculations
        const { data: aircraftData, error: aircraftError } = await supabase
          .from('aircraft_logbook')
          .select('aircraft_id, complex, taa, engine_type, category_class')
          .eq('user_id', user.id);

        // Create a map of aircraft_id -> aircraft features
        const aircraftFeatureMap = new Map<string, any>();
        if (aircraftData && !aircraftError) {
          aircraftData.forEach(aircraft => {
            aircraftFeatureMap.set(aircraft.aircraft_id.toUpperCase(), aircraft);
          });
        }
        
        setAircraftMap(aircraftFeatureMap);

        if (userRoutes && userRoutes.length > 0) {
          console.log('✅ User has existing route, setting hasCompletedWizard to true');
          setHasCompletedWizard(true);
          
          const loadedRoute: StudentRoute[] = [];
          
          // Fetch current checked state from database for all route steps
          const { data: routeDetails } = await supabase
            .from('route_step_details')
            .select('id, checked, route_step_id, title')
            .in('route_step_id', userRoutes.map(ur => ur.route_step_id));

          // Create a map of checked tasks from database
          const databaseCheckedTasks = new Map<string, boolean>();
          if (routeDetails) {
            routeDetails.forEach(detail => {
              if (detail.id) {
                databaseCheckedTasks.set(detail.id, detail.checked);
              }
              if (detail.title) {
                databaseCheckedTasks.set(detail.title, detail.checked);
              }
            });
          }

          // Deduplicate user routes by route_step_id - keep only the first occurrence
          const seenStepIds = new Set<string>();
          const uniqueUserRoutes = userRoutes.filter(userRoute => {
            if (seenStepIds.has(userRoute.route_step_id)) {
              console.warn('⚠️ Duplicate route step found, removing:', userRoute.route_step_id, userRoute);
              return false;
            }
            seenStepIds.add(userRoute.route_step_id);
            return true;
          });

          for (const userRoute of uniqueUserRoutes) {
            const step = routeSteps.find(s => s.id === userRoute.route_step_id);
            if (step) {
              // Calculate task progress from flight log data
              const taskProgress = allFlights && allFlights.length > 0
                ? await calculateTaskProgressFromFlights(step, allFlights, aircraftFeatureMap)
                : {};

              // Initialize tasks - use database state for manually-only tasks, otherwise use calculated or default to false
              step.details.forEach(detail => {
                // All tasks in Medical Certification, Initial Training Preparation, and Cadet Programs must be manually checked
                const isMedicalOrInitialTrainingStep = step.title === 'Medical Certification' || step.title === 'Initial Training Preparation';
                const isCadetProgramStep = step.category === 'Cadet Programs';
                
                const detailTitle = detail.title?.toLowerCase() || '';
                const isPracticeTestTask = detailTitle.includes('practice test') && detailTitle.includes('60 days');
                const is250NMTask = detailTitle.includes('250 nm') && detailTitle.includes('cross country') && 
                                    (detailTitle.includes('instructor') || detailTitle.includes('simulated instrument')) &&
                                    (detailTitle.includes('ifr') || detailTitle.includes('3 different') || detailTitle.includes('approaches'));
                const isNight100NMTask = detailTitle.includes('night') && detailTitle.includes('cross country') && detailTitle.includes('100 nm');
                const is150NM3PointsTask = detailTitle.includes('150 nm') && detailTitle.includes('cross country') && 
                                            (detailTitle.includes('3 points') || detailTitle.includes('50 nm') || detailTitle.includes('straight line'));
                const isControlledAirportTask = (detailTitle.includes('take off') || detailTitle.includes('takeoff') || detailTitle.includes('landing')) && 
                                                detailTitle.includes('controlled airport');
                const isDay100NMTask = detailTitle.includes('day') && detailTitle.includes('cross country') && detailTitle.includes('100 nm');
                const isNight100NMTask2 = detailTitle.includes('night') && detailTitle.includes('cross country') && detailTitle.includes('100 nm') && !detailTitle.includes('over');
                const isSoloOrPICTask = detailTitle.includes('solo') && (detailTitle.includes('instructor') || detailTitle.includes('pic duties') || detailTitle.includes('exercising'));
                const is300NMTask = detailTitle.includes('300 nm') && detailTitle.includes('cross country') && 
                                    (detailTitle.includes('3 landing') || detailTitle.includes('landing points') || detailTitle.includes('250 nm'));
                const isNightVFRControlledTask = detailTitle.includes('night') && detailTitle.includes('vfr') && 
                                                 (detailTitle.includes('take off') || detailTitle.includes('landing')) && 
                                                 detailTitle.includes('controlled');
                const isPracticalTest2MonthsTask = detailTitle.includes('practical test') && 
                                                    (detailTitle.includes('2 calendar months') || detailTitle.includes('2 months') || detailTitle.includes('60 days'));
                const isCertificateCheckRideTask = (detailTitle.includes('flight training') || detailTitle.includes('training')) && 
                                                   detailTitle.includes('certificate') && 
                                                   (detailTitle.includes('2 calendar months') || detailTitle.includes('2 months')) && 
                                                   detailTitle.includes('check ride');
                const isManuallyOnly = isMedicalOrInitialTrainingStep || isCadetProgramStep || isPracticeTestTask || is250NMTask || isNight100NMTask || is150NM3PointsTask || isControlledAirportTask || 
                                       isDay100NMTask || isNight100NMTask2 || isSoloOrPICTask || is300NMTask || isNightVFRControlledTask || isPracticalTest2MonthsTask || isCertificateCheckRideTask;
                
                if (detail.id) {
                  if (isManuallyOnly) {
                    // For manually-only tasks, always use database state
                    const dbChecked = databaseCheckedTasks.get(detail.id) ?? databaseCheckedTasks.get(detail.title) ?? false;
                    taskProgress[detail.id] = dbChecked;
                    console.log('🔒 Loading manually-only task from database:', detail.title, 'checked:', dbChecked);
                  } else if (!(detail.id in taskProgress)) {
                    // For other tasks, use database state if available, otherwise false
                    const dbChecked = databaseCheckedTasks.get(detail.id) ?? databaseCheckedTasks.get(detail.title);
                    taskProgress[detail.id] = dbChecked !== undefined ? dbChecked : false;
                  }
                }
              });

              // Recalculate order number based on wizard step key or category
              // This ensures correct ordering even if database has old order numbers
              const recalculatedOrder = getOrderNumberForStep(
                step.category, 
                userRoute.wizard_step_key || undefined, 
                step.title
              );

              loadedRoute.push({
                id: `${step.id}-${userRoute.created_at}`,
                stepId: step.id,
                title: step.title,
                category: step.category,
                icon: step.icon,
                completed: userRoute.completed,
                order: recalculatedOrder,
                taskProgress
              });
            }
          }
          
          // Reorder all steps to ensure correct wizard sequence
          const reorderedRoute = reorderRouteByWizardSequence(loadedRoute);
          
          // Sort by final order (should already be sorted, but just in case)
          reorderedRoute.sort((a, b) => a.order - b.order);
          
          // Update order numbers in database if they've changed
          if (user) {
            try {
              for (const routeItem of reorderedRoute) {
                const userRoute = userRoutes.find(ur => ur.route_step_id === routeItem.stepId);
                if (userRoute && userRoute.order_number !== routeItem.order) {
                  await supabase
                    .from('user_routes')
                    .update({ order_number: routeItem.order })
                    .eq('id', userRoute.id);
                }
              }
            } catch (error) {
              console.warn('⚠️ Error updating order numbers:', error);
            }
          }
          
          setStudentRoute(reorderedRoute);
        }
      } catch (error) {
        console.error('❌ Exception loading user route:', error);
      } finally {
        setHasCheckedForExistingRoute(true);
      }
    };

    if (routeSteps.length > 0) {
      loadUserRoute();
    }
  }, [user, routeSteps]);

  // Ensure flights are always loaded
  useEffect(() => {
    if (!user) return;

    const loadAllFlights = async () => {
      try {
        let allFlights: any[] = [];
        const pageSize = 1000;
        let from = 0;
        
        while (true) {
          const { data: flightsPage, error } = await supabase
            .from('flight_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .range(from, from + pageSize - 1);

          if (error) {
            console.warn('⚠️ Error fetching flights:', error);
            break;
          }

          if (!flightsPage || flightsPage.length === 0) {
            break;
          }

          allFlights = [...allFlights, ...flightsPage];

          if (flightsPage.length < pageSize) {
            break;
          }

          from += pageSize;
        }

        const totalSolo = allFlights.reduce((sum, f) => {
          const solo = f.solo_time != null ? parseFloat(f.solo_time.toString()) : 0;
          return sum + (isNaN(solo) ? 0 : solo);
        }, 0);

        console.log('🔄 Loaded all flights:', {
          totalFlights: allFlights.length,
          totalSoloTime: totalSolo
        });

        setFlights(allFlights);
        
        // Fetch aircraft data for complex/turbine/TAA/powered aircraft calculations
        const { data: aircraftData, error: aircraftError } = await supabase
          .from('aircraft_logbook')
          .select('aircraft_id, complex, taa, engine_type, category_class')
          .eq('user_id', user.id);

        // Create a map of aircraft_id -> aircraft features
        const aircraftFeatureMap = new Map<string, any>();
        if (aircraftData && !aircraftError) {
          aircraftData.forEach(aircraft => {
            aircraftFeatureMap.set(aircraft.aircraft_id.toUpperCase(), aircraft);
          });
          console.log('✈️ Loaded aircraft data:', aircraftFeatureMap.size, 'aircraft');
        }
        
        setAircraftMap(aircraftFeatureMap);
      } catch (error) {
        console.error('Error loading flights:', error);
      }
    };

    loadAllFlights();
  }, [user]);

  // Refresh task progress when flights change
  useEffect(() => {
    if (!user || studentRoute.length === 0 || routeSteps.length === 0 || isManuallyUpdating) return;
    
    // Don't refresh if a practice test task was just manually updated (within last 5 seconds)
    const timeSinceLastUpdate = Date.now() - lastPracticeTestUpdate;
    if (timeSinceLastUpdate < 5000) {
      console.log('⏸️ Skipping refresh - practice test task recently updated');
      return;
    }

    const refreshTaskProgress = async () => {
      // CRITICAL: Check flags at the very start before doing anything
      if (isManuallyUpdating) {
        console.log('⏸️ Refresh blocked - manual update in progress');
        return;
      }
      
      // Don't refresh if a practice test task was just manually updated (within last 5 seconds)
      const timeSinceLastUpdate = Date.now() - lastPracticeTestUpdate;
      if (timeSinceLastUpdate < 5000) {
        console.log('⏸️ Refresh blocked - practice test task recently updated', timeSinceLastUpdate, 'ms ago');
        return;
      }
      
      try {
        // Fetch ALL latest flight entries (with pagination)
        let allFlights: any[] = [];
        const pageSize = 1000;
        let from = 0;
        
        while (true) {
          const { data: flightsPage, error } = await supabase
            .from('flight_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .range(from, from + pageSize - 1);

          if (error) {
            console.warn('⚠️ Error fetching flights for progress refresh:', error);
            break;
          }

          if (!flightsPage || flightsPage.length === 0) {
            break;
          }

          allFlights = [...allFlights, ...flightsPage];

          if (flightsPage.length < pageSize) {
            break;
          }

          from += pageSize;
        }

        console.log('🔄 Refreshed flights for progress:', {
          totalFlights: allFlights.length,
          totalSoloTime: allFlights.reduce((sum, f) => {
            const solo = f.solo_time != null ? parseFloat(f.solo_time.toString()) : 0;
            return sum + (isNaN(solo) ? 0 : solo);
          }, 0)
        });

        // Store flights in state for pie chart calculations
        setFlights(allFlights);
        
        // Fetch aircraft data for complex/turbine/TAA/powered aircraft calculations
        const { data: aircraftData, error: aircraftError } = await supabase
          .from('aircraft_logbook')
          .select('aircraft_id, complex, taa, engine_type, category_class')
          .eq('user_id', user.id);

        // Create a map of aircraft_id -> aircraft features
        const aircraftFeatureMap = new Map<string, any>();
        if (aircraftData && !aircraftError) {
          aircraftData.forEach(aircraft => {
            aircraftFeatureMap.set(aircraft.aircraft_id.toUpperCase(), aircraft);
          });
        }
        
        setAircraftMap(aircraftFeatureMap);

        // Fetch current checked state from database to preserve manually checked tasks
        const { data: routeDetails } = await supabase
          .from('route_step_details')
          .select('id, checked, route_step_id, title')
          .in('route_step_id', studentRoute.map(s => s.stepId));

        // Create a map of manually checked tasks from database
        // Map by both ID and title to handle both cases
        const manuallyCheckedTasks = new Map<string, boolean>();
        if (routeDetails) {
          routeDetails.forEach(detail => {
            // CRITICAL: If user has manually unchecked "Obtain your Private Pilot Certificate",
            // override the database value to false - user's manual choice takes precedence
            if (detail.title === 'Obtain your Private Pilot Certificate' && manuallyUncheckedPrivatePilotRef.current) {
              manuallyCheckedTasks.set(detail.id || '', false);
              manuallyCheckedTasks.set(detail.title, false);
              console.log('🔒 Overriding database: Private Pilot Certificate is manually unchecked');
              return; // Skip storing the database value
            }
            
            // Store by ID if available
            if (detail.id) {
              manuallyCheckedTasks.set(detail.id, detail.checked);
            }
            // Also store by title for matching
            if (detail.title) {
              manuallyCheckedTasks.set(detail.title, detail.checked);
            }
          });
        }
        
        console.log('📋 Database checked tasks:', Array.from(manuallyCheckedTasks.entries()).filter(([k, v]) => v === true));

        // Update task progress for each step based on flight data
        setStudentRoute(prevRoute => {
          return prevRoute.map(routeStep => {
            const fullStep = routeSteps.find(rs => rs.id === routeStep.stepId);
            if (!fullStep) return routeStep;

            // Calculate progress from flights (with aircraft data for complex/turbine/TAA)
            calculateTaskProgressFromFlights(fullStep, allFlights || [], aircraftFeatureMap).then(newProgress => {
              // Start with existing progress to preserve manually checked items
              const mergedProgress = { ...routeStep.taskProgress };
              
              // First, ensure all manually-only tasks are preserved
              // These should NEVER be auto-updated from flight data
              fullStep.details.forEach((detail: any) => {
                // All tasks in Medical Certification, Initial Training Preparation, and Cadet Programs must be manually checked
                const isMedicalOrInitialTrainingStep = fullStep.title === 'Medical Certification' || fullStep.title === 'Initial Training Preparation';
                const isCadetProgramStep = fullStep.category === 'Cadet Programs';
                
                const detailTitle = detail.title?.toLowerCase() || '';
                const isPracticeTestTask = detailTitle.includes('practice test') && detailTitle.includes('60 days');
                const is250NMTask = detailTitle.includes('250 nm') && detailTitle.includes('cross country') && 
                                    (detailTitle.includes('instructor') || detailTitle.includes('simulated instrument')) &&
                                    (detailTitle.includes('ifr') || detailTitle.includes('3 different') || detailTitle.includes('approaches'));
                const isNight100NMTask = detailTitle.includes('night') && detailTitle.includes('cross country') && detailTitle.includes('100 nm');
                const is150NM3PointsTask = detailTitle.includes('150 nm') && detailTitle.includes('cross country') && 
                                            (detailTitle.includes('3 points') || detailTitle.includes('50 nm') || detailTitle.includes('straight line'));
                const isControlledAirportTask = (detailTitle.includes('take off') || detailTitle.includes('takeoff') || detailTitle.includes('landing')) && 
                                                detailTitle.includes('controlled airport');
                const isDay100NMTask = detailTitle.includes('day') && detailTitle.includes('cross country') && detailTitle.includes('100 nm');
                const isNight100NMTask2 = detailTitle.includes('night') && detailTitle.includes('cross country') && detailTitle.includes('100 nm') && !detailTitle.includes('over');
                const isSoloOrPICTask = detailTitle.includes('solo') && (detailTitle.includes('instructor') || detailTitle.includes('pic duties') || detailTitle.includes('exercising'));
                const is300NMTask = detailTitle.includes('300 nm') && detailTitle.includes('cross country') && 
                                    (detailTitle.includes('3 landing') || detailTitle.includes('landing points') || detailTitle.includes('250 nm'));
                const isNightVFRControlledTask = detailTitle.includes('night') && detailTitle.includes('vfr') && 
                                                 (detailTitle.includes('take off') || detailTitle.includes('landing')) && 
                                                 detailTitle.includes('controlled');
                const isPracticalTest2MonthsTask = detailTitle.includes('practical test') && 
                                                    (detailTitle.includes('2 calendar months') || detailTitle.includes('2 months') || detailTitle.includes('60 days'));
                const isCertificateCheckRideTask = (detailTitle.includes('flight training') || detailTitle.includes('training')) && 
                                                   detailTitle.includes('certificate') && 
                                                   (detailTitle.includes('2 calendar months') || detailTitle.includes('2 months')) && 
                                                   detailTitle.includes('check ride');
                
                if (isMedicalOrInitialTrainingStep || isPracticeTestTask || is250NMTask || isNight100NMTask || is150NM3PointsTask || isControlledAirportTask || 
                    isDay100NMTask || isNight100NMTask2 || isSoloOrPICTask || is300NMTask || isNightVFRControlledTask || isPracticalTest2MonthsTask || isCertificateCheckRideTask) {
                  const taskKey = detail.id || detail.title;
                  // Always preserve the current state or database state - never overwrite
                  const isManuallyChecked = detail.id 
                    ? manuallyCheckedTasks.get(detail.id) === true
                    : manuallyCheckedTasks.get(detail.title) === true;
                  
                  // ALWAYS use database state for manually-only tasks - never use calculated or current state
                  if (isManuallyChecked !== undefined) {
                    mergedProgress[taskKey] = isManuallyChecked;
                    console.log('🔒 Preserving manually-only task from database:', detail.title, 'checked:', isManuallyChecked);
                  } else {
                    // If not in database, default to false (but this shouldn't happen if task was checked)
                    mergedProgress[taskKey] = false;
                    console.log('⚠️ Manually-only task not found in database, defaulting to false:', detail.title);
                  }
                }
              });
              
              // Only update tasks that weren't manually checked in the database
              Object.keys(newProgress).forEach(taskKey => {
                // Find the detail to get its database ID
                const detail = fullStep.details.find(d => 
                  (d.id && d.id === taskKey) || (d.title === taskKey)
                );
                
                if (detail) {
                  const detailTitle = detail.title?.toLowerCase() || '';
                  
                  // CRITICAL: If user has manually unchecked "Obtain your Private Pilot Certificate", 
                  // NEVER auto-check it again - preserve the unchecked state
                  if (detail.title === 'Obtain your Private Pilot Certificate' && manuallyUncheckedPrivatePilotRef.current) {
                    // User has manually unchecked this - preserve unchecked state
                    mergedProgress[taskKey] = false;
                    console.log('🔒 Preserving manually unchecked Private Pilot Certificate task');
                    return;
                  }
                  
                  // Skip tasks that should only be manually checked
                  // Specifically: "practice test within 60 days" tasks require manual verification
                  if (detailTitle.includes('practice test') && detailTitle.includes('60 days')) {
                    // Don't auto-check this task - preserve its current state
                    return;
                  }
                  
                  // Skip "250 NM cross country with instructor, simulated instrument, IFR with 3 different approaches"
                  if (detailTitle.includes('250 nm') && detailTitle.includes('cross country') && 
                      (detailTitle.includes('instructor') || detailTitle.includes('simulated instrument')) &&
                      (detailTitle.includes('ifr') || detailTitle.includes('3 different') || detailTitle.includes('approaches'))) {
                    // Don't auto-check this task - preserve its current state
                    return;
                  }
                  
                  // Skip "night cross country over 100 NM" - distance requirement not tracked
                  if (detailTitle.includes('night') && detailTitle.includes('cross country') && detailTitle.includes('100 nm')) {
                    // Don't auto-check this task - preserve its current state
                    return;
                  }
                  
                  // Skip "150 NM cross country, 3 points, 1 straight line distance leg of 50 NM" - specific route requirements not tracked
                  if (detailTitle.includes('150 nm') && detailTitle.includes('cross country') && 
                      (detailTitle.includes('3 points') || detailTitle.includes('50 nm') || detailTitle.includes('straight line'))) {
                    // Don't auto-check this task - preserve its current state
                    return;
                  }
                  
                  // Skip "take offs and landings at a controlled airport" - controlled airport status not tracked
                  if ((detailTitle.includes('take off') || detailTitle.includes('takeoff') || detailTitle.includes('landing')) && 
                      detailTitle.includes('controlled airport')) {
                    // Don't auto-check this task - preserve its current state
                    return;
                  }
                  
                  // Check if this task was manually checked in the database
                  const isManuallyChecked = detail.id 
                    ? manuallyCheckedTasks.get(detail.id) === true
                    : manuallyCheckedTasks.get(detail.title) === true;
                  
                  // If manually checked, preserve current state (don't overwrite)
                  if (isManuallyChecked) {
                    // Keep the current state - don't update from flight data
                    console.log('Preserving manually checked task:', detail.title, 'current state:', mergedProgress[taskKey]);
                  } else {
                    // Not manually checked, update from flight data
                    mergedProgress[taskKey] = newProgress[taskKey];
                  }
                } else {
                  // No detail found, use calculated progress
                  mergedProgress[taskKey] = newProgress[taskKey];
                }
              });
              
              // Update state with merged progress
              // CRITICAL: For practice test tasks, always preserve their current state from the route
              setStudentRoute(currentRoute => {
                return currentRoute.map(step => {
                  if (step.id !== routeStep.id) return step;
                  
                  // Find manually-only tasks and ALWAYS use database state, not current route state
                  const fullStep = routeSteps.find(rs => rs.id === step.stepId);
                  if (fullStep) {
                    // All tasks in Medical Certification, Initial Training Preparation, and Cadet Programs must be manually checked
                    const isMedicalOrInitialTrainingStep = fullStep.title === 'Medical Certification' || fullStep.title === 'Initial Training Preparation';
                    const isCadetProgramStep = fullStep.category === 'Cadet Programs';
                    
                    fullStep.details.forEach((detail: any) => {
                      // CRITICAL: If user has manually unchecked "Obtain your Private Pilot Certificate", 
                      // NEVER auto-check it again - preserve the unchecked state
                      const isObtainPrivatePilotTask = detail.title === 'Obtain your Private Pilot Certificate';
                      const isPrivatePilotManuallyUnchecked = isObtainPrivatePilotTask && manuallyUncheckedPrivatePilotRef.current;
                      
                      if (isPrivatePilotManuallyUnchecked) {
                        const taskKey = detail.id || detail.title;
                        // User has manually unchecked this - preserve unchecked state
                        mergedProgress[taskKey] = false;
                        console.log('🔒 Preserving manually unchecked Private Pilot Certificate task in refresh');
                        return; // Skip the rest of the logic for this task
                      }
                      
                      const detailTitle = detail.title?.toLowerCase() || '';
                const isPracticeTestTask = detailTitle.includes('practice test') && detailTitle.includes('60 days');
                const is250NMTask = detailTitle.includes('250 nm') && detailTitle.includes('cross country') && 
                                    (detailTitle.includes('instructor') || detailTitle.includes('simulated instrument')) &&
                                    (detailTitle.includes('ifr') || detailTitle.includes('3 different') || detailTitle.includes('approaches'));
                const isNight100NMTask = detailTitle.includes('night') && detailTitle.includes('cross country') && detailTitle.includes('100 nm');
                const is150NM3PointsTask = detailTitle.includes('150 nm') && detailTitle.includes('cross country') && 
                                            (detailTitle.includes('3 points') || detailTitle.includes('50 nm') || detailTitle.includes('straight line'));
                const isControlledAirportTask = (detailTitle.includes('take off') || detailTitle.includes('takeoff') || detailTitle.includes('landing')) && 
                                                detailTitle.includes('controlled airport');
                const isDay100NMTask = detailTitle.includes('day') && detailTitle.includes('cross country') && detailTitle.includes('100 nm');
                const isNight100NMTask2 = detailTitle.includes('night') && detailTitle.includes('cross country') && detailTitle.includes('100 nm') && !detailTitle.includes('over');
                const isSoloOrPICTask = detailTitle.includes('solo') && (detailTitle.includes('instructor') || detailTitle.includes('pic duties') || detailTitle.includes('exercising'));
                const is300NMTask = detailTitle.includes('300 nm') && detailTitle.includes('cross country') && 
                                    (detailTitle.includes('3 landing') || detailTitle.includes('landing points') || detailTitle.includes('250 nm'));
                const isNightVFRControlledTask = detailTitle.includes('night') && detailTitle.includes('vfr') && 
                                                 (detailTitle.includes('take off') || detailTitle.includes('landing')) && 
                                                 detailTitle.includes('controlled');
                const isPracticalTest2MonthsTask = detailTitle.includes('practical test') && 
                                                    (detailTitle.includes('2 calendar months') || detailTitle.includes('2 months') || detailTitle.includes('60 days'));
                const isCertificateCheckRideTask = (detailTitle.includes('flight training') || detailTitle.includes('training')) && 
                                                   detailTitle.includes('certificate') && 
                                                   (detailTitle.includes('2 calendar months') || detailTitle.includes('2 months')) && 
                                                   detailTitle.includes('check ride');
                
                if (isMedicalOrInitialTrainingStep || isPracticeTestTask || is250NMTask || isNight100NMTask || is150NM3PointsTask || isControlledAirportTask || 
                    isDay100NMTask || isNight100NMTask2 || isSoloOrPICTask || is300NMTask || isNightVFRControlledTask || isPracticalTest2MonthsTask || isCertificateCheckRideTask) {
                        const taskKey = detail.id || detail.title;
                        
                        // CRITICAL: If user has manually unchecked "Obtain your Private Pilot Certificate", 
                        // override database state and preserve unchecked state
                        if (detail.title === 'Obtain your Private Pilot Certificate' && manuallyUncheckedPrivatePilotRef.current) {
                          mergedProgress[taskKey] = false;
                          console.log('🔒 Overriding database state - user manually unchecked Private Pilot Certificate');
                          return; // Skip the rest of the logic for this task
                        }
                        
                        // Get database state for this task - this is the source of truth
                        const dbChecked = detail.id 
                          ? manuallyCheckedTasks.get(detail.id)
                          : manuallyCheckedTasks.get(detail.title);
                        
                        if (dbChecked !== undefined) {
                          mergedProgress[taskKey] = dbChecked;
                          console.log('🔒 Force preserving manually-only task from DATABASE:', detail.title, 'checked:', dbChecked);
                        } else if (step.taskProgress[taskKey] !== undefined) {
                          // Fallback to current state only if database doesn't have it
                          mergedProgress[taskKey] = step.taskProgress[taskKey];
                          console.log('⚠️ Manually-only task not in database, using current state:', detail.title, 'state:', step.taskProgress[taskKey]);
                        }
                      }
                    });
                  }
                  
                  return { ...step, taskProgress: mergedProgress };
                });
              });
            });

            return routeStep;
          });
        });
      } catch (error) {
        console.error('❌ Error refreshing task progress:', error);
      }
    };

    // Refresh on mount and periodically (every 30 seconds)
    refreshTaskProgress();
    const interval = setInterval(refreshTaskProgress, 30000);

    return () => clearInterval(interval);
  }, [user, studentRoute.length, routeSteps.length, isManuallyUpdating]);

  // DISABLED: Auto-check "Obtain your Private Pilot Certificate" when Private Pilot License Part 61 is 100% complete
  // This has been completely disabled - the task is now manually-only to prevent re-checking issues
  // If you need auto-checking in the future, it should only run ONCE when the step first reaches 100%
  // and should NEVER run again if the user has manually unchecked it
  useEffect(() => {
    // Completely disabled to prevent re-checking after manual uncheck
    return;
    
    if (!user || studentRoute.length === 0 || routeSteps.length === 0 || isManuallyUpdating) return;

    // If user has manually unchecked the Private Pilot Certificate task, NEVER auto-check it again
    if (manuallyUncheckedPrivatePilotRef.current) {
      console.log('⏸️ Skipping auto-check - user has manually unchecked Private Pilot Certificate');
      return;
    }
    
    // Add a small delay to ensure manual updates have completed
    // This prevents race conditions where the useEffect runs before toggleTaskCompletion completes
    const timeoutId = setTimeout(() => {
      // Double-check the ref after the delay - user might have unchecked it during the delay
      if (manuallyUncheckedPrivatePilotRef.current) {
        console.log('⏸️ Skipping auto-check after delay - user has manually unchecked Private Pilot Certificate');
        return;
      }

    // Find the "Obtain your Private Pilot Certificate" task
    for (const step of studentRoute) {
      const fullStep = routeSteps.find(rs => rs.id === step.stepId);
      if (!fullStep) continue;

      for (const detail of fullStep.details) {
        if (detail.title === 'Obtain your Private Pilot Certificate') {
          const taskKey = detail.id || detail.title;
          const isCurrentlyChecked = step.taskProgress[taskKey] || false;

          // If user has manually unchecked it (ref is set and task is unchecked), never auto-check
          if (manuallyUncheckedPrivatePilotRef.current && !isCurrentlyChecked) {
            console.log('⏸️ Task is manually unchecked - skipping auto-check');
            return;
          }

          // If already checked, mark ref and continue - don't re-check
          if (isCurrentlyChecked) {
            hasCheckedPrivatePilotTaskRef.current = true;
            continue;
          }

          // Find the Private Pilot License Part 61 step
          const privatePilotStep = studentRoute.find(s => {
            const fullStep = routeSteps.find(rs => rs.id === s.stepId);
            return fullStep && (
              fullStep.title.toLowerCase().includes('private pilot') && 
              fullStep.title.toLowerCase().includes('part 61')
            );
          });

          if (privatePilotStep) {
            const privatePilotFullStep = routeSteps.find(rs => rs.id === privatePilotStep.stepId);
            if (privatePilotFullStep) {
              // Calculate progress manually to avoid dependency issues
              const completedTasks = privatePilotFullStep.details.filter((d: any) => 
                privatePilotStep.taskProgress[d.id || d.title] || false
              ).length;
              const privatePilotProgress = privatePilotFullStep.details.length > 0 
                ? (completedTasks / privatePilotFullStep.details.length) * 100 
                : 0;
              
              // Auto-check if Private Pilot License Part 61 is 100% complete and task is not already checked
              // Only do this once - if user unchecks it later, respect their choice
              if (privatePilotProgress === 100 && !hasCheckedPrivatePilotTaskRef.current) {
                hasCheckedPrivatePilotTaskRef.current = true;
                // Update state directly to avoid infinite loop
                setStudentRoute(prev => prev.map(s => {
                  if (s.id === step.id) {
                    return {
                      ...s,
                      taskProgress: {
                        ...s.taskProgress,
                        [taskKey]: true
                      }
                    };
                  }
                  return s;
                }));
                
                // Update database asynchronously
                const fullStepForTask = routeSteps.find(rs => rs.id === step.stepId);
                if (fullStepForTask && detail.id) {
                  const detailIndex = fullStepForTask.details.findIndex((d: any) => (d.id || d.title) === taskKey);
                  if (detailIndex >= 0) {
                    updateStepDetailChecked(fullStepForTask.id, detailIndex, true).catch(err => {
                      console.warn('Failed to auto-check Private Pilot Certificate task:', err);
                    });
                  }
                }
                return; // Exit early after checking one task to avoid multiple updates
              }
            }
          }
        }
      }
    }
    }, 100); // Small delay to let manual updates complete
    
    return () => clearTimeout(timeoutId);
  }, [studentRoute, routeSteps, user, isManuallyUpdating]);

  // Show wizard only if user has never completed it
  useEffect(() => {
    if (!loading && hasCheckedForExistingRoute && !hasCompletedWizard) {
      setShowWizard(true);
    }
  }, [loading, hasCheckedForExistingRoute, hasCompletedWizard]);

  const availableSteps = routeSteps.filter(step => 
    step.status === 'published' && 
    (selectedCategory === "all" || step.category === selectedCategory)
  );

  const getPhaseProgress = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return 0;
    
    const phaseSteps = studentRoute.filter(step => 
      phase.allowedCategories.includes(step.category)
    );
    
    if (phase.minSteps && phaseSteps.length >= phase.minSteps) {
      return 100;
    }
    
    return phase.minSteps ? (phaseSteps.length / phase.minSteps) * 100 : 0;
  };

  const isPhaseUnlocked = (phaseId: string) => {
    const phaseIndex = phases.findIndex(p => p.id === phaseId);
    if (phaseIndex === 0) return true;
    
    const previousPhase = phases[phaseIndex - 1];
    return getPhaseProgress(previousPhase.id) === 100;
  };

  // Reorder route by wizard sequence - ensures correct order: Initial Tasks -> Initial Training -> Flight Instructing -> Cadet Programs -> Regional -> Major
  const reorderRouteByWizardSequence = (route: StudentRoute[]): StudentRoute[] => {
    // First, separate steps by category groups
    const initialTasks = route.filter(s => s.category === 'Initial Tasks');
    const initialTraining = route.filter(s => 
      s.category === 'Primary Training' || s.category === 'Advanced Training'
    );
    const flightInstructing = route.filter(s => s.category === 'Flight Instructing');
    const cadetPrograms = route.filter(s => s.category === 'Cadet Programs');
    const regional = route.filter(s => s.category === 'Regional Airlines');
    const major = route.filter(s => s.category === 'Major Airlines');
    
    // Sort each group internally
    const sortInitialTraining = (a: StudentRoute, b: StudentRoute) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aOrder = aTitle.includes('private') ? 1 : 
                    aTitle.includes('instrument') ? 2 :
                    aTitle.includes('commercial') && aTitle.includes('single') ? 3 :
                    aTitle.includes('commercial') && aTitle.includes('multi') ? 4 : 5;
      const bOrder = bTitle.includes('private') ? 1 : 
                    bTitle.includes('instrument') ? 2 :
                    bTitle.includes('commercial') && bTitle.includes('single') ? 3 :
                    bTitle.includes('commercial') && bTitle.includes('multi') ? 4 : 5;
      return aOrder - bOrder;
    };
    
    initialTraining.sort(sortInitialTraining);
    
    // Sort Flight Instructing items by typical sequence: CFI -> CFII -> MEI -> Commercial Multi
    const sortFlightInstructing = (a: StudentRoute, b: StudentRoute) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const getOrder = (title: string) => {
        if (title.includes('certified flight instructor') && !title.includes('instrument')) return 1; // CFI
        if (title.includes('cfii') || (title.includes('certified flight instructor') && title.includes('instrument'))) return 2; // CFII
        if (title.includes('multi-engine instructor') || title.includes('mei')) return 3; // MEI
        if (title.includes('commercial') && title.includes('multi')) return 4; // Commercial Multi
        if (title.includes('flight instructing')) return 5; // Other Flight Instructing
        return 6;
      };
      return getOrder(aTitle) - getOrder(bTitle);
    };
    
    flightInstructing.sort(sortFlightInstructing);
    
    // Assign order numbers in correct sequence
    let currentOrder = 0;
    const reorderedRoute: StudentRoute[] = [];
    
    // 1. Initial Tasks (0-9)
    initialTasks.forEach(item => {
      reorderedRoute.push({ ...item, order: currentOrder++ });
    });
    
    // 2. Initial Training (10-29)
    initialTraining.forEach(item => {
      reorderedRoute.push({ ...item, order: currentOrder++ });
    });
    
    // 3. Flight Instructing (30+) - Must come BEFORE Cadet Programs
    flightInstructing.forEach(item => {
      reorderedRoute.push({ ...item, order: currentOrder++ });
    });
    
    // 4. Cadet Programs (after Flight Instructing) - Must come AFTER all Flight Instructing
    cadetPrograms.forEach(item => {
      reorderedRoute.push({ ...item, order: currentOrder++ });
    });
    
    // 5. Regional Airlines
    regional.forEach(item => {
      reorderedRoute.push({ ...item, order: currentOrder++ });
    });
    
    // 6. Major Airlines
    major.forEach(item => {
      reorderedRoute.push({ ...item, order: currentOrder++ });
    });
    
    return reorderedRoute;
  };

  // Get order number based on category and wizard step position
  const getOrderNumberForStep = (category: string, wizardStepKey?: string, stepTitle?: string): number => {
    // Define order based on wizard sequence
    const wizardOrder: Record<string, number> = {
      'initial-tasks': 0,
      'initial-training': 10,
      'career-path': 20,
      'flight-instructing': 30,
      'cadet-program': 40,
      'regional': 50,
      'major': 60,
    };

    // If we have a wizard step key, use it for base ordering
    let baseOrder = 99;
    if (wizardStepKey && wizardOrder[wizardStepKey] !== undefined) {
      baseOrder = wizardOrder[wizardStepKey];
    } else {
      // Fall back to category-based ordering
      const categoryOrder: Record<string, number> = {
        'Initial Tasks': 0,
        'Primary Training': 10,
        'Advanced Training': 20,
        'Flight Instructing': 30,
        'Cadet Programs': 40,
        'Regional Airlines': 50,
        'Major Airlines': 60,
      };
      baseOrder = categoryOrder[category] ?? 99;
    }

    // For steps within the same wizard step, determine sub-order based on typical training sequence
    // Private Pilot -> Instrument -> Commercial Single -> Commercial Multi
    if (wizardStepKey === 'initial-training' && stepTitle) {
      const titleLower = stepTitle.toLowerCase();
      if (titleLower.includes('private')) return baseOrder + 1;
      if (titleLower.includes('instrument')) return baseOrder + 2;
      if (titleLower.includes('commercial') && titleLower.includes('single')) return baseOrder + 3;
      if (titleLower.includes('commercial') && titleLower.includes('multi')) return baseOrder + 4;
    }

    // For Flight Instructing, it should come AFTER all initial training but BEFORE Cadet Programs
    if (wizardStepKey === 'flight-instructing') {
      // Find the highest order number from initial training steps
      const initialTrainingSteps = studentRoute.filter(s => {
        const sCategory = s.category;
        return sCategory === 'Primary Training' || sCategory === 'Advanced Training';
      });
      
      // Find the highest order number from Flight Instructing steps
      const existingFlightInstructingSteps = studentRoute.filter(s => s.category === 'Flight Instructing');
      
      if (initialTrainingSteps.length > 0) {
        const maxInitialTrainingOrder = Math.max(...initialTrainingSteps.map(s => s.order));
        
        if (existingFlightInstructingSteps.length > 0) {
          const maxFlightInstructingOrder = Math.max(...existingFlightInstructingSteps.map(s => s.order));
          return Math.max(maxInitialTrainingOrder + 1, maxFlightInstructingOrder + 1);
        }
        
        return maxInitialTrainingOrder + 1;
      }
    }
    
    // For Cadet Programs, they should come AFTER all Flight Instructing (or after Initial Training if no Flight Instructing)
    if (wizardStepKey === 'cadet-program') {
      // Find the highest order number from Flight Instructing steps
      const flightInstructingSteps = studentRoute.filter(s => s.category === 'Flight Instructing');
      
      // Find the highest order number from initial training steps (in case there's no Flight Instructing)
      const initialTrainingSteps = studentRoute.filter(s => {
        const sCategory = s.category;
        return sCategory === 'Primary Training' || sCategory === 'Advanced Training';
      });
      
      // Find existing Cadet Program steps
      const existingCadetProgramSteps = studentRoute.filter(s => s.category === 'Cadet Programs');
      
      // Determine the base order: after Flight Instructing if it exists, otherwise after Initial Training
      let baseOrder = 0;
      if (flightInstructingSteps.length > 0) {
        baseOrder = Math.max(...flightInstructingSteps.map(s => s.order));
      } else if (initialTrainingSteps.length > 0) {
        baseOrder = Math.max(...initialTrainingSteps.map(s => s.order));
      }
      
      if (existingCadetProgramSteps.length > 0) {
        const maxCadetOrder = Math.max(...existingCadetProgramSteps.map(s => s.order));
        return Math.max(baseOrder + 1, maxCadetOrder + 1);
      }
      
      return baseOrder + 1;
    }

    // For other wizard steps, find the next available slot within that wizard step
    const existingStepsInWizardStep = studentRoute.filter(s => {
      // Match by order range (within same base order group)
      return s.order >= baseOrder && s.order < baseOrder + 10;
    });
    
    if (existingStepsInWizardStep.length > 0) {
      const maxOrder = Math.max(...existingStepsInWizardStep.map(s => s.order));
      return maxOrder + 1;
    }
    
    return baseOrder + 1;
  };

  const addStepToRoute = async (stepId: string, suppressToast: boolean = false, wizardStepKey?: string) => {
    const step = routeSteps.find(s => s.id === stepId);
    if (!step) {
      console.error('❌ Step not found:', stepId);
      return;
    }

    const existingStep = studentRoute.find(s => s.stepId === stepId);
    if (existingStep) {
      if (!suppressToast) {
        toast.error(`${step.title} is already in your route`);
      }
      return;
    }

    // Initialize all tasks as unchecked for new routes
    // Tasks should only be checked when the user explicitly marks them as complete
    const taskProgress: Record<string, boolean> = {};
    step.details.forEach(detail => {
      if (detail.id) {
        taskProgress[detail.id] = false; // Always start unchecked for new routes
      }
    });

    // Calculate order number based on wizard step position
    const orderNumber = getOrderNumberForStep(step.category, wizardStepKey, step.title);

    const newStep: StudentRoute = {
      id: `${step.id}-${Date.now()}`,
      stepId: step.id,
      title: step.title,
      category: step.category,
      icon: step.icon,
      completed: false,
      order: orderNumber,
      taskProgress
    };

    if (user) {
      try {
        const { error } = await supabase
          .from('user_routes')
          .insert({
            user_id: user.id,
            route_step_id: step.id,
            step_category: step.category,
            wizard_step_key: wizardStepKey || 'manual',
            order_number: orderNumber,
            completed: false
          });

        if (error) throw error;

        // Reorder all steps to ensure correct wizard sequence
        const updatedRoute = [...studentRoute, newStep];
        const reorderedRoute = reorderRouteByWizardSequence(updatedRoute);
        setStudentRoute(reorderedRoute);
        
        // Update order numbers in database for all steps to maintain correct order
        try {
          for (const routeItem of reorderedRoute) {
            const { error: updateError } = await supabase
              .from('user_routes')
              .update({ order_number: routeItem.order })
              .eq('user_id', user.id)
              .eq('route_step_id', routeItem.stepId);
            
            if (updateError) {
              console.warn('⚠️ Error updating order number for step:', routeItem.stepId, updateError);
            }
          }
        } catch (updateError) {
          console.warn('⚠️ Error updating order numbers:', updateError);
        }
        
        if (!suppressToast) {
          toast.success(`${step.title} added to your route`);
        }
      } catch (error) {
        console.error('Error adding step:', error);
        if (!suppressToast) {
          toast.error('Failed to add step to route');
        }
      }
    } else {
      setStudentRoute(prev => [...prev, newStep].sort((a, b) => a.order - b.order));
    }
  };

  const addStepToRouteFromCard = (step: any) => {
    const currentPhase = phases.find(p => p.id === activePhase);
    if (!currentPhase) return;

    if (!currentPhase.allowedCategories.includes(step.category)) {
      toast.error(`This step doesn't belong in the ${currentPhase.title} phase`);
      return;
    }

    const phaseSteps = studentRoute.filter(s => 
      currentPhase.allowedCategories.includes(s.category)
    );

    if (currentPhase.maxSteps && phaseSteps.length >= currentPhase.maxSteps) {
      toast.error(`You can only add ${currentPhase.maxSteps} step(s) to this phase`);
      return;
    }

    addStepToRoute(step.id);
  };

  const removeStepFromRoute = async (stepId: string) => {
    // Find the step in the route to get its stepId (not the route entry id)
    const routeEntry = studentRoute.find(s => s.stepId === stepId);
    if (!routeEntry) {
      // If not found by stepId, try by id (for backward compatibility)
      const entryById = studentRoute.find(s => s.id === stepId);
      if (entryById) {
        // Remove from local state
        setStudentRoute(prev => prev.filter(step => step.id !== stepId));
        toast.success("Step removed from your route");
        
        // Remove from database if user is logged in
        if (user) {
          try {
            const { error } = await supabase
              .from('user_routes')
              .delete()
              .eq('user_id', user.id)
              .eq('route_step_id', entryById.stepId);
            
            if (error) throw error;
          } catch (error) {
            console.error('Error removing step from database:', error);
            toast.error('Failed to remove step from database');
          }
        }
      }
      return;
    }
    
    // Remove from local state
    setStudentRoute(prev => prev.filter(step => step.stepId !== stepId));
    toast.success("Step removed from your route");
    
    // Remove from database if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('user_routes')
          .delete()
          .eq('user_id', user.id)
          .eq('route_step_id', stepId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error removing step from database:', error);
        toast.error('Failed to remove step from database');
      }
    }
  };

  const toggleStepCompletion = (stepId: string) => {
    setStudentRoute(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ));
  };

  const toggleTaskCompletion = async (stepId: string, taskId: string, checked: boolean) => {
    console.log('🎯 toggleTaskCompletion called:', { stepId, taskId, checked });
    
    // Set flag to prevent auto-refresh from overwriting manual selection
    setIsManuallyUpdating(true);
    
    // Find the student step and route step first
    const studentStep = studentRoute.find(ss => ss.id === stepId);
    if (!studentStep) {
      console.error("Student step not found:", stepId);
      setIsManuallyUpdating(false);
      return;
    }

    const routeStep = routeSteps.find(rs => rs.id === studentStep.stepId);
    
    // If user is manually unchecking "Obtain your Private Pilot Certificate", mark it IMMEDIATELY
    // This must happen BEFORE any state updates to prevent race conditions
    if (routeStep) {
      const detail = routeStep.details.find((d: any) => (d.id || d.title) === taskId);
      if (detail && detail.title === 'Obtain your Private Pilot Certificate') {
        if (!checked) {
          // Mark that user has manually unchecked it - this will prevent the useEffect from ever re-checking it
          manuallyUncheckedPrivatePilotRef.current = true;
          hasCheckedPrivatePilotTaskRef.current = false; // Reset this so we don't think it was auto-checked
          console.log('🔒 User manually unchecked Private Pilot Certificate - will not auto-check again');
        } else {
          // If user manually checks it back, reset the flag so it can be auto-checked again if needed
          manuallyUncheckedPrivatePilotRef.current = false;
          console.log('✅ User manually checked Private Pilot Certificate - auto-check enabled again');
        }
      }
    }
    if (!routeStep) {
      console.error("Route step not found:", studentStep.stepId);
      setIsManuallyUpdating(false);
      return;
    }
    
    // Find the detail by ID or title - handle both cases
    const detailIndex = routeStep.details.findIndex((d: any) => {
      // Try to match by ID first, then by title
      if (d.id && d.id === taskId) return true;
      if (d.title === taskId) return true;
      return false;
    });
    
    if (detailIndex === -1) {
      console.error("Task detail not found:", taskId, "in step:", routeStep.title);
      console.log("Available details:", routeStep.details.map((d: any) => ({ id: d.id, title: d.title })));
      setIsManuallyUpdating(false);
      return;
    }

    const detail = routeStep.details[detailIndex];
    
    // Update local state immediately for responsive UI
    setStudentRoute(prev => prev.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            taskProgress: { ...step.taskProgress, [taskId]: checked }
          } 
        : step
    ));

    try {
      // If detail has no ID, we can't save to database, but we can still update local state
      if (!detail?.id) {
        console.warn("Detail has no ID, updating local state only:", detail);
        // Local state is already updated, so we're done
        setIsManuallyUpdating(false);
        return;
      }

      // Update in database using the detail's ID
      // This marks the task as manually checked/unchecked
      await updateStepDetailChecked(routeStep.id, detailIndex, checked);
      
      console.log('✅ Task completion updated in database:', {
        stepId: routeStep.id,
        taskId: detail.id,
        checked,
        taskTitle: detail.title
      });
      
      // For "practice test within 60 days" tasks, keep the flag set longer
      // to ensure refresh doesn't overwrite the manual check
      const detailTitle = detail.title?.toLowerCase() || '';
      const isPracticeTestTask = detailTitle.includes('practice test') && detailTitle.includes('60 days');
      
      if (isPracticeTestTask) {
        // Track when this task was manually updated
        setLastPracticeTestUpdate(Date.now());
        console.log('📝 Practice test task manually updated, blocking refresh for 5 seconds');
      }
      
      const delay = isPracticeTestTask ? 5000 : 2000; // Longer delay for practice test tasks
      
      // Wait to ensure database update is complete before allowing refresh
      setTimeout(() => {
        setIsManuallyUpdating(false);
      }, delay);
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to save task status");
      // Revert the local state change on error
      setStudentRoute(prev => prev.map(step => 
        step.id === stepId 
          ? { 
              ...step, 
              taskProgress: { ...step.taskProgress, [taskId]: !checked }
            } 
          : step
      ));
      setIsManuallyUpdating(false);
    }
  };

  const updateTaskDetails = async (stepId: string, taskId: string, updates: { 
    flightHours?: number; 
    taskType?: 'flight' | 'ground'; 
    hourType?: 'ATP' | 'R-ATP Bachelors Degree' | 'R-ATP Associated Degree' 
  }) => {
    setStudentRoute(prev => prev.map(step => {
      if (step.id === stepId) {
        const fullStep = routeSteps.find(rs => rs.id === stepId);
        if (fullStep) {
          fullStep.details = fullStep.details.map(detail => {
            if (detail.id === taskId || detail.title === taskId) {
              return {
                ...detail,
                ...updates
              }
            }
            return detail
          })
        }
        return step;
      }
      return step;
    }));
  };

const formatHtmlContent = (html: string) => {
  if (!html || !html.trim()) return null;
  
    const processedHtml = html
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '<span class="font-bold text-foreground">$1</span>')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '<span class="font-bold text-foreground">$1</span>')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '<span class="underline font-semibold text-foreground">$1</span>')
      .replace(/<p[^>]*>/gi, '<div class="mb-4 text-foreground leading-relaxed">')
      .replace(/<\/p>/gi, '</div>')
      .replace(/<br\s*\/?>/gi, '<br />')
      .replace(/<ul[^>]*>/gi, '<ul class="list-disc list-inside ml-4 mb-4 space-y-2">')
      .replace(/<\/ul>/gi, '</ul>')
      .replace(/<ol[^>]*>/gi, '<ol class="list-decimal list-inside ml-4 mb-4 space-y-2">')
      .replace(/<\/ol>/gi, '</ol>')
      .replace(/<li[^>]*>/gi, '<li class="text-foreground mb-1">')
      .replace(/<\/li>/gi, '</li>')
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '<h1 class="text-2xl font-bold mb-4 text-foreground">$1</h1>')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '<h2 class="text-xl font-bold mb-3 text-foreground">$1</h2>')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '<h3 class="text-lg font-semibold mb-3 text-foreground">$1</h3>')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '<h4 class="text-base font-semibold mb-2 text-foreground">$1</h4>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
  
  return (
    <div 
      className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
};

  const getStepProgress = (step: any, fullStep: any) => {
    if (!fullStep || !fullStep.details || fullStep.details.length === 0) return 0;
    
    const completedTasks = fullStep.details.filter((detail: any) => 
      step.taskProgress[detail.id || detail.title] || false
    ).length;
    
    return (completedTasks / fullStep.details.length) * 100;
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-aviation-light/40 to-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your route builder...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-aviation-light/40 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Modern Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Compass className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                  {studentRoute.length > 0 ? "My Career Route" : "Route Builder"}
                </h1>
              </div>
              <p className="text-muted-foreground text-base ml-14">
                {studentRoute.length > 0 
                  ? "Track your progress toward your aviation career goals" 
                  : "Build your personalized path to becoming an airline pilot"}
              </p>
            </div>
            {studentRoute.length > 0 && (
              <Button 
                onClick={() => setShowWizard(true)}
                variant="default"
                size="lg"
                className="gap-2 shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                Adjust Route
              </Button>
            )}
          </div>
          
          {/* Overall Progress Bar */}
          {studentRoute.length > 0 && (() => {
            const totalTasks = studentRoute.reduce((sum, step) => {
              const fullStep = routeSteps.find(rs => rs.id === step.stepId);
              return sum + (fullStep?.details.length || 0);
            }, 0);
            const completedTasks = studentRoute.reduce((sum, step) => {
              const fullStep = routeSteps.find(rs => rs.id === step.stepId);
              if (!fullStep) return sum;
              return sum + fullStep.details.filter((detail: any) => 
                step.taskProgress[detail.id || detail.title] || false
              ).length;
            }, 0);
            const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            
            return (
              <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">Overall Progress</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                  <span>{completedTasks} of {totalTasks} tasks completed</span>
                  <span>{studentRoute.length} step{studentRoute.length !== 1 ? 's' : ''} in route</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Route Steps - Modern Card Design */}
        {studentRoute.length > 0 && (
          <div className="space-y-6">
              {[...studentRoute].sort((a, b) => a.order - b.order).map((step, index) => {
                const fullStep = routeSteps.find(rs => rs.id === step.stepId);
                if (!fullStep) return null;

                const isExpanded = expandedSteps.has(step.id);
                const stepProgress = getStepProgress(step, fullStep);
              const completedCount = fullStep.details.filter((detail: any) => 
                step.taskProgress[detail.id || detail.title] || false
              ).length;
              const totalTasks = fullStep.details.length;

                return (
                  <Card 
                    key={step.id} 
                    className="border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                  >
                    <CardContent className="p-0">
                      {/* Modern Step Header */}
                      <div 
                        className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleStepExpansion(step.id)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Progress Indicator */}
                          <div className="flex-shrink-0">
                            <div className={`relative w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
                              stepProgress === 100 
                                ? 'bg-primary/10 ring-2 ring-primary/20' 
                                : stepProgress > 0
                                ? 'bg-primary/5'
                                : 'bg-muted/50'
                            }`}>
                              {stepProgress === 100 ? (
                                <div className="flex items-center justify-center">
                                  <Check className="h-8 w-8 text-primary font-bold" />
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className="text-lg font-bold text-foreground">{Math.round(stepProgress)}%</div>
                                  <div className="text-xs text-muted-foreground">done</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Step Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    Step {index + 1}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {completedCount} / {totalTasks}
                                  </Badge>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                                  {step.title}
                                </h3>
                                {fullStep.description && !isExpanded && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {fullStep.description.replace(/<[^>]*>/g, '').substring(0, 100)}
                                    {fullStep.description.replace(/<[^>]*>/g, '').length > 100 && '...'}
                                  </p>
                                )}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="gap-1.5 shrink-0"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronDown className="h-4 w-4" />
                                    <span className="hidden sm:inline">Hide</span>
                                  </>
                                ) : (
                                  <>
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="hidden sm:inline">Show</span>
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            {/* Progress Bar */}
                            <Progress value={stepProgress} className="h-2 mt-3" />
                          </div>
                        </div>
                      </div>

                      {/* Expandable Content */}
                        {isExpanded && (
                        <div className="border-t border-border/60 bg-muted/20">
                          {/* Overview Section */}
                            {fullStep.description && fullStep.description.trim() && (
                            <div className="p-6 border-b border-border/60">
                              <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold text-base">Overview</h4>
                              </div>
                              <div className="prose prose-sm max-w-none text-muted-foreground">
                                {formatHtmlContent(fullStep.description)}
                              </div>
                            </div>
                            )}
                            
                          {/* Tasks Section */}
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <Target className="h-4 w-4 text-primary" />
                              <h4 className="font-semibold text-base">Tasks</h4>
                              <span className="text-sm text-muted-foreground">({totalTasks})</span>
                            </div>
                            
                            <div className="space-y-2">
                              {fullStep.details
                                .sort((a, b) => {
                                  if (a.taskType !== b.taskType) {
                                    if (a.taskType === 'flight') return -1;
                                    if (b.taskType === 'flight') return 1;
                                    return 0;
                                  }
                                  return (a.orderNumber || 0) - (b.orderNumber || 0);
                                })
                                .map((detail, detailIndex) => {
                                // Use a consistent key for taskProgress lookup
                                const taskKey = detail.id || detail.title;
                                
                                // Get completion status from taskProgress - respect manual user changes
                                const isCompleted = step.taskProgress[taskKey] || false;
                                
                                 // Check if this step should show dropdowns (only Medical Certification and Initial Training Preparation)
                                 const shouldShowDropdown = step.title === 'Medical Certification' || step.title === 'Initial Training Preparation';
                                 const hasDescription = detail.description && detail.description.trim() && detail.description.trim() !== '<p></p>' && detail.description.trim() !== '<p><br></p>';
                                 
                                 // All tasks in Medical Certification, Initial Training Preparation, and Cadet Programs are manually-only
                                 const isMedicalOrInitialTrainingStep = step.title === 'Medical Certification' || step.title === 'Initial Training Preparation';
                                 const isCadetProgramStep = step.category === 'Cadet Programs';
                                 
                                 return (
                                  <div 
                                    key={detail.id || `task-${detailIndex}`} 
                                    className={`rounded-lg border transition-all ${
                                      isCompleted 
                                        ? 'bg-muted/40 border-muted/60' 
                                        : 'bg-card border-border/60 hover:border-primary/30 hover:bg-muted/20'
                                    }`}
                                  >
                                    {shouldShowDropdown && hasDescription ? (
                                      <Collapsible>
                                        <div className="flex items-center gap-3 p-3">
                                          <Checkbox
                                            id={`task-${detail.id || detailIndex}`}
                                            checked={isCompleted}
                                            onCheckedChange={(checked) => {
                                              console.log('Checkbox clicked:', { stepId: step.id, taskKey, checked, detail });
                                              toggleTaskCompletion(step.id, taskKey, !!checked);
                                            }}
                                            className="shrink-0"
                                          />
                                          
                                          <label 
                                            htmlFor={`task-${detail.id || detailIndex}`}
                                            className={`flex-1 cursor-pointer text-sm ${
                                              isCompleted 
                                                ? 'line-through text-muted-foreground' 
                                                : 'text-foreground font-medium'
                                            }`}
                                          >
                                            {detail.title}
                                          </label>
                                          
                                          {/* Pie chart for tasks that require hours */}
                                          {(() => {
                                            const detailTitle = detail.title?.toLowerCase() || '';
                                            const isPracticeTestTask = detailTitle.includes('practice test') && detailTitle.includes('60 days');
                                            const is250NMTask = detailTitle.includes('250 nm') && detailTitle.includes('cross country') && 
                                                                (detailTitle.includes('instructor') || detailTitle.includes('simulated instrument')) &&
                                                                (detailTitle.includes('ifr') || detailTitle.includes('3 different') || detailTitle.includes('approaches'));
                                            const isNight100NMTask = detailTitle.includes('night') && detailTitle.includes('cross country') && detailTitle.includes('100 nm');
                                            const is150NM3PointsTask = detailTitle.includes('150 nm') && detailTitle.includes('cross country') && 
                                                                        (detailTitle.includes('3 points') || detailTitle.includes('50 nm') || detailTitle.includes('straight line'));
                                            const isControlledAirportTask = (detailTitle.includes('take off') || detailTitle.includes('takeoff') || detailTitle.includes('landing')) && 
                                                                            detailTitle.includes('controlled airport');
                                            const isDay100NMTask = detailTitle.includes('day') && detailTitle.includes('cross country') && detailTitle.includes('100 nm');
                                            const isNight100NMTask2 = detailTitle.includes('night') && detailTitle.includes('cross country') && detailTitle.includes('100 nm') && !detailTitle.includes('over');
                                            const isSoloOrPICTask = detailTitle.includes('solo') && (detailTitle.includes('instructor') || detailTitle.includes('pic duties') || detailTitle.includes('exercising'));
                                            const is300NMTask = detailTitle.includes('300 nm') && detailTitle.includes('cross country') && 
                                                                (detailTitle.includes('3 landing') || detailTitle.includes('landing points') || detailTitle.includes('250 nm'));
                                            const isNightVFRControlledTask = detailTitle.includes('night') && detailTitle.includes('vfr') && 
                                                                             (detailTitle.includes('take off') || detailTitle.includes('landing')) && 
                                                                             detailTitle.includes('controlled');
                                            const isPracticalTest2MonthsTask = detailTitle.includes('practical test') && 
                                                                                (detailTitle.includes('2 calendar months') || detailTitle.includes('2 months') || detailTitle.includes('60 days'));
                                            const isCertificateCheckRideTask = (detailTitle.includes('flight training') || detailTitle.includes('training')) && 
                                                                               detailTitle.includes('certificate') && 
                                                                               (detailTitle.includes('2 calendar months') || detailTitle.includes('2 months')) && 
                                                                               detailTitle.includes('check ride');
                                            const isManuallyOnly = isMedicalOrInitialTrainingStep || isCadetProgramStep || isPracticeTestTask || is250NMTask || isNight100NMTask || is150NM3PointsTask || isControlledAirportTask || 
                                                                   isDay100NMTask || isNight100NMTask2 || isSoloOrPICTask || is300NMTask || isNightVFRControlledTask || isPracticalTest2MonthsTask || isCertificateCheckRideTask;
                                            
                                            return (detail.flightHours || extractHours(detail.title)) && !isManuallyOnly && (
                                              <TaskProgressPieChart 
                                                {...calculateCurrentHours(detail, flights || [], aircraftMap)} 
                                              />
                                            );
                                          })()}
                                          
                                          <div className="flex items-center gap-2 shrink-0">
                                            {detail.taskType && step.category !== 'Cadet Programs' && step.category !== 'Initial Tasks' && (
                                              <Badge 
                                                variant={detail.taskType === 'flight' ? 'default' : 'secondary'}
                                                className="text-xs"
                                              >
                                                {detail.taskType === 'flight' ? (
                                                  <><Plane className="h-3 w-3 mr-1" />Flight</>
                                                ) : (
                                                  <><BookOpen className="h-3 w-3 mr-1" />Ground</>
                                                )}
                                              </Badge>
                                            )}
                                            
                                            {detail.mandatory && (
                                              <Badge variant="destructive" className="text-xs">
                                                Required
                                              </Badge>
                                            )}
                                            
                                            {isCompleted && (
                                              <Badge variant="default" className="text-xs bg-green-500/90">
                                                <Check className="h-3 w-3 mr-1" />
                                                Done
                                              </Badge>
                                            )}
                                            
                                            <CollapsibleTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 shrink-0"
                                              >
                                                <ChevronDown className="h-4 w-4" />
                                              </Button>
                                            </CollapsibleTrigger>
                                          </div>
                                        </div>
                                        
                                        <CollapsibleContent className="px-3 pb-3">
                                          <div className="pl-7 pr-3 pt-2 border-t border-border/40">
                                            <div className="prose prose-sm max-w-none text-muted-foreground">
                                              {formatHtmlContent(detail.description)}
                                            </div>
                                          </div>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    ) : (
                                      <div className="flex items-center gap-3 p-3">
                                        <Checkbox
                                          id={`task-${detail.id || detailIndex}`}
                                          checked={isCompleted}
                                          onCheckedChange={(checked) => {
                                            console.log('Checkbox clicked:', { stepId: step.id, taskKey, checked, detail });
                                            toggleTaskCompletion(step.id, taskKey, !!checked);
                                          }}
                                          className="shrink-0"
                                        />
                                        
                                        <label 
                                          htmlFor={`task-${detail.id || detailIndex}`}
                                          className={`flex-1 cursor-pointer text-sm ${
                                            isCompleted 
                                              ? 'line-through text-muted-foreground' 
                                              : 'text-foreground font-medium'
                                          }`}
                                        >
                                          {detail.title}
                                        </label>
                                        
                                        {/* Pie chart for tasks that require hours */}
                                        {/* Exclude pie chart for manually-only tasks - these cannot be auto-checked */}
                                        {(() => {
                                          const detailTitle = detail.title?.toLowerCase() || '';
                                          const isPracticeTestTask = detailTitle.includes('practice test') && detailTitle.includes('60 days');
                                          const is250NMTask = detailTitle.includes('250 nm') && detailTitle.includes('cross country') && 
                                                              (detailTitle.includes('instructor') || detailTitle.includes('simulated instrument')) &&
                                                              (detailTitle.includes('ifr') || detailTitle.includes('3 different') || detailTitle.includes('approaches'));
                                          const isNight100NMTask = detailTitle.includes('night') && detailTitle.includes('cross country') && detailTitle.includes('100 nm');
                                          const is150NM3PointsTask = detailTitle.includes('150 nm') && detailTitle.includes('cross country') && 
                                                                      (detailTitle.includes('3 points') || detailTitle.includes('50 nm') || detailTitle.includes('straight line'));
                                          const isControlledAirportTask = (detailTitle.includes('take off') || detailTitle.includes('takeoff') || detailTitle.includes('landing')) && 
                                                                          detailTitle.includes('controlled airport');
                                          const isDay100NMTask = detailTitle.includes('day') && detailTitle.includes('cross country') && detailTitle.includes('100 nm');
                                          const isNight100NMTask2 = detailTitle.includes('night') && detailTitle.includes('cross country') && detailTitle.includes('100 nm') && !detailTitle.includes('over');
                                          const isSoloOrPICTask = detailTitle.includes('solo') && (detailTitle.includes('instructor') || detailTitle.includes('pic duties') || detailTitle.includes('exercising'));
                                          const is300NMTask = detailTitle.includes('300 nm') && detailTitle.includes('cross country') && 
                                                              (detailTitle.includes('3 landing') || detailTitle.includes('landing points') || detailTitle.includes('250 nm'));
                                          const isNightVFRControlledTask = detailTitle.includes('night') && detailTitle.includes('vfr') && 
                                                                           (detailTitle.includes('take off') || detailTitle.includes('landing')) && 
                                                                           detailTitle.includes('controlled');
                                          const isPracticalTest2MonthsTask = detailTitle.includes('practical test') && 
                                                                              (detailTitle.includes('2 calendar months') || detailTitle.includes('2 months') || detailTitle.includes('60 days'));
                                          const isCertificateCheckRideTask = (detailTitle.includes('flight training') || detailTitle.includes('training')) && 
                                                                             detailTitle.includes('certificate') && 
                                                                             (detailTitle.includes('2 calendar months') || detailTitle.includes('2 months')) && 
                                                                             detailTitle.includes('check ride');
                                          const isManuallyOnly = isMedicalOrInitialTrainingStep || isCadetProgramStep || isPracticeTestTask || is250NMTask || isNight100NMTask || is150NM3PointsTask || isControlledAirportTask || 
                                                                 isDay100NMTask || isNight100NMTask2 || isSoloOrPICTask || is300NMTask || isNightVFRControlledTask || isPracticalTest2MonthsTask || isCertificateCheckRideTask;
                                          
                                          return (detail.flightHours || extractHours(detail.title)) && !isManuallyOnly && (
                                            <TaskProgressPieChart 
                                              {...calculateCurrentHours(detail, flights || [], aircraftMap)} 
                                            />
                                          );
                                        })()}
                                        
                                        <div className="flex items-center gap-2 shrink-0">
                                          {detail.taskType && step.category !== 'Cadet Programs' && step.category !== 'Initial Tasks' && (
                                            <Badge 
                                              variant={detail.taskType === 'flight' ? 'default' : 'secondary'}
                                              className="text-xs"
                                            >
                                              {detail.taskType === 'flight' ? (
                                                <><Plane className="h-3 w-3 mr-1" />Flight</>
                                              ) : (
                                                <><BookOpen className="h-3 w-3 mr-1" />Ground</>
                                              )}
                                            </Badge>
                                          )}
                                          
                                          {detail.mandatory && (
                                            <Badge variant="destructive" className="text-xs">
                                              Required
                                            </Badge>
                                          )}
                                          
                                          {isCompleted && (
                                            <Badge variant="default" className="text-xs bg-green-500/90">
                                              <Check className="h-3 w-3 mr-1" />
                                              Done
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                 );
                              })}
                            </div>
                            
                            {fullStep.details.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground bg-destructive/5 border border-destructive/20 rounded-lg">
                              <p className="font-medium text-sm">No tasks found for this step</p>
                            </div>
                            )}
                          </div>
                        </div>
                        )}
                      </CardContent>
                    </Card>
                );
              })}
          </div>
        )}

        {/* Empty State - Modern Design */}
        {studentRoute.length === 0 && (
          <Card className="border border-border/60 bg-card shadow-sm">
            <CardContent className="py-20 px-6 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
                <Compass className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-3 text-foreground">Ready to Build Your Career Route?</h3>
              <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-base leading-relaxed">
                Create your personalized path from student pilot to airline pilot with our guided route builder.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                 <Button 
                  onClick={() => setShowWizard(true)}
                  size="lg"
                  className="gap-2"
                 >
                  <Sparkles className="h-4 w-4" />
                  Start Route Builder
                 </Button>
                 <Button 
                   variant="outline"
                   size="lg"
                   onClick={async () => {
                     if (user) {
                       try {
                         const { error } = await supabase
                           .from('user_routes')
                           .delete()
                           .eq('user_id', user.id);
                         
                         if (error) {
                           toast.error('Failed to reset route');
                           return;
                         }
                         
                         setStudentRoute([]);
                         setHasCompletedWizard(false);
                         setHasCheckedForExistingRoute(false);
                         setShowWizard(true);
                         toast.success('Route reset successfully');
                       } catch (error) {
                         toast.error('Failed to reset route');
                       }
                     }
                   }}
                 >
                  Reset & Start Over
                 </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Route Wizard */}
        <RouteWizard
          isOpen={showWizard}
          onClose={async () => {
            setShowWizard(false);
            setHasCompletedWizard(true);
          }}
          onStepAdd={async (stepId: string, wizardStepKey?: string) => {
            await addStepToRoute(stepId, true, wizardStepKey); // Suppress toast notifications from wizard
          }}
          onStepRemove={async (stepId: string) => {
            await removeStepFromRoute(stepId);
          }}
          availableSteps={routeSteps}
          currentUserRoute={studentRoute}
        />
      </main>
    </div>
  );
}
