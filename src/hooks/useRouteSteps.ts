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
          details: stepDetails.map(detail => ({
            id: detail.id,
            title: detail.title,
            description: detail.description,
            checked: detail.checked,
            flightHours: detail.flight_hours || undefined,
            orderNumber: detail.order_number,
            taskType: (detail.task_type as 'flight' | 'ground') || 'flight',
            mandatory: detail.mandatory || false,
            published: detail.published || false
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

      if (!stepId) {
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
            status: step.status,
            category: step.category
          })
          .select()
          .single()

        if (createError) throw createError
        stepId = newStep.id
      } else {
        // Update existing step
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

      // Insert details
      if (step.details.length > 0) {
        const { error: detailsError } = await supabase
          .from('route_step_details')
          .insert(
            step.details.map((detail, index) => ({
              route_step_id: stepId,
              title: detail.title,
              description: detail.description,
              checked: detail.checked,
              flight_hours: detail.flightHours || null,
              order_number: index,
              task_type: detail.taskType || 'flight',
              mandatory: detail.mandatory || false,
              published: detail.published || false
            }))
          )

        if (detailsError) throw detailsError
      }

      // Refresh data
      await fetchRouteSteps()

      toast({
        title: "Success",
        description: step.id ? "Route step updated successfully" : "Route step created successfully"
      })
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
      const step = routeSteps.find(s => s.id === stepId)
      if (!step || !step.details[detailIndex]?.id) return

      const { error } = await supabase
        .from('route_step_details')
        .update({ checked })
        .eq('id', step.details[detailIndex].id)

      if (error) throw error

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

  return {
    routeSteps,
    loading,
    saveRouteStep,
    updateStepDetailChecked,
    deleteRouteStep,
    refetch: fetchRouteSteps
  }
}