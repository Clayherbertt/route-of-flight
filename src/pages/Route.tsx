import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRouteSteps } from "@/hooks/useRouteSteps";
import { SortableRouteStepCard } from "@/components/SortableRouteStepCard";
import { Plus, Check, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface StudentRoute {
  id: string;
  stepId: string;
  title: string;
  category: string;
  icon: string;
  completed: boolean;
  order: number;
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
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
  }, [user, navigate]);

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

  const addStepToRoute = (step: any) => {
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

    const newStep: StudentRoute = {
      id: `${step.id}-${Date.now()}`,
      stepId: step.id,
      title: step.title,
      category: step.category,
      icon: step.icon,
      completed: false,
      order: studentRoute.length
    };

    setStudentRoute(prev => [...prev, newStep]);
    toast.success(`Added ${step.title} to your route`);
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

  const getUniqueCategories = () => {
    const categories = [...new Set(routeSteps.map(step => step.category))];
    return ["all", ...categories];
  };

  const toggleCardExpansion = (stepId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Build Your Airline Career Route</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create your personalized path to becoming an airline pilot. Follow the logical sequence 
            and choose the steps that align with your career goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Phase Timeline */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Career Phases</CardTitle>
                <CardDescription>Follow the sequence to build your route</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {phases.map((phase, index) => {
                  const progress = getPhaseProgress(phase.id);
                  const unlocked = isPhaseUnlocked(phase.id);
                  const isActive = activePhase === phase.id;
                  
                  return (
                    <div
                      key={phase.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      } ${!unlocked ? 'opacity-50' : ''}`}
                      onClick={() => unlocked && setActivePhase(phase.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium flex items-center gap-2">
                          {progress === 100 ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : !unlocked ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-primary" />
                          )}
                          {phase.title}
                        </h3>
                        {phase.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                      <Progress value={progress} className="h-1" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activePhase} onValueChange={setActivePhase}>
              <TabsList className="mb-6 w-full justify-start overflow-x-auto">
                {phases.map(phase => (
                  <TabsTrigger 
                    key={phase.id} 
                    value={phase.id}
                    disabled={!isPhaseUnlocked(phase.id)}
                    className="whitespace-nowrap"
                  >
                    {phase.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {phases.map(phase => (
                <TabsContent key={phase.id} value={phase.id}>
                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                      {getUniqueCategories()
                        .filter(cat => cat === "all" || phase.allowedCategories.includes(cat))
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
                    <div className="space-y-4">
                      {availableSteps
                        .filter(step => phase.allowedCategories.includes(step.category))
                        .map(step => (
                        <div key={step.id} className="relative">
                          <SortableRouteStepCard
                            step={step}
                            isExpanded={expandedCards[step.id!] || false}
                            onToggleExpansion={() => toggleCardExpansion(step.id!)}
                            onEdit={() => {}} // No edit functionality for students
                            onDelete={() => {}} // No delete functionality for students
                          />
                          <Button
                            size="sm"
                            onClick={() => addStepToRoute(step)}
                            className="absolute top-4 right-4 z-10"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        {/* Student's Route */}
        {studentRoute.length > 0 && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Your Career Route</CardTitle>
                <CardDescription>
                  Your personalized path to becoming an airline pilot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentRoute.map((step, index) => {
                    // Find the full route step data to pass to SortableRouteStepCard
                    const fullStep = routeSteps.find(rs => rs.id === step.stepId);
                    if (!fullStep) return null;

                    return (
                      <div key={step.id} className="relative">
                        <Badge variant="outline" className="absolute top-2 left-2 z-10">
                          Step {index + 1}
                        </Badge>
                        <SortableRouteStepCard
                          step={fullStep}
                          isExpanded={expandedCards[step.id] || false}
                          onToggleExpansion={() => toggleCardExpansion(step.id)}
                          onEdit={() => {}} // No edit functionality for students
                          onDelete={() => removeStepFromRoute(step.id)}
                        />
                        <div className="absolute top-2 right-2 z-10 flex gap-2">
                          <Button
                            size="sm"
                            variant={step.completed ? "default" : "outline"}
                            onClick={() => toggleStepCompletion(step.id)}
                          >
                            {step.completed ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Done
                              </>
                            ) : (
                              "Complete"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeStepFromRoute(step.id)}
                            className="text-muted-foreground hover:text-destructive px-2"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}