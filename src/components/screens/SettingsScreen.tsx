import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, Vibrate, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsScreenProps {
  onBack: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export interface AppSettings {
  alarmSound: string;
  vibrationPattern: string;
}

const alarmSounds = [
  { id: "gentle", name: "Gentle Wake", description: "Soft ascending tones" },
  { id: "classic", name: "Classic Alarm", description: "Traditional beeping" },
  { id: "urgent", name: "Urgent Alert", description: "Loud and attention-grabbing" },
  { id: "chime", name: "Chime", description: "Pleasant bell sounds" },
  { id: "pulse", name: "Pulse", description: "Rhythmic pulsing tone" },
];

const vibrationPatterns = [
  { id: "standard", name: "Standard", description: "Single long vibration", pattern: "━━━━━" },
  { id: "pulse", name: "Pulse", description: "Short repeated bursts", pattern: "━ ━ ━ ━ ━" },
  { id: "escalating", name: "Escalating", description: "Gradually increasing", pattern: "━ ━━ ━━━ ━━━━" },
  { id: "sos", name: "SOS", description: "Emergency pattern", pattern: "━━━ ━ ━ ━ ━━━" },
  { id: "heartbeat", name: "Heartbeat", description: "Double pulse rhythm", pattern: "━━ ━ ━━ ━ ━━" },
];

const SettingsScreen = ({ onBack, settings, onSaveSettings }: SettingsScreenProps) => {
  const [selectedSound, setSelectedSound] = useState(settings.alarmSound);
  const [selectedVibration, setSelectedVibration] = useState(settings.vibrationPattern);

  const handleSave = () => {
    onSaveSettings({
      alarmSound: selectedSound,
      vibrationPattern: selectedVibration,
    });
    onBack();
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
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {/* Alarm Sound Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Alarm Sound</h2>
              <p className="text-sm text-muted-foreground">Choose your wake-up sound</p>
            </div>
          </div>

          <div className="space-y-2">
            {alarmSounds.map((sound) => (
              <button
                key={sound.id}
                onClick={() => setSelectedSound(sound.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  selectedSound === sound.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Preview sound would go here
                    }}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                  >
                    <Play className="w-4 h-4 text-foreground ml-0.5" />
                  </button>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{sound.name}</p>
                    <p className="text-sm text-muted-foreground">{sound.description}</p>
                  </div>
                </div>
                {selectedSound === sound.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Vibration Pattern Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Vibrate className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Vibration Pattern</h2>
              <p className="text-sm text-muted-foreground">Select vibration intensity</p>
            </div>
          </div>

          <div className="space-y-2">
            {vibrationPatterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => setSelectedVibration(pattern.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  selectedVibration === pattern.id
                    ? "border-accent bg-accent/5"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <div className="text-left">
                  <p className="font-medium text-foreground">{pattern.name}</p>
                  <p className="text-sm text-muted-foreground mb-1">{pattern.description}</p>
                  <p className="text-xs font-mono text-muted-foreground tracking-wider">{pattern.pattern}</p>
                </div>
                {selectedVibration === pattern.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-accent-foreground" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Save Button */}
      <div className="p-4 border-t border-border">
        <Button 
          onClick={handleSave}
          className="w-full"
          size="lg"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsScreen;
