import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DestinationScreenProps {
  onBack: () => void;
  onConfirm: (destination: string) => void;
}

const DestinationScreen = ({ onBack, onConfirm }: DestinationScreenProps) => {
  const [pinPosition, setPinPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string>("");

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPinPosition({ x, y });
    
    // Simulated place names based on position
    const places = [
      "Central Station",
      "Market Square",
      "University Campus",
      "Business District",
      "Harbor View",
      "Old Town",
    ];
    setSelectedPlace(places[Math.floor(Math.random() * places.length)]);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search destination..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <motion.div 
        className="flex-1 relative bg-map-bg cursor-crosshair overflow-hidden"
        onClick={handleMapClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Stylized map elements */}
        <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none">
          {/* Water */}
          <ellipse cx="80%" cy="30%" rx="30%" ry="25%" className="fill-map-water/50" />
          
          {/* Roads */}
          <line x1="0" y1="40%" x2="100%" y2="40%" className="stroke-border" strokeWidth="8" />
          <line x1="50%" y1="0" x2="50%" y2="100%" className="stroke-border" strokeWidth="8" />
          <line x1="20%" y1="0" x2="80%" y2="100%" className="stroke-border" strokeWidth="4" />
          
          {/* Parks */}
          <rect x="10%" y="60%" width="20%" height="25%" rx="8" className="fill-map-land" />
          <rect x="65%" y="70%" width="25%" height="20%" rx="8" className="fill-map-land" />
          
          {/* Grid lines */}
          {[...Array(10)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={`${i * 10}%`}
              x2="100%"
              y2={`${i * 10}%`}
              className="stroke-border/30"
              strokeWidth="1"
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${i * 10}%`}
              y1="0"
              x2={`${i * 10}%`}
              y2="100%"
              className="stroke-border/30"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Tap instruction */}
        {!pinPosition && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-card/90 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg">
              <p className="text-foreground font-medium text-center">
                Tap anywhere to drop a pin
              </p>
            </div>
          </motion.div>
        )}

        {/* Pin */}
        {pinPosition && (
          <motion.div
            className="absolute"
            style={{ left: `${pinPosition.x}%`, top: `${pinPosition.y}%` }}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className="relative -translate-x-1/2 -translate-y-full">
              <MapPin className="w-10 h-10 text-primary drop-shadow-lg" fill="hsl(var(--primary))" />
              <motion.div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/30"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Bottom panel */}
      <motion.div 
        className="p-4 bg-card border-t border-border"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {selectedPlace ? (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Selected destination</p>
            <p className="text-lg font-semibold text-foreground">{selectedPlace}</p>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-muted-foreground text-center">
              No destination selected
            </p>
          </div>
        )}
        
        <Button 
          onClick={() => onConfirm(selectedPlace)}
          className="w-full"
          size="lg"
          disabled={!selectedPlace}
        >
          Confirm Destination
        </Button>
      </motion.div>
    </div>
  );
};

export default DestinationScreen;
