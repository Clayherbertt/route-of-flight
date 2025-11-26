import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { supabase } from '@/integrations/supabase/client'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Loader2, Search, Edit2, Save, X, FileText, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ENDORSEMENT_SECTIONS, organizeEndorsementsBySection, getSectionTitle } from '@/utils/endorsementSections'

interface Endorsement {
  id: string
  endorsement_number: string
  section_id: string
  section_title: string
  title: string
  far_reference: string | null
  endorsement_text: string
  category: string
  expires: boolean
  expiration_days: number | null
  notes: string | null
  display_order: number
  active: boolean
}

export default function EndorsementLibrary() {
  const { user } = useAuth()
  const { isAdmin, loading } = useIsAdmin()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [loadingEndorsements, setLoadingEndorsements] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingEndorsement, setEditingEndorsement] = useState<Endorsement | null>(null)
  const [editText, setEditText] = useState('')
  const [sections, setSections] = useState<Map<string, Endorsement[]>>(new Map())

  // Handle redirect logic in useEffect to avoid render-time navigation
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/')
    }
  }, [user, isAdmin, loading, navigate])

  // Fetch endorsements from database
  useEffect(() => {
    if (isAdmin && user) {
      fetchEndorsements()
    }
  }, [isAdmin, user])

  // Organize endorsements by section using the new categorization
  useEffect(() => {
    const organized = organizeEndorsementsBySection(endorsements)
    setSections(organized)
  }, [endorsements])

  const fetchEndorsements = async () => {
    try {
      setLoadingEndorsements(true)
      const { data, error } = await (supabase as any)
        .from('endorsements')
        .select('*')
        .eq('active', true)
        .order('section_id')
        .order('display_order')

      if (error) {
        console.error('Error fetching endorsements:', error)
        // Check if table doesn't exist
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          toast({
            title: "Table Not Found",
            description: "The endorsements table doesn't exist yet. Please run the database migrations first.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to load endorsements",
            variant: "destructive",
          })
        }
        return
      }
      setEndorsements((data || []) as Endorsement[])
    } catch (error: any) {
      console.error('Error fetching endorsements:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to load endorsements. Please check the console for details.",
        variant: "destructive",
      })
    } finally {
      setLoadingEndorsements(false)
    }
  }

  const handleEdit = (endorsement: Endorsement) => {
    setEditingEndorsement(endorsement)
    setEditText(endorsement.endorsement_text)
  }

  const handleSave = async () => {
    if (!editingEndorsement) return

    try {
      const { error } = await (supabase as any)
        .from('endorsements')
        .update({ 
          endorsement_text: editText,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingEndorsement.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Endorsement updated successfully",
      })

      setEditingEndorsement(null)
      setEditText('')
      fetchEndorsements()
    } catch (error) {
      console.error('Error updating endorsement:', error)
      toast({
        title: "Error",
        description: "Failed to update endorsement",
        variant: "destructive",
      })
    }
  }

  // Filter endorsements based on search query
  const filteredSections = new Map<string, Endorsement[]>()
  sections.forEach((endorsements, sectionId) => {
    const filtered = endorsements.filter(endorsement => {
      // Apply search filter
      const query = searchQuery.toLowerCase()
      return (
        endorsement.title.toLowerCase().includes(query) ||
        endorsement.endorsement_text.toLowerCase().includes(query) ||
        endorsement.far_reference?.toLowerCase().includes(query) ||
        endorsement.category.toLowerCase().includes(query) ||
        endorsement.endorsement_number.toLowerCase().includes(query)
      )
    })
    if (filtered.length > 0) {
      filteredSections.set(sectionId, filtered)
    }
  })

  // Get section title - use the utility function
  const getSectionTitleForDisplay = (sectionId: string) => {
    return getSectionTitle(sectionId)
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

  // Return null if not authorized (navigation happens in useEffect)
  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Endorsement Library</h1>
              <p className="text-muted-foreground mt-2">
                Manage and maintain all FAA endorsements (A.1 - A.92)
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {endorsements.length} Endorsements
            </Badge>
          </div>
        </div>

        {/* Search Bar and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search endorsements by number, title, FAR reference, or text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Required Alert */}
        {endorsements.length === 0 && !loadingEndorsements && (
          <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Database Setup Required
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    The endorsements table needs to be created. Please run the database migrations:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                    <li>Run migration: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">20251125161250_create_endorsements_table.sql</code></li>
                    <li>Seed data: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">20251125161250_seed_endorsements.sql</code></li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Endorsements by Section */}
        {loadingEndorsements ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading endorsements...</span>
            </div>
          </div>
        ) : endorsements.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Endorsements Found</CardTitle>
              <CardDescription>
                The endorsements table needs to be created and seeded with data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">To set up the endorsement library:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong>Run the migration:</strong> Apply <code className="bg-muted px-1 rounded">20251125161250_create_endorsements_table.sql</code> to create the table
                    </li>
                    <li>
                      <strong>Seed the data:</strong> Run <code className="bg-muted px-1 rounded">20251125161250_seed_endorsements.sql</code> to populate initial endorsements
                    </li>
                    <li>
                      <strong>Refresh this page</strong> after migrations are complete
                    </li>
                  </ol>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    You can apply these migrations through the Supabase Dashboard SQL Editor or using the Supabase CLI.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {Array.from(filteredSections.entries())
              .filter(([sectionId]) => sectionId !== 'other') // Filter out "other" section
              .sort(([sectionIdA], [sectionIdB]) => {
                const sectionA = ENDORSEMENT_SECTIONS.find(s => s.id === sectionIdA)
                const sectionB = ENDORSEMENT_SECTIONS.find(s => s.id === sectionIdB)
                const orderA = sectionA?.order || 999
                const orderB = sectionB?.order || 999
                return orderA - orderB
              })
              .map(([sectionId, sectionEndorsements]) => (
              <AccordionItem key={sectionId} value={sectionId} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">{getSectionTitleForDisplay(sectionId)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {sectionEndorsements.length} endorsement{sectionEndorsements.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4 pb-2">
                    {sectionEndorsements.map((endorsement) => (
                      <Card key={endorsement.id} className="relative">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="font-mono">
                                  {endorsement.endorsement_number}
                                </Badge>
                                {endorsement.expires && (
                                  <Badge variant="outline" className="text-xs">
                                    Expires: {endorsement.expiration_days} days
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {endorsement.category}
                                </Badge>
                              </div>
                              <CardTitle className="text-base mb-2">
                                {endorsement.title}
                              </CardTitle>
                              {endorsement.far_reference && (
                                <p className="text-sm text-muted-foreground font-mono mb-2">
                                  {endorsement.far_reference}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(endorsement)}
                              className="ml-2"
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                            {endorsement.endorsement_text}
                          </div>
                          {endorsement.notes && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                              <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                                Note:
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                {endorsement.notes}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingEndorsement} onOpenChange={(open) => !open && setEditingEndorsement(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Endorsement {editingEndorsement?.endorsement_number}</DialogTitle>
              <DialogDescription>
                {editingEndorsement?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="endorsement-text">Endorsement Text</Label>
                <Textarea
                  id="endorsement-text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="font-mono text-sm min-h-[200px] mt-2"
                  placeholder="Enter endorsement text..."
                />
              </div>
              {editingEndorsement?.far_reference && (
                <div>
                  <Label>FAR Reference</Label>
                  <p className="text-sm text-muted-foreground font-mono mt-1">
                    {editingEndorsement.far_reference}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingEndorsement(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
