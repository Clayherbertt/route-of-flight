import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRouteSteps } from "@/hooks/useRouteSteps";
import { StudentRouteStepCard } from "@/components/StudentRouteStepCard";
import { RouteWizard } from "@/components/RouteWizard";
import { Check, Lock, AlertCircle, Target, Plane, Compass } from "lucide-react";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { routeSteps, loading } = useRouteSteps();
  const [studentRoute, setStudentRoute] = useState<StudentRoute[]>([]);
  const [phases, setPhases] = useState<RoutePhase[]>(ROUTE_PHASES);
  const [activePhase, setActivePhase] = useState("initial-tasks");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  const [hasSeenWizard, setHasSeenWizard] = useState(() => {
    return localStorage.getItem('hasSeenRouteWizard') === 'true';
  });
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
  }, [user, navigate]);

  // Show wizard if user has no route and hasn't seen it yet
  useEffect(() => {
    if (!loading && studentRoute.length === 0 && !hasSeenWizard) {
      setShowWizard(true);
    }
  }, [loading, studentRoute.length, hasSeenWizard]);

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

  const addStepToRoute = (stepId: string) => {
    const step = routeSteps.find(s => s.id === stepId);
    if (!step) return;

    // Check if step already exists in route
    const existingStep = studentRoute.find(s => s.stepId === stepId);
    if (existingStep) {
      toast.error(`${step.title} is already in your route`);
      return;
    }

    const newStep: StudentRoute = {
      id: `${step.id}-${Date.now()}`,
      stepId: step.id,
      title: step.title,
      category: step.category,
      icon: step.icon,
      completed: false,
      order: studentRoute.length,
      taskProgress: {}
    };

    setStudentRoute(prev => [...prev, newStep]);
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

  const toggleTaskCompletion = (stepId: string, taskId: string, checked: boolean) => {
    setStudentRoute(prev => prev.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            taskProgress: { ...step.taskProgress, [taskId]: checked }
          } 
        : step
    ));
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

  if (loading) {
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
            Build Your Airline Career Path
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Create your personalized journey to becoming an airline pilot. Select training steps, 
            track your progress, and follow a proven path to the cockpit.
          </p>
        </div>

        {/* Show complex route building interface only when no route exists */}
        {studentRoute.length === 0 && (
          <>
            {/* Phase Navigation */}
            <div className="mb-8">
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Plane className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Career Phases</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {phases.map((phase) => {
                      const progress = getPhaseProgress(phase.id);
                      const unlocked = isPhaseUnlocked(phase.id);
                      const isActive = activePhase === phase.id;
                      
                      return (
                        <Button
                          key={phase.id}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          disabled={!unlocked}
                          onClick={() => unlocked && setActivePhase(phase.id)}
                          className="relative"
                        >
                          <div className="flex items-center gap-2">
                            {progress === 100 ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : !unlocked ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            {phase.title}
                          </div>
                          {progress > 0 && progress < 100 && (
                            <div className="absolute bottom-0 left-0 h-1 bg-primary/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Available Steps */}
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Training Steps</CardTitle>
                    <CardDescription>
                      {phases.find(p => p.id === activePhase)?.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {getUniqueCategories()
                        .filter(cat => {
                          const currentPhase = phases.find(p => p.id === activePhase);
                          return cat === "all" || currentPhase?.allowedCategories.includes(cat);
                        })
                        .map(category => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="capitalize"
                        >
                          {category === "all" ? "All Categories" : category}
                        </Button>
                      ))}
                    </div>

                    {/* Available Steps */}
                    <div className="space-y-6">
                      {availableSteps
                        .filter(step => {
                          const currentPhase = phases.find(p => p.id === activePhase);
                          return currentPhase?.allowedCategories.includes(step.category);
                        })
                        .map(step => (
                        <StudentRouteStepCard
                          key={step.id}
                          step={step}
                          variant="available"
                          onAddToRoute={() => addStepToRouteFromCard(step)}
                        />
                      ))}
                      
                      {availableSteps.filter(step => {
                        const currentPhase = phases.find(p => p.id === activePhase);
                        return currentPhase?.allowedCategories.includes(step.category);
                      }).length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No steps available for this phase yet.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Phase Progress Sidebar */}
              <div className="xl:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Phase Progress</CardTitle>
                    <CardDescription>Track your advancement through each phase</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {phases.map((phase) => {
                      const progress = getPhaseProgress(phase.id);
                      const unlocked = isPhaseUnlocked(phase.id);
                      const phaseSteps = studentRoute.filter(step => 
                        phase.allowedCategories.includes(step.category)
                      );
                      
                      return (
                        <div key={phase.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{phase.title}</span>
                            {phase.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {phaseSteps.length} of {phase.minSteps || 1} steps
                            </span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Student's Selected Route */}
        {studentRoute.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
              {studentRoute.map((step, index) => {
                const fullStep = routeSteps.find(rs => rs.id === step.stepId);
                if (!fullStep) return null;

                const isExpanded = expandedSteps.has(step.id);

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
                            <div className="relative">
                              <div className="w-12 h-12 border-2 border-border rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 bg-muted rounded-full"></div>
                              </div>
                            </div>
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
                            <h4 className="font-semibold mb-4 text-lg">Tasks & Requirements ({fullStep.details.length})</h4>
                            <div className="space-y-3">
                              {fullStep.details.map((detail, detailIndex) => (
                                <div key={detail.id || detailIndex} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                                  <Checkbox
                                    id={`task-${detail.id || detailIndex}`}
                                    checked={step.taskProgress[detail.id || detail.title] || false}
                                    onCheckedChange={(checked) => toggleTaskCompletion(step.id, detail.id || detail.title, !!checked)}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-3">
                                      <label 
                                        htmlFor={`task-${detail.id || detailIndex}`}
                                        className={`font-medium cursor-pointer ${
                                          step.taskProgress[detail.id || detail.title] ? 'line-through text-muted-foreground' : ''
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
                                      </div>
                                    </div>
                                    {detail.description && (
                                      <p className={`text-sm mt-1 ${
                                        step.taskProgress[detail.id || detail.title] ? 'line-through text-muted-foreground' : 'text-muted-foreground'
                                      }`}>
                                        {detail.description.replace(/<[^>]*>/g, '')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {fullStep.details.length === 0 && (
                              <div className="text-center py-8 text-muted-foreground">
                                <p>No tasks defined for this step yet.</p>
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
                    setHasSeenWizard(true);
                    localStorage.setItem('hasSeenRouteWizard', 'true');
                  }}
                  className="gap-2"
                >
                    <Compass className="h-4 w-4" />
                    Start Route Builder Wizard
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
          onClose={() => {
            setShowWizard(false);
            setHasSeenWizard(true);
            localStorage.setItem('hasSeenRouteWizard', 'true');
          }}
          onStepAdd={addStepToRoute}
          availableSteps={routeSteps}
        />
      </main>
    </div>
  );
}