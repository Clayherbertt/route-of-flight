import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useIsAdmin } from "@/hooks/useIsAdmin"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  CreditCard, 
  Plane, 
  Clock, 
  BarChart3,
  Settings,
  LogOut,
  Star
} from "lucide-react"
import Header from "@/components/layout/Header"
import { useNavigate } from "react-router-dom"

interface FlightStats {
  totalHours: number
  picHours: number
  multiEngineHours: number
  totalFlights: number
  nightHours: number
  instrumentHours: number
}

export default function Profile() {
  const { user, signOut } = useAuth()
  const { isAdmin } = useIsAdmin()
  const navigate = useNavigate()
  const [flightStats, setFlightStats] = useState<FlightStats>({
    totalHours: 0,
    picHours: 0,
    multiEngineHours: 0,
    totalFlights: 0,
    nightHours: 0,
    instrumentHours: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchFlightStats()
    }
  }, [user])

  const fetchFlightStats = async () => {
    try {
      const { data: flights, error } = await supabase
        .from('flight_entries')
        .select('total_time, pic_time, night_time, instrument_time')
        .eq('user_id', user?.id)

      if (error) throw error

      if (flights) {
        const stats = flights.reduce((acc, flight) => ({
          totalHours: acc.totalHours + (Number(flight.total_time) || 0),
          picHours: acc.picHours + (Number(flight.pic_time) || 0),
          multiEngineHours: acc.multiEngineHours + (Number(flight.total_time) || 0), // Simplified for now
          nightHours: acc.nightHours + (Number(flight.night_time) || 0),
          instrumentHours: acc.instrumentHours + (Number(flight.instrument_time) || 0),
          totalFlights: acc.totalFlights + 1
        }), {
          totalHours: 0,
          picHours: 0,
          multiEngineHours: 0,
          nightHours: 0,
          instrumentHours: 0,
          totalFlights: 0
        })

        setFlightStats(stats)
      }
    } catch (error) {
      console.error('Error fetching flight stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/signin')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/signin')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Please sign in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const joinDate = new Date(user.created_at).toLocaleDateString()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border min-h-screen">
          <div className="p-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">
                  {user.user_metadata?.full_name || user.user_metadata?.display_name || "Pilot"}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {isAdmin ? "Administrator" : "Pilot"}
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4 mb-8">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {loading ? "..." : flightStats.totalHours.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm font-medium">Total Flight Hours</p>
              </div>
              
              <div className="bg-gradient-to-r from-sky-500/5 to-sky-500/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Plane className="w-5 h-5 text-sky-600" />
                  <span className="text-2xl font-bold text-sky-600">
                    {loading ? "..." : flightStats.totalFlights}
                  </span>
                </div>
                <p className="text-sm font-medium">Total Flights</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Navigation
              </h3>
              
              {isAdmin && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left mb-2"
                  onClick={() => navigate('/admin')}
                >
                  <Shield className="mr-3 h-4 w-4" />
                  Admin Dashboard
                </Button>
              )}
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => navigate('/logbook')}
              >
                <BarChart3 className="mr-3 h-4 w-4" />
                View Logbook
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => navigate('/aircraft')}
              >
                <Plane className="mr-3 h-4 w-4" />
                Aircraft
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => navigate('/subscription')}
              >
                <Star className="mr-3 h-4 w-4" />
                Subscription
              </Button>
              
              <Separator className="my-4" />
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-muted-foreground hover:text-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 max-w-5xl">
          <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Profile Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account, subscription, and logbook preferences
                </p>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                Member since {joinDate}
              </Badge>
            </div>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your basic account details and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                      <div className="mt-1 p-3 bg-muted/50 rounded-md border">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                        {isAdmin && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Administrator
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <div className="mt-1 p-3 bg-muted/50 rounded-md border">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{user.user_metadata?.full_name || user.user_metadata?.display_name || "Not set"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                      <div className="mt-1 p-3 bg-muted/50 rounded-md border">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{joinDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  Manage your premium features and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="px-3 py-1">
                        Free Plan
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Upgrade for advanced features
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Premium Features Include:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Advanced flight analytics & insights
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Unlimited logbook entries
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Export capabilities (PDF, CSV)
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Priority customer support
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <Button
                    variant="default"
                    className="shrink-0"
                    onClick={() => navigate('/subscription')}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Logbook Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Personal Logbook Summary
                </CardTitle>
                <CardDescription>
                  Your current flight hours and statistics
                  {loading && <span className="ml-2">(Loading...)</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary mb-1">
                      {loading ? "..." : flightStats.totalHours.toFixed(1)}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">Total Hours</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-sky-500/10 to-sky-500/5 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-sky-600 mb-1">
                      {loading ? "..." : flightStats.picHours.toFixed(1)}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">PIC Hours</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600 mb-1">
                      {loading ? "..." : flightStats.nightHours.toFixed(1)}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">Night Hours</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600 mb-1">
                      {loading ? "..." : flightStats.instrumentHours.toFixed(1)}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">Instrument</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600 mb-1">
                      {loading ? "..." : flightStats.multiEngineHours.toFixed(1)}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">Multi-Engine</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-rose-600 mb-1">
                      {loading ? "..." : flightStats.totalFlights}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">Total Flights</p>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Last updated: {loading ? "Loading..." : "Just now"}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/logbook')}
                  >
                    View Full Logbook
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}