import { motion } from "framer-motion";
import { Bell, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { 
  startVibrationAlarm, 
  stopVibrationAlarm, 
  playAlarmSound, 
  stopAlarmSound,
  notificationHaptic,
  type Destination 
} from "@/lib/locationUtils";

interface AlarmScreenProps {
  destination: Destination;
  onStop: () => void;
}

const AlarmScreen = ({ destination, onStop }: AlarmScreenProps) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Trigger notification haptic for arrival
    notificationHaptic();
    
    // Show notification for lock screen
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification("You've arrived!", {
          body: destination.name.split(",")[0],
          icon: '/pwa-192x192.png',
          tag: 'arrival-alarm',
          requireInteraction: true,
        });
      } catch (err) {
        console.log('Notification error:', err);
      }
    }

    // Start alarm sound
    playAlarmSound();

    // Start vibration alarm (continuous)
    startVibrationAlarm();

    // Keep screen awake
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.log('Wake Lock not supported');
        }
      }
    };
    requestWakeLock();

    return () => {
      stopVibrationAlarm();
      stopAlarmSound();
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, [destination.name]);

  const handleStop = () => {
    stopVibrationAlarm();
    stopAlarmSound();
    onStop();
  };

  const shortName = destination.name.split(",")[0];

  return (
    <motion.div 
      className="h-full flex flex-col bg-primary p-6 relative overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full bg-primary-foreground/5"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 18}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <motion.div 
          className="mb-8"
          animate={{ rotate: [-15, 15, -15] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          <div className="w-28 h-28 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
            <Bell className="w-14 h-14 text-primary-foreground" />
          </div>
        </motion.div>

        <motion.div 
          className="text-center"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <h1 className="text-2xl font-bold text-primary-foreground mb-4">
            YOU'VE REACHED
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="w-6 h-6 text-primary-foreground" />
            <h2 className="text-3xl font-bold text-primary-foreground">
              {shortName}
            </h2>
          </div>
        </motion.div>

        <motion.div 
          className="mt-6 px-6 py-4 bg-primary-foreground/10 rounded-2xl max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-primary-foreground/80 text-center line-clamp-3">
            {destination.name}
          </p>
        </motion.div>
      </div>

      {/* Action button */}
      <div className="relative z-10" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={handleStop}
            size="lg"
            className="w-full h-16 text-xl font-bold bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            STOP ALARM
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AlarmScreen;
