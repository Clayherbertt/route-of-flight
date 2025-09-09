import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Settings
} from 'lucide-react'

export default function RouteDashboard() {
  const { user } = useAuth()
  const { isAdmin, loading } = useIsAdmin()
  const navigate = useNavigate()

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

  // Sample route steps data - this would come from database
  const routeSteps = [
    {
      id: 1,
      title: "School Shopping & Discovery Flight",
      description: "First step in aviation career - choosing a school and taking your first flight",
      icon: GraduationCap,
      order: 1,
      mandatory: true,
      content: {
        overview: "Learn about different types of flight schools and take your first discovery flight",
        details: [
          "Part 61 vs Part 141 schools",
          "University programs vs flight academies", 
          "What to expect in a discovery flight",
          "Questions to ask during school visits"
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
      content: {
        overview: "Get your medical certificate from an FAA-approved Aviation Medical Examiner",
        details: [
          "Finding an Aviation Medical Examiner (AME)",
          "Required medical documentation",
          "Common medical disqualifiers",
          "Special issuance process if needed"
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
      content: {
        overview: "Start your PPL training with ground school and flight lessons",
        details: [
          "Ground school requirements",
          "Flight training minimums", 
          "Written exam preparation",
          "Checkride preparation"
        ]
      },
      nextSteps: [],
      status: "draft",
      connectedFrom: [2]
    }
  ]

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
                          <CardDescription>{step.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Overview</h4>
                        <p className="text-sm text-muted-foreground">{step.content.overview}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Key Topics ({step.content.details.length})</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {step.content.details.map((detail, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground bg-background/50 p-2 rounded border">
                              {detail}
                            </div>
                          ))}
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
      </main>
    </div>
  )
}