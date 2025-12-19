import { motion } from "framer-motion";
import { Bell, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlarmScreenProps {
  onStop: () => void;
  onSnooze: () => void;
}

const AlarmScreen = ({ onStop, onSnooze }: AlarmScreenProps) => {
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
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
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
          <h1 className="text-3xl font-bold text-alarm-foreground mb-3 animate-alarm-pulse">
            YOU'VE REACHED
          </h1>
          <h1 className="text-4xl font-bold text-alarm-foreground animate-alarm-pulse">
            YOUR STOP
          </h1>
        </motion.div>

        {/* Wake up message */}
        <motion.p 
          className="mt-6 text-lg text-alarm-foreground/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Time to get off!
        </motion.p>
      </div>

      {/* Action buttons */}
      <div className="relative z-10 space-y-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={onStop}
            variant="alarm"
            size="xl"
            className="w-full bg-alarm-foreground text-alarm hover:bg-alarm-foreground/90"
          >
            <X className="w-6 h-6" />
            Stop Alarm
          </Button>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            onClick={onSnooze}
            variant="alarmSecondary"
            size="lg"
            className="w-full"
          >
            <Clock className="w-5 h-5" />
            Snooze for 1 minute
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AlarmScreen;
