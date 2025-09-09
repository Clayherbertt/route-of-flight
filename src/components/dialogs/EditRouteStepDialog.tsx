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
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, GraduationCap, Stethoscope, Plane, Trophy } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface RouteStepSubTopic {
  id?: string
  title: string
  checked: boolean
  flightHours?: number
  orderNumber: number
}

interface RouteStepDetail {
  id?: string
  title: string
  description: string
  checked: boolean
  flightHours?: number
  orderNumber: number
  subTopics?: RouteStepSubTopic[]
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
  details: RouteStepDetailWithSubTopics[]
  nextSteps: string[]
  connectedFrom?: string[]
}

interface RouteStepDetailWithSubTopics {
  id?: string
  title: string
  description: string
  checked: boolean
  flightHours?: number
  orderNumber: number
  subTopics?: RouteStepSubTopic[]
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
    if (step && JSON.stringify(step) !== JSON.stringify(editedStep)) {
      setEditedStep(step)
    }
  }, [step, editedStep])

  if (!editedStep) return null

  const handleSave = () => {
    onSave(editedStep)
    onOpenChange(false)
  }

  const addDetail = () => {
    if (newDetailTitle.trim()) {
      setEditedStep({
        ...editedStep,
        details: [...editedStep.details, {
          title: newDetailTitle.trim(),
          description: newDetailDescription.trim(),
          checked: false,
          flightHours: undefined,
          orderNumber: editedStep.details.length,
          subTopics: []
        }]
      })
      setNewDetailTitle('')
      setNewDetailDescription('')
    }
  }

  const removeDetail = (index: number) => {
    setEditedStep({
      ...editedStep,
      details: editedStep.details.filter((_, i) => i !== index)
    })
  }

  const updateDetail = (index: number, field: 'title' | 'description', value: string) => {
    const newDetails = [...editedStep.details]
    newDetails[index] = { ...newDetails[index], [field]: value }
    setEditedStep({
      ...editedStep,
      details: newDetails
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
                  value={editedStep.orderNumber}
                  onChange={(e) => setEditedStep({ ...editedStep, orderNumber: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                value={editedStep.description}
                onChange={(value) => setEditedStep({ ...editedStep, description: value })}
                placeholder="Brief description of this step"
                height="80px"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overview">Overview</Label>
              <RichTextEditor
                value={editedStep.overview}
                onChange={(value) => setEditedStep({ ...editedStep, overview: value })}
                placeholder="Detailed overview of this step"
                height="120px"
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
                  value={editedStep.icon || "GraduationCap"}
                  onValueChange={(value) => {
                    setEditedStep({ ...editedStep, icon: value })
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
              <Badge variant="secondary">{editedStep.details.length} topics</Badge>
            </div>
            
            <div className="space-y-4">
              {editedStep.details.map((detail, index) => (
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
                    <RichTextEditor
                      value={detail.description}
                      onChange={(value) => updateDetail(index, 'description', value)}
                      placeholder="Enter detailed information about this topic"
                      height="100px"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`checkable-${index}`}
                        checked={detail.checked || false}
                        onCheckedChange={(checked) => {
                          const newDetails = [...editedStep.details]
                          newDetails[index] = { ...newDetails[index], checked: checked as boolean }
                          setEditedStep({
                            ...editedStep,
                            details: newDetails
                          })
                        }}
                      />
                      <Label htmlFor={`checkable-${index}`}>Checkable item</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Flight Hours Required</Label>
                      <Input
                        type="number"
                        value={detail.flightHours || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined
                          const newDetails = [...editedStep.details]
                          newDetails[index] = { ...newDetails[index], flightHours: value }
                          setEditedStep({
                            ...editedStep,
                            details: newDetails
                          })
                        }}
                        placeholder="Hours"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  {/* Sub-topics section */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Sub-topics</Label>
                      <Badge variant="secondary" className="text-xs">
                        {detail.subTopics?.length || 0} items
                      </Badge>
                    </div>
                    
                    {detail.subTopics?.map((subTopic, subIndex) => (
                      <div key={subIndex} className="ml-4 p-3 border rounded-md bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Sub-topic {subIndex + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newDetails = [...editedStep.details]
                              const newSubTopics = [...(newDetails[index].subTopics || [])]
                              newSubTopics.splice(subIndex, 1)
                              newDetails[index] = { ...newDetails[index], subTopics: newSubTopics }
                              setEditedStep({
                                ...editedStep,
                                details: newDetails
                              })
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Input
                            value={subTopic.title}
                            onChange={(e) => {
                              const newDetails = [...editedStep.details]
                              const newSubTopics = [...(newDetails[index].subTopics || [])]
                              newSubTopics[subIndex] = { ...newSubTopics[subIndex], title: e.target.value }
                              newDetails[index] = { ...newDetails[index], subTopics: newSubTopics }
                              setEditedStep({
                                ...editedStep,
                                details: newDetails
                              })
                            }}
                            placeholder="Sub-topic title"
                          />
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={subTopic.checked}
                                onCheckedChange={(checked) => {
                                  const newDetails = [...editedStep.details]
                                  const newSubTopics = [...(newDetails[index].subTopics || [])]
                                  newSubTopics[subIndex] = { ...newSubTopics[subIndex], checked: checked as boolean }
                                  newDetails[index] = { ...newDetails[index], subTopics: newSubTopics }
                                  setEditedStep({
                                    ...editedStep,
                                    details: newDetails
                                  })
                                }}
                              />
                              <Label className="text-xs">Checkable</Label>
                            </div>
                            <div className="flex-1">
                              <Input
                                type="number"
                                value={subTopic.flightHours || ''}
                                onChange={(e) => {
                                  const value = e.target.value ? parseInt(e.target.value) : undefined
                                  const newDetails = [...editedStep.details]
                                  const newSubTopics = [...(newDetails[index].subTopics || [])]
                                  newSubTopics[subIndex] = { ...newSubTopics[subIndex], flightHours: value }
                                  newDetails[index] = { ...newDetails[index], subTopics: newSubTopics }
                                  setEditedStep({
                                    ...editedStep,
                                    details: newDetails
                                  })
                                }}
                                placeholder="Hours"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDetails = [...editedStep.details]
                        const currentSubTopics = newDetails[index].subTopics || []
                        newDetails[index] = { 
                          ...newDetails[index], 
                          subTopics: [
                            ...currentSubTopics,
                            {
                              title: '',
                              checked: false,
                              flightHours: undefined,
                              orderNumber: currentSubTopics.length
                            }
                          ]
                        }
                        setEditedStep({
                          ...editedStep,
                          details: newDetails
                        })
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sub-topic
                    </Button>
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
                  <RichTextEditor
                    value={newDetailDescription}
                    onChange={setNewDetailDescription}
                    placeholder="Enter detailed information"
                    height="80px"
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