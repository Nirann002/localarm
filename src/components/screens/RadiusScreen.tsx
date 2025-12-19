import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RadiusScreenProps {
  destination: string;
  onBack: () => void;
  onContinue: (radius: number) => void;
}

const radiusOptions = [
  { value: 200, label: "200m" },
  { value: 300, label: "300m" },
  { value: 500, label: "500m" },
  { value: 1000, label: "1km" },
];

const RadiusScreen = ({ destination, onBack, onContinue }: RadiusScreenProps) => {
  const [selectedRadius, setSelectedRadius] = useState(300);

  const getRadiusSize = () => {
    const baseSize = 60;
    const index = radiusOptions.findIndex(r => r.value === selectedRadius);
    return baseSize + index * 30;
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
        <div className="relative">
          {/* Radius circles */}
          {radiusOptions.map((option, index) => {
            const size = 60 + index * 30;
            const isSelected = option.value === selectedRadius;
            const isSmaller = option.value < selectedRadius;
            
            return (
              <motion.div
                key={option.value}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-300 ${
                  isSelected 
                    ? "border-primary bg-primary/10" 
                    : isSmaller
                    ? "border-muted-foreground/20 bg-transparent"
                    : "border-muted-foreground/10 bg-transparent"
                }`}
                style={{ 
                  width: size * 2, 
                  height: size * 2,
                }}
                animate={{ 
                  scale: isSelected ? [1, 1.02, 1] : 1,
                }}
                transition={{ 
                  duration: 2, 
                  repeat: isSelected ? Infinity : 0,
                }}
              />
            );
          })}

          {/* Center pin */}
          <motion.div 
            className="relative z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <MapPin className="w-7 h-7 text-primary-foreground" />
            </div>
          </motion.div>

          {/* Radius label */}
          <motion.div 
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center"
            key={selectedRadius}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-4xl font-bold text-foreground">
              {selectedRadius >= 1000 ? "1km" : `${selectedRadius}m`}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Slider section */}
      <div className="px-6 pb-4">
        <div className="flex justify-between mb-4">
          {radiusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedRadius(option.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedRadius === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Custom slider */}
        <div className="relative h-2 bg-muted rounded-full mb-6">
          <motion.div 
            className="absolute h-full bg-primary rounded-full"
            initial={false}
            animate={{ 
              width: `${((radiusOptions.findIndex(r => r.value === selectedRadius) + 1) / radiusOptions.length) * 100}%` 
            }}
            transition={{ type: "spring", damping: 20 }}
          />
          <input
            type="range"
            min={0}
            max={radiusOptions.length - 1}
            value={radiusOptions.findIndex(r => r.value === selectedRadius)}
            onChange={(e) => setSelectedRadius(radiusOptions[parseInt(e.target.value)].value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <p className="text-sm text-muted-foreground text-center mb-6">
          Larger radius gives more time to wake up
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
