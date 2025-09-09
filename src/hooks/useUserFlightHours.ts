import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export function useUserFlightHours() {
  const { user } = useAuth()
  const [totalHours, setTotalHours] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFlightHours() {
      if (!user) {
        setTotalHours(0)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('flight_entries')
          .select('total_time')
          .eq('user_id', user.id)

        if (error) {
          console.error('Error fetching flight hours:', error)
          setTotalHours(0)
        } else {
          const total = data.reduce((sum, entry) => sum + (parseFloat(entry.total_time.toString()) || 0), 0)
          setTotalHours(total)
        }
      } catch (error) {
        console.error('Error fetching flight hours:', error)
        setTotalHours(0)
      } finally {
        setLoading(false)
      }
    }

    fetchFlightHours()
  }, [user])

  return { totalHours, loading }
}