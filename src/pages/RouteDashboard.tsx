import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Route, 
  MapPin, 
  Plane, 
  Clock, 
  TrendingUp, 
  Users,
  Loader2,
  Navigation,
  BarChart3,
  Map
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

  const popularRoutes = [
    { id: 1, route: "LAX - JFK", flights: 245, avgTime: "5h 32m", trend: "+12%" },
    { id: 2, route: "DFW - ATL", flights: 198, avgTime: "2h 15m", trend: "+8%" },
    { id: 3, route: "ORD - DEN", flights: 156, avgTime: "2h 45m", trend: "+5%" },
    { id: 4, route: "MIA - LGA", flights: 134, avgTime: "2h 58m", trend: "+15%" },
    { id: 5, route: "PHX - SEA", flights: 112, avgTime: "2h 52m", trend: "+3%" },
  ]

  const routeStats = [
    { airport: "LAX", totalFlights: 1245, avgDelay: "12min", onTimeRate: "84%" },
    { airport: "JFK", totalFlights: 1156, avgDelay: "18min", onTimeRate: "78%" },
    { airport: "ATL", totalFlights: 1089, avgDelay: "8min", onTimeRate: "89%" },
    { airport: "ORD", totalFlights: 967, avgDelay: "15min", onTimeRate: "81%" },
    { airport: "DFW", totalFlights: 892, avgDelay: "10min", onTimeRate: "87%" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Route className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Route Dashboard</h1>
            <Badge variant="secondary">Administrator</Badge>
          </div>
          <p className="text-muted-foreground">
            Monitor flight routes, traffic patterns, and route performance analytics
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="routes">Popular Routes</TabsTrigger>
            <TabsTrigger value="airports">Airport Stats</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
                  <Route className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">
                    Currently tracked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Flights</CardTitle>
                  <Plane className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3,892</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Flight Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3h 24m</div>
                  <p className="text-xs text-muted-foreground">
                    -5min from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">84.2%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% improvement
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Route Management</CardTitle>
                  <CardDescription>
                    Manage flight routes and optimize traffic flow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <Button variant="outline" className="justify-start">
                      <Map className="mr-2 h-4 w-4" />
                      View Route Map
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Navigation className="mr-2 h-4 w-4" />
                      Optimize Routes
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Performance Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Traffic Insights</CardTitle>
                  <CardDescription>
                    Real-time flight traffic and patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Peak Hours</span>
                    <Badge variant="secondary">7-9 AM, 5-7 PM</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Busiest Route</span>
                    <Badge variant="secondary">LAX ⇄ JFK</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Weather Delays</span>
                    <Badge variant="destructive">23 Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="routes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Flight Routes</CardTitle>
                <CardDescription>
                  Most frequently flown routes and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularRoutes.map((route) => (
                    <div key={route.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Route className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{route.route}</p>
                          <p className="text-sm text-muted-foreground">{route.flights} flights this month</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{route.avgTime}</p>
                        <Badge variant="secondary" className="text-xs">
                          {route.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="airports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Airport Performance</CardTitle>
                <CardDescription>
                  Traffic statistics and performance metrics by airport
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routeStats.map((airport, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{airport.airport}</p>
                          <p className="text-sm text-muted-foreground">{airport.totalFlights} flights</p>
                        </div>
                      </div>
                      <div className="flex space-x-4 text-sm">
                        <div className="text-right">
                          <p className="text-muted-foreground">Avg Delay</p>
                          <p className="font-medium">{airport.avgDelay}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">On-Time</p>
                          <p className="font-medium text-green-600">{airport.onTimeRate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Analytics</CardTitle>
                <CardDescription>
                  Advanced analytics and reporting tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="justify-start h-auto p-6">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span className="font-medium">Traffic Analysis</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Analyze flight patterns and traffic flow
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-6">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span className="font-medium">Performance Trends</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Track performance over time
                      </p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}