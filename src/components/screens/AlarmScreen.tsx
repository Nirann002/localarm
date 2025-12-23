import { motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

interface AlarmScreenProps {
  onStop: () => void;
}

const AlarmScreen = ({ onStop }: AlarmScreenProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create and play alarm sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playAlarm = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      
      // Pulsing alarm effect
      const pulseAlarm = () => {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
      };
      
      const intervalId = setInterval(pulseAlarm, 400);
      
      return { oscillator, intervalId };
    };

    const { oscillator, intervalId } = playAlarm();

    // Trigger vibration if supported
    if ('vibrate' in navigator) {
      const vibratePattern = () => {
        navigator.vibrate([500, 200, 500, 200, 500]);
      };
      vibratePattern();
      const vibrateIntervalId = setInterval(vibratePattern, 1600);
      
      return () => {
        oscillator.stop();
        clearInterval(intervalId);
        clearInterval(vibrateIntervalId);
        navigator.vibrate(0);
        audioContext.close();
      };
    }

    return () => {
      oscillator.stop();
      clearInterval(intervalId);
      audioContext.close();
    };
  }, []);

  const handleStop = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
    onStop();
  };

  return (
    <motion.div 
      className="h-full flex flex-col bg-alarm p-6 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full bg-alarm-foreground/5"
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
        {/* Alarm icon */}
        <motion.div 
          className="mb-8"
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          <div className="w-28 h-28 rounded-full bg-alarm-foreground/20 flex items-center justify-center backdrop-blur-sm">
            <Bell className="w-14 h-14 text-alarm-foreground animate-alarm-shake" />
          </div>
        </motion.div>

        {/* Alert text */}
        <motion.div 
          className="text-center"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <h1 className="text-2xl font-bold text-alarm-foreground mb-3 animate-alarm-pulse">
            YOU ARE APPROACHING
          </h1>
          <h1 className="text-3xl font-bold text-alarm-foreground animate-alarm-pulse">
            YOUR DESTINATION
          </h1>
        </motion.div>

        {/* Wake up message */}
        <motion.p 
          className="mt-6 text-lg text-alarm-foreground/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Time to get ready!
        </motion.p>
      </div>

      {/* Action button */}
      <div className="relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={handleStop}
            variant="alarm"
            size="xl"
            className="w-full bg-alarm-foreground text-alarm hover:bg-alarm-foreground/90"
          >
            <X className="w-6 h-6" />
            Stop Alarm
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AlarmScreen;
