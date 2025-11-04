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
  const [allFlights, setAllFlights] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchFlightStats()
    }
  }, [user])

  const fetchFlightStats = async () => {
    try {
      // Fetch all flights with pagination (same as Logbook page)
      const pageSize = 1000;
      let from = 0;
      let collected: any[] = [];

      while (true) {
        const { data, error } = await supabase
          .from('flight_entries')
          .select('*')
          .eq('user_id', user?.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .range(from, from + pageSize - 1);

        if (error) throw error;

        if (!data || data.length === 0) {
          break;
        }

        collected = [...collected, ...data];

        if (data.length < pageSize) {
          break;
        }

        from += pageSize;
      }

      const flights = collected;

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
        setAllFlights(flights) // Store all flights for Master Flight Log calculations
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

  // Calculate Master Flight Log totals
  const formatHours = (value: number) => {
    const rounded = Math.round(value * 100) / 100;
    return rounded.toFixed(2).replace(/\.?0+$/, "");
  };

  const parseApproaches = (value: string | null | undefined): number => {
    if (!value) return 0;
    const trimmed = String(value).trim();
    if (!trimmed) return 0;
    const numeric = Number.parseInt(trimmed, 10);
    if (!Number.isNaN(numeric) && numeric >= 0) {
      return numeric;
    }
    return 0;
  };

  const totalHours = allFlights.reduce((sum, flight) => sum + (Number(flight.total_time) || 0), 0);
  const totalPIC = allFlights.reduce((sum, flight) => sum + (Number(flight.pic_time) || 0), 0);
  const totalSIC = allFlights.reduce((sum, flight) => sum + (Number(flight.sic_time) || 0), 0);
  const totalSolo = allFlights.reduce((sum, flight) => sum + (Number(flight.solo_time) || 0), 0);
  const totalNight = allFlights.reduce((sum, flight) => sum + (Number(flight.night_time) || 0), 0);
  const totalXC = allFlights.reduce((sum, flight) => sum + (Number(flight.cross_country_time) || 0), 0);
  const totalActualInstrument = allFlights.reduce((sum, flight) => sum + (Number(flight.actual_instrument) || 0), 0);
  const totalSimInstrument = allFlights.reduce((sum, flight) => sum + (Number(flight.simulated_instrument) || 0), 0);
  const totalInstrument = totalActualInstrument + totalSimInstrument;
  const totalApproachCount = allFlights.reduce((sum, flight) => sum + parseApproaches(flight.approaches), 0);
  const totalHolds = allFlights.reduce((sum, flight) => sum + (Number(flight.holds) || 0), 0);
  const totalLandings = allFlights.reduce((sum, flight) => {
    const legacyLandings = flight.landings != null ? Number(flight.landings) || 0 : 0;
    const dayLandings = flight.day_landings != null ? Number(flight.day_landings) || 0 : 0;
    const dayFullStop = flight.day_landings_full_stop != null ? Number(flight.day_landings_full_stop) || 0 : 0;
    const nightLandings = flight.night_landings != null ? Number(flight.night_landings) || 0 : 0;
    const nightFullStop = flight.night_landings_full_stop != null ? Number(flight.night_landings_full_stop) || 0 : 0;
    if (legacyLandings > 0) {
      return sum + legacyLandings;
    }
    const sumOfIndividualFields = dayLandings + dayFullStop + nightLandings + nightFullStop;
    return sum + sumOfIndividualFields;
  }, 0);
  const totalDualGiven = allFlights.reduce((sum, flight) => sum + (Number(flight.dual_given) || 0), 0);
  const totalDualReceived = allFlights.reduce((sum, flight) => sum + (Number(flight.dual_received) || 0), 0);
  const totalSimulatedFlight = allFlights.reduce((sum, flight) => sum + (Number(flight.simulated_flight) || 0), 0);
  const totalGroundTraining = allFlights.reduce((sum, flight) => sum + (Number(flight.ground_training) || 0), 0);

  const formatMetric = (value: number, type: "hours" | "count") =>
    type === "hours" ? `${formatHours(value)} hrs` : `${value}`;

  const masterTotals = [
    { key: "total-time", label: "Total Time", value: totalHours, type: "hours" as const },
    { key: "pic-time", label: "PIC", value: totalPIC, type: "hours" as const },
    { key: "sic-time", label: "SIC", value: totalSIC, type: "hours" as const },
    { key: "solo-time", label: "Solo", value: totalSolo, type: "hours" as const },
    { key: "night-time", label: "Night", value: totalNight, type: "hours" as const },
    { key: "instrument-time", label: "Instrument (Total)", value: totalInstrument, type: "hours" as const },
    { key: "actual-instrument", label: "Actual Instrument", value: totalActualInstrument, type: "hours" as const },
    { key: "sim-instrument", label: "Sim Instrument", value: totalSimInstrument, type: "hours" as const },
    { key: "xc-time", label: "Cross Country", value: totalXC, type: "hours" as const },
    { key: "holds", label: "Holds", value: totalHolds, type: "count" as const },
    { key: "approaches", label: "Approaches", value: totalApproachCount, type: "count" as const },
    { key: "landings", label: "Landings", value: totalLandings, type: "count" as const },
    { key: "dual-given", label: "Dual Given", value: totalDualGiven, type: "hours" as const },
    { key: "dual-received", label: "Dual Received", value: totalDualReceived, type: "hours" as const },
    { key: "sim-flight", label: "Sim Flight", value: totalSimulatedFlight, type: "hours" as const },
    { key: "ground-training", label: "Ground Training", value: totalGroundTraining, type: "hours" as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-aviation-light/40 to-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Profile Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">
                  {user.user_metadata?.full_name || user.user_metadata?.display_name || "Pilot"}
                </h1>
                <p className="text-muted-foreground mb-2">{user.email}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <Shield className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                  {isAdmin && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      Administrator
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    Member since {joinDate}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/logbook')}
                className="hidden md:flex"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Logbook
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/aircraft')}
                className="hidden md:flex"
              >
                <Plane className="mr-2 h-4 w-4" />
                Aircraft
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Hours</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : flightStats.totalHours.toFixed(1)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground/40" />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Flights</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : flightStats.totalFlights}
                  </p>
                </div>
                <Plane className="h-8 w-8 text-muted-foreground/40" />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">PIC Hours</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : flightStats.picHours.toFixed(1)}
                  </p>
                </div>
                <Plane className="h-8 w-8 text-muted-foreground/40" />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Night Hours</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : flightStats.nightHours.toFixed(1)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground/40" />
              </div>
            </div>
          </div>
        </div>

        {/* Master Flight Log */}
        <div className="mb-8">
          <div className="rounded-3xl border border-white/50 bg-white/45 shadow-2xl shadow-aviation-navy/20 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/40 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Master Flight Log</p>
                <p className="text-sm text-muted-foreground">High-level totals across your entire logbook</p>
              </div>
              <p className="text-sm font-medium text-foreground/80">
                {allFlights.length} flights logged
              </p>
            </div>
            <div className="overflow-x-auto">
              <div className="flex min-w-max gap-3 px-6 py-4">
                {masterTotals.map((item) => (
                  <div
                    key={item.key}
                    className="min-w-[160px] rounded-2xl border border-white/50 bg-background/70 px-4 py-3 shadow-sm"
                  >
                    <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {formatMetric(item.value, item.type)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Account & Subscription Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Email Address</label>
                <div className="p-3 bg-muted/50 rounded-md border flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Full Name</label>
                <div className="p-3 bg-muted/50 rounded-md border flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{user.user_metadata?.full_name || user.user_metadata?.display_name || "Not set"}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Member Since</label>
                <div className="p-3 bg-muted/50 rounded-md border flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{joinDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your premium features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="px-3 py-1 mb-2">
                    Free Plan
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Upgrade for advanced features
                  </p>
                </div>
                <Button
                  variant="default"
                  onClick={() => navigate('/subscription')}
                >
                  Upgrade
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Premium Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Advanced flight analytics
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
                    Priority support
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Links - Mobile */}
        <div className="mt-6 md:hidden">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/logbook')}
                >
                  <BarChart3 className="mr-3 h-4 w-4" />
                  View Logbook
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/aircraft')}
                >
                  <Plane className="mr-3 h-4 w-4" />
                  Aircraft
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/subscription')}
                >
                  <Star className="mr-3 h-4 w-4" />
                  Subscription
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate('/admin')}
                  >
                    <Shield className="mr-3 h-4 w-4" />
                    Admin Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}