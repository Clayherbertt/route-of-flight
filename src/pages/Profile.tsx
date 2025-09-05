import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, Shield, CreditCard } from "lucide-react"
import Header from "@/components/layout/Header"
import { useNavigate } from "react-router-dom"

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()

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
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <User className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">
              {user.user_metadata?.full_name || "Pilot Profile"}
            </h1>
            <p className="text-muted-foreground">Manage your account and logbook preferences</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your basic account details and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                    {user.email}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member Since
                  </label>
                  <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                    {joinDate}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Account Status
                  </label>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
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
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Badge variant="outline" className="mb-4">
                    Free Plan
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upgrade to premium to unlock advanced logbook features, analytics, and more.
                  </p>
                  <Button 
                    variant="aviation" 
                    className="w-full"
                    onClick={() => navigate('/subscription')}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Premium Features Include:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Advanced flight analytics</li>
                    <li>• Unlimited logbook entries</li>
                    <li>• Export capabilities</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logbook Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Logbook Summary</CardTitle>
              <CardDescription>
                Your current flight hours and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">0.0</p>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">0.0</p>
                  <p className="text-sm text-muted-foreground">PIC Hours</p>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">0.0</p>
                  <p className="text-sm text-muted-foreground">Multi-Engine</p>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Total Flights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}