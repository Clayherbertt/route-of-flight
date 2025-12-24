import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup, Sphere, Graticule } from "react-simple-maps";
import { subDays, subMonths, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, ZoomIn, ZoomOut, RotateCcw, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import airportCoordinates from "@/data/airportCoordinates.json";

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

// Using a more reliable TopoJSON source with detailed borders
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Alternative URL if the first one fails
const geoUrlAlt = "https://unpkg.com/world-atlas@2/countries-110m.json";

// For comprehensive administrative boundaries:
// - World countries: world-atlas (includes all country borders - white, 0.8px)
// - US states: us-atlas (white borders, 0.5px)
// - For other countries' provinces/states, additional datasets would be needed

// US States TopoJSON
const usStatesUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Canada Provinces - using a reliable GeoJSON source
// Using Natural Earth admin_1 data or similar comprehensive source
// Try multiple reliable sources
const canadaProvincesUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/canada.geojson";

// Note: To add provinces for other countries (Canada, Mexico, etc.), we would need:
// - Natural Earth admin_1_states_provinces data
// - Or country-specific datasets
// Currently, all country borders are visible (white, 0.8px stroke)

// Great Lakes FeatureCollection with accurate coordinates
// Coordinates are [longitude, latitude] pairs
const greatLakesFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Lake Superior" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-92.0, 46.5], [-90.0, 47.0], [-88.5, 47.5], [-87.0, 48.0],
          [-85.5, 48.2], [-84.0, 48.0], [-84.5, 47.0], [-87.0, 46.5],
          [-89.0, 46.0], [-91.0, 46.0], [-92.0, 46.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Lake Michigan" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-88.0, 45.5], [-87.5, 44.5], [-87.0, 43.5], [-87.0, 42.0],
          [-87.5, 41.5], [-88.0, 41.5], [-88.5, 42.0], [-88.5, 43.0],
          [-88.5, 44.0], [-88.2, 45.0], [-88.0, 45.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Lake Huron" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-83.5, 45.5], [-82.0, 45.8], [-81.0, 45.5], [-80.5, 44.5],
          [-81.0, 43.8], [-82.0, 43.5], [-83.0, 44.0], [-83.5, 44.8],
          [-83.5, 45.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Lake Erie" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-83.5, 42.2], [-82.0, 42.5], [-80.5, 42.2], [-80.0, 41.5],
          [-81.0, 41.2], [-82.5, 41.5], [-83.0, 42.0], [-83.5, 42.2]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Lake Ontario" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-79.5, 43.8], [-78.5, 44.0], [-77.5, 43.8], [-77.0, 43.2],
          [-77.5, 43.0], [-78.5, 43.2], [-79.0, 43.5], [-79.5, 43.8]
        ]]
      }
    }
  ]
};

// Note: For rivers and lakes, we'll need to use a proper water features GeoJSON
// The current world-atlas doesn't include detailed rivers/lakes
// We can add them as a separate layer if we have the data source

// For rivers and lakes, we'll use a combination approach:
// 1. Identify major water bodies by name in the geography data
// 2. Use a proper water features dataset if available
// Note: The standard world-atlas doesn't include detailed rivers/lakes
// We'll color major water bodies blue in the main geography layer

// Function to approximate US terrain based on coordinates
const getUSTerrainColor = (coords: any): { fill: string; stroke: string } => {
  // This is a rough approximation - we'd need detailed elevation data for accuracy
  // For now, we'll use a mix of colors to represent different terrain types
  
  // Try to extract a representative coordinate point
  let lat = 0;
  let lng = 0;
  
  if (coords && Array.isArray(coords)) {
    // Flatten and find center-ish point
    const flattenCoords = (arr: any[]): number[][] => {
      if (Array.isArray(arr[0]) && Array.isArray(arr[0][0])) {
        return arr.flatMap(flattenCoords);
      }
      return arr;
    };
    
    const flat = flattenCoords(coords);
    if (flat.length > 0) {
      const sum = flat.reduce((acc, coord) => {
        if (Array.isArray(coord) && coord.length >= 2) {
          return { lng: acc.lng + coord[0], lat: acc.lat + coord[1] };
        }
        return acc;
      }, { lng: 0, lat: 0 });
      
      if (flat.length > 0) {
        lng = sum.lng / flat.length;
        lat = sum.lat / flat.length;
      }
    }
  }
  
  // Approximate terrain regions based on coordinates
  // Rockies: roughly -120 to -105 longitude, 35 to 50 latitude
  if (lng >= -120 && lng <= -105 && lat >= 35 && lat <= 50) {
    return { fill: "#c9b99a", stroke: "#b4a485" }; // Brown/tan for mountains
  }
  
  // Sierra Nevada: roughly -120 to -118 longitude, 36 to 40 latitude
  if (lng >= -120 && lng <= -118 && lat >= 36 && lat <= 40) {
    return { fill: "#c9b99a", stroke: "#b4a485" }; // Brown/tan for mountains
  }
  
  // Appalachians: roughly -85 to -75 longitude, 35 to 45 latitude
  if (lng >= -85 && lng <= -75 && lat >= 35 && lat <= 45) {
    return { fill: "#b8d4a8", stroke: "#a4c494" }; // Green for forested mountains
  }
  
  // Pacific Northwest: roughly -125 to -120 longitude, 42 to 49 latitude
  if (lng >= -125 && lng <= -120 && lat >= 42 && lat <= 49) {
    return { fill: "#a8c494", stroke: "#94b484" }; // Darker green for forests
  }
  
  // Southwest desert: roughly -120 to -105 longitude, 32 to 37 latitude
  if (lng >= -120 && lng <= -105 && lat >= 32 && lat <= 37) {
    return { fill: "#f0e6c4", stroke: "#d4c5a4" }; // Sandy for desert
  }
  
  // Great Plains: roughly -105 to -95 longitude, 35 to 49 latitude
  if (lng >= -105 && lng <= -95 && lat >= 35 && lat <= 49) {
    return { fill: "#e6d5b8", stroke: "#d4c5a4" }; // Tan for plains
  }
  
  // Southeast: roughly -90 to -75 longitude, 25 to 35 latitude
  if (lng >= -90 && lng <= -75 && lat >= 25 && lat <= 35) {
    return { fill: "#c4d4a4", stroke: "#b0c490" }; // Light green for vegetation
  }
  
  // Northeast: roughly -75 to -70 longitude, 40 to 45 latitude
  if (lng >= -75 && lng <= -70 && lat >= 40 && lat <= 45) {
    return { fill: "#b8d4a8", stroke: "#a4c494" }; // Green for forests
  }
  
  // Default: light green for general vegetation
  return { fill: "#d4e6c4", stroke: "#b8d4a8" };
};

// Default rotation centers on United States (approximately -98.5795° W, 39.8283° N)
const DEFAULT_US_ROTATION: [number, number, number] = [98.5795, -39.8283, 0];

export const FlightMap = ({ flights, onDateRangeChange }: FlightMapProps) => {
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentGeoUrl, setCurrentGeoUrl] = useState(geoUrl);
  const [canadaDataError, setCanadaDataError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState<[number, number, number]>(DEFAULT_US_ROTATION);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; rotation: [number, number, number] } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null);
  const [touchStartZoom, setTouchStartZoom] = useState<number>(1);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // State for dropdown date selectors
  const [fromMonth, setFromMonth] = useState<string>("");
  const [fromDay, setFromDay] = useState<string>("");
  const [fromYear, setFromYear] = useState<string>("");
  const [toMonth, setToMonth] = useState<string>("");
  const [toDay, setToDay] = useState<string>("");
  const [toYear, setToYear] = useState<string>("");

  // Filter flights based on selected date range
  // Map starts blank - only shows flights when a date range is explicitly selected and applied
  const recentFlights = useMemo(() => {
    // If no date range selected, return empty array to keep map blank
    if (!dateRange.from || !dateRange.to) {
      return [];
    }
    
    // Set time to start/end of day for proper date range filtering
    const startDate = new Date(dateRange.from);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateRange.to);
    endDate.setHours(23, 59, 59, 999);
    
    const filtered = flights.filter((flight) => {
      if (!flight.departure_airport || !flight.arrival_airport) return false;
      const flightDate = flight.date ? new Date(flight.date) : null;
      if (!flightDate || Number.isNaN(flightDate.getTime())) return false;
      return flightDate >= startDate && flightDate <= endDate;
    });
    
    if (filtered.length > 0 || flights.length > 0) {
      console.log(`Flights from ${format(startDate, "MMM d, yyyy")} to ${format(endDate, "MMM d, yyyy")}:`, filtered.length, "out of", flights.length);
    }
    return filtered;
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
      } else {
        console.log("Airport not found in database:", code);
      }
    });

    console.log("Found airports with coordinates:", airportList.length, "out of", airportSet.size);
    return airportList;
  }, [recentFlights]);

  // Create route lines
  const routes = useMemo(() => {
    const validRoutes = recentFlights
      .map((flight) => {
        const fromCode = flight.departure_airport?.trim().toUpperCase();
        const toCode = flight.arrival_airport?.trim().toUpperCase();
        
        if (!fromCode || !toCode) return null;
        
        const fromCoords = (airportCoordinates as Record<string, AirportCoords>)[fromCode];
        const toCoords = (airportCoordinates as Record<string, AirportCoords>)[toCode];

        if (fromCoords && toCoords) {
          return {
            from: [fromCoords.lng, fromCoords.lat] as [number, number],
            to: [toCoords.lng, toCoords.lat] as [number, number],
            fromCode: fromCode,
            toCode: toCode,
          };
        }
        return null;
      })
      .filter((route): route is NonNullable<typeof route> => route !== null);
    
    console.log("Valid routes:", validRoutes.length);
    return validRoutes;
  }, [recentFlights]);

  // Calculate initial rotation to center on airports (if available), otherwise use US center
  const initialRotation = useMemo(() => {
    if (airports.length === 0) {
      return DEFAULT_US_ROTATION;
    }

    // Calculate center
    const lngs = airports.map(a => a.coords.lng);
    const lats = airports.map(a => a.coords.lat);
    
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    
    // For orthographic projection, rotate to center on the location
    return [-centerLng, -centerLat, 0] as [number, number, number];
  }, [airports]);

  // Initialize rotation when airports change (only if date range is selected and we have airports)
  // Otherwise, keep the default US-centered view
  useEffect(() => {
    if (dateRange.from && dateRange.to && airports.length > 0) {
      // Check if rotation is still at default (US center) - only then update to airport center
      const isAtDefault = Math.abs(rotation[0] - DEFAULT_US_ROTATION[0]) < 0.1 && 
                          Math.abs(rotation[1] - DEFAULT_US_ROTATION[1]) < 0.1;
      if (isAtDefault) {
        setRotation(initialRotation);
      }
    }
  }, [airports, initialRotation, dateRange, rotation]);

  // Handle zoom
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z * 1.5, 20));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z / 1.5, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    if (airports.length > 0 && dateRange.from && dateRange.to) {
      setRotation(initialRotation);
    } else {
      setRotation(DEFAULT_US_ROTATION);
    }
  }, [initialRotation, airports, dateRange]);

  // Handle mouse down for rotation
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX, 
      y: e.clientY,
      rotation: [...rotation] as [number, number, number]
    });
  }, [rotation]);

  // Handle mouse move for rotation
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Convert pixel movement to rotation angles
    // Sensitivity decreases as zoom increases (slower movement when zoomed in)
    // Base sensitivity of 0.5, divided by zoom level
    const baseSensitivity = 0.5;
    const sensitivity = baseSensitivity / zoom;
    const newRotation: [number, number, number] = [
      dragStart.rotation[0] + deltaX * sensitivity,
      Math.max(-90, Math.min(90, dragStart.rotation[1] - deltaY * sensitivity)),
      dragStart.rotation[2],
    ];
    
    setRotation(newRotation);
  }, [isDragging, dragStart, zoom]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Calculate distance between two touch points
  const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle touch start for pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger pinch gesture
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setTouchStartDistance(distance);
      setTouchStartZoom(zoom);
      e.preventDefault();
    } else if (e.touches.length === 1) {
      // Single finger - allow dragging
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY,
        rotation: [...rotation] as [number, number, number]
      });
    }
  }, [zoom, rotation]);

  // Handle touch move for pinch-to-zoom
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistance !== null) {
      // Two-finger pinch gesture - zoom
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / touchStartDistance;
      const newZoom = touchStartZoom * scale;
      setZoom(Math.max(0.5, Math.min(20, newZoom)));
      e.preventDefault();
    } else if (e.touches.length === 1 && isDragging && dragStart) {
      // Single finger drag - rotate map
      const deltaX = e.touches[0].clientX - dragStart.x;
      const deltaY = e.touches[0].clientY - dragStart.y;
      
      const baseSensitivity = 0.5;
      const sensitivity = baseSensitivity / zoom;
      const newRotation: [number, number, number] = [
        dragStart.rotation[0] + deltaX * sensitivity,
        Math.max(-90, Math.min(90, dragStart.rotation[1] - deltaY * sensitivity)),
        dragStart.rotation[2],
      ];
      
      setRotation(newRotation);
      e.preventDefault();
    }
  }, [touchStartDistance, touchStartZoom, isDragging, dragStart, zoom]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      // All fingers lifted
      setTouchStartDistance(null);
      setIsDragging(false);
      setDragStart(null);
    } else if (e.touches.length === 1) {
      // One finger remaining - switch to drag mode
      setTouchStartDistance(null);
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY,
        rotation: [...rotation] as [number, number, number]
      });
    }
  }, [rotation]);

  // Handle wheel/scroll for zoom (Mac-style natural scrolling)
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // On Mac, scrolling up (negative deltaY) should zoom in
    // Scrolling down (positive deltaY) should zoom out
    const delta = Math.abs(e.deltaY);
    
    // Only zoom if the scroll delta is significant enough
    if (delta < 1) return;
    
    // Calculate zoom increment - faster zooming
    // Base increment that scales with zoom level for responsive control
    const baseIncrement = 0.03; // Increased from 0.01 for faster zoom
    const zoomIncrement = baseIncrement * (1 + zoom * 0.15); // Increased multiplier
    
    if (e.deltaY < 0) {
      // Scrolling up - zoom in
      setZoom((z) => {
        const newZoom = z + zoomIncrement;
        return Math.min(newZoom, 20);
      });
    } else {
      // Scrolling down - zoom out
      setZoom((z) => {
        const newZoom = z - zoomIncrement;
        return Math.max(newZoom, 0.5);
      });
    }
  }, [zoom]);

  // Attach wheel event listener directly to DOM element
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Initialize dropdown values from dateRange
  useEffect(() => {
    if (dateRange.from) {
      setFromMonth(String(dateRange.from.getMonth() + 1).padStart(2, '0'));
      setFromDay(String(dateRange.from.getDate()).padStart(2, '0'));
      setFromYear(String(dateRange.from.getFullYear()));
    }
    if (dateRange.to) {
      setToMonth(String(dateRange.to.getMonth() + 1).padStart(2, '0'));
      setToDay(String(dateRange.to.getDate()).padStart(2, '0'));
      setToYear(String(dateRange.to.getFullYear()));
    }
  }, [dateRange]);

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const date = new Date(2000, i, 1);
    return { value: String(monthNum).padStart(2, '0'), label: format(date, 'MMMM') };
  });

  // Generate year options (current year and 10 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear - i;
    return { value: String(year), label: String(year) };
  });

  // Get days in month (handles leap years)
  const getDaysInMonth = (month: string, year: string): number => {
    if (!month || !year) return 31;
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    return new Date(yearNum, monthNum, 0).getDate();
  };

  // Generate day options based on selected month/year
  const getDayOptions = (month: string, year: string) => {
    const daysInMonth = getDaysInMonth(month, year);
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return { value: String(day).padStart(2, '0'), label: String(day) };
    });
  };

  // Update dateRange when dropdowns change
  const updateFromDate = (month: string, day: string, year: string) => {
    if (month && day && year) {
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      if (!isNaN(date.getTime())) {
        setDateRange(prev => ({ ...prev, from: date }));
      }
    }
  };

  const updateToDate = (month: string, day: string, year: string) => {
    if (month && day && year) {
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      if (!isNaN(date.getTime())) {
        setDateRange(prev => ({ ...prev, to: date }));
      }
    }
  };

  // Handle dropdown changes
  const handleFromMonthChange = (value: string) => {
    setFromMonth(value);
    const daysInMonth = getDaysInMonth(value, fromYear);
    const day = parseInt(fromDay, 10);
    const adjustedDay = day > daysInMonth ? String(daysInMonth).padStart(2, '0') : fromDay;
    setFromDay(adjustedDay);
    updateFromDate(value, adjustedDay, fromYear);
  };

  const handleFromDayChange = (value: string) => {
    setFromDay(value);
    updateFromDate(fromMonth, value, fromYear);
  };

  const handleFromYearChange = (value: string) => {
    setFromYear(value);
    const daysInMonth = getDaysInMonth(fromMonth, value);
    const day = parseInt(fromDay, 10);
    const adjustedDay = day > daysInMonth ? String(daysInMonth).padStart(2, '0') : fromDay;
    setFromDay(adjustedDay);
    updateFromDate(fromMonth, adjustedDay, value);
  };

  const handleToMonthChange = (value: string) => {
    setToMonth(value);
    const daysInMonth = getDaysInMonth(value, toYear);
    const day = parseInt(toDay, 10);
    const adjustedDay = day > daysInMonth ? String(daysInMonth).padStart(2, '0') : toDay;
    setToDay(adjustedDay);
    updateToDate(value, adjustedDay, toYear);
  };

  const handleToDayChange = (value: string) => {
    setToDay(value);
    updateToDate(toMonth, value, toYear);
  };

  const handleToYearChange = (value: string) => {
    setToYear(value);
    const daysInMonth = getDaysInMonth(toMonth, value);
    const day = parseInt(toDay, 10);
    const adjustedDay = day > daysInMonth ? String(daysInMonth).padStart(2, '0') : toDay;
    setToDay(adjustedDay);
    updateToDate(toMonth, adjustedDay, value);
  };

  const getDateRangeLabel = () => {
    if (!dateRange.from || !dateRange.to) {
      return "Select a date range";
    }
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  };

  const handleApplyDateRange = () => {
    if (dateRange.from && dateRange.to) {
      setIsDatePickerOpen(false);
      // Notify parent component of date range change
      if (onDateRangeChange) {
        onDateRangeChange(dateRange);
      }
    }
  };

  const handleQuickSelect = (months: number) => {
    const today = new Date();
    const startDate = subMonths(today, months);
    startDate.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);
    
    const newDateRange = { from: startDate, to: today };
    setDateRange(newDateRange);
    
    // Notify parent component immediately
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange);
    }
  };

  const getTitle = () => {
    return "Flight Routes";
  };

  // Always show the map, even if there are no flights

  return (
    <Card className="rounded-3xl border border-border/60 bg-card/95 shadow-xl shadow-aviation-navy/15 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-6 py-5">
        <div>
          <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Plane className="h-5 w-5 text-primary" />
            {getTitle()}
          </p>
          <p className="text-sm text-muted-foreground">
            {!dateRange.from || !dateRange.to
              ? "Select a date range to view flights"
              : recentFlights.length > 0 
                ? `${recentFlights.length} flight${recentFlights.length !== 1 ? "s" : ""} • ${airports.length} airports`
                : "No flights in selected period"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile: Dropdown menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs px-3"
                >
                  Select Range
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleQuickSelect(1)}>
                  1 Month
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickSelect(6)}>
                  6 Months
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickSelect(12)}>
                  12 Months
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsDatePickerOpen(true);
                  }}
                >
                  Custom Range
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Desktop: Individual buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs px-3"
              onClick={() => handleQuickSelect(1)}
            >
              1 Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs px-3"
              onClick={() => handleQuickSelect(6)}
            >
              6 Months
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs px-3"
              onClick={() => handleQuickSelect(12)}
            >
              12 Months
            </Button>
          </div>
          {/* Custom Range button - hidden on mobile, shown on desktop */}
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "hidden md:flex h-9 justify-start text-left font-normal bg-background/50 hover:bg-background border-border/60",
                  !dateRange.from && !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from && dateRange.to ? (
                  <span className="font-medium">
                    {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                  </span>
                ) : (
                  <span>Custom Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-5 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From Date</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Month</Label>
                        <Select value={fromMonth} onValueChange={handleFromMonthChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Day</Label>
                        <Select value={fromDay} onValueChange={handleFromDayChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {getDayOptions(fromMonth, fromYear).map((day) => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year</Label>
                        <Select value={fromYear} onValueChange={handleFromYearChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year.value} value={year.value}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To Date</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Month</Label>
                        <Select value={toMonth} onValueChange={handleToMonthChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Day</Label>
                        <Select value={toDay} onValueChange={handleToDayChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {getDayOptions(toMonth, toYear).map((day) => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year</Label>
                        <Select value={toYear} onValueChange={handleToYearChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year.value} value={year.value}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateRange({ from: null, to: null });
                      setFromMonth("");
                      setFromDay("");
                      setFromYear("");
                      setToMonth("");
                      setToDay("");
                      setToYear("");
                      setIsDatePickerOpen(false);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApplyDateRange}
                    disabled={!dateRange.from || !dateRange.to}
                    className="px-4"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <CardContent className="p-0">
        <div 
          ref={mapContainerRef}
          className="w-full rounded-b-3xl" 
          style={{ 
            height: "calc(100vh - 300px)",
            minHeight: "500px",
            position: "relative", 
            backgroundColor: "#0a0a1a", 
            cursor: isDragging ? "grabbing" : "grab",
            overflow: "hidden",
            touchAction: "none",
            WebkitUserSelect: "none",
            userSelect: "none"
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground z-10">
              <p>Map loading error. Please refresh the page.</p>
            </div>
          )}
          
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleZoomIn}
              className="h-9 w-9 p-0 bg-background/80 hover:bg-background"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleZoomOut}
              className="h-9 w-9 p-0 bg-background/80 hover:bg-background"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleReset}
              className="h-9 w-9 p-0 bg-background/80 hover:bg-background"
              title="Reset View"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <ComposableMap
            projection="geoOrthographic"
            projectionConfig={{
              scale: 200 * zoom,
              rotate: rotation,
            }}
            style={{ width: "100%", height: "100%" }}
          >
            {/* Realistic ocean with gradient effect */}
            <defs>
              <radialGradient id="oceanGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#DDE6F1" stopOpacity="1" />
                <stop offset="50%" stopColor="#DDE6F1" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#DDE6F1" stopOpacity="0.8" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <Sphere stroke="#1a3a5a" strokeWidth={0.5} fill="#DDE6F1" />
            <Graticule stroke="#2a4a6a" strokeWidth={0.2} opacity={0.2} />
            
            {/* World countries base layer */}
            <Geographies geography={currentGeoUrl}>
              {({ geographies }) => {
                if (!geographies || geographies.length === 0) {
                  return null;
                }
                return geographies.map((geo) => {
                  // Get country/region name for terrain coloring
                  const name = geo.properties?.NAME || geo.properties?.name || "";
                  const nameLower = name.toLowerCase();
                  
                  // Custom color scheme
                  let fillColor = "#F2F4F7"; // Default (will be overridden for specific regions)
                  let strokeColor = "#A9B3BD"; // Country borders
                  
                  // Water bodies - light blue-gray
                  if (nameLower.includes("lake superior") || nameLower.includes("lake michigan") ||
                      nameLower.includes("lake huron") || nameLower.includes("lake erie") ||
                      nameLower.includes("lake ontario")) {
                    fillColor = "#DDE6F1"; // Water
                    strokeColor = "#DDE6F1";
                  }
                  // Other major lakes - water color
                  else if (nameLower.includes("lake") && (
                      nameLower.includes("baikal") || nameLower.includes("victoria") ||
                      nameLower.includes("tanganyika") || nameLower.includes("caspian") ||
                      nameLower.includes("aral") || nameLower.includes("great bear") ||
                      nameLower.includes("great slave") || nameLower.includes("winnipeg") ||
                      nameLower.includes("dead sea"))) {
                    fillColor = "#DDE6F1"; // Water
                    strokeColor = "#DDE6F1";
                  }
                  // Major Rivers - water color
                  else if (nameLower.includes("mississippi") || nameLower.includes("amazon") ||
                           nameLower.includes("nile") || nameLower.includes("yangtze") ||
                           nameLower.includes("ganges") || nameLower.includes("mekong") ||
                           nameLower.includes("danube") || nameLower.includes("rhine")) {
                    fillColor = "#DDE6F1"; // Water
                    strokeColor = "#DDE6F1";
                  }
                  // United States - will be handled by US states layer, but set base color
                  else if (nameLower.includes("united states") || nameLower.includes("usa")) {
                    fillColor = "#F2F4F7"; // US Land Base
                    strokeColor = "#A9B3BD"; // Country borders
                  }
                  // Canada
                  else if (nameLower.includes("canada")) {
                    fillColor = "#E7ECEF"; // Canada Land
                    strokeColor = "#A9B3BD"; // Country borders
                  }
                  // Mexico and Central America
                  else if (nameLower.includes("mexico") || nameLower.includes("guatemala") || nameLower.includes("belize") || nameLower.includes("honduras") || nameLower.includes("nicaragua") || nameLower.includes("costa rica") || nameLower.includes("panama")) {
                    fillColor = "#E0D6C6"; // Mexico / Central America
                    strokeColor = "#A9B3BD"; // Country borders
                  }
                  // All other countries - default US land color
                  else {
                    fillColor = "#F2F4F7"; // Default land color
                    strokeColor = "#A9B3BD"; // Country borders
                  }
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={0.5}
                      style={{
                        default: { 
                          outline: "none",
                          filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))"
                        },
                        hover: { 
                          outline: "none", 
                          fill: fillColor, 
                          stroke: strokeColor,
                          filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.4))"
                        },
                        pressed: { 
                          outline: "none", 
                          fill: fillColor, 
                          stroke: strokeColor,
                          filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))"
                        },
                      }}
                    />
                  );
                });
              }}
            </Geographies>

            {/* US States layer for detailed terrain */}
            <Geographies geography={usStatesUrl}>
              {({ geographies }) => {
                if (!geographies || geographies.length === 0) {
                  return null;
                }
                return geographies.map((geo) => {
                  const stateName = geo.properties?.name || "";
                  const stateNameLower = stateName.toLowerCase();
                  
                  // US states with custom colors
                  const fillColor = "#F2F4F7"; // US Land Base
                  const strokeColor = "#C2C8D0"; // State Borders
                  
                  return (
                    <Geography
                      key={`state-${geo.rsmKey}`}
                      geography={geo}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: fillColor, stroke: strokeColor },
                        pressed: { outline: "none", fill: fillColor, stroke: strokeColor },
                      }}
                    />
                  );
                });
              }}
            </Geographies>

            {/* Canada Provinces layer */}
            <Geographies geography={canadaProvincesUrl}>
              {({ geographies }) => {
                if (!geographies || geographies.length === 0) {
                  return null;
                }
                return geographies.map((geo) => {
                  const provinceName = geo.properties?.name || geo.properties?.NAME || geo.properties?.province || "";
                  const provinceNameLower = provinceName.toLowerCase();
                  
                  // Canadian provinces with custom colors
                  const fillColor = "#E7ECEF"; // Canada Land
                  const strokeColor = "#A9B3BD"; // Country borders
                  
                  return (
                    <Geography
                      key={`canada-${geo.rsmKey}`}
                      geography={geo}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: fillColor, stroke: strokeColor },
                        pressed: { outline: "none", fill: fillColor, stroke: strokeColor },
                      }}
                    />
                  );
                });
              }}
            </Geographies>

            {/* Draw flight routes */}
            {routes.map((route, idx) => (
              <Line
                key={`${route.fromCode}-${route.toCode}-${idx}`}
                coordinates={[route.from, route.to]}
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                strokeOpacity={0.9}
                style={{
                  filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.5))"
                }}
              />
            ))}


            {/* Draw airport markers */}
            {airports.map(({ code, coords }) => (
              <Marker key={code} coordinates={[coords.lng, coords.lat]}>
                <circle r={5} fill="#1E73BE" stroke="#fff" strokeWidth={2} />
                <text
                  y={-10}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#2A2A2A"
                  fontWeight={700}
                  style={{ 
                    pointerEvents: "none",
                    textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                  }}
                >
                  {code}
                </text>
              </Marker>
            ))}
          </ComposableMap>
        </div>
      </CardContent>
    </Card>
  );
};

