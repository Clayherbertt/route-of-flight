import { useState } from 'react'
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
    description: 'Private pilot license training with structured curriculum',
    icon: 'Plane',
    category: 'Training',
    defaultStructure: {
      title: 'Private Pilot License Training',
      description: 'Complete your private pilot license with structured flight training',
      mandatory: true,
      allowCustomerReorder: false,
      status: 'draft' as const,
      category: 'Primary Training',
      details: [
        {
          title: 'Pre-flight Procedures',
          description: 'Learn comprehensive aircraft inspection and preparation procedures',
          checked: false,
          flightHours: 5,
          taskType: 'flight' as const
        },
        {
          title: 'Basic Maneuvers',
          description: 'Master fundamental flight maneuvers including turns, climbs, and descents',
          checked: false,
          flightHours: 10,
          taskType: 'flight' as const
        },
        {
          title: 'Solo Flight',
          description: 'Complete supervised solo flights to build confidence and skills',
          checked: false,
          flightHours: 10,
          taskType: 'flight' as const
        },
        {
          title: 'Regulations Study',
          description: 'Study Part 61 and Part 91 federal aviation regulations',
          checked: false,
          taskType: 'ground' as const
        }
      ]
    }
  },
  {
    id: 'initial-tasks',
    title: 'Initial Tasks',
    description: 'Pre-training preparation and administrative tasks',
    icon: 'BookOpen',
    category: 'Preparation',
    defaultStructure: {
      title: '',
      description: '',
      mandatory: true,
      allowCustomerReorder: false,
      status: 'draft' as const,
      category: 'Initial Tasks',
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
    onOpenChange(false)
    setSelectedTemplate(null)
  }

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
                    {template.defaultStructure.details.length} pre-configured topics
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
                <div><strong>Default Title:</strong> {selectedTemplate.defaultStructure.title}</div>
                <div><strong>Topics:</strong> {selectedTemplate.defaultStructure.details.length} items</div>
                <div><strong>Mandatory:</strong> {selectedTemplate.defaultStructure.mandatory ? 'Yes' : 'No'}</div>
                <div><strong>Customer Reorder:</strong> {selectedTemplate.defaultStructure.allowCustomerReorder ? 'Enabled' : 'Disabled'}</div>
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