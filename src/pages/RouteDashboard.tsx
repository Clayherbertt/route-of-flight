import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useUserFlightHours } from '@/hooks/useUserFlightHours'
import { useRouteSteps } from '@/hooks/useRouteSteps'
import { 
  DndContext, 
  DragEndEvent, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import Header from '@/components/layout/Header'
import { SortableRouteStepCard } from '@/components/SortableRouteStepCard'
import { EditRouteStepDialog } from '@/components/dialogs/EditRouteStepDialog'
import { StepTemplateSelectionDialog } from '@/components/dialogs/StepTemplateSelectionDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  Route, 
  Plus, 
  ArrowDown,
  Loader2,
  Trophy,
  Settings
} from 'lucide-react'
import * as icons from 'lucide-react'

export default function RouteDashboard() {
  const { user } = useAuth()
  const { isAdmin, loading } = useIsAdmin()
  const { 
    routeSteps, 
    setRouteSteps,
    loading: stepsLoading, 
    saveRouteStep, 
    deleteRouteStep, 
    reorderRouteSteps 
  } = useRouteSteps()
  const navigate = useNavigate()
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<any>(null)
  
  // Template selection dialog state
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  
  // Expansion state for cards
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  
  // Expansion state for accordion sections
  const [expandedSections, setExpandedSections] = useState<string[]>(['cadet-programs'])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = routeSteps.findIndex(step => step.id === active.id)
      const newIndex = routeSteps.findIndex(step => step.id === over?.id)
      
      const newOrder = arrayMove(routeSteps, oldIndex, newIndex).map(step => step.id!)
      reorderRouteSteps(newOrder)
    }
  }

  // Handle redirect logic in useEffect to avoid render-time navigation
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/')
    }
  }, [user, isAdmin, loading, navigate])

  // Show loading state while checking admin status
  if (loading || stepsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading dashboard...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Return null if not authorized (navigation happens in useEffect)
  if (!user || !isAdmin) {
    return null
  }

  // Edit handlers
  const handleEditStep = (step: any) => {
    setEditingStep(step)
    setEditDialogOpen(true)
  }

  const handleSaveStep = async (updatedStep: any) => {
    try {
      console.log('RouteDashboard: Saving step:', {
        id: updatedStep.id,
        title: updatedStep.title,
        category: updatedStep.category,
        hasDetails: updatedStep.details?.length > 0
      })
      
      // Optimistically update local state immediately
      setRouteSteps((prevSteps: any[]) => {
        if (updatedStep.id) {
          // Update existing step
          return prevSteps.map(step => 
            step.id === updatedStep.id ? { ...step, ...updatedStep } : step
          )
        } else {
          // Add new step - it will get an ID from the save response
          return [...prevSteps, updatedStep]
        }
      })
      
      // Save to database (this will return the saved step with ID)
      const result = await saveRouteStep(updatedStep)
      
      // If it was a new step, update with the actual ID from database
      if (!updatedStep.id && result?.stepId) {
        setRouteSteps((prevSteps: any[]) => 
          prevSteps.map(step => 
            step.id === undefined || step.id === '' 
              ? { ...step, id: result.stepId }
              : step
          )
        )
      }
      
      console.log('RouteDashboard: Step saved successfully')
    } catch (error) {
      console.error('RouteDashboard: Error saving step:', error)
      throw error
    }
  }

  // Template selection handlers
  const handleAddNewStep = () => {
    setEditingStep(null) // Clear any existing editing state
    setEditDialogOpen(false) // Ensure edit dialog is closed
    setTemplateDialogOpen(true)
  }

  const handleSelectTemplate = (template: any) => {
    // Create new step from template with next order number
    const nextOrderNumber = Math.max(...routeSteps.map(s => s.orderNumber), 0) + 1
    
    const newStep = {
      ...template.defaultStructure,
      id: '', // Empty ID means it's a new step
      orderNumber: nextOrderNumber,
      icon: template.icon,
      nextSteps: [],
      connectedFrom: []
    }
    
    console.log('RouteDashboard: Opening edit dialog for new step from template:', {
      templateId: template.id,
      category: newStep.category,
      icon: newStep.icon,
      orderNumber: newStep.orderNumber
    })
    
    // Close template dialog and open edit dialog with the new step
    setTemplateDialogOpen(false)
    setEditingStep(newStep)
    setEditDialogOpen(true)
  }

  const handleDeleteStep = async (stepId: string) => {
    if (window.confirm('Are you sure you want to delete this route step? This action cannot be undone.')) {
      await deleteRouteStep(stepId)
    }
  }

  const toggleCardExpansion = (stepId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }))
  }

  // Group route steps into accordion categories
  const groupStepsByCategory = () => {
    const groups: Record<string, typeof routeSteps> = {
      'initial-action-items': [],
      'initial-flight-training': [],
      'flight-instructing': [],
      'working-as-flight-instructor': [],
      'cadet-programs': []
    }

    routeSteps.forEach(step => {
      const title = step.title.toLowerCase()
      
      // ALWAYS check category first - if category is explicitly set, use it
      if (step.category === 'Cadet Programs') {
        groups['cadet-programs'].push(step)
        return // Don't check other conditions
      }
      
      // Initial Action Items
      if (title.includes('initial training preparation') || 
          title.includes('medical certification') ||
          title.includes('medical')) {
        groups['initial-action-items'].push(step)
      }
      // Initial Flight Training
      else if (
        (title.includes('private pilot') && (title.includes('part 61') || title.includes('pilot license'))) ||
        (title.includes('instrument rating') && (title.includes('part 61') || title.includes('rating'))) ||
        (title.includes('commercial pilot') && (title.includes('single engine') || title.includes('single')) && (title.includes('part 61') || title.includes('land') || title.includes('single'))) ||
        (title.includes('commercial pilot') && (title.includes('multi engine') || title.includes('multi')) && (title.includes('part 61') || title.includes('multi'))) ||
        (title.includes('commercial') && title.includes('single') && (title.includes('land') || title.includes('part 61'))) ||
        (title.includes('commercial') && title.includes('multi') && (title.includes('part 61') || title.includes('engine')))
      ) {
        groups['initial-flight-training'].push(step)
      }
      // Flight Instructing (certifications) - but NOT if category is Cadet Programs
      else if (
        ((title.includes('certified flight instructor') || title.includes('cfi')) && 
         !title.includes('instrument') && !title.includes('multi') && 
         !title.includes('restricted') && !title.includes('unrestricted') && 
         !title.includes('working') && !title.includes('atp')) ||
        (title.includes('certified flight instructor') && title.includes('instrument')) ||
        (title.includes('cfii')) ||
        (title.includes('multi engine instructor') || title.includes('mei'))
      ) {
        groups['flight-instructing'].push(step)
      }
      // Working as a Flight Instructor (time building)
      else if (
        (title.includes('unrestricted atp') && (title.includes('minimum') || title.includes('min'))) ||
        (title.includes('restricted atp') && title.includes('bachelor')) ||
        (title.includes('restricted atp') && title.includes('associate')) ||
        (title.includes('flight instructing') && title.includes('atp'))
      ) {
        groups['working-as-flight-instructor'].push(step)
      }
      // Cadet Programs - fallback to title matching if category wasn't set
      else if (
        title.includes('cadet program') ||
        title.includes('cadet')
      ) {
        groups['cadet-programs'].push(step)
      }
    })

    return groups
  }

  const stepGroups = groupStepsByCategory()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Route className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Route Dashboard</h1>
              <Badge variant="secondary">Administrator</Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNewStep}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Step
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Configure career path routes and steps for aspiring airline pilots
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Steps</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routeSteps.length}</div>
              <p className="text-xs text-muted-foreground">
                Active route steps
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {routeSteps.filter(step => step.status === 'published').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Live for customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Steps</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {routeSteps.filter(step => step.status === 'draft').length}
              </div>
              <p className="text-xs text-muted-foreground">
                In development
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Career Path Steps</h2>
          </div>

          <Accordion 
            type="multiple" 
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="space-y-4"
          >
            {/* Initial Action Items */}
            <AccordionItem value="initial-action-items" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Initial Action Items</h3>
                    <p className="text-sm text-muted-foreground">
                      {stepGroups['initial-action-items'].length} step{stepGroups['initial-action-items'].length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={stepGroups['initial-action-items'].map(step => step.id!).filter(Boolean)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {stepGroups['initial-action-items'].map((step) => {
                        if (!step.id) return null
                        return (
                          <SortableRouteStepCard
                            key={step.id}
                            step={step}
                            isExpanded={expandedCards[step.id] || false}
                            onToggleExpansion={() => toggleCardExpansion(step.id!)}
                            onEdit={() => handleEditStep(step)}
                            onDelete={() => handleDeleteStep(step.id!)}
                          />
                        )
                      })}
                      {stepGroups['initial-action-items'].length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No steps in this category yet
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </AccordionContent>
            </AccordionItem>

            {/* Initial Flight Training */}
            <AccordionItem value="initial-flight-training" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Initial Flight Training</h3>
                    <p className="text-sm text-muted-foreground">
                      {stepGroups['initial-flight-training'].length} step{stepGroups['initial-flight-training'].length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={stepGroups['initial-flight-training'].map(step => step.id!).filter(Boolean)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {stepGroups['initial-flight-training'].map((step) => {
                        if (!step.id) return null
                        return (
                          <SortableRouteStepCard
                            key={step.id}
                            step={step}
                            isExpanded={expandedCards[step.id] || false}
                            onToggleExpansion={() => toggleCardExpansion(step.id!)}
                            onEdit={() => handleEditStep(step)}
                            onDelete={() => handleDeleteStep(step.id!)}
                          />
                        )
                      })}
                      {stepGroups['initial-flight-training'].length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No steps in this category yet
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </AccordionContent>
            </AccordionItem>

            {/* Flight Instructing */}
            <AccordionItem value="flight-instructing" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Flight Instructing</h3>
                    <p className="text-sm text-muted-foreground">
                      {stepGroups['flight-instructing'].length} step{stepGroups['flight-instructing'].length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={stepGroups['flight-instructing'].map(step => step.id!).filter(Boolean)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {stepGroups['flight-instructing'].map((step) => {
                        if (!step.id) return null
                        return (
                          <SortableRouteStepCard
                            key={step.id}
                            step={step}
                            isExpanded={expandedCards[step.id] || false}
                            onToggleExpansion={() => toggleCardExpansion(step.id!)}
                            onEdit={() => handleEditStep(step)}
                            onDelete={() => handleDeleteStep(step.id!)}
                          />
                        )
                      })}
                      {stepGroups['flight-instructing'].length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No steps in this category yet
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </AccordionContent>
            </AccordionItem>

            {/* Working as a Flight Instructor */}
            <AccordionItem value="working-as-flight-instructor" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Working as a Flight Instructor</h3>
                    <p className="text-sm text-muted-foreground">
                      {stepGroups['working-as-flight-instructor'].length} step{stepGroups['working-as-flight-instructor'].length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={stepGroups['working-as-flight-instructor'].map(step => step.id!).filter(Boolean)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {stepGroups['working-as-flight-instructor'].map((step) => {
                        if (!step.id) return null
                        return (
                          <SortableRouteStepCard
                            key={step.id}
                            step={step}
                            isExpanded={expandedCards[step.id] || false}
                            onToggleExpansion={() => toggleCardExpansion(step.id!)}
                            onEdit={() => handleEditStep(step)}
                            onDelete={() => handleDeleteStep(step.id!)}
                          />
                        )
                      })}
                      {stepGroups['working-as-flight-instructor'].length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No steps in this category yet
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </AccordionContent>
            </AccordionItem>

            {/* Cadet Programs */}
            <AccordionItem value="cadet-programs" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Cadet Programs</h3>
                    <p className="text-sm text-muted-foreground">
                      {stepGroups['cadet-programs'].length} step{stepGroups['cadet-programs'].length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={stepGroups['cadet-programs'].map(step => step.id!).filter(Boolean)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {stepGroups['cadet-programs'].map((step) => {
                        if (!step.id) return null
                        return (
                          <SortableRouteStepCard
                            key={step.id}
                            step={step}
                            isExpanded={expandedCards[step.id] || false}
                            onToggleExpansion={() => toggleCardExpansion(step.id!)}
                            onEdit={() => handleEditStep(step)}
                            onDelete={() => handleDeleteStep(step.id!)}
                          />
                        )
                      })}
                      {stepGroups['cadet-programs'].length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No steps in this category yet
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>


        <EditRouteStepDialog
          step={editingStep}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveStep}
        />

        <StepTemplateSelectionDialog
          open={templateDialogOpen}
          onOpenChange={setTemplateDialogOpen}
          onSelectTemplate={handleSelectTemplate}
        />
      </main>
    </div>
  )
}