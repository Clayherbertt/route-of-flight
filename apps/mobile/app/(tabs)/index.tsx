import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { WelcomeCard } from '@/components/WelcomeCard';
import { MonthlyHoursChart } from '@/components/MonthlyHoursChart';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { subDays, subMonths, format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

interface FlightEntry {
  id: string;
  date: string;
  created_at: string;
  aircraft_type: string;
  aircraft_registration: string;
  start_time?: string | null;
  total_time?: number;
  pic_time?: number;
  sic_time?: number;
  solo_time?: number;
  night_time?: number;
  instrument_time?: number;
  actual_instrument?: number;
  simulated_instrument?: number;
  cross_country_time?: number;
  holds?: number;
  landings?: number;
  day_landings?: number;
  day_landings_full_stop?: number;
  night_landings?: number;
  night_landings_full_stop?: number;
  dual_given?: number;
  dual_received?: number;
  simulated_flight?: number;
  ground_training?: number;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [flights, setFlights] = useState<FlightEntry[]>([]);
  const [aircraftMap, setAircraftMap] = useState<Map<string, { engine_type: string | null }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [aircraftLoading, setAircraftLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFlights();
      fetchAircraft();
    }
  }, [user]);

  const fetchAircraft = async () => {
    if (!user) {
      setAircraftLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('aircraft_logbook')
        .select('aircraft_id, engine_type')
        .eq('user_id', user.id);

      if (error) throw error;

      const map = new Map<string, { engine_type: string | null }>();
      if (data) {
        data.forEach((aircraft) => {
          if (!aircraft.aircraft_id) return;
          map.set(String(aircraft.aircraft_id).toUpperCase(), {
            engine_type: aircraft.engine_type,
          });
        });
      }
      setAircraftMap(map);
    } catch (error) {
      console.error('Error fetching aircraft:', error);
    } finally {
      setAircraftLoading(false);
    }
  };

  const fetchFlights = async () => {
    try {
      const pageSize = 1000;
      let from = 0;
      let collected: FlightEntry[] = [];

      while (true) {
        const { data, error } = await supabase
          .from('flight_entries')
          .select('*')
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

      collected.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) {
          return dateB - dateA;
        }

        const parseTime = (timeStr: string | null | undefined): number => {
          if (!timeStr) return -1;
          const parts = timeStr.split(':').map(Number);
          return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
        };

        const timeA = parseTime(a.start_time);
        const timeB = parseTime(b.start_time);

        if (timeA >= 0 && timeB >= 0) {
          if (timeA !== timeB) {
            return timeB - timeA;
          }
        } else if (timeA >= 0 && timeB < 0) {
          return -1;
        } else if (timeA < 0 && timeB >= 0) {
          return 1;
        }

        const createdA = new Date(a.created_at).getTime();
        const createdB = new Date(b.created_at).getTime();
        return createdB - createdA;
      });

      setFlights(collected);
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalHours = flights.reduce((sum, flight) => {
    const time = Number(flight.total_time) || 0;
    return sum + time;
  }, 0);
  const totalPIC = flights.reduce((sum, flight) => {
    const time = Number(flight.pic_time) || 0;
    return sum + time;
  }, 0);
  const totalSIC = flights.reduce((sum, flight) => {
    const time = Number(flight.sic_time) || 0;
    return sum + time;
  }, 0);

  const last30DaysHours = flights.reduce((sum, flight) => {
    const flightDate = new Date(flight.date);
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    if (flightDate >= thirtyDaysAgo) {
      const time = Number(flight.total_time) || 0;
      return sum + time;
    }
    return sum;
  }, 0);

  const turbineSICHours = totalSIC;

  const turbinePICHours = useMemo(() => {
    if (aircraftMap.size === 0 && aircraftLoading) return 0;
    
    return flights.reduce((sum, flight) => {
      const picTimeValue = flight.pic_time;
      if (picTimeValue === null || picTimeValue === undefined) return sum;
      
      const picTime = parseFloat(String(picTimeValue));
      if (isNaN(picTime) || picTime <= 0) return sum;
      
      if (!flight.aircraft_registration) return sum;
      
      const aircraftId = String(flight.aircraft_registration).toUpperCase();
      const aircraft = aircraftMap.get(aircraftId);
      
      if (!aircraft) return sum;
      if (!aircraft.engine_type) return sum;
      
      const isTurbine = ['TurboFan', 'Turbojet', 'TurboProp', 'Turboshaft'].includes(aircraft.engine_type);
      if (!isTurbine) return sum;
      
      return sum + picTime;
    }, 0);
  }, [flights, aircraftMap, aircraftLoading]);

  const monthlyHoursData = useMemo(() => {
    try {
      const now = new Date();
      const twelveMonthsAgo = subMonths(now, 11);
      const months = eachMonthOfInterval({
        start: startOfMonth(twelveMonthsAgo),
        end: endOfMonth(now),
      });

      if (!months || months.length === 0) {
        const fallbackMonths = [];
        for (let i = 11; i >= 0; i--) {
          const monthDate = subMonths(now, i);
          fallbackMonths.push({
            month: format(monthDate, "MMMM"),
            monthShort: format(monthDate, "MMM"),
            hours: 0,
          });
        }
        return fallbackMonths;
      }

      const monthlyData = months.map((month) => {
        const hoursInMonth = flights.reduce((sum, flight) => {
          if (!flight.date) {
            return sum;
          }
          
          try {
            const flightDate = new Date(flight.date);
            if (Number.isNaN(flightDate.getTime())) {
              return sum;
            }
            
            const flightYear = flightDate.getFullYear();
            const flightMonth = flightDate.getMonth();
            const monthYear = month.getFullYear();
            const monthMonth = month.getMonth();
            
            if (flightYear === monthYear && flightMonth === monthMonth) {
              return sum + (Number(flight.total_time) || 0);
            }
          } catch (e) {
            console.error('Error processing flight date:', e, flight);
          }
          return sum;
        }, 0);

        return {
          month: format(month, "MMMM"),
          monthShort: format(month, "MMM"),
          hours: Math.round(hoursInMonth * 100) / 100,
        };
      });

      return monthlyData;
    } catch (error) {
      console.error('Error calculating monthly hours:', error);
      const fallbackMonths = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        fallbackMonths.push({
          month: format(monthDate, "MMMM"),
          monthShort: format(monthDate, "MMM"),
          hours: 0,
        });
      }
      return fallbackMonths;
    }
  }, [flights]);

  const firstName = user?.user_metadata?.first_name || 'Captain';

  if (loading || aircraftLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <WelcomeCard
            firstName={firstName}
            totalHours={totalHours}
            last30DaysHours={last30DaysHours}
            picHours={totalPIC}
            sicHours={turbineSICHours}
            turbineHours={turbinePICHours}
          />
          <MonthlyHoursChart data={monthlyHoursData} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 24,
  },
});
