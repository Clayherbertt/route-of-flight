import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, Plane, Heart, GraduationCap, Building, Users, MapPin, Target } from "lucide-react";

interface RouteWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onStepAdd: (stepId: string) => void;
  availableSteps: any[];
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
    instructions: "These initial tasks are required for all pilots. They set the foundation for your aviation career."
  },
  {
    id: "medical",
    title: "Medical Certification",
    description: "Get your medical certificate",
    icon: Heart,
    required: true,
    categories: ["Medical"],
    instructions: "Medical certification is mandatory and must be completed early in your training."
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
    categories: ["Airline Programs"],
    instructions: "Optional: Select a cadet or pathway program that partners with airlines.",
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

export function RouteWizard({ isOpen, onClose, onStepAdd, availableSteps }: RouteWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSteps, setSelectedSteps] = useState<Record<string, string[]>>({});
  const [careerPathChoice, setCareerPathChoice] = useState<string>("");

  const currentWizardStep = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const getAvailableStepsForCategory = (categories: string[]) => {
    return availableSteps.filter(step => 
      categories.includes(step.category) && step.status === 'published'
    );
  };

  const handleStepSelect = (stepId: string) => {
    const stepKey = currentWizardStep.id;
    
    if (currentWizardStep.multiSelect) {
      setSelectedSteps(prev => {
        const current = prev[stepKey] || [];
        const isSelected = current.includes(stepId);
        
        if (isSelected) {
          return { ...prev, [stepKey]: current.filter(id => id !== stepId) };
        } else {
          return { ...prev, [stepKey]: [...current, stepId] };
        }
      });
    } else {
      setSelectedSteps(prev => ({ ...prev, [stepKey]: [stepId] }));
    }
  };

  const handleNext = () => {
    // Add selected steps to route
    const stepKey = currentWizardStep.id;
    const selected = selectedSteps[stepKey] || [];
    
    selected.forEach(stepId => {
      onStepAdd(stepId);
    });

    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Wizard complete
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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
        <p className="text-sm text-muted-foreground mb-6">{currentWizardStep.instructions}</p>
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
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
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
          <p>No steps available for this category yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-6">{currentWizardStep.instructions}</p>
        
        {currentWizardStep.orderMatters && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Private Pilot must be completed first. The other certificates can be done in any order.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {availableSteps.map((step) => (
            <Card 
              key={step.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedForThisStep.includes(step.id) ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleStepSelect(step.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{step.icon}</div>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
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
          ))}
        </div>

        {currentWizardStep.multiSelect && (
          <p className="text-xs text-muted-foreground mt-4">
            You can select multiple items. Click to select/deselect.
          </p>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              <span>Step {currentStep + 1} of {WIZARD_STEPS.length}</span>
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
                  <p className="text-muted-foreground">{currentWizardStep.description}</p>
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
                {currentStep === WIZARD_STEPS.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}