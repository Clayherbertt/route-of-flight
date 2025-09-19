import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRouteSteps } from "@/hooks/useRouteSteps";
import { StudentRouteStepCard } from "@/components/StudentRouteStepCard";
import { RouteWizard } from "@/components/RouteWizard";
import { Route3DTimeline } from "@/components/3d/Route3DTimeline";
import { Route3DModal } from "@/components/3d/Route3DModal";
import { supabase } from "@/integrations/supabase/client";
import { CircularProgress } from "@/components/CircularProgress";
import { Check, Lock, AlertCircle, Target, Plane, Compass, View, Box } from "lucide-react";
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
  const [is3DView, setIs3DView] = useState(false);
  const [activeStep3D, setActiveStep3D] = useState<string | null>(null);

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
        {/* View Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium">Career Route Builder</span>
          </div>
          
          {studentRoute.length > 0 && (
            <div className="flex items-center gap-3">
              <View className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">2D View</span>
              <Switch
                checked={is3DView}
                onCheckedChange={setIs3DView}
              />
              <span className="text-sm text-muted-foreground">3D View</span>
              <Box className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* 3D View */}
        {is3DView && studentRoute.length > 0 ? (
          <Route3DTimeline
            studentRoute={studentRoute}
            routeSteps={routeSteps}
            onWaypointClick={setActiveStep3D}
            activeStep={activeStep3D || undefined}
          />
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
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
                    variant="default"
                    size="lg"
                    className="gap-2"
                  >
                    <Compass className="h-5 w-5" />
                    Adjust Flight Route
                  </Button>
                </div>
              )}
            </div>

            {/* 2D Route Display */}
            {studentRoute.length > 0 && (
              <div className="max-w-6xl mx-auto">
                <div className="space-y-6">
                  {studentRoute.map((step, index) => {
                    const fullStep = routeSteps.find(rs => rs.id === step.stepId);
                    if (!fullStep) return null;

                    const isExpanded = expandedSteps.has(step.id);
                    const stepProgress = getStepProgress(step, fullStep);

                    return (
                      <div key={step.id} className="relative">
                        <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                  {step.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {fullStep.description?.replace(/<[^>]*>/g, '')}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 ml-6">
                                <CircularProgress 
                                  progress={stepProgress}
                                  size={48}
                                  strokeWidth={4}
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => toggleStepExpansion(step.id)}
                                >
                                  {isExpanded ? 'Collapse' : 'Expand'}
                                </Button>
                              </div>
                            </div>

                            {/* Expandable Content */}
                            {isExpanded && (
                              <div className="mt-6 border-t pt-6">
                                {/* Show main step description if it exists and has content */}
                                {fullStep.description && fullStep.description.trim() && (
                                  <div className="mb-6">
                                    <h4 className="font-semibold mb-3 text-lg">Overview</h4>
                                    <div className="prose prose-sm max-w-none">
                                      {formatHtmlContent(fullStep.description)}
                                    </div>
                                  </div>
                                )}
                                
                                <h4 className="font-semibold mb-4 text-lg">Detailed Information ({fullStep.details.length})</h4>
                                <div className="space-y-6">
                                  {fullStep.details.map((detail, detailIndex) => {
                                    const isCompleted = step.taskProgress[detail.id || detail.title] || false;
                                    
                                    return (
                                      <div key={detail.id || detailIndex} className={`border rounded-lg transition-all duration-300 ${
                                        isCompleted ? 'bg-muted/20 opacity-75 border-muted' : 'bg-card border-border shadow-sm'
                                      }`}>
                                        {/* Task Header */}
                                        <div className="flex items-start space-x-3 p-4 border-b border-border/50">
                                          <Checkbox
                                            id={`task-${detail.id || detailIndex}`}
                                            checked={isCompleted}
                                            onCheckedChange={(checked) => toggleTaskCompletion(step.id, detail.id || detail.title, !!checked)}
                                            className="mt-1"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-3">
                                              <label 
                                                htmlFor={`task-${detail.id || detailIndex}`}
                                                className={`font-semibold cursor-pointer transition-all duration-300 text-lg ${
                                                  isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                                                }`}
                                              >
                                                {detail.title}
                                              </label>
                                              <div className="flex gap-2 flex-shrink-0">
                                                {detail.flightHours && (
                                                  <Badge variant="outline" className="text-xs">
                                                    {detail.flightHours}h
                                                  </Badge>
                                                )}
                                                {step.category !== 'Initial Tasks' && (
                                                  <Badge 
                                                    variant={detail.taskType === 'flight' ? 'default' : 'secondary'} 
                                                    className="text-xs"
                                                  >
                                                    {detail.taskType || 'ground'}
                                                  </Badge>
                                                )}
                                                {detail.mandatory && (
                                                  <Badge variant="destructive" className="text-xs">
                                                    Required
                                                  </Badge>
                                                )}
                                                {isCompleted && (
                                                  <Badge variant="default" className="text-xs bg-green-500">
                                                    ✓ Complete
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {fullStep.details.length === 0 && (
                                  <div className="text-center py-8 text-muted-foreground bg-red-50 border border-red-200 rounded">
                                    <p>⚠️ No route step details found in database</p>
                                    <p className="text-xs mt-2">Step ID: {fullStep.id}</p>
                                    <p className="text-xs">Check admin panel for step details</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        
                        {/* Arrow connector */}
                        {index < studentRoute.length - 1 && (
                          <div className="flex justify-center py-4">
                            <div className="w-0.5 h-8 bg-border"></div>
                            <div className="absolute w-2 h-2 bg-border rounded-full mt-3 -ml-1"></div>
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
          </>
        )}

        {/* 3D Modal */}
        <Route3DModal
          isOpen={!!activeStep3D}
          onClose={() => setActiveStep3D(null)}
          step={activeStep3D ? studentRoute.find(s => s.id === activeStep3D) || null : null}
          fullStep={activeStep3D ? routeSteps.find(rs => rs.id === studentRoute.find(s => s.id === activeStep3D)?.stepId) : null}
          onTaskToggle={toggleTaskCompletion}
        />

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