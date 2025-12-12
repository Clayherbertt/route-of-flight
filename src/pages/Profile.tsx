import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useIsAdmin } from "@/hooks/useIsAdmin"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignatureCanvas } from "@/components/SignatureCanvas"
import { useToast } from "@/hooks/use-toast"
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
  Star,
  Edit,
  Save,
  X,
  UserCircle
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
  const { toast } = useToast()
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
  
  // Account editing state
  const [isEditing, setIsEditing] = useState(false)
  const [showAccountDialog, setShowAccountDialog] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    cfiCertificateNumber: '',
    cfiCertificateType: 'CFI',
    cfiExpirationDate: '',
    electronicSignature: ''
  })

  useEffect(() => {
    if (user) {
      fetchFlightStats()
      fetchProfileData()
    }
  }, [user])

  const fetchProfileData = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, cfi_certificate_number, cfi_expiration_date, electronic_signature')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        // Parse CFI certificate number and type
        const cfiNumber = data.cfi_certificate_number || ''
        const certificateTypes = ['CFI', 'CFII', 'MEI', 'GI', 'AGI', 'IGI']
        let number = cfiNumber
        let type = 'CFI'
        
        for (const certType of certificateTypes) {
          if (cfiNumber.endsWith(certType)) {
            number = cfiNumber.slice(0, -certType.length)
            type = certType
            break
          }
        }

        setProfileData({
          fullName: data.full_name || user.user_metadata?.full_name || user.user_metadata?.display_name || '',
          email: data.email || user.email || '',
          cfiCertificateNumber: number,
          cfiCertificateType: type,
          cfiExpirationDate: data.cfi_expiration_date || '',
          electronicSignature: data.electronic_signature || ''
        })
      } else {
        // Initialize with user metadata
        setProfileData({
          fullName: user.user_metadata?.full_name || user.user_metadata?.display_name || '',
          email: user.email || '',
          cfiCertificateNumber: '',
          cfiCertificateType: 'CFI',
          cfiExpirationDate: '',
          electronicSignature: ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      // Combine certificate number and type
      const fullCertificateNumber = profileData.cfiCertificateNumber 
        ? `${profileData.cfiCertificateNumber}${profileData.cfiCertificateType}`
        : null

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.fullName,
          email: profileData.email,
          cfi_certificate_number: fullCertificateNumber,
          cfi_expiration_date: profileData.cfiExpirationDate || null,
          electronic_signature: profileData.electronicSignature || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (error) {
        throw error
      }

      toast({
        title: "Profile updated",
        description: "Your account information has been saved successfully.",
      })

      setIsEditing(false)
      setShowAccountDialog(false)
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    fetchProfileData()
    setIsEditing(false)
  }

  // Check if user is an instructor (has CFI certificate number)
  const isInstructor = !!profileData.cfiCertificateNumber || isEditing

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
          .order('start_time', { ascending: false, nullsFirst: false })
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowAccountDialog(true)}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Account Information
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/aircraft')}>
                    <Plane className="mr-2 h-4 w-4" />
                    Aircraft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/subscription')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscription
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

        {/* Subscription Section */}
        <div className="grid md:grid-cols-1 gap-6">
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

      {/* Account Information Dialog */}
      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Information
            </DialogTitle>
            <DialogDescription>
              Your account details and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="dialog-email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="dialog-email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="mt-2"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md border flex items-center gap-2 mt-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.email || user.email}</span>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="dialog-fullName">Full Name</Label>
              {isEditing ? (
                <Input
                  id="dialog-fullName"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="mt-2"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md border flex items-center gap-2 mt-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.fullName || user.user_metadata?.full_name || user.user_metadata?.display_name || "Not set"}</span>
                </div>
              )}
            </div>
            
            <div>
              <Label>Member Since</Label>
              <div className="p-3 bg-muted/50 rounded-md border flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{joinDate}</span>
              </div>
            </div>

            <Separator />

            {/* CFI Instructor Fields */}
            {(isInstructor || isEditing) && (
              <>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Flight Instructor Information</Label>
                  <p className="text-sm text-muted-foreground">
                    Add your CFI certificate information to issue endorsements
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dialog-cfiNumber">Certificate Number</Label>
                    <Input
                      id="dialog-cfiNumber"
                      value={profileData.cfiCertificateNumber}
                      onChange={(e) => setProfileData({ ...profileData, cfiCertificateNumber: e.target.value })}
                      placeholder="e.g., 4083052"
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-cfiType">Certificate Type</Label>
                    <Select
                      value={profileData.cfiCertificateType}
                      onValueChange={(value) => setProfileData({ ...profileData, cfiCertificateType: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CFI">CFI</SelectItem>
                        <SelectItem value="CFII">CFII</SelectItem>
                        <SelectItem value="MEI">MEI</SelectItem>
                        <SelectItem value="GI">GI</SelectItem>
                        <SelectItem value="AGI">AGI</SelectItem>
                        <SelectItem value="IGI">IGI</SelectItem>
                      </SelectContent>
                    </Select>
                    {isEditing && profileData.cfiCertificateNumber && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Full number: {profileData.cfiCertificateNumber}{profileData.cfiCertificateType}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="dialog-cfiExpiration">Expiration Date</Label>
                  <Input
                    id="dialog-cfiExpiration"
                    type="date"
                    value={profileData.cfiExpirationDate}
                    onChange={(e) => setProfileData({ ...profileData, cfiExpirationDate: e.target.value })}
                    disabled={!isEditing}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Electronic Signature</Label>
                  {isEditing ? (
                    <div className="mt-2">
                      <SignatureCanvas
                        value={profileData.electronicSignature}
                        onChange={(value) => setProfileData({ ...profileData, electronicSignature: value })}
                        firstName={profileData.fullName.split(' ')[0] || ''}
                        lastName={profileData.fullName.split(' ').slice(1).join(' ') || ''}
                      />
                    </div>
                  ) : (
                    <div className="mt-2 p-3 bg-muted/50 rounded-md border">
                      {profileData.electronicSignature ? (
                        <img 
                          src={profileData.electronicSignature} 
                          alt="Signature" 
                          className="max-w-full h-20 object-contain"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">No signature on file</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {!isInstructor && !isEditing && (
              <div className="p-3 bg-muted/50 rounded-md border text-sm text-muted-foreground">
                <p>Are you a Flight Instructor? Click "Edit" to add your CFI certificate information.</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}