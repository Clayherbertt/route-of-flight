import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Edit, Trash2, GripVertical } from 'lucide-react'
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
  published?: boolean
}

interface RouteStep {
  id?: string
  title: string
  description: string
  icon: string
  orderNumber: number
  mandatory: boolean
  allowCustomerReorder: boolean
  status: 'draft' | 'published'
  category: string
  details: RouteStepDetail[]
  nextSteps: string[]
  connectedFrom?: string[]
}

interface SortableRouteStepCardProps {
  step: RouteStep
  isExpanded: boolean
  onToggleExpansion: () => void
  onEdit: () => void
  onDelete: () => void
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

export function SortableRouteStepCard({ 
  step, 
  isExpanded, 
  onToggleExpansion, 
  onEdit, 
  onDelete 
}: SortableRouteStepCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id! })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const IconComponent = iconMap[step.icon as keyof typeof iconMap] || icons.GraduationCap

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-muted"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <div className="flex gap-1">
                    {step.mandatory && (
                      <Badge variant="destructive" className="text-xs">
                        Mandatory
                      </Badge>
                    )}
                    <Badge 
                      variant={step.status === 'published' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {step.status}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{stripHtmlTags(step.description)}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleExpansion}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="border-t pt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Tasks ({step.details.length})</h4>
                  <div className="space-y-2">
                     {step.details.slice(0, 5).map((detail, index) => (
                       <div key={index} className="flex items-center space-x-2 text-sm">
                         <div className="w-2 h-2 rounded-full bg-primary/40" />
                         <span className="flex-1">{detail.title}</span>
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
                       </div>
                     ))}
                    {step.details.length > 5 && (
                      <div className="text-sm text-muted-foreground">
                        +{step.details.length - 5} more tasks...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}