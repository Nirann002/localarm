import { useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import WelcomeScreen from "@/components/screens/WelcomeScreen";
import DestinationScreen from "@/components/screens/DestinationScreen";
import RadiusScreen from "@/components/screens/RadiusScreen";
import TrackingScreen from "@/components/screens/TrackingScreen";
import AlarmScreen from "@/components/screens/AlarmScreen";

type Screen = "welcome" | "destination" | "radius" | "tracking" | "alarm";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [destination, setDestination] = useState("");
  const [radius, setRadius] = useState(300);

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
            onConfirm={(dest) => {
              setDestination(dest);
              setCurrentScreen("radius");
            }}
          />
        );
      case "radius":
        return (
          <RadiusScreen
            destination={destination}
            onBack={() => setCurrentScreen("destination")}
            onContinue={(r) => {
              setRadius(r);
              setCurrentScreen("tracking");
            }}
          />
        );
      case "tracking":
        return (
          <TrackingScreen
            destination={destination}
            radius={radius}
            onStop={() => setCurrentScreen("welcome")}
            onSimulateArrival={() => setCurrentScreen("alarm")}
          />
        );
      case "alarm":
        return (
          <AlarmScreen
            onStop={() => setCurrentScreen("welcome")}
            onSnooze={() => {
              // In real app, would snooze and return to tracking
              setCurrentScreen("tracking");
            }}
          />
        );
    }
  };

  return <MobileFrame>{renderScreen()}</MobileFrame>;
};

export default Index;
