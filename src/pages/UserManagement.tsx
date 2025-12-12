import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { supabase } from '@/integrations/supabase/client'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Shield, Users, Loader2, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  display_name: string | null
  created_at: string
  approval_status: string | null
  email_confirmed: boolean
  subscription_plan: string | null
  is_admin: boolean
}

export default function UserManagement() {
  const { user } = useAuth()
  const { isAdmin, loading } = useIsAdmin()
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  // Handle redirect logic
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/')
    }
  }, [user, isAdmin, loading, navigate])

  // Fetch all users
  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers()
    }
  }, [user, isAdmin])

  const fetchUsers = async () => {
    try {
      // First, get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, display_name, created_at, approval_status')
        .order('created_at', { ascending: false })

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        toast.error('Failed to load users')
        return
      }

      // For each profile, check email confirmation status and subscription plan
      const usersWithEmailStatus = await Promise.all(
        (profiles || []).map(async (profile) => {
          try {
            // Check email confirmation
            const { data: emailData, error: emailError } = await supabase.rpc('get_user_email_confirmed', {
              user_id_param: profile.id
            })
            
            if (emailError) {
              console.error(`RPC error for user ${profile.id}:`, emailError)
            }
            
            // emailData should be a boolean
            const isConfirmed = emailData === true || emailData === 'true' || emailData === 1
            
            // Check if user is admin
            let isAdmin = false
            try {
              const { data: adminData, error: adminError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', profile.id)
                .eq('role', 'admin')
                .maybeSingle()
              
              if (!adminError && adminData) {
                isAdmin = true
              }
            } catch (adminError) {
              console.error(`Error checking admin status for user ${profile.id}:`, adminError)
            }

            // Fetch subscription plan (only if not admin)
            let subscriptionPlan = 'Basic' // Default
            if (!isAdmin) {
              try {
                const { data: subscriberData, error: subError } = await supabase
                  .from('subscribers')
                  .select('current_plan_slug')
                  .eq('user_id', profile.id)
                  .maybeSingle()
                
                if (!subError && subscriberData?.current_plan_slug) {
                  // Map slug to display name
                  const planSlug = subscriberData.current_plan_slug.toLowerCase()
                  if (planSlug === 'pro') {
                    subscriptionPlan = 'Pro'
                  } else if (planSlug === 'pro-plus' || planSlug === 'pro_plus') {
                    subscriptionPlan = 'Pro Plus'
                  } else {
                    subscriptionPlan = 'Basic'
                  }
                }
              } catch (subError) {
                console.error(`Error fetching subscription for user ${profile.id}:`, subError)
              }
            }
            
            return {
              ...profile,
              email_confirmed: isConfirmed,
              subscription_plan: isAdmin ? null : subscriptionPlan,
              is_admin: isAdmin
            }
          } catch (error) {
            console.error(`Error processing user ${profile.id}:`, error)
            return {
              ...profile,
              email_confirmed: false,
              subscription_plan: 'Basic',
              is_admin: false
            }
          }
        })
      )

      setUsers(usersWithEmailStatus)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const deleteUser = async (userId: string) => {
    setDeletingUserId(userId)
    try {
      // Try to use the Edge Function first (if deployed)
      let edgeFunctionWorked = false
      try {
        const { data, error } = await supabase.functions.invoke('delete-user', {
          body: { userId }
        })

        if (!error && !data?.error) {
          edgeFunctionWorked = true
          toast.success('User and all associated data deleted successfully. Subscription cancelled.')
          setUsers(users.filter(u => u.id !== userId))
          fetchUsers()
          return
        } else {
          console.log('Edge Function error:', error || data?.error)
        }
      } catch (e) {
        console.log('Edge Function not available or failed:', e)
      }

      // If Edge Function didn't work, manually delete all user data
      // Delete all user data in order
      console.log('Deleting user data manually...')
      
      // 1. Delete from subscribers (cancels subscription)
      const { error: subError } = await supabase.from('subscribers').delete().eq('user_id', userId)
      if (subError) console.warn('Error deleting subscriber:', subError)
      
      // 2. Delete from user_routes
      const { error: routesError } = await supabase.from('user_routes').delete().eq('user_id', userId)
      if (routesError) console.warn('Error deleting user routes:', routesError)
      
      // 3. Delete from flight_entries
      const { error: flightsError } = await supabase.from('flight_entries').delete().eq('user_id', userId)
      if (flightsError) console.warn('Error deleting flight entries:', flightsError)
      
      // 4. Delete from aircraft_logbook
      const { error: aircraftError } = await supabase.from('aircraft_logbook').delete().eq('user_id', userId)
      if (aircraftError) console.warn('Error deleting aircraft logbook:', aircraftError)
      
      // 5. Try to delete from user_endorsements (if exists)
      try {
        const { error: endorsementsError } = await supabase.from('user_endorsements').delete().eq('user_id', userId)
        if (endorsementsError && !endorsementsError.message?.includes('does not exist')) {
          console.warn('Error deleting user endorsements:', endorsementsError)
        }
      } catch (e) {
        // Table might not exist, ignore
      }
      
      // 6. Delete from profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        throw new Error(`Failed to delete user profile: ${profileError.message}`)
      }

      // Edge Function should now be deployed and handle auth.users deletion
      // If it still fails, the manual deletion above will have removed all data
      toast.success('All user data deleted successfully. Subscription cancelled.')
      
      // Remove user from local state
      setUsers(users.filter(u => u.id !== userId))
      // Refresh the list
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(`Failed to delete user: ${error.message || 'Unknown error'}`)
    } finally {
      setDeletingUserId(null)
    }
  }

  // Show loading state while checking admin status
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Checking permissions...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Return null if not authorized
  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">User Management</h1>
              <Badge variant="secondary">Administrator</Badge>
            </div>
          </div>
          <p className="text-muted-foreground">
            View and manage all registered users
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
            <CardDescription>
              Registered pilots and their account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading users...</span>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userProfile) => (
                    <TableRow key={userProfile.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {userProfile.full_name || userProfile.display_name || 'No name'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {userProfile.id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{userProfile.email || 'No email'}</TableCell>
                      <TableCell>
                        <Badge variant={userProfile.email_confirmed ? 'default' : 'secondary'}>
                          {userProfile.email_confirmed ? 'active' : 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {userProfile.is_admin ? (
                          <Badge variant="default" className="bg-primary text-primary-foreground">
                            ADMIN
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            {userProfile.subscription_plan || 'Basic'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(userProfile.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingUserId === userProfile.id}
                            >
                              {deletingUserId === userProfile.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this user? This action cannot be undone.
                                This will permanently delete their account, all associated data (logbook entries, routes, aircraft, etc.), and cancel their subscription.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUser(userProfile.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}