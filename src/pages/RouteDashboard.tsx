import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useUserFlightHours } from '@/hooks/useUserFlightHours'
import Header from '@/components/layout/Header'
import { EditRouteStepDialog } from '@/components/dialogs/EditRouteStepDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Route, 
  Plus, 
  Edit3, 
  ArrowRight,
  Loader2,
  GraduationCap,
  Stethoscope,
  Plane,
  Trophy,
  MapPin,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export default function RouteDashboard() {
  const { user } = useAuth()
  const { isAdmin, loading } = useIsAdmin()
  const { totalHours } = useUserFlightHours()
  const navigate = useNavigate()
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<any>(null)
  
  // Expansion state for cards
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [routeSteps, setRouteSteps] = useState([
    {
      id: 1,
      title: "School Shopping & Discovery Flight",
      description: "First step in aviation career - choosing a school and taking your first flight",
      icon: GraduationCap,
      order: 1,
      mandatory: true,
      allowCustomerReorder: false,
      content: {
        overview: "Learn about different types of flight schools and take your first discovery flight",
        details: [
          {
            title: "Part 61 vs Part 141 schools",
            description: "Understand the differences between Part 61 and Part 141 flight training programs, including their structure, requirements, and which might be best for your goals.",
            checked: false
          },
          {
            title: "University programs vs flight academies", 
            description: "Compare collegiate aviation programs with dedicated flight academies, considering factors like cost, timeline, and career preparation.",
            checked: false
          },
          {
            title: "What to expect in a discovery flight",
            description: "Learn what happens during your first flight lesson, how to prepare, and what questions to ask your instructor.",
            checked: false
          },
          {
            title: "Questions to ask during school visits",
            description: "Essential questions about aircraft condition, instructor qualifications, safety records, and financing options.",
            checked: false
          }
        ]
      },
      nextSteps: [2],
      status: "published"
    },
    {
      id: 2,
      title: "First Class Medical Certificate",
      description: "Obtain your FAA medical certificate to ensure flight eligibility",
      icon: Stethoscope,
      order: 2,
      mandatory: true,
      allowCustomerReorder: true,
      content: {
        overview: "Get your medical certificate from an FAA-approved Aviation Medical Examiner",
        details: [
          {
            title: "Finding an Aviation Medical Examiner (AME)",
            description: "Locate FAA-authorized doctors in your area and understand the examination process.",
            checked: false
          },
          {
            title: "Required medical documentation",
            description: "Gather necessary medical records, prescriptions, and documentation before your exam.",
            checked: false
          },
          {
            title: "Common medical disqualifiers",
            description: "Learn about conditions that might affect your medical certificate and potential solutions.",
            checked: false
          },
          {
            title: "Special issuance process if needed",
            description: "Understand the special issuance process for conditions requiring additional FAA review.",
            checked: false
          }
        ]
      },
      nextSteps: [3],
      status: "published",
      connectedFrom: [1]
    },
    {
      id: 3,
      title: "Private Pilot License Training",
      description: "Begin your formal flight training toward your first pilot certificate",
      icon: Plane,
      order: 3,
      mandatory: true,
      allowCustomerReorder: false,
      content: {
        overview: "Start your PPL training with ground school and flight lessons",
        details: [
          {
            title: "Ground school requirements",
            description: "Complete the theoretical knowledge portion of pilot training covering aerodynamics, weather, navigation, and regulations.",
            checked: false
          },
          {
            title: "Flight training minimums",
            description: "Understanding minimum flight hour requirements and what skills you'll develop during training.",
            checked: false,
            flightHours: 40
          },
          {
            title: "Written exam preparation", 
            description: "Prepare for the FAA knowledge test with study materials, practice tests, and test-taking strategies.",
            checked: false
          },
          {
            title: "Checkride preparation",
            description: "Get ready for your practical exam with oral preparation and flight test requirements.",
            checked: false
          }
        ]
      },
      nextSteps: [],
      status: "draft",
      connectedFrom: [2]
    }
  ])

  // Handle redirect logic in useEffect to avoid render-time navigation
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/')
    }
  }, [user, isAdmin, loading, navigate])

  // Show loading state while checking admin status
  if (loading) {
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

  const handleSaveStep = (updatedStep: any) => {
    setRouteSteps(steps => 
      steps.map(step => step.id === updatedStep.id ? updatedStep : step)
    )
  }

  const toggleCardExpansion = (stepId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Step
            </Button>
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
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Drag to reorder</Badge>
            </div>
          </div>

          <div className="space-y-4">
            {routeSteps.map((step, index) => (
              <div key={step.id} className="relative">
                <Card className={`transition-all hover:shadow-md ${
                  step.status === 'published' ? 'border-green-200 bg-green-50/50' : 'border-yellow-200 bg-yellow-50/50'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                          <step.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <CardTitle className="text-lg">{step.title}</CardTitle>
                            {step.mandatory && (
                              <Badge variant="destructive" className="text-xs">
                                Mandatory
                              </Badge>
                            )}
                            <Badge variant={step.status === 'published' ? 'default' : 'secondary'}>
                              {step.status}
                            </Badge>
                          </div>
                          <CardDescription>
                            <div 
                              dangerouslySetInnerHTML={{ __html: step.description }}
                            />
                          </CardDescription>
                        </div>
                      </div>
                       <div className="flex items-center space-x-2">
                         <Button 
                           variant="ghost" 
                           size="sm"
                           onClick={() => toggleCardExpansion(step.id)}
                         >
                           {expandedCards.has(step.id) ? (
                             <ChevronUp className="h-4 w-4" />
                           ) : (
                             <ChevronDown className="h-4 w-4" />
                           )}
                         </Button>
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleEditStep(step)}
                         >
                           <Edit3 className="h-4 w-4 mr-2" />
                           Edit
                         </Button>
                       </div>
                    </div>
                  </CardHeader>
                  
                  {expandedCards.has(step.id) && (
                    <CardContent>
                      <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Overview</h4>
                            <div 
                              className="text-sm text-muted-foreground prose prose-sm" 
                              dangerouslySetInnerHTML={{ __html: step.content.overview }}
                            />
                          </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Key Topics ({step.content.details.length})</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {step.content.details.map((detail, idx) => {
                              const remainingHours = detail.flightHours ? Math.max(0, detail.flightHours - totalHours) : null
                              return (
                                <div key={idx} className="text-sm bg-background/50 p-3 rounded border">
                                  <div className="flex items-start space-x-3">
                                    {detail.checked !== undefined && (
                                      <Checkbox 
                                        className="mt-0.5"
                                        checked={detail.checked}
                                        onCheckedChange={() => {
                                          // Update checkbox state
                                          const updatedSteps = routeSteps.map(s => 
                                            s.id === step.id ? {
                                              ...s,
                                              content: {
                                                ...s.content,
                                                details: s.content.details.map((d, i) => 
                                                  i === idx ? { ...d, checked: !d.checked } : d
                                                )
                                              }
                                            } : s
                                          )
                                          setRouteSteps(updatedSteps)
                                        }}
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="font-medium text-foreground mb-1">{detail.title}</div>
                                      <div 
                                        className="text-muted-foreground text-xs mb-2 prose prose-xs" 
                                        dangerouslySetInnerHTML={{ __html: detail.description }}
                                      />
                                      {detail.flightHours && (
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="outline" className="text-xs">
                                            {detail.flightHours} hours required
                                          </Badge>
                                          {remainingHours !== null && (
                                            <Badge variant={remainingHours === 0 ? "default" : "secondary"} className="text-xs">
                                              {remainingHours === 0 ? "Complete!" : `${remainingHours} hours remaining`}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                      {step.allowCustomerReorder && (
                                        <Badge variant="outline" className="mt-2 text-xs">
                                          Customer can reorder
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {step.connectedFrom && step.connectedFrom.length > 0 && (
                          <div className="flex items-center space-x-2 pt-2 border-t">
                            <span className="text-sm font-medium">Connected from:</span>
                            <Badge variant="outline">
                              Step {step.connectedFrom[0]}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                  
                  {!expandedCards.has(step.id) && (
                    <CardContent className="pt-0">
                      <div className="text-sm text-muted-foreground">
                        {step.content.details.length} key topics • Click to expand
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Connection Arrow */}
                {index < routeSteps.length - 1 && (
                  <div className="flex justify-center py-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <EditRouteStepDialog
          step={editingStep}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveStep}
        />
      </main>
    </div>
  )
}