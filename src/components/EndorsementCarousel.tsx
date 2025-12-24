import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Award, FileText, UserPlus, Send, Clock, CheckCircle, XCircle, AlertTriangle, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ENDORSEMENT_SECTIONS, organizeEndorsementsBySection, getSectionTitle } from '@/utils/endorsementSections'

interface Endorsement {
  id: string
  endorsement_id: string
  endorsement_number: string
  title: string
  far_reference: string | null
  received_date: string
  instructor_name: string | null
  instructor_certificate_number: string | null
  status: string
  notes: string | null
  endorsement_text?: string | null
  instructor_expiration_date?: string | null
  instructor_signature?: string | null
}

interface PendingEndorsement extends Endorsement {
  created_at: string
}

export function EndorsementCarousel() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [pendingEndorsements, setPendingEndorsements] = useState<PendingEndorsement[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPending, setLoadingPending] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [showDisclaimerDialog, setShowDisclaimerDialog] = useState(false)
  
  // Debug: Log when disclaimer dialog state changes
  useEffect(() => {
    console.log('showDisclaimerDialog state changed:', showDisclaimerDialog)
  }, [showDisclaimerDialog])
  const [showIssueDialog, setShowIssueDialog] = useState(false)
  const [showIssueFormDialog, setShowIssueFormDialog] = useState(false)
  const [showPendingDialog, setShowPendingDialog] = useState(false)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [availableEndorsements, setAvailableEndorsements] = useState<any[]>([])
  const [loadingEndorsements, setLoadingEndorsements] = useState(false)
  const [selectedEndorsement, setSelectedEndorsement] = useState<any | null>(null)
  const [instructorProfile, setInstructorProfile] = useState<any | null>(null)
  const [loadingInstructorProfile, setLoadingInstructorProfile] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [emailValidationError, setEmailValidationError] = useState('')
  const [validatingEmail, setValidatingEmail] = useState(false)
  const [editableEndorsementText, setEditableEndorsementText] = useState('')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      fetchEndorsements()
      fetchPendingEndorsements()
    }
  }, [user])

  // Refresh pending count when dialog opens/closes
  useEffect(() => {
    if (showPendingDialog && user) {
      fetchPendingEndorsements()
    }
  }, [showPendingDialog, user])

  // Fetch instructor profile when issue form dialog opens
  useEffect(() => {
    if (showIssueFormDialog && user && selectedEndorsement) {
      fetchInstructorProfile()
      // Initialize editable endorsement text
      if (selectedEndorsement.endorsement_text) {
        setEditableEndorsementText(selectedEndorsement.endorsement_text)
      } else {
        setEditableEndorsementText('')
      }
    }
  }, [showIssueFormDialog, user, selectedEndorsement])

  const fetchInstructorProfile = async () => {
    if (!user) return

    try {
      setLoadingInstructorProfile(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, cfi_certificate_number, cfi_expiration_date, electronic_signature')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching instructor profile:', error)
        toast({
          title: "Error",
          description: "Failed to load instructor profile information.",
          variant: "destructive",
        })
        return
      }

      setInstructorProfile(data)
    } catch (error: any) {
      console.error('Error fetching instructor profile:', error)
      toast({
        title: "Error",
        description: "Failed to load instructor profile information.",
        variant: "destructive",
      })
    } finally {
      setLoadingInstructorProfile(false)
    }
  }

  const validateRecipientEmail = async (email: string) => {
    if (!email) {
      setEmailValidationError('')
      return false
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailValidationError('Please enter a valid email address')
      return false
    }

    // Safeguard: Check if instructor is trying to issue to themselves
    if (instructorProfile?.email) {
      const emailNormalized = email.toLowerCase().trim()
      const instructorEmailNormalized = instructorProfile.email.toLowerCase().trim()
      
      if (emailNormalized === instructorEmailNormalized) {
        setEmailValidationError('You cannot issue an endorsement to your own email address')
        return false
      }
    }

    try {
      setValidatingEmail(true)
      setEmailValidationError('')

      // Check if user exists in auth.users by email
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error || !data) {
        setEmailValidationError('This email is not registered with Route of Flight')
        return false
      }

      // Additional safeguard: Check user ID if we have the current user
      if (user && data.id === user.id) {
        setEmailValidationError('You cannot issue an endorsement to your own email address')
        return false
      }

      // Auto-fill recipient name if found
      if (data.full_name) {
        setRecipientName(data.full_name)
      }

      setEmailValidationError('')
      return true
    } catch (error: any) {
      console.error('Error validating email:', error)
      setEmailValidationError('Error validating email. Please try again.')
      return false
    } finally {
      setValidatingEmail(false)
    }
  }

  const fetchEndorsements = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_endorsements')
        .select(`
          id,
          endorsement_id,
          received_date,
          instructor_name,
          instructor_certificate_number,
          status,
          notes,
          endorsements (
            endorsement_number,
            title,
            far_reference
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted') // Only show accepted endorsements
        .order('received_date', { ascending: false })

      if (error) {
        console.error('Error fetching endorsements:', error)
        return
      }

      // Transform the data to flatten the nested endorsements object
      const transformedData: Endorsement[] = (data || []).map((item: any) => {
        // Parse notes field - it may contain JSON with endorsement_text and instructor_metadata
        // The edited endorsement text from the instructor is stored here
        let endorsementText = ''
        let instructorExpirationDate = null
        let instructorSignature = null

        if (item.notes) {
          try {
            // Try to parse as JSON first (new format with edited text)
            const parsed = JSON.parse(item.notes)
            if (parsed.endorsement_text) {
              // Use the edited endorsement text from the instructor
              endorsementText = parsed.endorsement_text
            }
            if (parsed.instructor_metadata) {
              instructorExpirationDate = parsed.instructor_metadata.expiration_date
              instructorSignature = parsed.instructor_metadata.electronic_signature
            }
          } catch {
            // If not JSON, treat as plain text (backward compatibility)
            // This is the edited text stored directly
            endorsementText = item.notes
          }
        }
        
        // IMPORTANT: Always use the edited text from notes, never fall back to the library text
        // The endorsement_text from the library (item.endorsements?.endorsement_text) should NOT be used
        // because the instructor may have edited it

        return {
          id: item.id,
          endorsement_id: item.endorsement_id,
          endorsement_number: item.endorsements?.endorsement_number || '',
          title: item.endorsements?.title || '',
          far_reference: item.endorsements?.far_reference || null,
          received_date: item.received_date,
          instructor_name: item.instructor_name,
          instructor_certificate_number: item.instructor_certificate_number,
          status: item.status,
          notes: item.notes,
          endorsement_text: endorsementText,
          instructor_expiration_date: instructorExpirationDate,
          instructor_signature: instructorSignature,
        }
      })

      setEndorsements(transformedData)
    } catch (error) {
      console.error('Error fetching endorsements:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingEndorsements = async () => {
    if (!user) return

    try {
      setLoadingPending(true)
      const { data, error } = await supabase
        .from('user_endorsements')
        .select(`
          id,
          endorsement_id,
          received_date,
          instructor_name,
          instructor_certificate_number,
          status,
          notes,
          created_at,
          endorsements (
            endorsement_number,
            title,
            far_reference,
            endorsement_text
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending endorsements:', error)
        return
      }

      // Transform the data
      const transformedData: PendingEndorsement[] = (data || []).map((item: any) => {
        // Parse notes field - it may contain JSON with endorsement_text and instructor_metadata
        let endorsementText = item.endorsements?.endorsement_text || ''
        let instructorExpirationDate = null
        let instructorSignature = null

        if (item.notes) {
          try {
            // Try to parse as JSON first (new format with edited text)
            const parsed = JSON.parse(item.notes)
            if (parsed.endorsement_text) {
              // Use the edited endorsement text from the instructor - this is what they typed
              endorsementText = parsed.endorsement_text
            } else {
              // If JSON but no endorsement_text field, use notes as fallback
              endorsementText = item.notes
            }
            if (parsed.instructor_metadata) {
              instructorExpirationDate = parsed.instructor_metadata.expiration_date
              instructorSignature = parsed.instructor_metadata.electronic_signature
            }
          } catch (e) {
            // If not JSON, treat as plain text (backward compatibility)
            // This means the notes field contains the edited text directly
            endorsementText = item.notes
          }
        }
        
        // IMPORTANT: Always use the edited text from notes, never fall back to the library text
        // The endorsement_text from the library (item.endorsements?.endorsement_text) should NOT be used
        // because the instructor may have edited it

        return {
          id: item.id,
          endorsement_id: item.endorsement_id,
          endorsement_number: item.endorsements?.endorsement_number || '',
          title: item.endorsements?.title || '',
          far_reference: item.endorsements?.far_reference || null,
          received_date: item.received_date,
          instructor_name: item.instructor_name,
          instructor_certificate_number: item.instructor_certificate_number,
          status: item.status,
          notes: item.notes,
          endorsement_text: endorsementText,
          instructor_expiration_date: instructorExpirationDate,
          instructor_signature: instructorSignature,
          created_at: item.created_at,
        }
      })

      setPendingEndorsements(transformedData)
    } catch (error) {
      console.error('Error fetching pending endorsements:', error)
    } finally {
      setLoadingPending(false)
    }
  }

  const handleAcceptEndorsement = async (endorsementId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_endorsements')
        .update({ status: 'accepted' })
        .eq('id', endorsementId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      toast({
        title: "Endorsement accepted",
        description: "The endorsement has been added to your endorsements.",
      })

      // Refresh both lists
      await fetchEndorsements()
      await fetchPendingEndorsements()
    } catch (error: any) {
      console.error('Error accepting endorsement:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to accept endorsement. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDenyEndorsement = async (endorsementId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_endorsements')
        .update({ status: 'denied' })
        .eq('id', endorsementId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      toast({
        title: "Endorsement denied",
        description: "The endorsement has been declined.",
      })

      // Refresh pending list
      await fetchPendingEndorsements()
    } catch (error: any) {
      console.error('Error denying endorsement:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to deny endorsement. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchAvailableEndorsements = async () => {
    try {
      setLoadingEndorsements(true)
      const { data, error } = await (supabase as any)
        .from('endorsements')
        .select('*')
        .eq('active', true)
        .order('endorsement_number')

      if (error) {
        console.error('Error fetching available endorsements:', error)
        toast({
          title: "Error",
          description: "Failed to load endorsements from the library.",
          variant: "destructive",
        })
        return
      }

      setAvailableEndorsements(data || [])
    } catch (error: any) {
      console.error('Error fetching available endorsements:', error)
      toast({
        title: "Error",
        description: "Failed to load endorsements. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingEndorsements(false)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/95 shadow-xl shadow-aviation-navy/15 backdrop-blur">
        <div className="px-6 py-6">
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Loading endorsements...</p>
          </div>
        </div>
      </div>
    )
  }

  // Render dialogs component (shared across all states)
  const renderDialogs = () => (
    <>
      {/* Request Endorsement Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Endorsement</DialogTitle>
            <DialogDescription>
              Request an endorsement from your instructor. This feature is coming soon.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              The request endorsement feature will allow you to send a request to your instructor for a specific endorsement.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disclaimer Dialog */}
      <Dialog 
        open={showDisclaimerDialog} 
        onOpenChange={(open) => {
          console.log('Disclaimer dialog onOpenChange:', open)
          setShowDisclaimerDialog(open)
          if (!open) {
            setDisclaimerAccepted(false)
          }
        }}
      >
        <DialogContent className="max-w-2xl sm:max-w-3xl">
          <DialogHeader className="space-y-3 pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Endorsement Validity Disclaimer
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Important information about instructor certification requirements
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="rounded-lg border border-yellow-200/50 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-900/10 p-4 space-y-4">
              <div className="space-y-3 text-sm leading-relaxed text-foreground">
                <p className="text-base font-medium text-foreground mb-2">
                  Instructor Certification Requirements
                </p>
                <p>
                  To issue any FAA-required endorsement, the instructor must hold a current and valid Certified Flight Instructor (CFI/CFII/MEI) certificate or a Ground Instructor certificate appropriate to the training being endorsed.
                </p>
                <p>
                  Issuing an endorsement without an active instructor certificate renders the endorsement invalid, and the student cannot use it to meet the requirements of 14 CFR Part 61.
                </p>
                <p>
                  Providing an endorsement while not properly certificated may also constitute a violation of 14 CFR § 61.59, which prohibits the fraudulent or intentional falsification of records, including logbook entries and endorsements.
                </p>
                <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800">
                  <p className="font-semibold text-foreground">
                    All instructors are responsible for ensuring their instructor certificate is valid, current (when applicable), and appropriate for the type of endorsement being issued.
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="accept-disclaimer"
                  checked={disclaimerAccepted}
                  onCheckedChange={(checked) => setDisclaimerAccepted(checked === true)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="accept-disclaimer"
                  className="text-sm font-medium leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I understand and accept the terms of this disclaimer. I certify that I hold a current and valid instructor certificate appropriate for the endorsements I will issue.
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDisclaimerDialog(false)
                setDisclaimerAccepted(false)
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (disclaimerAccepted) {
                  setShowDisclaimerDialog(false)
                  await fetchAvailableEndorsements()
                  setShowIssueDialog(true)
                  setDisclaimerAccepted(false)
                }
              }}
              disabled={!disclaimerAccepted}
              className="w-full sm:w-auto"
            >
              Accept and Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Endorsement Dialog - Endorsement Selection */}
      <Dialog open={showIssueDialog} onOpenChange={(open) => {
        setShowIssueDialog(open)
        if (!open) {
          setAvailableEndorsements([])
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select Endorsement to Issue</DialogTitle>
            <DialogDescription>
              Choose an endorsement from the library to issue to a student.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-4">
            {loadingEndorsements ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Loading endorsements...</p>
              </div>
            ) : availableEndorsements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-sm font-medium text-foreground mb-1">No endorsements available</p>
                <p className="text-xs text-muted-foreground">Please check the endorsement library.</p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {Array.from(organizeEndorsementsBySection(availableEndorsements).entries())
                  .filter(([sectionId]) => sectionId !== 'other')
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
                            <h3 className="font-semibold text-base">{getSectionTitle(sectionId)}</h3>
                            <p className="text-xs text-muted-foreground">
                              {sectionEndorsements.length} endorsement{sectionEndorsements.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-2">
                          {sectionEndorsements.map((endorsement: any) => (
                            <div
                              key={endorsement.id}
                              className="w-full rounded-md border border-input bg-background px-4 py-3 transition-colors"
                            >
                              <div className="flex items-start justify-between w-full gap-3">
                                <div className="flex-1 text-left min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <Badge variant="secondary" className="font-mono text-xs">
                                      {endorsement.endorsement_number}
                                    </Badge>
                                    {endorsement.far_reference && (
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {endorsement.far_reference}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium text-foreground">
                                    {endorsement.title}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    console.log('Endorsement clicked:', endorsement)
                                    setSelectedEndorsement(endorsement)
                                    setRecipientEmail('')
                                    setRecipientName('')
                                    setEmailValidationError('')
                                    setShowIssueDialog(false)
                                    setShowIssueFormDialog(true)
                                  }}
                                  className="flex-shrink-0"
                                >
                                  Issue
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Endorsement Form Dialog */}
      <Dialog 
        open={showIssueFormDialog} 
        onOpenChange={(open) => {
          setShowIssueFormDialog(open)
          if (!open) {
            setSelectedEndorsement(null)
            setRecipientEmail('')
            setRecipientName('')
            setEmailValidationError('')
            setInstructorProfile(null)
            setEditableEndorsementText('')
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] w-[calc(100vw-2rem)] sm:w-full overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Issue Endorsement: {selectedEndorsement?.endorsement_number}
            </DialogTitle>
            <DialogDescription>
              {selectedEndorsement?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 max-h-[75vh] overflow-y-auto overflow-x-hidden">
            {/* Endorsement Text */}
            {selectedEndorsement && (
              <div className="space-y-2">
                <Label htmlFor="endorsement-text" className="text-sm font-semibold">
                  Endorsement Text
                </Label>
                <Textarea
                  id="endorsement-text"
                  value={editableEndorsementText}
                  onChange={(e) => setEditableEndorsementText(e.target.value)}
                  className="min-h-[120px] text-sm leading-relaxed resize-y"
                  placeholder="Enter endorsement text..."
                />
              </div>
            )}

            <Separator />

            {/* Recipient Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient-email" className="text-sm font-semibold">
                  Recipient Email <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Must be a registered Route of Flight user
                </p>
                <Input
                  id="recipient-email"
                  type="email"
                  placeholder="student@example.com"
                  value={recipientEmail}
                  onChange={(e) => {
                    setRecipientEmail(e.target.value)
                    setEmailValidationError('')
                  }}
                  onBlur={() => {
                    if (recipientEmail) {
                      validateRecipientEmail(recipientEmail)
                    }
                  }}
                  className={emailValidationError ? 'border-destructive' : ''}
                  disabled={validatingEmail}
                />
                {validatingEmail && (
                  <p className="text-xs text-muted-foreground mt-1">Validating email...</p>
                )}
                {emailValidationError && (
                  <p className="text-xs text-destructive mt-1">{emailValidationError}</p>
                )}
              </div>

              <div>
                <Label htmlFor="recipient-name" className="text-sm font-semibold">
                  Recipient Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="recipient-name"
                  type="text"
                  placeholder="John Doe"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Instructor Information */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Flight Instructor Information</Label>
              {loadingInstructorProfile ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">Loading instructor information...</p>
                </div>
              ) : instructorProfile ? (
                <div className="space-y-4">
                  {/* Check if all required fields are present */}
                  {(!instructorProfile.cfi_certificate_number || !instructorProfile.cfi_expiration_date || !instructorProfile.electronic_signature) && (
                    <div className="rounded-lg border border-yellow-200/50 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-900/10 p-3">
                      <p className="text-xs font-semibold text-foreground mb-1">
                        ⚠️ Missing Required Information
                      </p>
                      <p className="text-xs text-foreground">
                        You must complete all required instructor fields (Certificate Number, Expiration Date, and Signature) in your Profile page before issuing endorsements.
                      </p>
                    </div>
                  )}
                  
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Full Name</Label>
                        <p className="text-sm font-medium text-foreground">
                          {instructorProfile.full_name || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          Certificate Number {!instructorProfile.cfi_certificate_number && <span className="text-destructive">*</span>}
                        </Label>
                        <p className={`text-sm font-mono font-medium ${instructorProfile.cfi_certificate_number ? 'text-foreground' : 'text-destructive'}`}>
                          {instructorProfile.cfi_certificate_number || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          Expiration Date {!instructorProfile.cfi_expiration_date && <span className="text-destructive">*</span>}
                        </Label>
                        <p className={`text-sm font-medium ${instructorProfile.cfi_expiration_date ? 'text-foreground' : 'text-destructive'}`}>
                          {instructorProfile.cfi_expiration_date 
                            ? format(new Date(instructorProfile.cfi_expiration_date), 'MMM d, yyyy')
                            : 'Not provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Electronic Signature {!instructorProfile.electronic_signature && <span className="text-destructive">*</span>}
                      </Label>
                      {instructorProfile.electronic_signature ? (
                        <div className="rounded border border-border/40 bg-background p-3 flex items-center justify-center">
                          <img 
                            src={instructorProfile.electronic_signature} 
                            alt="Instructor Signature" 
                            className="max-h-20 max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-destructive">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-yellow-200/50 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-900/10 p-4">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Instructor Profile Incomplete
                  </p>
                  <p className="text-sm text-foreground mb-2">
                    Please complete your instructor profile information in your Profile page to issue endorsements.
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">Required fields:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>CFI Certificate Number</li>
                      <li>CFI Expiration Date</li>
                      <li>Electronic Signature</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowIssueFormDialog(false)
                setSelectedEndorsement(null)
                setRecipientEmail('')
                setRecipientName('')
                setEmailValidationError('')
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!recipientEmail || !recipientName) {
                  toast({
                    title: "Missing Information",
                    description: "Please fill in all required fields.",
                    variant: "destructive",
                  })
                  return
                }

                const isValid = await validateRecipientEmail(recipientEmail)
                if (!isValid) {
                  toast({
                    title: "Invalid Email",
                    description: emailValidationError || "Please enter a valid registered email address.",
                    variant: "destructive",
                  })
                  return
                }

                if (!instructorProfile) {
                  toast({
                    title: "Incomplete Profile",
                    description: "Please complete your instructor profile before issuing endorsements.",
                    variant: "destructive",
                  })
                  return
                }

                // Safeguard: Verify all required instructor information is present
                const missingFields: string[] = []
                if (!instructorProfile.cfi_certificate_number || instructorProfile.cfi_certificate_number.trim() === '') {
                  missingFields.push('CFI Certificate Number')
                }
                if (!instructorProfile.cfi_expiration_date) {
                  missingFields.push('CFI Expiration Date')
                }
                if (!instructorProfile.electronic_signature || instructorProfile.electronic_signature.trim() === '') {
                  missingFields.push('Electronic Signature')
                }

                if (missingFields.length > 0) {
                  toast({
                    title: "Incomplete Instructor Information",
                    description: `Please complete the following required fields in your Profile page before issuing endorsements: ${missingFields.join(', ')}`,
                    variant: "destructive",
                  })
                  return
                }

                // Get recipient user ID
                const { data: recipientData, error: recipientError } = await supabase
                  .from('profiles')
                  .select('id, email')
                  .eq('email', recipientEmail.toLowerCase().trim())
                  .single()

                if (recipientError || !recipientData) {
                  toast({
                    title: "Error",
                    description: "Could not find recipient user. Please verify the email address.",
                    variant: "destructive",
                  })
                  return
                }

                const recipientUserId = recipientData.id

                // Safeguard: Prevent instructors from issuing endorsements to themselves
                if (user && recipientUserId === user.id) {
                  toast({
                    title: "Cannot Issue to Yourself",
                    description: "You cannot issue an endorsement to your own email address. Please enter a different recipient email.",
                    variant: "destructive",
                  })
                  return
                }

                // Additional check: Compare emails directly (in case user ID comparison fails)
                const recipientEmailNormalized = recipientEmail.toLowerCase().trim()
                const instructorEmailNormalized = instructorProfile.email?.toLowerCase().trim()
                
                if (instructorEmailNormalized && recipientEmailNormalized === instructorEmailNormalized) {
                  toast({
                    title: "Cannot Issue to Yourself",
                    description: "You cannot issue an endorsement to your own email address. Please enter a different recipient email.",
                    variant: "destructive",
                  })
                  return
                }

                // Validate endorsement text
                if (!editableEndorsementText || editableEndorsementText.trim() === '') {
                  toast({
                    title: "Missing Information",
                    description: "Please enter the endorsement text.",
                    variant: "destructive",
                  })
                  return
                }

                // Create the endorsement record
                try {
                  // Store instructor metadata as JSON string in notes along with endorsement text
                  const instructorMetadata = {
                    expiration_date: instructorProfile.cfi_expiration_date || null,
                    electronic_signature: instructorProfile.electronic_signature || null,
                  }
                  
                  // Combine endorsement text and metadata
                  const notesContent = JSON.stringify({
                    endorsement_text: editableEndorsementText,
                    instructor_metadata: instructorMetadata,
                  })

                  const { error: insertError } = await supabase
                    .from('user_endorsements')
                    .insert({
                      user_id: recipientUserId,
                      endorsement_id: selectedEndorsement.id,
                      received_date: new Date().toISOString().split('T')[0], // Today's date
                      instructor_name: instructorProfile.full_name || '',
                      instructor_certificate_number: instructorProfile.cfi_certificate_number || '',
                      status: 'pending',
                      notes: notesContent, // Store the edited endorsement text and instructor metadata
                    })

                  if (insertError) {
                    console.error('Error issuing endorsement:', insertError)
                    toast({
                      title: "Error",
                      description: `Failed to issue endorsement: ${insertError.message}`,
                      variant: "destructive",
                    })
                    return
                  }

                  // Success!
                  toast({
                    title: "Endorsement Issued",
                    description: `Endorsement has been sent to ${recipientName}'s pending endorsements.`,
                  })

                  // Close dialog and reset form
                  setShowIssueFormDialog(false)
                  setSelectedEndorsement(null)
                  setRecipientEmail('')
                  setRecipientName('')
                  setEmailValidationError('')
                  setEditableEndorsementText('')
                  setInstructorProfile(null)
                } catch (error: any) {
                  console.error('Error issuing endorsement:', error)
                  toast({
                    title: "Error",
                    description: `Failed to issue endorsement: ${error.message || 'Unknown error'}`,
                    variant: "destructive",
                  })
                }
              }}
              disabled={
                !recipientEmail || 
                !recipientName || 
                !!emailValidationError || 
                validatingEmail || 
                loadingInstructorProfile || 
                !editableEndorsementText.trim() ||
                !instructorProfile?.cfi_certificate_number ||
                !instructorProfile?.cfi_expiration_date ||
                !instructorProfile?.electronic_signature
              }
              className="w-full sm:w-auto"
            >
              Issue Endorsement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pending Endorsements Dialog */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Pending Endorsements</DialogTitle>
            <DialogDescription>
              Review and accept or deny endorsements sent to you by instructors.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {loadingPending ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Loading pending endorsements...</p>
              </div>
            ) : pendingEndorsements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-sm font-medium text-foreground mb-1">No pending endorsements</p>
                <p className="text-xs text-muted-foreground">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEndorsements.map((endorsement) => (
                  <Card key={endorsement.id} className="border-border/60">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Endorsement Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="font-mono text-xs">
                                {endorsement.endorsement_number}
                              </Badge>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
                                Pending
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-foreground text-base mb-1">
                              {endorsement.title}
                            </h3>
                            {endorsement.far_reference && (
                              <p className="text-sm text-muted-foreground">
                                {endorsement.far_reference}
                              </p>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Endorsement Text */}
                        {endorsement.endorsement_text && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Endorsement Text:</p>
                            <div className="p-4 bg-muted/50 rounded-lg border border-border/40">
                              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                {endorsement.endorsement_text}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Instructor Information */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Instructor Information:</p>
                          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
                            {endorsement.instructor_name && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Name</p>
                                <p className="text-sm font-medium text-foreground">{endorsement.instructor_name}</p>
                              </div>
                            )}
                            {endorsement.instructor_certificate_number && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Certificate Number</p>
                                <p className="text-sm font-mono font-medium text-foreground">{endorsement.instructor_certificate_number}</p>
                              </div>
                            )}
                            {endorsement.instructor_expiration_date && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Expiration Date</p>
                                <p className="text-sm font-medium text-foreground">
                                  {format(new Date(endorsement.instructor_expiration_date), 'MMM d, yyyy')}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Received</p>
                              <p className="text-sm font-medium text-foreground">
                                {format(new Date(endorsement.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Instructor Signature */}
                        {endorsement.instructor_signature && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Electronic Signature:</p>
                            <div className="rounded border border-border/40 bg-background p-3 flex items-center justify-center">
                              <img 
                                src={endorsement.instructor_signature} 
                                alt="Instructor Signature" 
                                className="max-h-20 max-w-full object-contain"
                              />
                            </div>
                          </div>
                        )}

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleAcceptEndorsement(endorsement.id)}
                            className="flex-1"
                            variant="default"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleDenyEndorsement(endorsement.id)}
                            className="flex-1"
                            variant="outline"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Deny
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )

  if (endorsements.length === 0) {
    return (
      <>
        <div className="rounded-3xl border border-border/60 bg-card/95 shadow-xl shadow-aviation-navy/15 backdrop-blur">
          <div className="px-4 sm:px-6 py-6">
            {/* Mobile: Full-width header */}
            <div className="md:hidden mb-4">
              <div className="w-full mb-4">
                <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Award className="h-5 w-5 text-primary" />
                  My Endorsements
                </p>
                <p className="text-sm text-muted-foreground mt-1">Endorsements you've received from instructors</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Menu className="mr-2 h-4 w-4" />
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => {
                    setShowDisclaimerDialog(true)
                  }}>
                    <Send className="mr-2 h-4 w-4" />
                    Issue Endorsements
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowRequestDialog(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Request Endorsements
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPendingDialog(true)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Pending Endorsements
                    {pendingEndorsements.length > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {pendingEndorsements.length}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Desktop: Original layout */}
            <div className="hidden md:flex items-center justify-between mb-4">
              <div>
                <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Award className="h-5 w-5 text-primary" />
                  My Endorsements
                </p>
                <p className="text-sm text-muted-foreground">Endorsements you've received from instructors</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRequestDialog(true)}
                  className="rounded-full"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Request Endorsement
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Issue Endorsement button clicked - empty state')
                    setShowDisclaimerDialog(true)
                  }}
                  className="rounded-full"
                  type="button"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Issue Endorsement
                </Button>
                <Button
                  variant={pendingEndorsements.length > 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPendingDialog(true)}
                  className="rounded-full relative"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Pending Endorsements
                  {pendingEndorsements.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {pendingEndorsements.length}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-border/40 rounded-2xl">
              <p className="text-sm text-muted-foreground">No endorsements recorded yet</p>
            </div>
          </div>
        </div>
        {renderDialogs()}
      </>
    )
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card/95 shadow-xl shadow-aviation-navy/15 backdrop-blur">
      <div className="px-4 sm:px-6 py-6">
        {/* Mobile: Full-width header */}
        <div className="md:hidden mb-4">
          <div className="w-full mb-4">
            <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Award className="h-5 w-5 text-primary" />
              My Endorsements
            </p>
            <p className="text-sm text-muted-foreground mt-1">{endorsements.length} endorsement{endorsements.length !== 1 ? 's' : ''} received</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Menu className="mr-2 h-4 w-4" />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => {
                setShowDisclaimerDialog(true)
              }}>
                <Send className="mr-2 h-4 w-4" />
                Issue Endorsements
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowRequestDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Request Endorsements
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPendingDialog(true)}>
                <Clock className="mr-2 h-4 w-4" />
                Pending Endorsements
                {pendingEndorsements.length > 0 && (
                  <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {pendingEndorsements.length}
                  </Badge>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Desktop: Original layout */}
        <div className="hidden md:flex items-center justify-between mb-4">
          <div>
            <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Award className="h-5 w-5 text-primary" />
              My Endorsements
            </p>
            <p className="text-sm text-muted-foreground">{endorsements.length} endorsement{endorsements.length !== 1 ? 's' : ''} received</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRequestDialog(true)}
              className="rounded-full"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Request Endorsement
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Issue Endorsement button clicked - normal state')
                setShowDisclaimerDialog(true)
              }}
              className="rounded-full"
              type="button"
            >
              <Send className="mr-2 h-4 w-4" />
              Issue Endorsement
            </Button>
            <Button
              variant={pendingEndorsements.length > 0 ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPendingDialog(true)}
              className="rounded-full relative"
            >
              <Clock className="mr-2 h-4 w-4" />
              Pending Endorsements
              {pendingEndorsements.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {pendingEndorsements.length}
                </Badge>
              )}
            </Button>
            {endorsements.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollLeft}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollRight}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {endorsements.map((endorsement) => (
            <Card
              key={endorsement.id}
              className="min-w-[320px] max-w-[320px] flex-shrink-0 border-border/60 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Endorsement Header */}
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {endorsement.endorsement_number}
                    </Badge>
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>

                  {/* Endorsement Title */}
                  <div>
                    <h3 className="font-semibold text-foreground text-sm leading-tight mb-1">
                      {endorsement.title}
                    </h3>
                    {endorsement.far_reference && (
                      <p className="text-xs text-muted-foreground">
                        {endorsement.far_reference}
                      </p>
                    )}
                  </div>

                  {/* Endorsement Text - Show the edited text from instructor */}
                  {endorsement.endorsement_text ? (
                    <div className="pt-2 border-t border-border/40">
                      <p className="text-xs text-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap">
                        {endorsement.endorsement_text}
                      </p>
                    </div>
                  ) : endorsement.notes ? (
                    // Fallback: if endorsement_text is not set but notes exists, use notes directly
                    <div className="pt-2 border-t border-border/40">
                      <p className="text-xs text-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap">
                        {endorsement.notes}
                      </p>
                    </div>
                  ) : null}

                  {/* Instructor Info - Condensed */}
                  <div className="pt-2 border-t border-border/40 space-y-1.5">
                    {endorsement.instructor_name && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Instructor:</span>
                        <span className="font-medium text-foreground truncate ml-2 text-right">
                          {endorsement.instructor_name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      {endorsement.instructor_certificate_number && (
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-muted-foreground text-[10px]">Cert:</span>
                          <span className="font-mono font-medium text-foreground truncate text-[10px]">
                            {endorsement.instructor_certificate_number}
                          </span>
                        </div>
                      )}
                      {endorsement.instructor_expiration_date && (
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                          <span className="text-muted-foreground text-[10px]">Exp:</span>
                          <span className="font-medium text-foreground text-[10px]">
                            {format(new Date(endorsement.instructor_expiration_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                    {endorsement.instructor_signature && (
                      <div className="pt-1 flex items-center justify-center">
                        <img 
                          src={endorsement.instructor_signature} 
                          alt="Signature" 
                          className="max-h-12 max-w-full object-contain opacity-80"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-muted-foreground">Received:</span>
                      <span className="font-medium text-foreground">
                        {format(new Date(endorsement.received_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {renderDialogs()}
    </div>
  )
}

