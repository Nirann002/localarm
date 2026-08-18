import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Navigation, Loader2, Search, X, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  searchPlaces,
  reverseGeocode,
  isOnline,
  getCachedLocation,
  impactHaptic,
  type SearchResult,
  type Destination,
} from "@/lib/locationUtils";

interface DestinationScreenProps {
  onBack: () => void;
  onConfirm: (destination: Destination) => void;
}

const DestinationScreen = ({ onBack, onConfirm }: DestinationScreenProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationName, setDestinationName] = useState<string>("");
  const [radius, setRadius] = useState(300);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  // Get user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Try cached location first
          const cached = getCachedLocation();
          if (cached) {
            setUserLocation(cached);
            setLocationError("Using last known location");
          } else {
            setLocationError("Could not get your location. Please enable location services.");
            setUserLocation({ lat: 13.0827, lng: 80.2707 }); // Default to Chennai
          }
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationError("Geolocation is not supported.");
      setUserLocation({ lat: 13.0827, lng: 80.2707 });
      setIsLoading(false);
    }
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!userLocation || !mapRef.current || leafletMapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const userIcon = L.divIcon({
        className: "user-location-marker",
        html: `<div style="width: 20px; height: 20px; background: hsl(175, 45%, 45%); border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        setDestinationCoords({ lat, lng });
        setSearchQuery("");
        setShowResults(false);
        impactHaptic();

        if (isOnline()) {
          setDestinationName("Loading...");
          const name = await reverseGeocode(lat, lng);
          setDestinationName(name);
        } else {
          setDestinationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      });

      leafletMapRef.current = map;
      setMapReady(true);
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [userLocation]);

  // Update destination marker and radius circle
  useEffect(() => {
    if (!leafletMapRef.current || !mapReady) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      if (destMarkerRef.current) {
        destMarkerRef.current.remove();
        destMarkerRef.current = null;
      }

      if (radiusCircleRef.current) {
        radiusCircleRef.current.remove();
        radiusCircleRef.current = null;
      }

      if (destinationCoords) {
        const destIcon = L.divIcon({
          className: "destination-marker",
          html: `<div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="hsl(35, 95%, 55%)" stroke="white" stroke-width="1.5">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3" fill="white"/>
            </svg>
          </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });

        destMarkerRef.current = L.marker([destinationCoords.lat, destinationCoords.lng], { icon: destIcon }).addTo(leafletMapRef.current);

        radiusCircleRef.current = L.circle([destinationCoords.lat, destinationCoords.lng], {
          radius: radius,
          color: "hsl(35, 95%, 55%)",
          fillColor: "hsl(35, 95%, 55%)",
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(leafletMapRef.current);
      }
    };

    updateMarkers();
  }, [destinationCoords, radius, mapReady]);

  // Search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery || searchQuery.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      setSearchError(null);
      return;
    }

    if (!isOnline()) {
      setSearchError("Search needs internet, but alarm will still work.");
      setSearchResults([]);
      setShowResults(true);
      return;
    }

    searchTimeoutRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchPlaces(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch {
        setSearchError("Search needs internet, but alarm will still work.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectPlace = useCallback((result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setDestinationCoords({ lat, lng });
    setDestinationName(result.display_name);
    setSearchQuery(result.display_name.split(",")[0]);
    setShowResults(false);
    impactHaptic();

    if (leafletMapRef.current) {
      leafletMapRef.current.setView([lat, lng], 16);
    }
  }, []);

  const handleConfirm = () => {
    if (destinationCoords && destinationName) {
      impactHaptic();
      onConfirm({
        name: destinationName,
        lat: destinationCoords.lat,
        lng: destinationCoords.lng,
        radius,
      });
    }
  };

  const centerOnUser = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newLocation);
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([newLocation.lat, newLocation.lng], 15);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Getting your location...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search Header */}
      <div 
        className="px-3 py-3 border-b border-border bg-card z-20 relative"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors shrink-0 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-muted border-border h-11"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-card rounded-lg border border-border shadow-lg max-h-64 overflow-y-auto z-30">
            {searchError ? (
              <div className="flex items-center gap-2 p-4 text-muted-foreground">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">{searchError}</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-muted-foreground text-sm text-center">
                No results found
              </div>
            ) : (
              searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelectPlace(result)}
                  className="w-full flex items-start gap-3 p-3 hover:bg-muted active:bg-muted transition-colors text-left border-b border-border/50 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground line-clamp-2">
                    {result.display_name}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Location error banner */}
      {locationError && (
        <div className="px-4 py-2 bg-destructive/20 border-b border-destructive/30">
          <p className="text-xs text-destructive">{locationError}</p>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="h-full w-full" />

        {/* Center on user button */}
        <button
          onClick={centerOnUser}
          className="absolute bottom-32 right-4 z-[1000] w-12 h-12 rounded-full bg-card shadow-lg flex items-center justify-center border border-border hover:bg-muted active:scale-95 transition-all"
        >
          <Navigation className="w-5 h-5 text-accent" />
        </button>
      </div>

      {/* Bottom panel */}
      <motion.div 
        className="p-4 bg-card border-t border-border space-y-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {destinationCoords && destinationName ? (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="text-sm font-medium text-foreground line-clamp-2">
                {destinationName}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-muted-foreground">Search or tap on the map to select destination</p>
          </div>
        )}

        {/* Radius slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Alert radius</span>
            <span className="text-sm font-medium text-primary">{radius}m</span>
          </div>
          <Slider
            value={[radius]}
            onValueChange={(value) => setRadius(value[0])}
            min={100}
            max={1000}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100m</span>
            <span>1km</span>
          </div>
        </div>
        
        <Button 
          onClick={handleConfirm}
          className="w-full h-12"
          size="lg"
          disabled={!destinationCoords || !destinationName}
        >
          Start Tracking
        </Button>
      </motion.div>
    </div>
  );
};

export default DestinationScreen;
