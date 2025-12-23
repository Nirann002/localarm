import { motion } from "framer-motion";
import { MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onSetDestination: () => void;
}

const WelcomeScreen = ({ onSetDestination }: WelcomeScreenProps) => {
  return (
    <div className="h-full flex flex-col bg-background px-6 py-8 relative">
      {/* Logo and branding */}
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icon */}
        <motion.div 
          className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            <MapPin className="w-14 h-14 text-primary" strokeWidth={1.5} />
            <motion.div 
              className="absolute -top-1 -right-1"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bell className="w-6 h-6 text-accent" strokeWidth={2} />
            </motion.div>
          </div>
        </motion.div>

        {/* App name */}
        <motion.h1 
          className="text-5xl font-bold text-foreground tracking-tight mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Localarm
        </motion.h1>

        {/* Tagline */}
        <motion.p 
          className="text-xl text-muted-foreground text-center mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Wake up at the right stop
        </motion.p>

        <motion.p 
          className="text-sm text-muted-foreground/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          No more missed stops
        </motion.p>
      </motion.div>

      {/* CTA */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          onClick={onSetDestination} 
          className="w-full"
          size="lg"
        >
          <MapPin className="w-5 h-5" />
          Set Destination
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Works with bus, train, and metro
        </p>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
