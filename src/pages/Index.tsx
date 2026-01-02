import { useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import WelcomeScreen from "@/components/screens/WelcomeScreen";
import DestinationScreen from "@/components/screens/DestinationScreen";
import TrackingScreen from "@/components/screens/TrackingScreen";
import AlarmScreen from "@/components/screens/AlarmScreen";

type Screen = "welcome" | "destination" | "tracking" | "alarm";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [destination, setDestination] = useState("");
  const [radius, setRadius] = useState(300);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);

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
            onConfirm={(dest, r, coords) => {
              setDestination(dest);
              setRadius(r);
              setDestinationCoords(coords);
              setCurrentScreen("tracking");
            }}
          />
        );
      case "tracking":
        return (
          <TrackingScreen
            destination={destination}
            radius={radius}
            destinationCoords={destinationCoords!}
            onStop={() => setCurrentScreen("welcome")}
            onArrival={() => setCurrentScreen("alarm")}
          />
        );
      case "alarm":
        return (
          <AlarmScreen
            onStop={() => setCurrentScreen("welcome")}
          />
        );
    }
  };

  return <MobileFrame>{renderScreen()}</MobileFrame>;
};

export default Index;