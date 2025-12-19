import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RadiusScreenProps {
  destination: string;
  onBack: () => void;
  onContinue: (radius: number) => void;
}

const MIN_RADIUS = 200;
const MAX_RADIUS = 1000;

const RadiusScreen = ({ destination, onBack, onContinue }: RadiusScreenProps) => {
  const [selectedRadius, setSelectedRadius] = useState(300);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const radiusToPercent = (radius: number) => {
    return ((radius - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) * 100;
  };

  const percentToRadius = (percent: number) => {
    const radius = MIN_RADIUS + (percent / 100) * (MAX_RADIUS - MIN_RADIUS);
    return Math.round(radius / 50) * 50; // Snap to nearest 50m
  };

  const handleSliderInteraction = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSelectedRadius(percentToRadius(percent));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    handleSliderInteraction(e.clientX);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleSliderInteraction(e.clientX);
      }
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    handleSliderInteraction(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging.current) {
      handleSliderInteraction(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const getRadiusCircleSize = () => {
    const minSize = 80;
    const maxSize = 180;
    const percent = radiusToPercent(selectedRadius);
    return minSize + (percent / 100) * (maxSize - minSize);
  };

  const formatRadius = (r: number) => {
    return r >= 1000 ? `${(r / 1000).toFixed(1)}km` : `${r}m`;
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
        <div>
          <h1 className="text-xl font-semibold text-foreground">Wake me within</h1>
          <p className="text-sm text-muted-foreground">{destination}</p>
        </div>
      </div>

      {/* Visualization */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative flex items-center justify-center">
          {/* Animated radius circle */}
          <motion.div
            className="absolute rounded-full border-2 border-primary/40 bg-primary/10"
            animate={{ 
              width: getRadiusCircleSize(),
              height: getRadiusCircleSize(),
            }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          />
          
          {/* Pulse effect */}
          <motion.div
            className="absolute rounded-full border border-primary/20"
            animate={{ 
              width: getRadiusCircleSize() + 40,
              height: getRadiusCircleSize() + 40,
              opacity: [0.5, 0, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Center pin */}
          <motion.div 
            className="relative z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
              <MapPin className="w-8 h-8 text-primary-foreground" />
            </div>
          </motion.div>

          {/* Radius label */}
          <motion.div 
            className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center"
            key={selectedRadius}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-5xl font-bold text-foreground">
              {formatRadius(selectedRadius)}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Slider section */}
      <div className="px-6 pb-6">
        {/* Labels */}
        <div className="flex justify-between mb-2 text-sm text-muted-foreground">
          <span>{formatRadius(MIN_RADIUS)}</span>
          <span>{formatRadius(MAX_RADIUS)}</span>
        </div>

        {/* Draggable slider */}
        <div 
          ref={sliderRef}
          className="relative h-12 flex items-center cursor-pointer touch-none select-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Track background */}
          <div className="absolute w-full h-2 bg-muted rounded-full" />
          
          {/* Active track */}
          <motion.div 
            className="absolute h-2 bg-primary rounded-full"
            style={{ width: `${radiusToPercent(selectedRadius)}%` }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          />

          {/* Thumb */}
          <motion.div
            className="absolute w-8 h-8 bg-primary rounded-full shadow-lg shadow-primary/40 flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ left: `calc(${radiusToPercent(selectedRadius)}% - 16px)` }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          >
            <div className="w-3 h-3 bg-primary-foreground rounded-full" />
          </motion.div>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-4 mb-6">
          Drag to adjust • Larger radius gives more time to wake up
        </p>

        <Button 
          onClick={() => onContinue(selectedRadius)}
          className="w-full"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default RadiusScreen;
