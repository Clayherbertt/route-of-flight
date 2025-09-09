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
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, display_name, created_at, approval_status')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        toast.error('Failed to load users')
      } else {
        setUsers(data || [])
      }
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
      // Delete user profile (this will cascade to auth.users due to foreign key)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        console.error('Error deleting user profile:', profileError)
        toast.error('Failed to delete user')
        return
      }

      // Note: Deleting from profiles table only. 
      // Auth users table is managed by Supabase and will be handled by cascade if configured

      toast.success('User deleted successfully')
      // Remove user from local state
      setUsers(users.filter(u => u.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
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
                        <Badge variant={userProfile.approval_status === 'approved' ? 'default' : 'secondary'}>
                          {userProfile.approval_status || 'pending'}
                        </Badge>
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
                                This will permanently delete their account and all associated data.
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