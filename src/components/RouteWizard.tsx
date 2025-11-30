import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, Plane, Heart, GraduationCap, Building, Users, MapPin, Target, BookOpen, Compass } from "lucide-react";

interface RouteWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onStepAdd: (stepId: string) => Promise<void>;
  onStepRemove?: (stepId: string) => Promise<void>; // Optional callback to remove steps
  availableSteps: any[];
  currentUserRoute?: Array<{ stepId: string; [key: string]: any }>; // User's current route steps
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  required: boolean;
  categories: string[];
  instructions?: string;
  multiSelect?: boolean;
  orderMatters?: boolean;
  options?: { label: string; value: string; description?: string }[];
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "initial-tasks",
    title: "Initial Tasks",
    description: "Essential first steps for every pilot",
    icon: Target,
    required: true,
    categories: ["Initial Tasks"],
    instructions: "These first two initial steps are required as they are extremely important before getting into flying."
  },
  {
    id: "initial-training",
    title: "Initial Training",
    description: "Build your flight certifications",
    icon: GraduationCap,
    required: true,
    categories: ["Primary Training", "Advanced Training"],
    instructions: "Select your training path. Private Pilot MUST be completed first, then you can choose the order for the remaining certificates.",
    multiSelect: true,
    orderMatters: true
  },
  {
    id: "career-path",
    title: "Career Path Choice",
    description: "Choose your route to the airlines",
    icon: Building,
    required: false,
    categories: ["Flight Instructor", "Career Development"],
    instructions: "Choose your path to build flight hours and experience.",
    options: [
      { 
        label: "Flight Instructor Route", 
        value: "instructor", 
        description: "Become a CFI/CFII/MEI to build hours while teaching others"
      },
      { 
        label: "Other Route", 
        value: "other", 
        description: "Pipeline patrol, parachute ops, Part 91 operator, etc."
      }
    ]
  },
  {
    id: "cadet-program",
    title: "Cadet Program (Optional)",
    description: "Join an airline pathway program",
    icon: Users,
    required: false,
    categories: ["Cadet Programs"],
    instructions: "Optional: Select a cadet or pathway program that partners with airlines. These programs provide structured paths to airline careers with mentorship and guaranteed interviews.",
    multiSelect: false
  },
  {
    id: "regional",
    title: "Regional/135 Operator",
    description: "Choose your first airline job",
    icon: Plane,
    required: false,
    categories: ["Regional Airlines"],
    instructions: "Select your target regional airline or Part 135 operator for your first airline job.",
    multiSelect: false
  },
  {
    id: "major",
    title: "Major Airline",
    description: "Your final destination",
    icon: MapPin,
    required: false,
    categories: ["Major Airlines"],
    instructions: "Choose your dream major airline destination.",
    multiSelect: false
  }
];

export function RouteWizard({ isOpen, onClose, onStepAdd, onStepRemove, availableSteps, currentUserRoute = [] }: RouteWizardProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSteps, setSelectedSteps] = useState<Record<string, string[]>>({});
  const [careerPathChoice, setCareerPathChoice] = useState<string>("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [initialSelectedSteps, setInitialSelectedSteps] = useState<Record<string, string[]>>({}); // Track initial state

  // Dynamically generate wizard steps based on career path choice
  const getWizardSteps = (): WizardStep[] => {
    const baseSteps = WIZARD_STEPS.slice(0, 3); // Initial Tasks, Initial Training, Career Path Choice
    
    // If Flight Instructor Route is selected, add Flight Instructing step
    if (careerPathChoice === "instructor") {
      const flightInstructingStep: WizardStep = {
        id: "flight-instructing",
        title: "Flight Instructing",
        description: "CFI, CFII, MEI certifications and requirements",
        icon: BookOpen,
        required: true,
        categories: ["Flight Instructing"],
        instructions: "Select the flight instruction certifications and requirements for your route.",
        multiSelect: true,
        orderMatters: false
      };
      
      const remainingSteps = WIZARD_STEPS.slice(3); // Cadet Program, Regional, Major
      return [...baseSteps, flightInstructingStep, ...remainingSteps];
    }
    
    return WIZARD_STEPS;
  };

  const wizardSteps = getWizardSteps();
  const currentWizardStep = wizardSteps[currentStep];
  const progress = ((currentStep + 1) / wizardSteps.length) * 100;

  // Initialize selected steps from user's current route when wizard opens (only once)
  useEffect(() => {
    if (isOpen && !hasInitialized && currentUserRoute.length > 0 && availableSteps.length > 0) {
      const preSelected: Record<string, string[]> = {};
      let hasFlightInstructing = false;
      
      // First pass: Check if user has Flight Instructing steps
      currentUserRoute.forEach(userStep => {
        const step = availableSteps.find(s => s.id === userStep.stepId);
        if (step && step.category === 'Flight Instructing') {
          hasFlightInstructing = true;
        }
      });
      
      // Pre-select "Flight Instructor Route" if user has Flight Instructing steps
      // This must be set BEFORE getting wizard steps so the flight-instructing step is included
      if (hasFlightInstructing) {
        setCareerPathChoice("instructor");
        preSelected['career-path'] = ["instructor"];
      }
      
      // Compute wizard steps based on whether user has Flight Instructing (not state, since state update is async)
      // This matches the logic in getWizardSteps() but uses the computed value instead of state
      const baseSteps = WIZARD_STEPS.slice(0, 3); // Initial Tasks, Initial Training, Career Path Choice
      let computedWizardSteps: WizardStep[];
      
      if (hasFlightInstructing) {
        const flightInstructingStep: WizardStep = {
          id: "flight-instructing",
          title: "Flight Instructing",
          description: "CFI, CFII, MEI certifications and requirements",
          icon: BookOpen,
          required: true,
          categories: ["Flight Instructing"],
          instructions: "Select the flight instruction certifications and requirements for your route.",
          multiSelect: true,
          orderMatters: false
        };
        const remainingSteps = WIZARD_STEPS.slice(3); // Cadet Program, Regional, Major
        computedWizardSteps = [...baseSteps, flightInstructingStep, ...remainingSteps];
      } else {
        computedWizardSteps = WIZARD_STEPS;
      }
      
      // Second pass: Match user's route steps to wizard steps
      currentUserRoute.forEach(userStep => {
        // Find the step by ID from availableSteps
        const step = availableSteps.find(s => s.id === userStep.stepId);
        if (!step) return;
        
        // Find which wizard step this belongs to by checking categories
        computedWizardSteps.forEach(wizardStep => {
          if (wizardStep.categories.includes(step.category)) {
            const stepKey = wizardStep.id;
            if (!preSelected[stepKey]) {
              preSelected[stepKey] = [];
            }
            // Add the step ID to the pre-selected list for this wizard step
            if (!preSelected[stepKey].includes(step.id)) {
              preSelected[stepKey].push(step.id);
            }
          }
        });
      });
      
      // Set all pre-selected steps at once
      if (Object.keys(preSelected).length > 0) {
        setSelectedSteps(preSelected);
        setInitialSelectedSteps(preSelected); // Store initial state for comparison
      }
      
      setHasInitialized(true);
    }
    
    // Reset initialization flag when wizard closes
    if (!isOpen) {
      setHasInitialized(false);
    }
  }, [isOpen, currentUserRoute, availableSteps, hasInitialized]);

  const getAvailableStepsForCategory = (categories: string[]) => {
    const filtered = availableSteps.filter(step => 
      categories.includes(step.category) && step.status === 'published'
    );
    
    // Auto-select initial tasks on first step (only once when wizard first opens)
    if (currentStep === 0 && currentWizardStep.id === "initial-tasks") {
      const stepKey = currentWizardStep.id;
      if (filtered.length > 0 && (selectedSteps[stepKey] || []).length === 0) {
        const initialTaskIds = filtered.map(step => step.id);
        setSelectedSteps(prev => ({ ...prev, [stepKey]: initialTaskIds }));
      }
    }
    
    return filtered;
  };

  const handleStepSelect = (stepId: string, event?: React.MouseEvent) => {
    // Prevent event propagation
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    const stepKey = currentWizardStep.id;
    
    // Prevent unchecking initial tasks - they're required
    if (stepKey === 'initial-tasks') {
      return;
    }
    
    // Use functional update to ensure we get the latest state
    setSelectedSteps(prev => {
      const current = prev[stepKey] || [];
      const isSelected = current.includes(stepId);
      
      if (currentWizardStep.multiSelect) {
        // For multi-select, toggle the item
        if (isSelected) {
          const newSelection = { ...prev, [stepKey]: current.filter(id => id !== stepId) };
          return newSelection;
        } else {
          const newSelection = { ...prev, [stepKey]: [...current, stepId] };
          return newSelection;
        }
      } else {
        // For single-select, allow toggling - if already selected, deselect it
        if (isSelected) {
          // Deselect by removing it
          const newSelection = { ...prev, [stepKey]: [] };
          return newSelection;
        } else {
          // Select it
          const newSelection = { ...prev, [stepKey]: [stepId] };
          return newSelection;
        }
      }
    });
  };

  const handleNext = async () => {
    const stepKey = currentWizardStep.id;
    const selected = selectedSteps[stepKey] || [];
    const initialSelected = initialSelectedSteps[stepKey] || [];
    
    // Find steps that were deselected (were in initial but not in current)
    const deselected = initialSelected.filter(id => !selected.includes(id));
    
    // Find steps that were newly selected (not in initial but in current)
    const newlySelected = selected.filter(id => !initialSelected.includes(id));
    
    // Remove deselected steps
    if (onStepRemove && deselected.length > 0) {
      for (const stepId of deselected) {
        await onStepRemove(stepId);
      }
    }
    
    // Add newly selected steps
    for (const stepId of newlySelected) {
      await onStepAdd(stepId);
    }
    
    // Update initial state to reflect current state for next step
    setInitialSelectedSteps(prev => ({
      ...prev,
      [stepKey]: selected
    }));

    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Wizard complete - sync all remaining steps
      await syncAllSteps();
      onClose();
    }
  };
  
  // Sync all steps when wizard completes
  const syncAllSteps = async () => {
    // Compare all wizard steps
    for (const wizardStep of wizardSteps) {
      const stepKey = wizardStep.id;
      const selected = selectedSteps[stepKey] || [];
      const initialSelected = initialSelectedSteps[stepKey] || [];
      
      // Find steps that were deselected
      const deselected = initialSelected.filter(id => !selected.includes(id));
      
      // Find steps that were newly selected
      const newlySelected = selected.filter(id => !initialSelected.includes(id));
      
      // Remove deselected steps
      if (onStepRemove && deselected.length > 0) {
        for (const stepId of deselected) {
          await onStepRemove(stepId);
        }
      }
      
      // Add newly selected steps
      for (const stepId of newlySelected) {
        await onStepAdd(stepId);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBeginWizard = () => {
    setShowIntro(false);
  };

  // Reset intro screen when dialog closes
  const handleClose = async () => {
    // Before closing, sync all steps to ensure deselected items are removed
    await syncAllSteps();
    
    setShowIntro(true);
    setCurrentStep(0);
    setSelectedSteps({});
    setInitialSelectedSteps({});
    setCareerPathChoice("");
    setHasInitialized(false);
    onClose();
  };

  const canProceed = () => {
    if (currentWizardStep.required) {
      const selected = selectedSteps[currentWizardStep.id] || [];
      return selected.length > 0;
    }
    return true; // Optional steps can be skipped
  };

  const renderCareerPathChoice = () => {
    if (currentWizardStep.id !== "career-path" || !currentWizardStep.options) return null;

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-6">{currentWizardStep.instructions}</div>
        <div className="space-y-3">
          {currentWizardStep.options.map((option) => (
            <Card 
              key={option.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                careerPathChoice === option.value ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setCareerPathChoice(option.value);
                setSelectedSteps(prev => ({ ...prev, [currentWizardStep.id]: [option.value] }));
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{option.label}</h3>
                    <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                  </div>
                  {careerPathChoice === option.value && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderStepSelection = () => {
    if (currentWizardStep.options) {
      return renderCareerPathChoice();
    }

    const availableSteps = getAvailableStepsForCategory(currentWizardStep.categories);
    const selectedForThisStep = selectedSteps[currentWizardStep.id] || [];

    if (availableSteps.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <div>No steps available for this category yet.</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-6">{currentWizardStep.instructions}</div>
        
        {currentWizardStep.orderMatters && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Private Pilot must be completed first. The other certificates can be done in any order.
            </div>
          </div>
        )}

        <div className="space-y-3">
          {availableSteps.map((step) => {
            // Get the icon component from lucide-react
            const IconComponent = step.icon === "BookOpen" ? BookOpen : 
                               step.icon === "Plane" ? Plane :
                               step.icon === "Users" ? Users :
                               step.icon === "GraduationCap" ? GraduationCap :
                               step.icon === "Target" ? Target :
                               BookOpen; // fallback to BookOpen
            
            return (
              <Card 
                key={step.id}
                className={`transition-all hover:shadow-md ${
                  selectedForThisStep.includes(step.id) ? 'ring-2 ring-primary' : ''
                } ${currentWizardStep.id === 'initial-tasks' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                onClick={currentWizardStep.id === 'initial-tasks' ? undefined : (e) => handleStepSelect(step.id, e)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <div className="text-sm text-muted-foreground">{step.description?.replace(/<[^>]*>/g, '')}</div>
                        <Badge variant="outline" className="mt-1">
                          {step.category}
                        </Badge>
                      </div>
                    </div>
                    {selectedForThisStep.includes(step.id) && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {currentWizardStep.multiSelect && (
          <div className="text-xs text-muted-foreground mt-4">
            You can select multiple items. Click to select/deselect.
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {showIntro ? (
          // Introduction Screen
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Plane className="h-6 w-6 text-primary" />
                Flight Career Route Builder
              </DialogTitle>
              <DialogDescription>
                Build your personalized path to becoming an airline pilot
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-8">
                  <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Compass className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-foreground">
                        Welcome to the Route Builder
                      </h3>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        This wizard will help you create a personalized career roadmap tailored to your aviation goals. 
                        We'll guide you through selecting the training, certifications, and career milestones that will 
                        take you from where you are today to your dream airline job.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <div className="space-y-2">
                        <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto">
                          <Target className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-semibold">Set Your Goals</h4>
                        <p className="text-sm text-muted-foreground">
                          Define your career path and training objectives
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto">
                          <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-semibold">Plan Your Training</h4>
                        <p className="text-sm text-muted-foreground">
                          Select certifications and courses you need
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto">
                          <Plane className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-semibold">Track Progress</h4>
                        <p className="text-sm text-muted-foreground">
                          Monitor your journey to the airlines
                        </p>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button 
                        onClick={handleBeginWizard}
                        size="lg"
                        className="gap-2 px-8 py-6 text-lg"
                      >
                        Begin Route Builder
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          // Wizard Steps
          <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Plane className="h-6 w-6 text-primary" />
            Flight Career Route Builder
          </DialogTitle>
          <DialogDescription>
            Let's build your personalized path to becoming an airline pilot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {wizardSteps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <currentWizardStep.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {currentWizardStep.title}
                    {currentWizardStep.required && (
                      <Badge variant="destructive">Required</Badge>
                    )}
                  </CardTitle>
                  <div className="text-muted-foreground">{currentWizardStep.description}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderStepSelection()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            
            <div className="flex gap-2">
              {!currentWizardStep.required && (
                <Button 
                  variant="ghost"
                  onClick={handleNext}
                >
                  Skip
                </Button>
              )}
              
              <Button 
                onClick={handleNext}
                disabled={currentWizardStep.required && !canProceed()}
                className="gap-2"
              >
                {currentStep === wizardSteps.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}