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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, GraduationCap, Stethoscope, Plane, Trophy } from 'lucide-react'

interface RouteStep {
  id: number
  title: string
  description: string
  icon: any
  order: number
  mandatory: boolean
  allowCustomerReorder: boolean
  content: {
    overview: string
    details: Array<{
      title: string
      description: string
    }>
  }
  nextSteps: number[]
  status: 'published' | 'draft'
  connectedFrom?: number[]
}

interface EditRouteStepDialogProps {
  step: RouteStep | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (step: RouteStep) => void
}

const iconOptions = [
  { value: 'GraduationCap', label: 'Graduation Cap', icon: GraduationCap },
  { value: 'Stethoscope', label: 'Medical/Stethoscope', icon: Stethoscope },
  { value: 'Plane', label: 'Airplane', icon: Plane },
  { value: 'Trophy', label: 'Trophy', icon: Trophy },
]

export function EditRouteStepDialog({ step, open, onOpenChange, onSave }: EditRouteStepDialogProps) {
  const [editedStep, setEditedStep] = useState<RouteStep | null>(step)
  const [newDetailTitle, setNewDetailTitle] = useState('')
  const [newDetailDescription, setNewDetailDescription] = useState('')

  // Reset edited step when step prop changes
  useEffect(() => {
    setEditedStep(step)
  }, [step])

  if (!editedStep) return null

  const handleSave = () => {
    onSave(editedStep)
    onOpenChange(false)
  }

  const addDetail = () => {
    if (newDetailTitle.trim()) {
      setEditedStep({
        ...editedStep,
        content: {
          ...editedStep.content,
          details: [...editedStep.content.details, {
            title: newDetailTitle.trim(),
            description: newDetailDescription.trim()
          }]
        }
      })
      setNewDetailTitle('')
      setNewDetailDescription('')
    }
  }

  const removeDetail = (index: number) => {
    setEditedStep({
      ...editedStep,
      content: {
        ...editedStep.content,
        details: editedStep.content.details.filter((_, i) => i !== index)
      }
    })
  }

  const updateDetail = (index: number, field: 'title' | 'description', value: string) => {
    const newDetails = [...editedStep.content.details]
    newDetails[index] = { ...newDetails[index], [field]: value }
    setEditedStep({
      ...editedStep,
      content: {
        ...editedStep.content,
        details: newDetails
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Route Step</DialogTitle>
          <DialogDescription>
            Modify the content and settings for this career path step.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Step Title</Label>
                <Input
                  id="title"
                  value={editedStep.title}
                  onChange={(e) => setEditedStep({ ...editedStep, title: e.target.value })}
                  placeholder="Enter step title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={editedStep.order}
                  onChange={(e) => setEditedStep({ ...editedStep, order: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedStep.description}
                onChange={(e) => setEditedStep({ ...editedStep, description: e.target.value })}
                placeholder="Brief description of this step"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overview">Overview</Label>
              <Textarea
                id="overview"
                value={editedStep.content.overview}
                onChange={(e) => setEditedStep({
                  ...editedStep,
                  content: { ...editedStep.content, overview: e.target.value }
                })}
                placeholder="Detailed overview of this step"
                rows={3}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mandatory">Mandatory Step</Label>
                <div className="text-sm text-muted-foreground">
                  Required step that cannot be skipped
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
                <Label htmlFor="allowCustomerReorder">Allow Customer Reordering</Label>
                <div className="text-sm text-muted-foreground">
                  Let customers reorder this step's topics
                </div>
              </div>
              <Switch
                id="allowCustomerReorder"
                checked={editedStep.allowCustomerReorder}
                onCheckedChange={(checked) => setEditedStep({ ...editedStep, allowCustomerReorder: checked })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editedStep.status}
                  onValueChange={(value: 'published' | 'draft') => 
                    setEditedStep({ ...editedStep, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value="GraduationCap" // This would need to be properly mapped
                  onValueChange={(value) => {
                    const selectedIcon = iconOptions.find(opt => opt.value === value)
                    if (selectedIcon) {
                      setEditedStep({ ...editedStep, icon: selectedIcon.icon })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <option.icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Key Topics/Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Key Topics</Label>
              <Badge variant="secondary">{editedStep.content.details.length} topics</Badge>
            </div>
            
            <div className="space-y-4">
              {editedStep.content.details.map((detail, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Topic {index + 1}</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDetail(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Topic Title</Label>
                    <Input
                      value={detail.title}
                      onChange={(e) => updateDetail(index, 'title', e.target.value)}
                      placeholder="Enter topic title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Topic Description</Label>
                    <Textarea
                      value={detail.description}
                      onChange={(e) => updateDetail(index, 'description', e.target.value)}
                      placeholder="Enter detailed information about this topic"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              
              <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
                <h5 className="font-medium">Add New Topic</h5>
                <div className="space-y-2">
                  <Label>Topic Title</Label>
                  <Input
                    value={newDetailTitle}
                    onChange={(e) => setNewDetailTitle(e.target.value)}
                    placeholder="Enter topic title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Topic Description</Label>
                  <Textarea
                    value={newDetailDescription}
                    onChange={(e) => setNewDetailDescription(e.target.value)}
                    placeholder="Enter detailed information"
                    rows={2}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={addDetail}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
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