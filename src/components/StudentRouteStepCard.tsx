import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Plus, Check, ChevronDown, ChevronRight } from 'lucide-react'
import * as icons from 'lucide-react'
import { useState } from 'react'

interface RouteStepDetail {
  id?: string
  title: string
  description: string
  checked: boolean
  flightHours?: number
  orderNumber: number
  taskType?: 'flight' | 'ground'
  mandatory?: boolean
}

interface RouteStep {
  id?: string
  title: string
  description: string
  icon: string
  orderNumber: number
  mandatory: boolean
  status: 'draft' | 'published'
  category: string
  details: RouteStepDetail[]
  nextSteps: string[]
}

interface StudentRouteStepCardProps {
  step: RouteStep
  variant?: 'available' | 'selected'
  onAddToRoute?: () => void
  onRemoveFromRoute?: () => void
  onToggleCompletion?: () => void
  onTaskToggle?: (taskId: string, checked: boolean) => void
  isCompleted?: boolean
  stepNumber?: number
  isExpanded?: boolean
  onToggleExpansion?: () => void
}

const iconMap = {
  GraduationCap: icons.GraduationCap,
  Plane: icons.Plane,
  Trophy: icons.Trophy,
  BookOpen: icons.BookOpen,
  Navigation: icons.Navigation,
  Clock: icons.Clock,
  Users: icons.Users,
  Award: icons.Award,
  Target: icons.Target,
  Settings: icons.Settings
}

// Utility function to strip HTML tags for display
const stripHtmlTags = (html: string) => {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

export function StudentRouteStepCard({ 
  step, 
  variant = 'available',
  onAddToRoute,
  onRemoveFromRoute,
  onToggleCompletion,
  onTaskToggle,
  isCompleted = false,
  stepNumber,
  isExpanded = false,
  onToggleExpansion
}: StudentRouteStepCardProps) {
  const IconComponent = iconMap[step.icon as keyof typeof iconMap] || icons.GraduationCap
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      variant === 'selected' ? 'border-primary/50 bg-primary/5' : ''
    } ${isCompleted ? 'border-green-500/50 bg-green-50/50' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {stepNumber && (
                  <Badge variant="outline" className="text-xs font-medium">
                    Step {stepNumber}
                  </Badge>
                )}
                <CardTitle className="text-xl">{step.title}</CardTitle>
                <div className="flex gap-1">
                  {step.mandatory && (
                    <Badge variant="destructive" className="text-xs">
                      Mandatory
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {step.category}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-base">
                {stripHtmlTags(step.description)}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {variant === 'available' && onAddToRoute && (
              <Button size="sm" onClick={onAddToRoute}>
                <Plus className="h-4 w-4 mr-1" />
                Add to Route
              </Button>
            )}
            
            {variant === 'selected' && (
              <div className="flex gap-2">
                {onToggleCompletion && (
                  <Button
                    size="sm"
                    variant={isCompleted ? "default" : "outline"}
                    onClick={onToggleCompletion}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Completed
                      </>
                    ) : (
                      "Mark Complete"
                    )}
                  </Button>
                )}
                {onRemoveFromRoute && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRemoveFromRoute}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-lg">Tasks & Requirements ({step.details.length})</h4>
            {onToggleExpansion && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpansion}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          {isExpanded && (
            <div className="space-y-3">
              {step.details.map((detail, index) => {
                const taskId = detail.id || index.toString()
                const isTaskExpanded = expandedTasks.has(taskId)
                
                return (
                  <Card key={taskId} className="border border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {variant === 'selected' && onTaskToggle ? (
                          <Checkbox
                            id={`task-${taskId}`}
                            checked={detail.checked}
                            onCheckedChange={(checked) => onTaskToggle(taskId, !!checked)}
                            className="mt-0.5"
                          />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-primary/40 mt-2 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <label 
                              htmlFor={`task-${taskId}`}
                              className={`font-medium cursor-pointer ${
                                detail.checked ? 'line-through text-muted-foreground' : ''
                              }`}
                            >
                              {detail.title}
                            </label>
                            <div className="flex gap-2 flex-shrink-0 items-center">
                              {detail.flightHours && (
                                <Badge variant="outline" className="text-xs">
                                  {detail.flightHours}h
                                </Badge>
                              )}
                              {step.category !== 'Initial Tasks' && step.category !== 'Cadet Programs' && (
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
                              {detail.description && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTaskExpansion(taskId)}
                                  className="h-6 w-6 p-0 ml-2"
                                >
                                  {isTaskExpanded ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                          {detail.description && (
                            <Collapsible open={isTaskExpanded} onOpenChange={() => toggleTaskExpansion(taskId)}>
                              <CollapsibleContent className="mt-3">
                                <div className="prose prose-sm max-w-none bg-muted/50 rounded-lg p-4">
                                  <div 
                                    dangerouslySetInnerHTML={{ __html: detail.description }}
                                    className="text-sm text-muted-foreground [&>*]:mb-2 [&>*:last-child]:mb-0 [&>ul]:ml-4 [&>ol]:ml-4 [&>ul>li]:list-disc [&>ol>li]:list-decimal"
                                  />
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          
          {isExpanded && step.details.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks defined for this step yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}