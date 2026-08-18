import { useState, useEffect } from "react";
import MobileFrame from "@/components/MobileFrame";
import WelcomeScreen from "@/components/screens/WelcomeScreen";
import DestinationScreen from "@/components/screens/DestinationScreen";
import TrackingScreen from "@/components/screens/TrackingScreen";
import AlarmScreen from "@/components/screens/AlarmScreen";
import LocationGate from "@/components/screens/LocationGate";
import {
  cacheDestination,
  getCachedDestination,
  clearCachedDestination,
  primeAudio,
  type Destination,
} from "@/lib/locationUtils";

type Screen = "welcome" | "destination" | "tracking" | "alarm";

const Index = () => {
  const [locationReady, setLocationReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [destination, setDestination] = useState<Destination | null>(null);

  // Check for cached destination on mount (for offline resume)
  useEffect(() => {
    const cached = getCachedDestination();
    if (cached) {
      setDestination(cached);
      // Resume tracking if there's a cached destination
      setCurrentScreen("tracking");
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleConfirmDestination = (dest: Destination) => {
    // Unlock audio inside the user gesture so the alarm can sound later
    // even if the screen is off when we arrive.
    primeAudio();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setDestination(dest);
    cacheDestination(dest);
    setCurrentScreen("tracking");
  };

  const handleArrival = () => {
    setCurrentScreen("alarm");
  };

  const handleStopAlarm = () => {
    clearCachedDestination();
    setDestination(null);
    setCurrentScreen("welcome");
  };

  const handleStopTracking = () => {
    clearCachedDestination();
    setDestination(null);
    setCurrentScreen("welcome");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return (
          <WelcomeScreen 
            onSetDestination={() => setCurrentScreen("destination")}
          />
        );
      case "destination":
        return (
          <DestinationScreen
            onBack={() => setCurrentScreen("welcome")}
            onConfirm={handleConfirmDestination}
          />
        );
      case "tracking":
        return destination ? (
          <TrackingScreen
            destination={destination}
            onStop={handleStopTracking}
            onArrival={handleArrival}
          />
        ) : null;
      case "alarm":
        return destination ? (
          <AlarmScreen
            destination={destination}
            onStop={handleStopAlarm}
          />
        ) : null;
    }
  };

  return <MobileFrame>{renderScreen()}</MobileFrame>;
};

export default Index;
