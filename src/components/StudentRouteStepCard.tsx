import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Check } from 'lucide-react'
import * as icons from 'lucide-react'

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
  stepNumber
}: StudentRouteStepCardProps) {
  const IconComponent = iconMap[step.icon as keyof typeof iconMap] || icons.GraduationCap

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
          <h4 className="font-semibold mb-4 text-lg">Tasks & Requirements ({step.details.length})</h4>
          <div className="space-y-3">
            {step.details.map((detail, index) => (
              <div key={detail.id || index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                {variant === 'selected' && onTaskToggle ? (
                  <Checkbox
                    id={`task-${detail.id || index}`}
                    checked={detail.checked}
                    onCheckedChange={(checked) => onTaskToggle(detail.id || index.toString(), !!checked)}
                    className="mt-0.5"
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-primary/40 mt-2 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <label 
                      htmlFor={`task-${detail.id || index}`}
                      className={`font-medium cursor-pointer ${
                        detail.checked ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {detail.title}
                    </label>
                    <div className="flex gap-2 flex-shrink-0">
                      {detail.flightHours && (
                        <Badge variant="outline" className="text-xs">
                          {detail.flightHours}h
                        </Badge>
                      )}
                      {step.category !== 'Initial Tasks' && (
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
                    </div>
                  </div>
                  {detail.description && (
                    <p className={`text-sm mt-1 ${
                      detail.checked ? 'line-through text-muted-foreground' : 'text-muted-foreground'
                    }`}>
                      {stripHtmlTags(detail.description)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {step.details.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks defined for this step yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}