import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useIsAdmin } from "@/hooks/useIsAdmin"
import { User, Settings, LogOut, Shield, CreditCard, Book, Building2, Route, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function UserMenu() {
  const { user, signOut } = useAuth()
  const { isAdmin } = useIsAdmin()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate("/signin")
    } catch (error) {
      console.error('Logout error:', error)
      // Navigate to signin even if logout fails
      navigate("/signin")
    }
  }

  const handleProfile = () => {
    navigate("/profile")
  }

  const handleAdmin = () => {
    navigate("/admin")
  }

  const handleSubscription = () => {
    navigate("/subscription")
  }

  const handleLogbook = () => {
    navigate("/logbook")
  }

  const handleAirlines = () => {
    navigate("/airlines")
  }

  const handleRouteBuilder = () => {
    navigate("/route")
  }

  const handleResumeBuilder = () => {
    navigate("/resume")
  }

  if (!user) return null

  const userInitials = user.email
    ?.split('@')[0]
    .slice(0, 2)
    .toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || user.user_metadata?.display_name || "Pilot"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogbook}>
          <Book className="mr-2 h-4 w-4" />
          <span>Logbook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAirlines}>
          <Building2 className="mr-2 h-4 w-4" />
          <span>Airlines</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRouteBuilder}>
          <Route className="mr-2 h-4 w-4" />
          <span>Route Builder</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleResumeBuilder}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Resume Builder</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSubscription}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Subscription</span>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={handleAdmin}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}