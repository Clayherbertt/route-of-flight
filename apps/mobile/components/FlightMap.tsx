import { useMemo, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, PanResponder } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { subMonths } from 'date-fns';
import airportCoordinates from '@/data/airportCoordinates.json';
// @ts-ignore - topojson-client doesn't have types
import * as topojson from 'topojson-client';

interface FlightEntry {
  id: string;
  date: string;
  departure_airport: string;
  arrival_airport: string;
}

interface FlightMapProps {
  flights: FlightEntry[];
  onDateRangeChange?: (dateRange: { from: Date | null; to: Date | null }) => void;
}

interface AirportCoords {
  lat: number;
  lng: number;
  name: string;
}

// World map TopoJSON URL - using 50m resolution which is simpler/faster
const WORLD_MAP_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

export function FlightMap({ flights, onDateRangeChange }: FlightMapProps) {
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [selectedRange, setSelectedRange] = useState<'1month' | '6months' | '12months' | null>(null);
  const [worldMapData, setWorldMapData] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState(true);
  
  // Zoom and rotation state (orthographic projection)
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState<[number, number, number]>([98.5795, -39.8283, 0]); // Default: centered on US
  const lastTapRef = useRef<number | null>(null);
  const lastDistanceRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; rotation: [number, number, number] } | null>(null);

  // Load world map TopoJSON data
  useEffect(() => {
    const loadWorldMap = async () => {
      try {
        const response = await fetch(WORLD_MAP_URL);
        const topoData = await response.json();
        setWorldMapData(topoData);
        setMapLoading(false);
      } catch (error) {
        console.error('Error loading world map:', error);
        setMapLoading(false);
      }
    };
    
    loadWorldMap();
  }, []);

  const { width: screenWidth } = Dimensions.get('window');
  const mapWidth = screenWidth - 32;
  const mapHeight = 400;
  const projectionScale = 200; // Base scale for orthographic projection
  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;

  // Filter flights based on selected date range
  const recentFlights = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
      return [];
    }
    
    const startDate = new Date(dateRange.from);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateRange.to);
    endDate.setHours(23, 59, 59, 999);
    
    return flights.filter((flight) => {
      if (!flight.departure_airport || !flight.arrival_airport) return false;
      const flightDate = flight.date ? new Date(flight.date) : null;
      if (!flightDate || Number.isNaN(flightDate.getTime())) return false;
      return flightDate >= startDate && flightDate <= endDate;
    });
  }, [flights, dateRange]);

  // Get unique airports and their coordinates
  const airports = useMemo(() => {
    const airportSet = new Set<string>();
    recentFlights.forEach((flight) => {
      if (flight.departure_airport) airportSet.add(flight.departure_airport.trim().toUpperCase());
      if (flight.arrival_airport) airportSet.add(flight.arrival_airport.trim().toUpperCase());
    });

    const airportList: Array<{ code: string; coords: AirportCoords }> = [];
    airportSet.forEach((code) => {
      const coords = (airportCoordinates as Record<string, AirportCoords>)[code];
      if (coords) {
        airportList.push({ code, coords });
      }
    });

    return airportList;
  }, [recentFlights]);

  // Create route lines
  const routes = useMemo(() => {
    return recentFlights
      .map((flight) => {
        const fromCode = flight.departure_airport?.trim().toUpperCase();
        const toCode = flight.arrival_airport?.trim().toUpperCase();
        
        if (!fromCode || !toCode) return null;
        
        const fromCoords = (airportCoordinates as Record<string, AirportCoords>)[fromCode];
        const toCoords = (airportCoordinates as Record<string, AirportCoords>)[toCode];

        if (fromCoords && toCoords) {
          return {
            from: { lat: fromCoords.lat, lng: fromCoords.lng },
            to: { lat: toCoords.lat, lng: toCoords.lng },
            fromCode,
            toCode,
          };
        }
        return null;
      })
      .filter((route): route is NonNullable<typeof route> => route !== null);
  }, [recentFlights]);

  // Orthographic projection: Convert lat/lng to 2D coordinates on a sphere
  // Memoized to prevent recreation on every render
  const latLngToXY = useMemo(() => {
    const [rotLng, rotLat] = rotation;
    const scale = projectionScale * zoom;
    
    return (lat: number, lng: number): { x: number; y: number; visible: boolean } => {
      // Convert to radians
      const phi = (90 - lat) * Math.PI / 180;
      const lambda = lng * Math.PI / 180;
      
      // 3D coordinates on unit sphere
      const cosPhi = Math.cos(phi);
      const x = cosPhi * Math.cos(lambda);
      const y = cosPhi * Math.sin(lambda);
      const z = Math.sin(phi);
      
      // Rotate around Y axis (longitude rotation)
      const rotY = rotLng * Math.PI / 180;
      const cosRotY = Math.cos(rotY);
      const sinRotY = Math.sin(rotY);
      const x1 = x * cosRotY + z * sinRotY;
      const z1 = -x * sinRotY + z * cosRotY;
      
      // Rotate around X axis (latitude rotation)
      const rotX = -rotLat * Math.PI / 180; // Negative for correct direction
      const cosRotX = Math.cos(rotX);
      const sinRotX = Math.sin(rotX);
      const y1 = y * cosRotX - z1 * sinRotX;
      const z2 = y * sinRotX + z1 * cosRotX;
      
      // Orthographic projection (only show front-facing points)
      const visible = z2 >= 0;
      
      // Project to 2D
      const x2d = centerX + x1 * scale;
      const y2d = centerY - y1 * scale; // Flip Y axis
      
      return { x: x2d, y: y2d, visible };
    };
  }, [rotation, zoom, centerX, centerY, projectionScale]);

  // Generate world map paths from TopoJSON with optimized processing
  const worldMapPaths = useMemo(() => {
    if (!worldMapData || !latLngToXY) return [];
    
    try {
      const geojson = topojson.feature(worldMapData, worldMapData.objects.countries as any);
      if (!geojson || !geojson.features) return [];
      
      const paths: Array<{ d: string; fill: string; stroke: string }> = [];
      
      // Process all features with coordinate simplification
      geojson.features.forEach((feature: any) => {
        if (!feature || !feature.geometry) return;
        
        try {
          const geometry = feature.geometry;
          const pathParts: string[] = [];
          
          const processRing = (ring: number[][], isOuter: boolean) => {
            const step = isOuter ? 1 : 2;
            let firstPoint = true;
            
            for (let i = 0; i < ring.length; i += step) {
              const coord = ring[i];
              if (!Array.isArray(coord) || coord.length < 2) continue;
              const [lng, lat] = coord;
              if (typeof lat !== 'number' || typeof lng !== 'number') continue;
              
              const { x, y, visible } = latLngToXY(lat, lng);
              
              if (visible || firstPoint) {
                if (firstPoint) {
                  pathParts.push(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
                  firstPoint = false;
                } else {
                  pathParts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
                }
              }
            }
            
            if (isOuter && !firstPoint) {
              pathParts.push('Z');
            }
          };
          
          if (geometry.type === 'Polygon') {
            if (geometry.coordinates && Array.isArray(geometry.coordinates)) {
              geometry.coordinates.forEach((ring: number[][], ringIndex: number) => {
                if (Array.isArray(ring) && ring.length > 0) {
                  processRing(ring, ringIndex === 0);
                }
              });
            }
          } else if (geometry.type === 'MultiPolygon') {
            if (geometry.coordinates && Array.isArray(geometry.coordinates)) {
              geometry.coordinates.forEach((polygon: number[][][]) => {
                if (Array.isArray(polygon)) {
                  polygon.forEach((ring: number[][], ringIndex: number) => {
                    if (Array.isArray(ring) && ring.length > 0) {
                      processRing(ring, ringIndex === 0);
                    }
                  });
                }
              });
            }
          }
          
          const pathD = pathParts.join(' ');
          if (pathD && pathD.length > 20) {
            paths.push({
              d: pathD,
              fill: '#F2F4F7',
              stroke: '#A9B3BD',
            });
          }
        } catch (err) {
          // Skip problematic features
        }
      });
      
      return paths;
    } catch (error) {
      console.error('Error processing world map data:', error);
      return [];
    }
  }, [worldMapData, latLngToXY]);

  // Calculate distance between two touch points
  const getDistance = (touch1: any, touch2: any) => {
    const dx = touch2.pageX - touch1.pageX;
    const dy = touch2.pageY - touch1.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Pan responder for gestures (rotation and zoom)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        
        // Check for double tap (zoom in)
        const now = Date.now();
        if (lastTapRef.current && now - lastTapRef.current < 300) {
          const newZoom = Math.min(zoom * 2, 3);
          setZoom(newZoom);
          lastTapRef.current = null;
          return;
        }
        lastTapRef.current = now;

        if (touches.length === 2) {
          lastDistanceRef.current = getDistance(touches[0], touches[1]);
        } else if (touches.length === 1) {
          dragStartRef.current = {
            x: evt.nativeEvent.pageX,
            y: evt.nativeEvent.pageY,
            rotation: [...rotation],
          };
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length === 2) {
          // Two finger pinch - zoom
          const currentDistance = getDistance(touches[0], touches[1]);
          if (lastDistanceRef.current !== null) {
            const scaleChange = currentDistance / lastDistanceRef.current;
            const newZoom = Math.max(0.5, Math.min(zoom * scaleChange, 3));
            setZoom(newZoom);
          }
          lastDistanceRef.current = currentDistance;
        } else if (touches.length === 1 && dragStartRef.current) {
          // Single finger drag - rotate globe
          const sensitivity = 0.5; // Rotation sensitivity
          const deltaX = gestureState.dx * sensitivity;
          const deltaY = gestureState.dy * sensitivity;
          
          // Rotate around Y axis (horizontal drag = longitude rotation)
          // Rotate around X axis (vertical drag = latitude rotation)
          const newRotation: [number, number, number] = [
            dragStartRef.current.rotation[0] - deltaX / (projectionScale * zoom),
            Math.max(-90, Math.min(90, dragStartRef.current.rotation[1] - deltaY / (projectionScale * zoom))),
            0,
          ];
          setRotation(newRotation);
        }
      },

      onPanResponderRelease: () => {
        lastDistanceRef.current = null;
        dragStartRef.current = null;
      },
    })
  ).current;

  const handleQuickSelect = (months: number) => {
    const today = new Date();
    const startDate = subMonths(today, months);
    startDate.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);
    
    const newDateRange = { from: startDate, to: today };
    setDateRange(newDateRange);
    
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange);
    }

    if (months === 1) setSelectedRange('1month');
    else if (months === 6) setSelectedRange('6months');
    else if (months === 12) setSelectedRange('12months');
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>Flight Routes</ThemedText>
          <ThemedText style={styles.subtitle}>
            {!dateRange.from || !dateRange.to
              ? "Select a date range to view flights"
              : recentFlights.length > 0 
                ? `${recentFlights.length} flight${recentFlights.length !== 1 ? "s" : ""} • ${airports.length} airports`
                : "No flights in selected period"}
          </ThemedText>
        </View>
      </View>

      {/* Date Range Buttons */}
      <View style={styles.dateRangeContainer}>
        <TouchableOpacity
          style={[
            styles.dateButton,
            selectedRange === '1month' && styles.dateButtonActive
          ]}
          onPress={() => handleQuickSelect(1)}
        >
          <ThemedText style={[
            styles.dateButtonText,
            selectedRange === '1month' && styles.dateButtonTextActive
          ]}>
            1 Month
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.dateButton,
            selectedRange === '6months' && styles.dateButtonActive
          ]}
          onPress={() => handleQuickSelect(6)}
        >
          <ThemedText style={[
            styles.dateButtonText,
            selectedRange === '6months' && styles.dateButtonTextActive
          ]}>
            6 Months
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.dateButton,
            selectedRange === '12months' && styles.dateButtonActive
          ]}
          onPress={() => handleQuickSelect(12)}
        >
          <ThemedText style={[
            styles.dateButtonText,
            selectedRange === '12months' && styles.dateButtonTextActive
          ]}>
            12 Months
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* World Map */}
      <View style={styles.mapContainer}>
        {mapLoading || !worldMapData ? (
          <View style={styles.emptyState}>
            <Ionicons name="globe-outline" size={48} color="#9CA3AF" />
            <ThemedText style={styles.emptyText}>Loading world map...</ThemedText>
          </View>
        ) : recentFlights.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={48} color="#9CA3AF" />
            <ThemedText style={styles.emptyText}>
              {!dateRange.from || !dateRange.to
                ? "Select a date range above to view your flight routes"
                : "No flights found in the selected period"}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.mapTouchArea} {...panResponder.panHandlers}>
            <Svg width={mapWidth} height={mapHeight} style={styles.svg}>
              <Defs>
                <RadialGradient id="oceanGradient" cx="50%" cy="50%">
                  <Stop offset="0%" stopColor="#DDE6F1" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#DDE6F1" stopOpacity="0.9" />
                </RadialGradient>
              </Defs>
              
              {/* Sphere background (circle) - represents the globe */}
              <Circle
                cx={centerX}
                cy={centerY}
                r={projectionScale * zoom}
                fill="#DDE6F1"
                stroke="#A9B3BD"
                strokeWidth="1"
              />
              
              {/* World map countries */}
              <G>
                {worldMapPaths.map((country, index) => (
                  <Path
                    key={`country-${index}`}
                    d={country.d}
                    fill={country.fill}
                    stroke={country.stroke}
                    strokeWidth="0.5"
                  />
                ))}
              </G>
              
              <G>
                {/* Draw flight routes */}
                {routes.map((route, index) => {
                  const fromXY = latLngToXY(route.from.lat, route.from.lng);
                  const toXY = latLngToXY(route.to.lat, route.to.lng);
                  
                  // Only draw route if both points are visible
                  if (fromXY.visible && toXY.visible) {
                    return (
                      <Line
                        key={`route-${index}`}
                        x1={fromXY.x}
                        y1={fromXY.y}
                        x2={toXY.x}
                        y2={toXY.y}
                        stroke="#24587E"
                        strokeWidth="2"
                        strokeOpacity="0.8"
                      />
                    );
                  }
                  return null;
                })}
                
                {/* Draw airport markers */}
                {airports.map((airport) => {
                  const xy = latLngToXY(airport.coords.lat, airport.coords.lng);
                  
                  // Only show airports on the visible side of the globe
                  if (xy.visible) {
                    return (
                      <G key={airport.code}>
                        <Circle
                          cx={xy.x}
                          cy={xy.y}
                          r="5"
                          fill="#1E73BE"
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <SvgText
                          x={xy.x}
                          y={xy.y - 10}
                          fontSize="11"
                          fill="#2A2A2A"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {airport.code}
                        </SvgText>
                      </G>
                    );
                  }
                  return null;
                })}
              </G>
            </Svg>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    minHeight: 400,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  dateRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 0,
  },
  dateButtonActive: {
    backgroundColor: '#24587E',
    borderColor: '#24587E',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  dateButtonTextActive: {
    color: '#fff',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTouchArea: {
    width: '100%',
    height: '100%',
  },
  svg: {
    backgroundColor: '#DDE6F1',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
});
