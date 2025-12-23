import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom user location icon
const userLocationIcon = L.divIcon({
  className: "user-location-marker",
  html: `<div style="width: 20px; height: 20px; background: hsl(175, 45%, 45%); border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Custom destination icon
const destinationIcon = L.divIcon({
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

interface DestinationScreenProps {
  onBack: () => void;
  onConfirm: (destination: string, radius: number, coords: { lat: number; lng: number }) => void;
}

// Component to handle map clicks
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to recenter map
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
};

const DestinationScreen = ({ onBack, onConfirm }: DestinationScreenProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(300);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

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
          setLocationError("Could not get your location. Please enable location services.");
          // Default to a fallback location
          setUserLocation({ lat: 51.505, lng: -0.09 });
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setUserLocation({ lat: 51.505, lng: -0.09 });
      setIsLoading(false);
    }
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setDestinationCoords({ lat, lng });
  };

  const handleConfirm = () => {
    if (destinationCoords) {
      onConfirm("Selected Destination", radius, destinationCoords);
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
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-border bg-card z-10">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">Select Destination</h1>
          <p className="text-xs text-muted-foreground">Tap on the map to set your destination</p>
        </div>
      </div>

      {/* Location error banner */}
      {locationError && (
        <div className="px-4 py-2 bg-destructive/20 border-b border-destructive/30">
          <p className="text-xs text-destructive">{locationError}</p>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {userLocation && (
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={15}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            
            {/* User location marker */}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} />
            
            {/* Destination marker */}
            {destinationCoords && (
              <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={destinationIcon} />
            )}
          </MapContainer>
        )}

        {/* Center on user button */}
        <button
          onClick={() => {
            if (userLocation && "geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                });
              });
            }
          }}
          className="absolute bottom-32 right-4 z-[1000] w-12 h-12 rounded-full bg-card shadow-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
        >
          <Navigation className="w-5 h-5 text-accent" />
        </button>
      </div>

      {/* Bottom panel */}
      <motion.div 
        className="p-4 bg-card border-t border-border space-y-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {destinationCoords ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Destination selected</p>
              <p className="text-sm font-medium text-foreground">
                {destinationCoords.lat.toFixed(5)}, {destinationCoords.lng.toFixed(5)}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-muted-foreground">Tap on the map to select destination</p>
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
          className="w-full"
          size="lg"
          disabled={!destinationCoords}
        >
          Start Tracking
        </Button>
      </motion.div>
    </div>
  );
};

export default DestinationScreen;
