import { motion } from "framer-motion";
import { MapPin, Moon, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrackingScreenProps {
  destination: string;
  radius: number;
  onStop: () => void;
  onSimulateArrival: () => void;
}

const TrackingScreen = ({ destination, radius, onStop, onSimulateArrival }: TrackingScreenProps) => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-3 h-3 rounded-full bg-accent"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <h1 className="text-lg font-semibold text-foreground">Sleep Mode ON</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Pulse animation */}
        <div className="relative mb-8">
          {/* Outer pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full bg-accent/20"
            style={{ width: 200, height: 200, top: -50, left: -50 }}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-accent/30"
            style={{ width: 150, height: 150, top: -25, left: -25 }}
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 0.2, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          
          {/* Center icon */}
          <motion.div 
            className="relative w-24 h-24 rounded-full bg-accent flex items-center justify-center shadow-xl shadow-accent/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Moon className="w-10 h-10 text-accent-foreground" />
          </motion.div>
        </div>

        {/* Status info */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Rest easy
          </h2>
          <p className="text-muted-foreground">
            We'll wake you up when you arrive
          </p>
        </motion.div>

        {/* Destination card */}
        <motion.div 
          className="w-full bg-card rounded-2xl p-5 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Destination</p>
              <p className="text-lg font-semibold text-foreground">{destination}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Alarm at {radius >= 1000 ? "1km" : `${radius}m`} radius
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tracking indicator */}
        <motion.div 
          className="flex items-center gap-2 mt-6 text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Navigation className="w-4 h-4" />
          <span className="text-sm">Tracking your location in the background</span>
        </motion.div>
      </div>

      {/* Bottom actions */}
      <div className="p-6 space-y-3">
        <Button 
          onClick={onSimulateArrival}
          variant="accent"
          className="w-full"
          size="lg"
        >
          Simulate Arrival (Demo)
        </Button>
        <Button 
          onClick={onStop}
          variant="outline"
          className="w-full"
          size="lg"
        >
          Stop Tracking
        </Button>
      </div>
    </div>
  );
};

export default TrackingScreen;
