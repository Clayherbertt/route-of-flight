import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WelcomeCard } from '@/components/WelcomeCard';
import { MonthlyHoursChart } from '@/components/MonthlyHoursChart';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function Dashboard() {
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
          // Skip if aircraft_id is null or empty
          if (!aircraft.aircraft_id) return;
          // Normalize aircraft_id (uppercase only, matching web app logic)
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

      // Fetch all flights with pagination (matching web app logic)
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

      // Client-side sort to ensure proper chronological order (matching web app)
      collected.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) {
          return dateB - dateA; // DESC order
        }

        // If same date, compare start_time
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

        // Use created_at as tiebreaker
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

  const formatHours = (value: number) => {
    const rounded = Math.round(value * 100) / 100;
    return rounded.toFixed(2).replace(/\.?0+$/, '');
  };

  const formatMetric = (value: number, type: 'hours' | 'count') =>
    type === 'hours' ? `${formatHours(value)} hrs` : `${value}`;

  // Calculate totals - matching web app logic exactly
  const totalHours = flights.reduce((sum, flight) => {
    const time = Number(flight.total_time) || 0;
    return sum + time;
  }, 0);
  const totalPIC = flights.reduce((sum, flight) => {
    const time = Number(flight.pic_time) || 0;
    return sum + time;
  }, 0);
  const totalXC = flights.reduce((sum, flight) => {
    const time = Number(flight.cross_country_time) || 0;
    return sum + time;
  }, 0);
  const totalNight = flights.reduce((sum, flight) => {
    const time = Number(flight.night_time) || 0;
    return sum + time;
  }, 0);
  const totalActualInstrument = flights.reduce(
    (sum, flight) => sum + (Number(flight.actual_instrument) || 0),
    0,
  );
  const totalSimInstrument = flights.reduce(
    (sum, flight) => sum + (Number(flight.simulated_instrument) || 0),
    0,
  );
  const totalInstrument = totalActualInstrument + totalSimInstrument;
  const totalSIC = flights.reduce((sum, flight) => {
    const time = Number(flight.sic_time) || 0;
    return sum + time;
  }, 0);

  // Calculate turbine SIC time - Since all SIC flights are turbine, this equals total SIC
  // This is the same calculation as totalSIC but kept separate for clarity
  const turbineSICHours = totalSIC;
  const totalSolo = flights.reduce((sum, flight) => {
    const time = Number(flight.solo_time) || 0;
    return sum + time;
  }, 0);

  // Calculate total landings - matching web app logic (prioritize landings field, fallback to sum of individual fields)
  const totalLandings = flights.reduce(
    (sum, flight) => {
      // Safely convert to numbers, handling null/undefined
      const legacyLandings = flight.landings != null ? Number(flight.landings) || 0 : 0;
      const dayLandings = flight.day_landings != null ? Number(flight.day_landings) || 0 : 0;
      const dayFullStop = flight.day_landings_full_stop != null ? Number(flight.day_landings_full_stop) || 0 : 0;
      const nightLandings = flight.night_landings != null ? Number(flight.night_landings) || 0 : 0;
      const nightFullStop = flight.night_landings_full_stop != null ? Number(flight.night_landings_full_stop) || 0 : 0;
      
      // Priority: Use landings field (from AllLandings in CSV) - this is the most accurate total
      if (legacyLandings > 0) {
        return sum + legacyLandings;
      }
      
      // Fallback: Sum individual fields if landings field is not set
      const sumOfIndividualFields = dayLandings + dayFullStop + nightLandings + nightFullStop;
      return sum + sumOfIndividualFields;
    },
    0,
  );

  // Additional totals matching web app
  const totalDualGiven = flights.reduce(
    (sum, flight) => sum + (Number(flight.dual_given) || 0),
    0,
  );
  const totalDualReceived = flights.reduce(
    (sum, flight) => sum + (Number(flight.dual_received) || 0),
    0,
  );
  const totalSimulatedFlight = flights.reduce(
    (sum, flight) => sum + (Number(flight.simulated_flight) || 0),
    0,
  );
  const totalGroundTraining = flights.reduce(
    (sum, flight) => sum + (Number(flight.ground_training) || 0),
    0,
  );
  const totalHolds = flights.reduce(
    (sum, flight) => sum + (Number(flight.holds) || 0),
    0,
  );

  // Calculate flight hours in last 30 days
  const last30DaysHours = flights.reduce((sum, flight) => {
    const flightDate = new Date(flight.date);
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    if (flightDate >= thirtyDaysAgo) {
      const time = Number(flight.total_time) || 0;
      return sum + time;
    }
    return sum;
  }, 0);

  // Calculate monthly hours for last 12 months (matching web app logic)
  const monthlyHoursData = useMemo(() => {
    try {
      const now = new Date();
      const twelveMonthsAgo = subMonths(now, 11);
      const months = eachMonthOfInterval({
        start: startOfMonth(twelveMonthsAgo),
        end: endOfMonth(now),
      });

      if (!months || months.length === 0) {
        // Return 12 months with zero hours if date calculation fails
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
            
            // Check if flight date is within the month (compare year and month)
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

      // Always return 12 months, even if some have zero hours
      return monthlyData;
    } catch (error) {
      console.error('Error calculating monthly hours:', error);
      // Return 12 months with zero hours on error
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

  // Calculate turbine PIC time - PIC time from flights where:
  // 1. The aircraft is turbine-powered (from aircraft_logbook)
  // 2. The flight entry contains PIC time (pic_time > 0)
  const turbinePICHours = useMemo(() => {
    // Wait for aircraft data to be loaded
    if (aircraftMap.size === 0 && aircraftLoading) return 0;
    
    return flights.reduce((sum, flight) => {
      // Must have PIC time in the flight entry
      const picTimeValue = flight.pic_time;
      if (picTimeValue === null || picTimeValue === undefined) return sum;
      
      const picTime = parseFloat(String(picTimeValue));
      if (isNaN(picTime) || picTime <= 0) return sum;
      
      // Must have aircraft registration to look up aircraft
      if (!flight.aircraft_registration) return sum;
      
      // Look up aircraft in aircraft_logbook (normalize to uppercase, matching web app logic)
      const aircraftId = String(flight.aircraft_registration).toUpperCase();
      const aircraft = aircraftMap.get(aircraftId);
      
      // Only count if aircraft exists in logbook, has engine_type set, and is turbine-powered
      if (!aircraft) return sum;
      if (!aircraft.engine_type) return sum;
      
      const isTurbine = ['TurboFan', 'Turbojet', 'TurboProp', 'Turboshaft'].includes(aircraft.engine_type);
      if (!isTurbine) return sum;
      
      // All checks passed - this is PIC time in a turbine aircraft
      return sum + picTime;
    }, 0);
  }, [flights, aircraftMap, aircraftLoading]);

  // Get user's first name from user metadata
  const firstName = user?.user_metadata?.first_name || 'Captain';

  if (loading || aircraftLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
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
    </SafeAreaView>
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
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 0,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mapSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    height: 400,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#6B7280',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  flightCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  carousel: {
    marginVertical: 16,
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  metricCard: {
    minWidth: 140,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#6B7280',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  mapPlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    margin: 16,
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});

