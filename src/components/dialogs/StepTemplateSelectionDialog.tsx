import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  GraduationCap, 
  Stethoscope, 
  Plane, 
  Trophy,
  BookOpen,
  Clock
} from 'lucide-react'

interface StepTemplate {
  id: string
  title: string
  description: string
  icon: string
  category: string
  defaultStructure: {
    title: string
    description: string
    mandatory: boolean
    allowCustomerReorder: boolean
    status: 'draft' | 'published'
    category: string
    hourType?: 'ATP' | 'R-ATP'
    hourRequirementTitle?: string
    hourRequirement?: number
    details: Array<{
      title: string
      description: string
      checked: boolean
      flightHours?: number
      taskType?: 'flight' | 'ground'
      mandatory?: boolean
      published?: boolean
    }>
  }
}

const stepTemplates: StepTemplate[] = [
  {
    id: 'flight-training',
    title: 'Flight Training',
    description: 'Create a blank flight training step',
    icon: 'Plane',
    category: 'Training',
    defaultStructure: {
      title: '',
      description: '',
      mandatory: false,
      allowCustomerReorder: false,
      status: 'draft' as const,
      category: 'Primary Training',
      details: []
    }
  },
  {
    id: 'initial-tasks',
    title: 'Initial Tasks',
    description: 'Create a blank initial tasks step',
    icon: 'BookOpen',
    category: 'Preparation',
    defaultStructure: {
      title: '',
      description: '',
      mandatory: false,
      allowCustomerReorder: false,
      status: 'draft' as const,
      category: 'Initial Tasks',
      details: []
    }
  },
  {
    id: 'flight-instruction',
    title: 'Flight Instruction',
    description: 'Flight instruction template with ATP/R-ATP hour requirements',
    icon: 'Clock',
    category: 'Instruction',
    defaultStructure: {
      title: '',
      description: '',
      mandatory: false,
      allowCustomerReorder: false,
      status: 'draft' as const,
      category: 'Flight Instructing',
      hourType: 'ATP',
      hourRequirementTitle: '',
      hourRequirement: 0,
      details: []
    }
  }
]

const iconMap = {
  GraduationCap,
  Stethoscope,
  Plane,
  Trophy,
  BookOpen,
  Clock
}

interface StepTemplateSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: StepTemplate) => void
}

export function StepTemplateSelectionDialog({ 
  open, 
  onOpenChange, 
  onSelectTemplate 
}: StepTemplateSelectionDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<StepTemplate | null>(null)

  const handleSelectTemplate = (template: StepTemplate) => {
    setSelectedTemplate(template)
  }

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate)
      onOpenChange(false)
      setSelectedTemplate(null)
    }
  }

  const handleCancel = () => {
    setSelectedTemplate(null)
    onOpenChange(false)
  }

  // Reset selection when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedTemplate(null)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Step Template</DialogTitle>
          <DialogDescription>
            Choose a template to create a new route step with pre-configured structure and content.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {stepTemplates.map((template) => {
            const IconComponent = iconMap[template.icon as keyof typeof iconMap] || GraduationCap
            const isSelected = selectedTemplate?.id === template.id
            
            return (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {template.category}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Blank template - ready for customization
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {selectedTemplate && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Template Preview: {selectedTemplate.title}</h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm space-y-2">
                <div><strong>Title:</strong> Blank (ready to customize)</div>
                <div><strong>Description:</strong> Empty (ready to customize)</div>
                <div><strong>Category:</strong> {selectedTemplate.defaultStructure.category}</div>
                <div><strong>Status:</strong> Draft</div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedTemplate}
          >
            Create Step from Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}