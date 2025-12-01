import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface RouteStepDetail {
  id?: string
  title: string
  description: string
  checked: boolean
  flightHours?: number
  orderNumber: number
  taskType?: 'flight' | 'ground'
  mandatory?: boolean
  published?: boolean
}

interface RouteStep {
  id?: string
  title: string
  description: string
  icon: string
  orderNumber: number
  mandatory: boolean
  allowCustomerReorder: boolean
  status: 'draft' | 'published'
  category: string
  details: RouteStepDetail[]
  nextSteps: string[]
  connectedFrom?: string[]
}

export function useRouteSteps() {
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchRouteSteps = async () => {
    try {
      setLoading(true)
      
      // Fetch route steps
      const { data: steps, error: stepsError } = await supabase
        .from('route_steps')
        .select('*')
        .order('order_number')

      if (stepsError) throw stepsError

      // Fetch step details
      const { data: details, error: detailsError } = await supabase
        .from('route_step_details')
        .select('*')
        .order('order_number')

      if (detailsError) throw detailsError

      // Fetch connections
      const { data: connections, error: connectionsError } = await supabase
        .from('route_step_connections')
        .select('*')

      if (connectionsError) throw connectionsError

      // Combine the data
      const combinedSteps = steps?.map(step => {
        const stepDetails = details?.filter(detail => detail.route_step_id === step.id) || []
        const nextSteps = connections?.filter(conn => conn.from_step_id === step.id).map(conn => conn.to_step_id) || []
        const connectedFrom = connections?.filter(conn => conn.to_step_id === step.id).map(conn => conn.from_step_id) || []

        // Deduplicate details by content (title + description) to prevent duplicates
        // This handles cases where duplicate records exist in the database
        const uniqueDetails = stepDetails.reduce((acc, detail) => {
          // Create a key based on content, not just ID
          const contentKey = `${detail.title.trim().toLowerCase()}-${(detail.description || '').trim().toLowerCase()}`
          const orderKey = detail.order_number
          
          // If we haven't seen this content before, or if this one has a lower order_number (keep the first one)
          if (!acc.has(contentKey) || acc.get(contentKey).order_number > orderKey) {
            acc.set(contentKey, detail)
          }
          return acc
        }, new Map())
        
        const deduplicatedDetails = Array.from(uniqueDetails.values())
          .sort((a, b) => a.order_number - b.order_number)

        return {
          id: step.id,
          title: step.title,
          description: step.description,
          icon: step.icon,
          orderNumber: step.order_number,
          mandatory: step.mandatory,
          allowCustomerReorder: step.allow_customer_reorder,
          status: step.status as 'draft' | 'published',
          category: step.category || 'Primary Training',
          details: deduplicatedDetails.map(detail => ({
            id: detail.id,
            title: detail.title,
            description: detail.description,
            checked: detail.checked,
            flightHours: detail.flight_hours || undefined,
            orderNumber: detail.order_number,
            taskType: (detail.task_type as 'flight' | 'ground') || 'flight',
            mandatory: (detail as any).mandatory || false,
            published: (detail as any).published !== undefined ? (detail as any).published : true
          })),
          nextSteps,
          connectedFrom: connectedFrom.length > 0 ? connectedFrom : undefined
        }
      }) || []

      setRouteSteps(combinedSteps)
    } catch (error) {
      console.error('Error fetching route steps:', error)
      toast({
        title: "Error",
        description: "Failed to load route steps",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveRouteStep = async (step: RouteStep) => {
    try {
      let stepId = step.id;

      if (!stepId || stepId.trim() === '' || stepId === 'undefined') {
        // Create new step
        const { data: newStep, error: createError } = await supabase
          .from('route_steps')
          .insert({
            title: step.title,
            description: step.description,
            icon: step.icon,
            order_number: step.orderNumber,
            mandatory: step.mandatory,
            allow_customer_reorder: step.allowCustomerReorder,
            status: 'published', // Always publish new steps so data is immediately accessible
            category: step.category
          })
          .select()
          .single()

        if (createError) throw createError
        stepId = newStep.id
      } else {
        // Update existing step - first verify it exists
        const { data: existingStep, error: checkError } = await supabase
          .from('route_steps')
          .select('id')
          .eq('id', step.id)
          .maybeSingle()

        if (checkError) {
          console.error('Error checking existing step:', checkError)
          throw new Error(`Error verifying route step: ${checkError.message}`)
        }
        
        if (!existingStep) {
          throw new Error(`Route step with ID ${step.id} not found`)
        }

        const { error: stepError } = await supabase
          .from('route_steps')
          .update({
            title: step.title,
            description: step.description,
            icon: step.icon,
            order_number: step.orderNumber,
            mandatory: step.mandatory,
            allow_customer_reorder: step.allowCustomerReorder,
            status: step.status,
            category: step.category
          })
          .eq('id', step.id)

        if (stepError) throw stepError

        // Delete existing details for updates
        const { error: deleteError } = await supabase
          .from('route_step_details')
          .delete()
          .eq('route_step_id', step.id)

        if (deleteError) throw deleteError
      }

      // Insert details - but only if we have a valid stepId
      if (step.details.length > 0 && stepId) {
        // Verify the step still exists before inserting details
        const { data: stepExists, error: verifyError } = await supabase
          .from('route_steps')
          .select('id')
          .eq('id', stepId)
          .single()

        if (verifyError || !stepExists) {
          throw new Error(`Cannot insert details: Route step ${stepId} does not exist`)
        }

        // Deduplicate details before inserting to prevent duplicates
        // Remove duplicates based on content, not just index
        const uniqueDetails = step.details.reduce((acc, detail) => {
          // Use title + description as key to identify true duplicates
          const contentKey = `${detail.title.trim().toLowerCase()}-${(detail.description || '').trim().toLowerCase()}`
          if (!acc.has(contentKey)) {
            acc.set(contentKey, detail)
          }
          return acc
        }, new Map())
        
        const detailsToInsert = Array.from(uniqueDetails.values()).map((detail, index) => ({
              route_step_id: stepId,
          title: detail.title.trim(),
          description: detail.description || '',
          checked: detail.checked || false,
              flight_hours: detail.flightHours || null,
              order_number: index,
              task_type: detail.taskType || 'flight',
              mandatory: detail.mandatory || false,
              published: true // Always publish new details so they're immediately accessible
            }))

        if (detailsToInsert.length > 0) {
          const { error: detailsError } = await supabase
            .from('route_step_details')
            .insert(detailsToInsert)

          if (detailsError) {
            console.error('Error inserting details:', detailsError)
            throw detailsError
          }
        }
      }

      // Don't refetch - let the UI update optimistically
      // The component will handle updating local state

      toast({
        title: "Success",
        description: step.id ? "Route step updated successfully" : "Route step created successfully"
      })
      
      // Return the saved step data so the component can update optimistically
      return { stepId, step }
    } catch (error) {
      console.error('Error saving route step:', error)
      toast({
        title: "Error",
        description: "Failed to save route step",
        variant: "destructive"
      })
      throw error
    }
  }

  const updateStepDetailChecked = async (stepId: string, detailIndex: number, checked: boolean) => {
    try {
      console.log('🔧 updateStepDetailChecked called with:', { stepId, detailIndex, checked });
      
      const step = routeSteps.find(s => s.id === stepId)
      console.log('🔧 Found step:', step?.title);
      
      if (!step) {
        console.warn('❌ Step not found for stepId:', stepId);
        return;
      }
      
      const detail = step.details[detailIndex];
      console.log('🔧 Detail at index:', detailIndex, detail);
      
      if (!detail?.id) {
        console.warn('❌ Detail has no ID:', detail);
        return;
      }

      console.log('🚀 Updating database with:', { detailId: detail.id, checked });
      
      const { error } = await supabase
        .from('route_step_details')
        .update({ checked })
        .eq('id', detail.id)

      if (error) {
        console.error('💥 Supabase error:', error);
        throw error;
      } else {
        console.log('✅ Database update successful');
      }

      // Update local state
      setRouteSteps(steps => 
        steps.map(s => 
          s.id === stepId ? {
            ...s,
            details: s.details.map((detail, idx) => 
              idx === detailIndex ? { ...detail, checked } : detail
            )
          } : s
        )
      )
    } catch (error) {
      console.error('Error updating detail checked status:', error)
      toast({
        title: "Error",
        description: "Failed to update checkbox status",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchRouteSteps()
  }, [])

  const deleteRouteStep = async (stepId: string) => {
    try {
      // Delete route step details first
      const { error: detailsError } = await supabase
        .from('route_step_details')
        .delete()
        .eq('route_step_id', stepId)

      if (detailsError) throw detailsError

      // Delete route step connections
      const { error: connectionsError } = await supabase
        .from('route_step_connections')
        .delete()
        .or(`from_step_id.eq.${stepId},to_step_id.eq.${stepId}`)

      if (connectionsError) throw connectionsError

      // Delete the route step itself
      const { error: stepError } = await supabase
        .from('route_steps')
        .delete()
        .eq('id', stepId)

      if (stepError) throw stepError

      toast({
        title: "Success",
        description: "Route step deleted successfully"
      })
      await fetchRouteSteps()
    } catch (error) {
      console.error('Error deleting route step:', error)
      toast({
        title: "Error", 
        description: "Failed to delete route step",
        variant: "destructive"
      })
    }
  }

  const reorderRouteSteps = async (newOrder: string[]) => {
    try {
      // Update order_number for each step based on new order
      const updates = newOrder.map((stepId, index) => ({
        id: stepId,
        order_number: index
      }))

      // Update each step's order in the database
      for (const update of updates) {
        const { error } = await supabase
          .from('route_steps')
          .update({ order_number: update.order_number })
          .eq('id', update.id)

        if (error) throw error
      }

      // Refresh data to reflect new order
      await fetchRouteSteps()

      toast({
        title: "Success",
        description: "Route steps reordered successfully"
      })
    } catch (error) {
      console.error('Error reordering route steps:', error)
      toast({
        title: "Error",
        description: "Failed to reorder route steps",
        variant: "destructive"
      })
    }
  }

  return {
    routeSteps,
    setRouteSteps,
    loading,
    saveRouteStep,
    updateStepDetailChecked,
    deleteRouteStep,
    reorderRouteSteps,
    refetch: fetchRouteSteps
  }
}