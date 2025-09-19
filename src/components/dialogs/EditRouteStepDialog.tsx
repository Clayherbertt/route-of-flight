import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Plane, GripVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
const CATEGORIES = ['Initial Tasks', 'Primary Training', 'Cadet Programs', 'Flight Instructing', 'Other Time Builders', 'Regional Requirements', 'Major Requirements'];

interface SortableTaskItemProps {
  task: RouteStepDetail;
  taskIndex: number;
  originalIndex: number;
  onToggleCompleted: (index: number, checked: boolean) => void;
  onUpdateTitle: (index: number, title: string) => void;
  onUpdateHours?: (index: number, hours: number | undefined) => void;
  onUpdateDescription?: (index: number, description: string) => void;
  onRemove: (index: number) => void;
  showHours?: boolean;
  showDescription?: boolean;
}

function SortableTaskItem({ task, taskIndex, originalIndex, onToggleCompleted, onUpdateTitle, onUpdateHours, onUpdateDescription, onRemove, showHours = false, showDescription = false }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `task-${originalIndex}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 space-y-3 ${showDescription ? 'bg-muted/30' : 'bg-secondary/30'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <Checkbox 
            checked={task.checked} 
            onCheckedChange={(checked) => onToggleCompleted(originalIndex, checked as boolean)} 
          />
          <Input 
            value={task.title} 
            onChange={(e) => onUpdateTitle(originalIndex, e.target.value)} 
            placeholder={showHours ? "Flight requirement name" : showDescription ? "Task name" : "Ground training requirement"} 
            className="font-medium flex-1" 
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => onRemove(originalIndex)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {showHours && onUpdateHours && (
        <div className="flex items-center gap-2 ml-10">
          <Label className="text-sm whitespace-nowrap">Required hours:</Label>
          <Input 
            type="number" 
            value={task.flightHours || ''} 
            onChange={(e) => onUpdateHours(originalIndex, e.target.value ? parseInt(e.target.value) : undefined)} 
            placeholder="Optional" 
            className="w-24" 
            min="0" 
          />
          <span className="text-sm text-muted-foreground">hours</span>
        </div>
      )}
      
      {showDescription && onUpdateDescription && (
        <div className="ml-10 space-y-3">
          <RichTextEditor 
            value={task.description} 
            onChange={(value) => onUpdateDescription(originalIndex, value)} 
            placeholder="Task description..." 
            height="120px"
          />
        </div>
      )}
    </div>
  );
}
interface RouteStepDetail {
  id?: string;
  title: string;
  description: string;
  checked: boolean;
  flightHours?: number;
  orderNumber: number;
  taskType: 'flight' | 'ground';
  mandatory?: boolean;
  published?: boolean;
}
interface RouteStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  orderNumber: number;
  mandatory: boolean;
  allowCustomerReorder: boolean;
  status: 'draft' | 'published';
  category: string;
  hourType?: 'ATP' | 'R-ATP';
  hourRequirementTitle?: string;
  hourRequirement?: number;
  details: RouteStepDetail[];
  nextSteps: string[];
  connectedFrom?: string[];
}
interface EditRouteStepDialogProps {
  step: RouteStep | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (step: RouteStep) => void;
}
export function EditRouteStepDialog({
  step,
  open,
  onOpenChange,
  onSave
}: EditRouteStepDialogProps) {
  const [editedStep, setEditedStep] = useState<RouteStep | null>(step);
  const [newFlightTitle, setNewFlightTitle] = useState('');
  const [newFlightHours, setNewFlightHours] = useState('');
  const [newGroundTitle, setNewGroundTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reset edited step when step prop changes or dialog opens/closes
  useEffect(() => {
    if (step) {
      setEditedStep(step);
    } else {
      setEditedStep(null);
    }
  }, [step, open]);

  if (!editedStep) return null;

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const activeId = active.id.replace('task-', '');
      const overId = over.id.replace('task-', '');
      
      const activeIndex = editedStep.details.findIndex((_, index) => index.toString() === activeId);
      const overIndex = editedStep.details.findIndex((_, index) => index.toString() === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const newDetails = arrayMove(editedStep.details, activeIndex, overIndex).map((detail, index) => ({
          ...detail,
          orderNumber: index
        }));

        setEditedStep({
          ...editedStep,
          details: newDetails
        });
      }
    }
  };
  if (!editedStep) return null;
  const handleSave = () => {
    // Ensure all data is properly formatted before saving
    const stepToSave: RouteStep = {
      ...editedStep,
      title: editedStep.title.replace(/<[^>]*>/g, '').trim(), // Strip HTML tags from title
      description: editedStep.description.trim(),
      category: editedStep.category || 'Primary Training',
      details: editedStep.details.map((detail, index) => ({
        ...detail,
        title: detail.title.replace(/<[^>]*>/g, '').trim(), // Strip HTML tags from detail titles
        orderNumber: index,
        taskType: detail.taskType || 'flight'
      }))
    };
    onSave(stepToSave);
    onOpenChange(false);
  };
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
      });
      setNewFlightTitle('');
      setNewFlightHours('');
    }
  };
  const addGroundTask = () => {
    if (newGroundTitle.trim()) {
      setEditedStep({
        ...editedStep,
        details: [...editedStep.details, {
          title: newGroundTitle.trim(),
          description: '',
          checked: false,
          orderNumber: editedStep.details.length,
          taskType: 'ground',
          mandatory: editedStep.category === 'Initial Tasks' ? false : undefined,
          published: editedStep.category === 'Initial Tasks' ? true : undefined
        }]
      });
      setNewGroundTitle('');
    }
  };
  const removeDetail = (index: number) => {
    setEditedStep({
      ...editedStep,
      details: editedStep.details.filter((_, i) => i !== index)
    });
  };
  const updateTaskTitle = (index: number, title: string) => {
    const newDetails = [...editedStep.details];
    newDetails[index] = {
      ...newDetails[index],
      title
    };
    setEditedStep({
      ...editedStep,
      details: newDetails
    });
  };
  const updateTaskHours = (index: number, hours: number | undefined) => {
    const newDetails = [...editedStep.details];
    newDetails[index] = {
      ...newDetails[index],
      flightHours: hours
    };
    setEditedStep({
      ...editedStep,
      details: newDetails
    });
  };
  const updateTaskDescription = (index: number, description: string) => {
    const newDetails = [...editedStep.details];
    newDetails[index] = {
      ...newDetails[index],
      description
    };
    setEditedStep({
      ...editedStep,
      details: newDetails
    });
  };
  const updateTaskPublished = (index: number, published: boolean) => {
    const newDetails = [...editedStep.details];
    newDetails[index] = {
      ...newDetails[index],
      published
    };
    setEditedStep({
      ...editedStep,
      details: newDetails
    });
  };
  const updateTaskMandatory = (index: number, mandatory: boolean) => {
    const newDetails = [...editedStep.details];
    newDetails[index] = {
      ...newDetails[index],
      mandatory
    };
    setEditedStep({
      ...editedStep,
      details: newDetails
    });
  };
  const toggleTaskCompleted = (index: number, checked: boolean) => {
    const newDetails = [...editedStep.details];
    newDetails[index] = {
      ...newDetails[index],
      checked
    };
    setEditedStep({
      ...editedStep,
      details: newDetails
    });
  };
  const flightTasks = editedStep.details.filter(detail => detail.taskType === 'flight');
  const groundTasks = editedStep.details.filter(detail => detail.taskType === 'ground');
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task Template</DialogTitle>
          <DialogDescription>
            Configure the training requirements and tasks for this step.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input id="title" value={editedStep.title} onChange={e => setEditedStep({
              ...editedStep,
              title: e.target.value
            })} placeholder="Enter task title (e.g., Private Pilot License)" className="text-lg font-medium" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Task Description</Label>
              <RichTextEditor 
                value={editedStep.description} 
                onChange={(value) => setEditedStep({
                  ...editedStep,
                  description: value
                })} 
                placeholder="Describe what this training step involves..." 
                height="120px"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={editedStep.category} onValueChange={value => setEditedStep({
              ...editedStep,
              category: value
            })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {CATEGORIES.map(category => <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mandatory">Mandatory Step</Label>
                <div className="text-sm text-muted-foreground">
                  Required step that cannot be skipped by students
                </div>
              </div>
              <Switch id="mandatory" checked={editedStep.mandatory} onCheckedChange={checked => setEditedStep({
              ...editedStep,
              mandatory: checked
            })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="published">Publish Task</Label>
                <div className="text-sm text-muted-foreground">
                  Make this task visible to students
                </div>
              </div>
              <Switch id="published" checked={editedStep.status === 'published'} onCheckedChange={checked => setEditedStep({
              ...editedStep,
              status: checked ? 'published' : 'draft'
            })} />
            </div>

            {/* Hour Requirements for Flight Instructing */}
            {editedStep.category === 'Flight Instructing' && (
              <>
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-medium">Hour Requirements</h3>
                  
                  <div className="space-y-2">
                    <Label>Hour Type</Label>
                    <Select value={editedStep.hourType || 'ATP'} onValueChange={value => setEditedStep({
                      ...editedStep,
                      hourType: value as 'ATP' | 'R-ATP'
                    })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hour type" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border z-50">
                        <SelectItem value="ATP">ATP</SelectItem>
                        <SelectItem value="R-ATP">R-ATP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourRequirementTitle">Hour Requirement Title</Label>
                    <Input 
                      id="hourRequirementTitle"
                      value={editedStep.hourRequirementTitle || ''} 
                      onChange={e => setEditedStep({
                        ...editedStep,
                        hourRequirementTitle: e.target.value
                      })} 
                      placeholder="e.g., Total Flight Time Required" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourRequirement">Required Hours</Label>
                    <Input 
                      id="hourRequirement"
                      type="number"
                      value={editedStep.hourRequirement || ''} 
                      onChange={e => setEditedStep({
                        ...editedStep,
                        hourRequirement: e.target.value ? parseInt(e.target.value) : undefined
                      })} 
                      placeholder="Enter required hours" 
                      min="0"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Conditional rendering based on category */}
          {editedStep.category === 'Initial Tasks' ? (
            /* Initial Tasks Template - Simple task list */
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-bold">T</span>
                  </div>
                  <h3 className="text-lg font-semibold">Task Items</h3>
                  <Badge variant="default">{editedStep.details.length} items</Badge>
                </div>
                
                <div className="space-y-3">
                  <SortableContext items={editedStep.details.map((_, index) => `task-${index}`)} strategy={verticalListSortingStrategy}>
                    {editedStep.details.map((task, taskIndex) => (
                      <SortableTaskItem
                        key={`task-${taskIndex}`}
                        task={task}
                        taskIndex={taskIndex}
                        originalIndex={taskIndex}
                        onToggleCompleted={toggleTaskCompleted}
                        onUpdateTitle={updateTaskTitle}
                        onUpdateDescription={updateTaskDescription}
                        onRemove={removeDetail}
                        showDescription={true}
                      />
                    ))}
                  </SortableContext>
                  
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-3">Add New Task</h4>
                    <div className="flex items-center gap-2">
                      <Input value={newGroundTitle} onChange={e => setNewGroundTitle(e.target.value)} placeholder="Add task item" className="flex-1" />
                      <Button onClick={addGroundTask} disabled={!newGroundTitle.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DndContext>
          ) : (
            /* Flight Training Template - Flight and Ground sections */
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <>
                {/* Flight Training Requirements */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Flight Training Requirements</h3>
                    <Badge variant="default">{flightTasks.length} items</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <SortableContext items={flightTasks.map((task) => `task-${editedStep.details.indexOf(task)}`)} strategy={verticalListSortingStrategy}>
                      {flightTasks.map((task, taskIndex) => {
                        const originalIndex = editedStep.details.indexOf(task);
                        return (
                          <SortableTaskItem
                            key={`task-${originalIndex}`}
                            task={task}
                            taskIndex={taskIndex}
                            originalIndex={originalIndex}
                            onToggleCompleted={toggleTaskCompleted}
                            onUpdateTitle={updateTaskTitle}
                            onUpdateHours={updateTaskHours}
                            onRemove={removeDetail}
                            showHours={true}
                          />
                        );
                      })}
                    </SortableContext>
                      
                    <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-sm">Add Flight Requirement</h4>
                      <div className="flex items-center gap-2">
                        <Input value={newFlightTitle} onChange={e => setNewFlightTitle(e.target.value)} placeholder="Add flight requirement (e.g., Cross-country solo)" className="flex-1" />
                        <Input type="number" value={newFlightHours} onChange={e => setNewFlightHours(e.target.value)} placeholder="Hours" className="w-24" min="0" />
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
                    <SortableContext items={groundTasks.map((task) => `task-${editedStep.details.indexOf(task)}`)} strategy={verticalListSortingStrategy}>
                      {groundTasks.map((task, taskIndex) => {
                        const originalIndex = editedStep.details.indexOf(task);
                        return (
                          <SortableTaskItem
                            key={`task-${originalIndex}`}
                            task={task}
                            taskIndex={taskIndex}
                            originalIndex={originalIndex}
                            onToggleCompleted={toggleTaskCompleted}
                            onUpdateTitle={updateTaskTitle}
                            onRemove={removeDetail}
                          />
                        );
                      })}
                    </SortableContext>
                      
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-3">Add Ground Requirement</h4>
                      <div className="flex items-center gap-2">
                        <Input value={newGroundTitle} onChange={e => setNewGroundTitle(e.target.value)} placeholder="Add ground requirement (e.g., Written exam preparation)" className="flex-1" />
                        <Button onClick={addGroundTask} disabled={!newGroundTitle.trim()}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            </DndContext>
          )}
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
    </Dialog>;
}