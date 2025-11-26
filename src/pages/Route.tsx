import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRouteSteps } from "@/hooks/useRouteSteps";
import { RouteWizard } from "@/components/RouteWizard";
import { supabase } from "@/integrations/supabase/client";
import { CircularProgress } from "@/components/CircularProgress";
import { Check, Target, Compass, ChevronDown, ChevronRight, Clock, Plane, BookOpen } from "lucide-react";
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
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [hasCheckedForExistingRoute, setHasCheckedForExistingRoute] = useState(false);

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
          console.log('✅ User has existing route, setting hasCompletedWizard to true');
          setHasCompletedWizard(true);
          
          const loadedRoute: StudentRoute[] = [];
          
          for (const userRoute of userRoutes) {
            const step = routeSteps.find(s => s.id === userRoute.route_step_id);
            if (step) {
              const taskProgress: Record<string, boolean> = {};
              step.details.forEach(detail => {
                if (detail.id) {
                  taskProgress[detail.id] = detail.checked;
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
            }
          }
          
          setStudentRoute(loadedRoute);
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

  const addStepToRoute = async (stepId: string) => {
    const step = routeSteps.find(s => s.id === stepId);
    if (!step) {
      console.error('❌ Step not found:', stepId);
      return;
    }

    const existingStep = studentRoute.find(s => s.stepId === stepId);
    if (existingStep) {
      toast.error(`${step.title} is already in your route`);
      return;
    }

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

    if (user) {
      try {
        const { error } = await supabase
          .from('user_routes')
          .insert({
            user_id: user.id,
            route_step_id: step.id,
            step_category: step.category,
            wizard_step_key: 'manual',
            order_number: studentRoute.length,
            completed: false
          });

        if (error) throw error;

        setStudentRoute(prev => [...prev, newStep]);
        toast.success(`${step.title} added to your route`);
      } catch (error) {
        console.error('Error adding step:', error);
        toast.error('Failed to add step to route');
      }
    } else {
    setStudentRoute(prev => [...prev, newStep]);
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
    setStudentRoute(prev => prev.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            taskProgress: { ...step.taskProgress, [taskId]: checked }
          } 
        : step
    ));

    try {
      const studentStep = studentRoute.find(ss => ss.id === stepId);
      const routeStep = routeSteps.find(rs => rs.id === studentStep?.stepId);
      
      if (routeStep) {
        const detailIndex = routeStep.details.findIndex(detail => detail.id === taskId);
        
        if (detailIndex !== -1) {
          await updateStepDetailChecked(routeStep.id, detailIndex, checked);
          toast.success(checked ? "Task completed!" : "Task unchecked");
        }
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to save task status");
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

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
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
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {studentRoute.length > 0 ? "My Career Route" : "Route Builder"}
          </h1>
              <p className="text-muted-foreground text-lg">
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
                className="gap-2"
              >
                <Compass className="h-5 w-5" />
                Adjust Route
              </Button>
          )}
          </div>
        </div>

        {/* Route Steps - Modern Timeline Design */}
        {studentRoute.length > 0 && (
          <div className="space-y-8">
              {studentRoute.map((step, index) => {
                const fullStep = routeSteps.find(rs => rs.id === step.stepId);
                if (!fullStep) return null;

                const isExpanded = expandedSteps.has(step.id);
                const stepProgress = getStepProgress(step, fullStep);
              const completedCount = fullStep.details.filter((detail: any) => 
                step.taskProgress[detail.id || detail.title] || false
              ).length;
              const totalTasks = fullStep.details.length;

                return (
                  <div key={step.id} className="relative">
                  {/* Timeline Line - positioned behind the circle */}
                  {index < studentRoute.length - 1 && (
                    <div className="absolute left-7 top-20 bottom-0 w-0.5 bg-border/20" style={{ zIndex: 0 }} />
                  )}
                  
                  <Card className="border border-border/60 bg-card/95 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative" style={{ zIndex: 1 }}>
                    <CardContent className="p-0">
                      {/* Step Header */}
                      <div className="p-6 border-b border-border/60 bg-gradient-to-r from-card to-card/50">
                        <div className="flex items-start gap-6">
                          {/* Step Number & Progress Circle */}
                          <div className="flex flex-col items-center gap-2 flex-shrink-0 relative" style={{ zIndex: 2 }}>
                            <div className={`relative w-14 h-14 rounded-full flex items-center justify-center ${
                              stepProgress === 100 
                                ? 'bg-primary/10' 
                                : 'bg-background'
                            }`} style={{ zIndex: 3 }}>
                              <CircularProgress 
                                progress={stepProgress}
                                size={56}
                                strokeWidth={3}
                                showText={stepProgress < 100}
                              />
                              {stepProgress === 100 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Check className="h-6 w-6 text-primary font-bold" />
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                              Step {index + 1}
                            </span>
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                                <h3 className="text-2xl font-bold text-foreground mb-2">
                              {step.title}
                            </h3>
                                {fullStep.description && (
                                  <p className="text-muted-foreground line-clamp-2">
                                    {fullStep.description.replace(/<[^>]*>/g, '').substring(0, 150)}
                                    {fullStep.description.replace(/<[^>]*>/g, '').length > 150 && '...'}
                            </p>
                                )}
                          </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <Badge variant="outline" className="text-sm px-3 py-1">
                                  {completedCount} / {totalTasks} tasks
                                </Badge>
                            <Button 
                                  variant="ghost" 
                              size="sm"
                              onClick={() => toggleStepExpansion(step.id)}
                                  className="gap-2"
                            >
                                  {isExpanded ? (
                                    <>
                                      <ChevronDown className="h-4 w-4" />
                                      Hide Details
                                    </>
                                  ) : (
                                    <>
                                      <ChevronRight className="h-4 w-4" />
                                      Show Details
                                    </>
                                  )}
                            </Button>
                              </div>
                            </div>
                          </div>
                          </div>
                        </div>

                      {/* Expandable Tasks */}
                        {isExpanded && (
                        <div className="p-6 bg-muted/20">
                            {fullStep.description && fullStep.description.trim() && (
                            <div className="mb-8 p-4 rounded-lg bg-card border border-border/60">
                              <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                Overview
                              </h4>
                                <div className="prose prose-sm max-w-none">
                                  {formatHtmlContent(fullStep.description)}
                                </div>
                              </div>
                            )}
                            
                          <div className="space-y-3">
                            <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
                              <Target className="h-5 w-5 text-primary" />
                              Tasks ({totalTasks})
                            </h4>
                            
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
                                const isTaskExpanded = expandedTasks.has(detail.id || `${step.id}-${detailIndex}`);
                                
                                 return (
                                  <div 
                                    key={detail.id || detailIndex} 
                                    className={`group rounded-lg border transition-all duration-200 ${
                                      isCompleted 
                                        ? 'bg-muted/30 border-muted/50 opacity-75' 
                                        : 'bg-card border-border/60 hover:border-primary/50 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-start gap-4 p-4">
                                          <Checkbox
                                            id={`task-${detail.id || detailIndex}`}
                                            checked={isCompleted}
                                            onCheckedChange={(checked) => toggleTaskCompletion(step.id, detail.id || detail.title, !!checked)}
                                            className="mt-1"
                                          />
                                      
                                       <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                           <label 
                                             htmlFor={`task-${detail.id || detailIndex}`}
                                            className={`font-semibold cursor-pointer text-base leading-tight ${
                                               isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                                             }`}
                                           >
                                             {detail.title}
                                           </label>
                                          
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            {detail.taskType && (
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
                                            
                                              {(detail.flightHours || step.category === 'Flight Instructing') && (
                                                <Popover>
                                                  <PopoverTrigger asChild>
                                                  <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1">
                                                    <Clock className="h-3 w-3" />
                                                      {detail.flightHours || 0}h
                                                    </Button>
                                                  </PopoverTrigger>
                                                <PopoverContent className="w-64 p-4">
                                                    <div className="space-y-3">
                                                      <Label className="text-sm font-medium">Flight Hours</Label>
                                                      <Input
                                                        type="number"
                                                        placeholder="Enter hours"
                                                        value={detail.flightHours || ''}
                                                        onChange={(e) => {
                                                          const hours = parseFloat(e.target.value) || 0
                                                        updateTaskDetails(step.id, detail.id || detail.title, { flightHours: hours })
                                                        }}
                                                      className="h-9"
                                                      />
                                                      {step.category === 'Flight Instructing' && (
                                                        <>
                                                          <Label className="text-sm font-medium">Hour Type</Label>
                                                          <Select 
                                                            value={(detail as any).hourType || 'ATP'} 
                                                          onValueChange={(value) => updateTaskDetails(step.id, detail.id || detail.title, { 
                                                              hourType: value as 'ATP' | 'R-ATP Bachelors Degree' | 'R-ATP Associated Degree' 
                                                            })}
                                                          >
                                                          <SelectTrigger className="h-9">
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
                                              
                                              {detail.mandatory && (
                                                <Badge variant="destructive" className="text-xs">
                                                  Required
                                                </Badge>
                                              )}
                                            
                                              {isCompleted && (
                                              <Badge variant="default" className="text-xs bg-green-500/90">
                                                <Check className="h-3 w-3 mr-1" />
                                                Complete
                                                </Badge>
                                              )}
                                            
                                              {detail.description && detail.description.trim() && (
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => toggleTaskExpansion(detail.id || `${step.id}-${detailIndex}`)}
                                                className="h-7 w-7 p-0"
                                                >
                                                {isTaskExpanded ? (
                                                  <ChevronDown className="h-4 w-4" />
                                                  ) : (
                                                  <ChevronRight className="h-4 w-4" />
                                                  )}
                                                </Button>
                                              )}
                                       </div>
                                     </div>
                                      
                                        {isTaskExpanded && detail.description && detail.description.trim() && (
                                          <div className="mt-3 pt-3 border-t border-border/50">
                                         <div className="prose prose-sm max-w-none">
                                           {formatHtmlContent(detail.description)}
                                         </div>
                                       </div>
                                     )}
                                      </div>
                                    </div>
                                    </div>
                                 );
                              })}
                            </div>
                            
                            {fullStep.details.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground bg-destructive/10 border border-destructive/20 rounded-lg">
                              <p className="font-medium">No tasks found for this step</p>
                                <p className="text-xs mt-2">Step ID: {fullStep.id}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
          </div>
        )}

        {/* Empty State */}
        {studentRoute.length === 0 && (
          <Card className="border-dashed border-2 border-border/60 bg-card/50">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Compass className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Ready to Build Your Career Route?</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                Create your personalized path from student pilot to airline pilot with our guided route builder.
                </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                 <Button 
                  onClick={() => setShowWizard(true)}
                  size="lg"
                   className="gap-2"
                 >
                  <Compass className="h-5 w-5" />
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
          onStepAdd={async (stepId: string) => {
            await addStepToRoute(stepId);
          }}
          availableSteps={routeSteps}
        />
      </main>
    </div>
  );
}
