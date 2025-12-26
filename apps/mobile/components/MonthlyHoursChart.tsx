import { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Svg, { Line, Polyline, Circle, Text as SvgText, G } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';

interface MonthlyData {
  month: string;
  monthShort: string;
  hours: number;
}

interface MonthlyHoursChartProps {
  data: MonthlyData[];
}

const CHART_PADDING = 20;
const CHART_HEIGHT = 240;
const POINT_RADIUS = 4;
const STROKE_WIDTH = 2;
const Y_AXIS_WIDTH = 55;
const X_AXIS_HEIGHT = 35;

export function MonthlyHoursChart({ data }: MonthlyHoursChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>No flight data available</ThemedText>
        </View>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const minWidthPerMonth = 60;
  
  // Chart area calculations with proper spacing
  const chartAreaLeft = CHART_PADDING + Y_AXIS_WIDTH;
  const chartAreaTop = CHART_PADDING + 10; // Extra space at top for value labels
  const chartAreaHeight = CHART_HEIGHT - chartAreaTop - X_AXIS_HEIGHT;
  const chartAreaBottom = chartAreaTop + chartAreaHeight;

  // Calculate chart width for scrollable content - needs to fit all data points with proper spacing at the end
  const scrollableChartWidth = Math.max(screenWidth, data.length * minWidthPerMonth) + CHART_PADDING;
  const scrollableChartAreaWidth = scrollableChartWidth - chartAreaLeft - CHART_PADDING;

  // Calculate max hours for Y-axis scaling (round up to nearest 10)
  const maxHoursInData = Math.max(...data.map(d => d.hours), 0);
  const maxHours = maxHoursInData > 0 ? Math.ceil(maxHoursInData / 10) * 10 : 60; // Default to 60 if no data
  const yAxisSteps = 6;
  const yStep = maxHours / yAxisSteps;

  // Calculate X and Y positions for each data point
  const points = data.map((item, index) => {
    const x = chartAreaLeft + (index / (data.length - 1 || 1)) * scrollableChartAreaWidth;
    const y = chartAreaBottom - (item.hours / maxHours) * chartAreaHeight;
    return { x, y, ...item };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Flight Hours - Last 12 Months</ThemedText>
        <ThemedText style={styles.subtitle}>Monthly flight hours breakdown</ThemedText>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.chartScrollView}
        onScrollBeginDrag={() => setSelectedPoint(null)} // Clear selection when scrolling
      >
        <View style={styles.chartContainer}>
          <Svg width={scrollableChartWidth} height={CHART_HEIGHT} style={styles.svg}>
            {/* Grid lines and Y-axis labels */}
            <G>
              {Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
                const y = chartAreaBottom - (i / yAxisSteps) * chartAreaHeight;
                const value = i * yStep;
                return (
                  <G key={`grid-${i}`}>
                    <Line
                      x1={chartAreaLeft}
                      y1={y}
                      x2={chartAreaLeft + scrollableChartAreaWidth}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      opacity={0.3}
                    />
                    <SvgText
                      x={chartAreaLeft - 15}
                      y={y + 4}
                      fontSize="11"
                      fill="#6B7280"
                      fontWeight="500"
                      textAnchor="end"
                    >
                      {Math.round(value)}
                    </SvgText>
                  </G>
                );
              })}
            </G>

            {/* Chart line */}
            <Polyline
              points={points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#1D75BC"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((point, index) => {
              const isSelected = selectedPoint === index;
              return (
                <G key={`point-${index}`}>
                  {/* Invisible larger touchable area for easier tapping */}
                  <Circle
                    cx={point.x}
                    cy={point.y}
                    r={POINT_RADIUS + 10}
                    fill="transparent"
                    onPress={() => setSelectedPoint(isSelected ? null : index)}
                  />
                  {/* Visible data point */}
                  <Circle
                    cx={point.x}
                    cy={point.y}
                    r={POINT_RADIUS}
                    fill="#1D75BC"
                    stroke="#fff"
                    strokeWidth="2"
                    onPress={() => setSelectedPoint(isSelected ? null : index)}
                  />
                  {/* Value label above point - only show when selected */}
                  {isSelected && point.hours > 0 && (
                    <SvgText
                      x={point.x}
                      y={point.y - 12}
                      fontSize="10"
                      fill="#24587E"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {point.hours.toFixed(1)}
                    </SvgText>
                  )}
                </G>
              );
            })}

            {/* X-axis labels (month names) */}
            {points.map((point, index) => (
              <SvgText
                key={`label-${index}`}
                x={point.x}
                y={chartAreaBottom + 20}
                fontSize="11"
                fill="#6B7280"
                fontWeight="500"
                textAnchor="middle"
              >
                {point.monthShort}
              </SvgText>
            ))}
          </Svg>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 24,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  chartScrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingRight: 0,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    backgroundColor: '#F9FAFB',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

