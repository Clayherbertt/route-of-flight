import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WelcomeCardProps {
  firstName: string;
  totalHours: number;
  last30DaysHours: number;
  picHours: number;
  sicHours: number;
  turbineHours: number;
}

export function WelcomeCard({
  firstName,
  totalHours,
  last30DaysHours,
  picHours,
  sicHours,
  turbineHours,
}: WelcomeCardProps) {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? Math.max(insets.top, 44) : insets.top || 0;

  const formatHours = (value: number) => {
    const rounded = Math.round(value * 100) / 100;
    return rounded.toFixed(1).replace(/\.?0+$/, '');
  };

  const formatLargeNumber = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <LinearGradient
      colors={['#1D75BC', '#24587E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { paddingTop: topPadding + 16 }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.welcomeText}>Welcome back,</ThemedText>
          <ThemedText style={styles.nameText}>{firstName}</ThemedText>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Stats Card */}
      <View style={styles.statsCard}>
        {/* Total Time Section */}
        <View style={styles.totalTimeSection}>
          <View style={styles.totalTimeLeft}>
            <ThemedText style={styles.totalTimeLabel}>Total Flight Time</ThemedText>
            <ThemedText style={styles.totalTimeValue}>{formatLargeNumber(totalHours)} hrs</ThemedText>
          </View>
          <View style={styles.totalTimeRight}>
            <ThemedText style={styles.monthLabel}>Last 30 Days</ThemedText>
            <ThemedText style={styles.monthValue}>
              {last30DaysHours >= 0 ? '+' : ''}{formatHours(last30DaysHours)}
            </ThemedText>
          </View>
        </View>

        {/* Bottom Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>PIC</ThemedText>
            <ThemedText style={styles.statValue}>{formatLargeNumber(picHours)}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Turbine SIC</ThemedText>
            <ThemedText style={styles.statValue}>{formatLargeNumber(sicHours)}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Turbine PIC</ThemedText>
            <ThemedText style={styles.statValue}>{formatLargeNumber(turbineHours)}</ThemedText>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 28,
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
  },
  totalTimeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  totalTimeLeft: {
    flex: 1,
  },
  totalTimeLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
    lineHeight: 20,
  },
  totalTimeValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 44,
  },
  totalTimeRight: {
    alignItems: 'flex-end',
  },
  monthLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.75,
    marginBottom: 4,
    textAlign: 'right',
    lineHeight: 16,
  },
  monthValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 28,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  statItem: {
    alignItems: 'flex-start',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.75,
    marginBottom: 4,
    lineHeight: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 24,
  },
});

