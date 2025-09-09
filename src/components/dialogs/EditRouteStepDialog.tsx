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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, X, Plane } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

interface RouteStepDetail {
  id?: string
  title: string
  description: string
  checked: boolean
  flightHours?: number
  orderNumber: number
  taskType: 'flight' | 'ground'
}

interface RouteStep {
  id: string
  title: string
  description: string
  icon: string
  orderNumber: number
  mandatory: boolean
  allowCustomerReorder: boolean
  overview: string
  status: 'draft' | 'published'
  details: RouteStepDetail[]
  nextSteps: string[]
  connectedFrom?: string[]
}

interface EditRouteStepDialogProps {
  step: RouteStep | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (step: RouteStep) => void
}

export function EditRouteStepDialog({ step, open, onOpenChange, onSave }: EditRouteStepDialogProps) {
  const [editedStep, setEditedStep] = useState<RouteStep | null>(step)
  const [newFlightTitle, setNewFlightTitle] = useState('')
  const [newFlightHours, setNewFlightHours] = useState('')
  const [newGroundTitle, setNewGroundTitle] = useState('')

  // Reset edited step when step prop changes
  useEffect(() => {
    if (step) {
      setEditedStep(step)
    }
  }, [step])

  if (!editedStep) return null

  const handleSave = () => {
    // Ensure all data is properly formatted before saving
    const stepToSave: RouteStep = {
      ...editedStep,
      title: editedStep.title.trim(),
      description: editedStep.description.trim(),
      overview: editedStep.overview || '',
      details: editedStep.details.map((detail, index) => ({
        ...detail,
        title: detail.title.trim(),
        orderNumber: index,
        taskType: detail.taskType || 'flight'
      }))
    }
    onSave(stepToSave)
    onOpenChange(false)
  }

  const addFlightTask = () => {
    if (newFlightTitle.trim()) {
      setEditedStep({
        ...editedStep,
        details: [...editedStep.details, {
          title: newFlightTitle.trim(),
          description: '',
          checked: false,
          flightHours: newFlightHours ? parseInt(newFlightHours) : undefined,
          orderNumber: editedStep.details.length,
          taskType: 'flight'
        }]
      })
      setNewFlightTitle('')
      setNewFlightHours('')
    }
  }

  const addGroundTask = () => {
    if (newGroundTitle.trim()) {
      setEditedStep({
        ...editedStep,
        details: [...editedStep.details, {
          title: newGroundTitle.trim(),
          description: '',
          checked: false,
          orderNumber: editedStep.details.length,
          taskType: 'ground'
        }]
      })
      setNewGroundTitle('')
    }
  }

  const removeDetail = (index: number) => {
    setEditedStep({
      ...editedStep,
      details: editedStep.details.filter((_, i) => i !== index)
    })
  }

  const updateTaskTitle = (index: number, title: string) => {
    const newDetails = [...editedStep.details]
    newDetails[index] = { ...newDetails[index], title }
    setEditedStep({
      ...editedStep,
      details: newDetails
    })
  }

  const updateTaskHours = (index: number, hours: number | undefined) => {
    const newDetails = [...editedStep.details]
    newDetails[index] = { ...newDetails[index], flightHours: hours }
    setEditedStep({
      ...editedStep,
      details: newDetails
    })
  }

  const toggleTaskCompleted = (index: number, checked: boolean) => {
    const newDetails = [...editedStep.details]
    newDetails[index] = { ...newDetails[index], checked }
    setEditedStep({
      ...editedStep,
      details: newDetails
    })
  }

  const flightTasks = editedStep.details.filter(detail => detail.taskType === 'flight')
  const groundTasks = editedStep.details.filter(detail => detail.taskType === 'ground')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Flight Training Template</DialogTitle>
          <DialogDescription>
            Configure the training requirements and tasks for this step.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={editedStep.title}
                onChange={(e) => setEditedStep({ ...editedStep, title: e.target.value })}
                placeholder="Enter task title (e.g., Private Pilot License)"
                className="text-lg font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Task Description</Label>
              <Textarea
                id="description"
                value={editedStep.description}
                onChange={(e) => setEditedStep({ ...editedStep, description: e.target.value })}
                placeholder="Describe what this training step involves..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overview">Overview</Label>
              <Textarea
                id="overview"
                value={editedStep.overview || ''}
                onChange={(e) => setEditedStep({ ...editedStep, overview: e.target.value })}
                placeholder="Brief overview of this training step..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mandatory">Mandatory Step</Label>
                <div className="text-sm text-muted-foreground">
                  Required step that cannot be skipped by students
                </div>
              </div>
              <Switch
                id="mandatory"
                checked={editedStep.mandatory}
                onCheckedChange={(checked) => setEditedStep({ ...editedStep, mandatory: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="published">Publish Task</Label>
                <div className="text-sm text-muted-foreground">
                  Make this task visible to students
                </div>
              </div>
              <Switch
                id="published"
                checked={editedStep.status === 'published'}
                onCheckedChange={(checked) => setEditedStep({ 
                  ...editedStep, 
                  status: checked ? 'published' : 'draft' 
                })}
              />
            </div>
          </div>

          <Separator />

          {/* Flight Training Requirements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Flight Training Requirements</h3>
              <Badge variant="default">{flightTasks.length} items</Badge>
            </div>
            
            <div className="space-y-3">
              {flightTasks.map((task, taskIndex) => {
                const originalIndex = editedStep.details.indexOf(task)
                return (
                  <div key={originalIndex} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={task.checked}
                          onCheckedChange={(checked) => toggleTaskCompleted(originalIndex, checked as boolean)}
                        />
                        <Input
                          value={task.title}
                          onChange={(e) => updateTaskTitle(originalIndex, e.target.value)}
                          placeholder="Flight requirement name"
                          className="font-medium flex-1"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDetail(originalIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6">
                      <Label className="text-sm whitespace-nowrap">Required hours:</Label>
                      <Input
                        type="number"
                        value={task.flightHours || ''}
                        onChange={(e) => updateTaskHours(originalIndex, e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Optional"
                        className="w-24"
                        min="0"
                      />
                      <span className="text-sm text-muted-foreground">hours</span>
                    </div>
                  </div>
                )
              })}
              
              <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">Add Flight Requirement</h4>
                <div className="flex items-center gap-2">
                  <Input
                    value={newFlightTitle}
                    onChange={(e) => setNewFlightTitle(e.target.value)}
                    placeholder="Add flight requirement (e.g., Cross-country solo)"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={newFlightHours}
                    onChange={(e) => setNewFlightHours(e.target.value)}
                    placeholder="Hours"
                    className="w-24"
                    min="0"
                  />
                  <Button onClick={addFlightTask} disabled={!newFlightTitle.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ground Training Requirements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs text-primary-foreground font-bold">G</span>
              </div>
              <h3 className="text-lg font-semibold">Ground Training Requirements</h3>
              <Badge variant="secondary">{groundTasks.length} items</Badge>
            </div>
            
            <div className="space-y-3">
              {groundTasks.map((task, taskIndex) => {
                const originalIndex = editedStep.details.indexOf(task)
                return (
                  <div key={originalIndex} className="border rounded-lg p-4 bg-secondary/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={task.checked}
                          onCheckedChange={(checked) => toggleTaskCompleted(originalIndex, checked as boolean)}
                        />
                        <Input
                          value={task.title}
                          onChange={(e) => updateTaskTitle(originalIndex, e.target.value)}
                          placeholder="Ground training requirement"
                          className="font-medium flex-1"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDetail(originalIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
              
              <div className="border-2 border-dashed rounded-lg p-4">
                <h4 className="font-medium text-sm mb-3">Add Ground Requirement</h4>
                <div className="flex items-center gap-2">
                  <Input
                    value={newGroundTitle}
                    onChange={(e) => setNewGroundTitle(e.target.value)}
                    placeholder="Add ground requirement (e.g., Written exam preparation)"
                    className="flex-1"
                  />
                  <Button onClick={addGroundTask} disabled={!newGroundTitle.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}