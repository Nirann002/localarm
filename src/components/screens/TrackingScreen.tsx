import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Moon, Navigation, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  calculateDistance, 
  calculateETA, 
  cacheLocation,
  primeAudio,
  keepAudioSessionAlive,
  releaseAudioSession,
  type Destination 
} from "@/lib/locationUtils";
import {
  startLocationTracking,
  ensureNotificationPermission,
  setupNotificationChannel,
  notifyArrival,
  isNative,
  type TrackerHandle,
} from "@/lib/nativeTracking";

interface TrackingScreenProps {
  destination: Destination;
  onStop: () => void;
  onArrival: () => void;
}

const TrackingScreen = ({ destination, onStop, onArrival }: TrackingScreenProps) => {
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<string>("Calculating...");
  const trackerRef = useRef<TrackerHandle | null>(null);
  const hasTriggeredRef = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);


  useEffect(() => {
    // Notification permission + Android alarm channel
    ensureNotificationPermission();
    setupNotificationChannel();

    // Keep the audio session alive so the alarm can sound with the screen off
    primeAudio();

    // Request wake lock to keep screen on
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch {
          console.log('Wake Lock not supported');
        }
      }
    };
    requestWakeLock();

    const handleVisibility = () => {
      keepAudioSessionAlive();
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Heartbeat: browsers throttle background timers, but this revives audio
    // and the wake lock as soon as the app gets any execution time.
    const heartbeat = window.setInterval(() => {
      keepAudioSessionAlive();
    }, 5000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(heartbeat);
      releaseAudioSession();
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  // GPS tracking (background foreground-service watcher on native, web fallback otherwise)
  useEffect(() => {
    let cancelled = false;

    const handlePosition = ({
      latitude,
      longitude,
      speed,
    }: { latitude: number; longitude: number; speed: number | null }) => {
      // Cache location for offline use
      cacheLocation(latitude, longitude);

      const distance = calculateDistance(latitude, longitude, destination.lat, destination.lng);
      setCurrentDistance(Math.round(distance));

      // Calculate ETA using GPS speed if available
      const speedKmh = speed && speed > 0 ? speed * 3.6 : 30;
      setEta(calculateETA(distance, speedKmh).text);

      // Check if within radius (trigger only once)
      if (distance <= destination.radius && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        notifyArrival(destination.name.split(',')[0]);
        trackerRef.current?.stop();
        onArrival();
      }
    };

    startLocationTracking(handlePosition, (message) => {
      console.error('Location error:', message);
    }).then((handle) => {
      if (cancelled) {
        handle.stop();
        return;
      }
      trackerRef.current = handle;
    });

    return () => {
      cancelled = true;
      trackerRef.current?.stop();
      trackerRef.current = null;
    };
  }, [destination, onArrival]);

  const handleStop = () => {
    trackerRef.current?.stop();
    trackerRef.current = null;
    onStop();
  };


  const formatDistance = (distance: number | null): string => {
    if (distance === null) return "Calculating...";
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km away`;
    }
    return `${distance} m away`;
  };

  const shortName = destination.name.split(",")[0];

  return (
    <div 
      className="h-full flex flex-col bg-background"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
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
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">Destination</p>
              <p className="text-lg font-semibold text-foreground truncate">{shortName}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {destination.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ETA card */}
        <motion.div 
          className="w-full bg-card rounded-2xl p-4 border border-border mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Estimated arrival</span>
            </div>
            <motion.span 
              className="text-lg font-bold text-primary"
              key={eta}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              {eta}
            </motion.span>
          </div>
        </motion.div>

        {/* Live distance */}
        <motion.div 
          className="w-full bg-card rounded-2xl p-4 border border-border mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current distance</span>
            <motion.span 
              className="text-lg font-bold text-primary"
              key={currentDistance}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              {formatDistance(currentDistance)}
            </motion.span>
          </div>
        </motion.div>

        {/* Alert radius info */}
        <motion.div 
          className="w-full bg-muted/50 rounded-xl p-3 border border-border mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <p className="text-sm text-muted-foreground text-center">
            Alarm at {destination.radius}m radius
          </p>
        </motion.div>

        {/* GPS indicator */}
        <motion.div 
          className="flex items-center gap-2 mt-6 text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Navigation className="w-4 h-4" />
          <span className="text-sm">GPS tracking active • Works offline</span>
        </motion.div>
      </div>

      {/* Bottom actions */}
      <div 
        className="p-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
      >
        <Button 
          onClick={handleStop}
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
