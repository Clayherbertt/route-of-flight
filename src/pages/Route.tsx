import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRouteSteps } from "@/hooks/useRouteSteps";
import { StudentRouteStepCard } from "@/components/StudentRouteStepCard";
import { RouteWizard } from "@/components/RouteWizard";
import { supabase } from "@/integrations/supabase/client";
import { CircularProgress } from "@/components/CircularProgress";
import { Check, Lock, AlertCircle, Target, Plane, Compass, ChevronDown, ChevronRight } from "lucide-react";
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

  // Fetch flight log data for progress tracking
  useEffect(() => {
    if (!user) return;

    const fetchFlightLogData = async () => {
      try {
        setLoadingFlightLog(true);
        const pageSize = 1000;
        let from = 0;
        let collected: any[] = [];

        while (true) {
          const { data, error } = await supabase
            .from('flight_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .range(from, from + pageSize - 1);

          if (error) throw error;

          if (!data || data.length === 0) {
            break;
          }

          collected = [...collected, ...data];

          if (data.length < pageSize) {
            break;
          }

          from += pageSize;
        }

        // Calculate totals
        const totals = collected.reduce((acc, flight) => {
          const nightTime = Number(flight.night_time) || 0;
          const crossCountryTime = Number(flight.cross_country_time) || 0;
          const dualReceived = Number(flight.dual_received) || 0;
          const simulatedInstrumentValue = Number(flight.simulated_instrument) || 0;
          
          // Calculate night dual received: sum all dual_received hours for flights that also have night time
          // This counts all dual instruction received during flights that include night time
          const nightDualReceived = (nightTime > 0 && dualReceived > 0) 
            ? dualReceived // Count all dual received hours for flights with night time
            : 0;

          // Calculate cross-country dual received: sum all dual_received hours for flights that also have cross-country time
          // This counts all dual instruction received during flights that include cross-country time
          const crossCountryDualReceived = (crossCountryTime > 0 && dualReceived > 0) 
            ? dualReceived // Count all dual received hours for flights with cross-country time
            : 0;

          return {
            totalHours: acc.totalHours + (Number(flight.total_time) || 0),
            picHours: acc.picHours + (Number(flight.pic_time) || 0),
            nightHours: acc.nightHours + nightTime,
            crossCountryHours: acc.crossCountryHours + crossCountryTime,
            instrumentHours: acc.instrumentHours + (Number(flight.instrument_time) || 0),
            simulatedInstrument: acc.simulatedInstrument + simulatedInstrumentValue,
            soloHours: acc.soloHours + (Number(flight.solo_time) || 0),
            sicHours: acc.sicHours + (Number(flight.sic_time) || 0),
            dualReceived: acc.dualReceived + dualReceived,
            dualGiven: acc.dualGiven + (Number(flight.dual_given) || 0),
            nightDualReceived: acc.nightDualReceived + nightDualReceived,
            crossCountryDualReceived: acc.crossCountryDualReceived + crossCountryDualReceived,
          };
        }, {
          totalHours: 0,
          picHours: 0,
          nightHours: 0,
          crossCountryHours: 0,
          instrumentHours: 0,
          simulatedInstrument: 0,
          soloHours: 0,
          sicHours: 0,
          dualReceived: 0,
          dualGiven: 0,
          nightDualReceived: 0,
          crossCountryDualReceived: 0,
        });

        // Debug: Log simulated instrument calculation
        console.log('🔍 Route.tsx - Simulated Instrument Calculation:');
        console.log(`  Total flights fetched: ${collected.length}`);
        console.log(`  Total simulated instrument hours: ${totals.simulatedInstrument}`);
        console.log(`  Sample flights with sim instrument:`, collected
          .filter(f => (Number(f.simulated_instrument) || 0) > 0)
          .slice(0, 5)
          .map(f => ({ date: f.date, simulated_instrument: f.simulated_instrument })));

        setFlightLogData(totals);
      } catch (error) {
        console.error('Error fetching flight log data:', error);
      } finally {
        setLoadingFlightLog(false);
      }
    };

    fetchFlightLogData();
  }, [user]);
  const [studentRoute, setStudentRoute] = useState<StudentRoute[]>([]);
  const [phases, setPhases] = useState<RoutePhase[]>(ROUTE_PHASES);
  const [activePhase, setActivePhase] = useState("initial-tasks");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  const [hasCompletedWizard, setHasCompletedWizard] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [hasCheckedForExistingRoute, setHasCheckedForExistingRoute] = useState(false);
  const [flightLogData, setFlightLogData] = useState<{
    totalHours: number;
    picHours: number;
    nightHours: number;
    crossCountryHours: number;
    instrumentHours: number;
    simulatedInstrument: number;
    soloHours: number;
    sicHours: number;
    dualReceived: number;
    dualGiven: number;
    nightDualReceived: number; // Night hours where dual received > 0
    crossCountryDualReceived: number; // Cross-country hours where dual received > 0
  }>({
    totalHours: 0,
    picHours: 0,
    nightHours: 0,
    crossCountryHours: 0,
    instrumentHours: 0,
    simulatedInstrument: 0,
    soloHours: 0,
    sicHours: 0,
    dualReceived: 0,
    dualGiven: 0,
    nightDualReceived: 0,
    crossCountryDualReceived: 0,
  });
  const [loadingFlightLog, setLoadingFlightLog] = useState(true);

  // Load existing user route on component mount
  useEffect(() => {
    if (!user) return;
    
    const loadUserRoute = async () => {
      console.log('🔄 Loading user route for user:', user.id);
      try {
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

        if (userRoutes && userRoutes.length > 0) {
          // User has completed the wizard before
          console.log('✅ User has existing route, setting hasCompletedWizard to true');
          setHasCompletedWizard(true);
          
          // Convert database records to StudentRoute format
          const loadedRoute: StudentRoute[] = [];
          
          for (const userRoute of userRoutes) {
            const step = routeSteps.find(s => s.id === userRoute.route_step_id);
            if (step) {
              // Load task progress from database
              console.log('📊 Loading step details for step:', step.title, step.details.map(d => ({ id: d.id, title: d.title, checked: d.checked })));
              const taskProgress: Record<string, boolean> = {};
              step.details.forEach(detail => {
                if (detail.id) {
                  taskProgress[detail.id] = detail.checked;
                  console.log(`🔍 Setting taskProgress[${detail.id}] = ${detail.checked}`);
                }
              });

              loadedRoute.push({
                id: `${step.id}-${userRoute.created_at}`,
                stepId: step.id,
                title: step.title,
                category: step.category,
                icon: step.icon,
                completed: userRoute.completed,
                order: userRoute.order_number,
                taskProgress
              });
            } else {
              console.warn('⚠️ Step not found for route:', userRoute.route_step_id);
            }
          }
          
          console.log('🎯 Setting loaded route to state:', loadedRoute);
          setStudentRoute(loadedRoute);
        } else {
          console.log('📝 No existing user routes found');
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

  // Show wizard only if user has never completed it (no records in user_routes)
  useEffect(() => {
    if (!loading && hasCheckedForExistingRoute && !hasCompletedWizard) {
      console.log('🧙 Showing wizard - user has never completed wizard');
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

  const addStepToRoute = async (stepId: string) => {
    console.log('🔍 addStepToRoute called with stepId:', stepId);
    const step = routeSteps.find(s => s.id === stepId);
    if (!step) {
      console.error('❌ Step not found:', stepId);
      return;
    }

    // Check if step already exists in route
    const existingStep = studentRoute.find(s => s.stepId === stepId);
    if (existingStep) {
      console.log('⚠️ Step already exists in route:', step.title);
      toast.error(`${step.title} is already in your route`);
      return;
    }

    // Initialize task progress from database state
    const taskProgress: Record<string, boolean> = {};
    step.details.forEach(detail => {
      if (detail.id) {
        taskProgress[detail.id] = detail.checked;
      }
    });

    const newStep: StudentRoute = {
      id: `${step.id}-${Date.now()}`,
      stepId: step.id,
      title: step.title,
      category: step.category,
      icon: step.icon,
      completed: false,
      order: studentRoute.length,
      taskProgress
    };

    // Save to database if user is authenticated
    if (user) {
      console.log('💾 Saving step to database for user:', user.id);
      try {
        const { error } = await supabase
          .from('user_routes')
          .insert({
            user_id: user.id,
            route_step_id: step.id,
            step_category: step.category,
            wizard_step_key: 'manual', // This is for manual additions
            order_number: studentRoute.length,
            completed: false
          });

        if (error) {
          console.error('❌ Database save error:', error);
          toast.error('Failed to save step. Please try again.');
          return;
        }
        console.log('✅ Successfully saved step to database');
      } catch (error) {
        console.error('❌ Database save exception:', error);
        toast.error('Failed to save step. Please try again.');
        return;
      }
    } else {
      console.warn('⚠️ No user authenticated, cannot save to database');
    }

    setStudentRoute(prev => [...prev, newStep]);
    console.log('✅ Step added to local state:', step.title);
    toast.success(`Added ${step.title} to your route`);
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

  const removeStepFromRoute = (stepId: string) => {
    setStudentRoute(prev => prev.filter(step => step.id !== stepId));
    toast.success("Step removed from your route");
  };

  const toggleStepCompletion = (stepId: string) => {
    setStudentRoute(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ));
  };

  const toggleTaskCompletion = async (stepId: string, taskId: string, checked: boolean) => {
    // Update local state immediately for responsive UI
    setStudentRoute(prev => prev.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            taskProgress: { ...step.taskProgress, [taskId]: checked }
          } 
        : step
    ));

    // Persist to database - find the route step and detail by taskId
    try {
      // Find the route step that contains this student route step
      const studentStep = studentRoute.find(ss => ss.id === stepId);
      console.log('🔍 Student step found:', studentStep);
      
      const routeStep = routeSteps.find(rs => rs.id === studentStep?.stepId);
      console.log('🔍 Route step found:', routeStep);
      
      if (routeStep) {
        const detailIndex = routeStep.details.findIndex(detail => detail.id === taskId);
        console.log('🔍 Detail index for taskId:', taskId, 'is:', detailIndex);
        console.log('🔍 Route step details:', routeStep.details.map(d => ({ id: d.id, title: d.title, checked: d.checked })));
        
        if (detailIndex !== -1) {
          console.log('🚀 Calling updateStepDetailChecked with:', { stepId: routeStep.id, detailIndex, checked });
          await updateStepDetailChecked(routeStep.id, detailIndex, checked);
          toast.success(checked ? "Task completed!" : "Task unchecked");
        } else {
          console.warn('❌ Detail not found for taskId:', taskId);
        }
      } else {
        console.warn('❌ Route step not found for student step:', studentStep?.stepId);
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to save task status");
      // Revert local state on error
      setStudentRoute(prev => prev.map(step => 
        step.id === stepId 
          ? { 
              ...step, 
              taskProgress: { ...step.taskProgress, [taskId]: !checked }
            } 
          : step
      ));
    }
  };

  const updateTaskDetails = async (stepId: string, taskId: string, updates: { 
    flightHours?: number; 
    taskType?: 'flight' | 'ground'; 
    hourType?: 'ATP' | 'R-ATP Bachelors Degree' | 'R-ATP Associated Degree' 
  }) => {
    // Update local state immediately for better UX - this affects the displayed data
    setStudentRoute(prev => prev.map(step => {
      if (step.id === stepId) {
        // Find and update the step details in the full route step data
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
    
    // You could add server sync here if needed in the future
  };

// Enhanced utility function to convert HTML to formatted JSX
const formatHtmlContent = (html: string) => {
  if (!html || !html.trim()) return null;
  
  // Create a more comprehensive HTML parser
  const createElementFromHtml = (htmlString: string) => {
    // Handle common HTML elements with proper styling
    const processedHtml = htmlString
      // Handle strong/bold tags
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '<span class="font-bold text-foreground">$1</span>')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '<span class="font-bold text-foreground">$1</span>')
      // Handle underline tags
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '<span class="underline font-semibold text-foreground">$1</span>')
      // Handle paragraphs
      .replace(/<p[^>]*>/gi, '<div class="mb-4 text-foreground leading-relaxed">')
      .replace(/<\/p>/gi, '</div>')
      // Handle line breaks
      .replace(/<br\s*\/?>/gi, '<br />')
      // Handle unordered lists
      .replace(/<ul[^>]*>/gi, '<ul class="list-disc list-inside ml-4 mb-4 space-y-2">')
      .replace(/<\/ul>/gi, '</ul>')
      // Handle ordered lists
      .replace(/<ol[^>]*>/gi, '<ol class="list-decimal list-inside ml-4 mb-4 space-y-2">')
      .replace(/<\/ol>/gi, '</ol>')
      // Handle list items
      .replace(/<li[^>]*>/gi, '<li class="text-foreground mb-1">')
      .replace(/<\/li>/gi, '</li>')
      // Handle headings
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '<h1 class="text-2xl font-bold mb-4 text-foreground">$1</h1>')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '<h2 class="text-xl font-bold mb-3 text-foreground">$1</h2>')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '<h3 class="text-lg font-semibold mb-3 text-foreground">$1</h3>')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '<h4 class="text-base font-semibold mb-2 text-foreground">$1</h4>')
      // Handle non-breaking spaces
      .replace(/&nbsp;/g, ' ')
      // Handle other common entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
    
    return processedHtml;
  };
  
  const processedContent = createElementFromHtml(html);
  
  return (
    <div 
      className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
      dangerouslySetInnerHTML={{ __html: processedContent }}
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

  // Parse requirement from task title (e.g., "40 hours total time" -> { hours: 40, type: "totalHours" })
  const parseTaskRequirement = (title: string): { hours: number; type: string | null } | null => {
    const hourMatch = title.match(/(\d+(?:\.\d+)?)\s*hours?\s+(?:of\s+)?(total\s+time|pic|night|cross\s+country|instrument|solo|sic|flight\s+training|simulated\s+instrument|dual|instruction|instructor)?/i);
    if (!hourMatch) return null;

    const hours = parseFloat(hourMatch[1]);
    const typeText = hourMatch[2]?.toLowerCase() || '';
    const titleLower = title.toLowerCase();

    let type: string | null = null;
    
    // Check for cross-country + dual training (most specific combination after night+dual)
    if (titleLower.includes('cross country') || titleLower.includes('cross-country')) {
      if (titleLower.includes('flight training') || titleLower.includes('instructor') || titleLower.includes('dual') || titleLower.includes('dual received')) {
        type = 'crossCountryDualReceived';
      } else {
        type = 'crossCountryHours';
      }
    }
    // Check for night + dual training (most specific combination)
    else if (titleLower.includes('night') && (titleLower.includes('flight training') || titleLower.includes('instructor') || titleLower.includes('dual'))) {
      type = 'nightDualReceived';
    } else if (titleLower.includes('with an instructor') || 
        titleLower.includes('with instructor') || 
        titleLower.includes('dual instruction') ||
        titleLower.includes('dual received') ||
        (titleLower.includes('flight training') && (titleLower.includes('instructor') || titleLower.includes('dual')))) {
      type = 'dualReceived';
    } else if (titleLower.includes('dual given') || titleLower.includes('instruction given')) {
      type = 'dualGiven';
    } else if (typeText.includes('total time') || (typeText === '' && titleLower.includes('total time'))) {
      type = 'totalHours';
    } else if (typeText.includes('pic')) {
      type = 'picHours';
    } else if (typeText.includes('night')) {
      type = 'nightHours';
    } else if (titleLower.includes('simulated instrument') || (typeText.includes('simulated') && typeText.includes('instrument'))) {
      type = 'simulatedInstrument';
    } else if (typeText.includes('instrument') && !typeText.includes('simulated')) {
      type = 'instrumentHours';
    } else if (typeText.includes('solo')) {
      type = 'soloHours';
    } else if (typeText.includes('sic')) {
      type = 'sicHours';
    } else if (typeText.includes('flight training') || typeText.includes('flight')) {
      type = 'totalHours'; // Default to total time for generic flight training
    }

    return { hours, type };
  };

  // Check if task requirement is met based on flight log
  const isTaskRequirementMet = (detail: any): boolean => {
    const requirement = parseTaskRequirement(detail.title);
    if (!requirement || !requirement.type) return false;

    const currentHours = flightLogData[requirement.type as keyof typeof flightLogData] || 0;
    return currentHours >= requirement.hours;
  };

  // Get progress for a task requirement
  const getTaskProgress = (detail: any): { current: number; required: number; percentage: number } => {
    const requirement = parseTaskRequirement(detail.title);
    if (!requirement || !requirement.type) {
      return { current: 0, required: 0, percentage: 0 };
    }

    const currentHours = flightLogData[requirement.type as keyof typeof flightLogData] || 0;
    const percentage = Math.min((currentHours / requirement.hours) * 100, 100);

    return {
      current: currentHours,
      required: requirement.hours,
      percentage,
    };
  };

  // Auto-check tasks when requirements are met
  useEffect(() => {
    if (loadingFlightLog || !user || studentRoute.length === 0 || routeSteps.length === 0) return;

    const checkAndUpdate = async () => {
      for (const step of studentRoute) {
        const fullStep = routeSteps.find(rs => rs.id === step.stepId);
        if (!fullStep) continue;

        for (const detail of fullStep.details) {
          const taskId = detail.id || detail.title;
          const isCurrentlyChecked = step.taskProgress[taskId] || false;
          const isRequirementMet = isTaskRequirementMet(detail);

          // Auto-check if requirement is met and not already checked
          if (isRequirementMet && !isCurrentlyChecked) {
            await toggleTaskCompletion(step.id, taskId, true);
          }
        }
      }
    };

    checkAndUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightLogData.totalHours, flightLogData.picHours, flightLogData.nightHours, flightLogData.crossCountryHours, flightLogData.instrumentHours, flightLogData.simulatedInstrument, flightLogData.dualReceived, flightLogData.dualGiven, flightLogData.nightDualReceived, flightLogData.crossCountryDualReceived, loadingFlightLog]);

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

  const getUniqueCategories = () => {
    const categories = [...new Set(routeSteps.map(step => step.category))];
    return ["all", ...categories];
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium">Career Route Builder</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {studentRoute.length > 0 ? "My Route" : "Build Your Airline Career Path"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {studentRoute.length > 0 
              ? "Track your progress and stay on course to achieve your aviation career goals." 
              : "Create your personalized journey to becoming an airline pilot. Select training steps, track your progress, and follow a proven path to the cockpit."
            }
          </p>
          
          {/* Adjust Route Button for existing routes */}
          {studentRoute.length > 0 && (
            <div className="flex justify-center mb-8">
              <Button 
                onClick={() => setShowWizard(true)}
                variant="aviation"
                size="lg"
                className="gap-2"
              >
                <Compass className="h-5 w-5" />
                Adjust Flight Route
              </Button>
            </div>
          )}
        </div>

        {/* Modern Route Display */}
        {studentRoute.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <div className="space-y-4">
              {studentRoute.map((step, index) => {
                const fullStep = routeSteps.find(rs => rs.id === step.stepId);
                if (!fullStep) return null;

                const isExpanded = expandedSteps.has(step.id);
                const stepProgress = getStepProgress(step, fullStep);
                const completedTasks = fullStep.details.filter((detail: any) => 
                  step.taskProgress[detail.id || detail.title] || false
                ).length;
                const totalTasks = fullStep.details.length;

                return (
                  <div key={step.id} className="relative group">
                    {/* Main Step Card */}
                    <Card className={`border-2 transition-all duration-300 hover:shadow-lg ${
                      isExpanded 
                        ? 'border-primary/50 shadow-lg bg-gradient-to-br from-primary/5 to-transparent' 
                        : 'border-border/50 hover:border-primary/30'
                    } ${stepProgress === 100 ? 'ring-2 ring-green-500/20' : ''}`}>
                      <CardContent className="p-0">
                        {/* Step Header */}
                        <div 
                          className="p-6 cursor-pointer"
                          onClick={() => toggleStepExpansion(step.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              {/* Step Number Badge */}
                              <div className="flex-shrink-0">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                                  stepProgress === 100
                                    ? 'bg-green-500 text-white'
                                    : stepProgress > 0
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {stepProgress === 100 ? (
                                    <Check className="h-6 w-6" />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                              </div>

                              {/* Step Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className={`text-xl font-bold transition-colors ${
                                    stepProgress === 100 ? 'text-green-600 dark:text-green-400' : 'text-foreground'
                                  }`}>
                                    {step.title}
                                  </h3>
                                  {stepProgress === 100 && (
                                    <Badge className="bg-green-500 hover:bg-green-600">
                                      <Check className="h-3 w-3 mr-1" />
                                      Complete
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {fullStep.description?.replace(/<[^>]*>/g, '').substring(0, 150)}
                                  {fullStep.description && fullStep.description.length > 150 && '...'}
                                </p>
                                
                                {/* Progress Bar */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                      {completedTasks} of {totalTasks} tasks completed
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {Math.round(stepProgress)}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={stepProgress} 
                                    className="h-2"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Expand/Collapse Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0 h-10 w-10 rounded-lg hover:bg-primary/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStepExpansion(step.id);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Expandable Content */}
                        {isExpanded && (
                          <div className="border-t bg-muted/30">
                            <div className="p-6 space-y-6">
                              {/* Overview Section */}
                              {fullStep.description && fullStep.description.trim() && (
                                <div className="bg-card rounded-lg p-4 border border-border/50">
                                  <h4 className="font-semibold mb-3 text-base flex items-center gap-2">
                                    <Compass className="h-4 w-4 text-primary" />
                                    Overview
                                  </h4>
                                  <div className="prose prose-sm max-w-none text-foreground">
                                    {formatHtmlContent(fullStep.description)}
                                  </div>
                                </div>
                              )}
                              
                              {/* Tasks Section */}
                              <div>
                                <h4 className="font-semibold mb-4 text-base flex items-center gap-2">
                                  <Target className="h-4 w-4 text-primary" />
                                  Tasks & Requirements ({totalTasks})
                                </h4>
                                <div className="space-y-3">
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
                                    const isCompleted = step.taskProgress[detail.id || detail.title] || false;
                                    const taskId = detail.id || `${step.id}-${detailIndex}`;
                                    const requirement = parseTaskRequirement(detail.title);
                                    const taskProgress = requirement ? getTaskProgress(detail) : null;
                                    const isRequirementMet = requirement ? isTaskRequirementMet(detail) : false;
                                    
                                    return (
                                      <div 
                                        key={taskId}
                                        className={`group/task rounded-lg border transition-all duration-200 ${
                                          isCompleted || isRequirementMet
                                            ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30' 
                                            : 'bg-card border-border hover:border-primary/30 hover:shadow-sm'
                                        }`}
                                      >
                                        {/* Task Header */}
                                        <div className="p-4">
                                          <div className="flex items-start gap-3">
                                            <Checkbox
                                              id={`task-${taskId}`}
                                              checked={isCompleted || isRequirementMet}
                                              onCheckedChange={(checked) => toggleTaskCompletion(step.id, detail.id || detail.title, !!checked)}
                                              className="mt-1 flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-start justify-between gap-3 mb-2">
                                                <label 
                                                  htmlFor={`task-${taskId}`}
                                                  className={`flex-1 cursor-pointer font-medium text-base transition-all ${
                                                    isCompleted || isRequirementMet
                                                      ? 'line-through text-muted-foreground' 
                                                      : 'text-foreground'
                                                  }`}
                                                >
                                                  {detail.title}
                                                </label>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                  {/* Flight Hours */}
                                                  {(detail.flightHours || step.category === 'Flight Instructing') && (
                                                    <Popover>
                                                      <PopoverTrigger asChild>
                                                        <Button 
                                                          variant="outline" 
                                                          size="sm" 
                                                          className="h-7 text-xs px-2"
                                                          onClick={(e) => e.stopPropagation()}
                                                        >
                                                          {detail.flightHours || 0}h
                                                        </Button>
                                                      </PopoverTrigger>
                                                      <PopoverContent className="w-64" onClick={(e) => e.stopPropagation()}>
                                                        <div className="space-y-3">
                                                          <Label className="text-sm font-medium">Flight Hours</Label>
                                                          <Input
                                                            type="number"
                                                            placeholder="Enter hours"
                                                            value={detail.flightHours || ''}
                                                            onChange={(e) => {
                                                              const hours = parseFloat(e.target.value) || 0
                                                              updateTaskDetails(step.id!, detail.id || detail.title, { flightHours: hours })
                                                            }}
                                                          />
                                                          {step.category === 'Flight Instructing' && (
                                                            <>
                                                              <Label className="text-sm font-medium">Hour Type</Label>
                                                              <Select 
                                                                value={(detail as any).hourType || 'ATP'} 
                                                                onValueChange={(value) => updateTaskDetails(step.id!, detail.id || detail.title, { 
                                                                  hourType: value as 'ATP' | 'R-ATP Bachelors Degree' | 'R-ATP Associated Degree' 
                                                                })}
                                                              >
                                                                <SelectTrigger>
                                                                  <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                  <SelectItem value="ATP">ATP</SelectItem>
                                                                  <SelectItem value="R-ATP Bachelors Degree">R-ATP Bachelors Degree</SelectItem>
                                                                  <SelectItem value="R-ATP Associated Degree">R-ATP Associated Degree</SelectItem>
                                                                </SelectContent>
                                                              </Select>
                                                            </>
                                                          )}
                                                        </div>
                                                      </PopoverContent>
                                                    </Popover>
                                                  )}
                                                  
                                                  {/* Task Type */}
                                                  {step.category !== 'Initial Tasks' && (
                                                    <Badge 
                                                      variant={detail.taskType === 'flight' ? 'default' : 'secondary'} 
                                                      className="text-xs"
                                                    >
                                                      {detail.taskType || 'ground'}
                                                    </Badge>
                                                  )}
                                                  
                                                  {/* Required Badge */}
                                                  {detail.mandatory && (
                                                    <Badge variant="destructive" className="text-xs">
                                                      Required
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              {/* Progress Pie Chart for Flight Log Requirements */}
                                              {requirement && requirement.type && taskProgress && (
                                                <div className="mt-3 flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                                                  <CircularProgress 
                                                    progress={taskProgress.percentage}
                                                    size={56}
                                                    strokeWidth={5}
                                                  />
                                                  <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                      <span className="text-sm font-medium text-foreground">
                                                        {taskProgress.current.toFixed(1)} / {taskProgress.required} hrs
                                                      </span>
                                                      <span className="text-xs text-muted-foreground">
                                                        {Math.round(taskProgress.percentage)}%
                                                      </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                      {taskProgress.required - taskProgress.current > 0 
                                                        ? `${(taskProgress.required - taskProgress.current).toFixed(1)} hours remaining`
                                                        : 'Requirement met! ✓'
                                                      }
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {fullStep.details.length === 0 && (
                                  <div className="text-center py-8 text-muted-foreground bg-destructive/10 border border-destructive/20 rounded-lg">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                                    <p className="font-medium">No tasks found</p>
                                    <p className="text-xs mt-1">Step ID: {fullStep.id}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Connector Line */}
                    {index < studentRoute.length - 1 && (
                      <div className="flex justify-center py-2">
                        <div className="w-0.5 h-6 bg-gradient-to-b from-primary/40 to-primary/20"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {studentRoute.length === 0 && (
          <div className="mt-12">
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Compass className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">Ready to Build Your Flight Career Route?</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Let our guided wizard help you create a personalized path from student pilot to airline pilot.
                </p>
                <div className="space-y-3">
                 <Button 
                   onClick={() => {
                     setShowWizard(true);
                   }}
                   className="gap-2"
                 >
                     <Compass className="h-4 w-4" />
                     Start Route Builder Wizard
                   </Button>
                 <Button 
                   variant="outline"
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
                   className="gap-2"
                 >
                     Reset Route & Start Over
                   </Button>
                  <p className="text-xs text-muted-foreground">
                    Or manually add steps from the categories above
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Route Wizard */}
        <RouteWizard
          isOpen={showWizard}
          onClose={async () => {
            setShowWizard(false);
            setHasCompletedWizard(true);
          }}
          onStepAdd={async (stepId: string) => {
            await addStepToRoute(stepId);
          }}
          availableSteps={routeSteps}
        />
      </main>
    </div>
  );
}