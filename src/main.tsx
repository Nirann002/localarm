import { createRoot } from "react-dom/client";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import App from "./App.tsx";
import "./index.css";

// Initialize Capacitor plugins
const initCapacitor = async () => {
  try {
    // Set status bar style for native
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0f172a" });
  } catch {
    // Web fallback - ignore errors
  }

  try {
    // Hide splash screen after app loads
    await SplashScreen.hide();
  } catch {
    // Web fallback - ignore errors
  }
};

// Initialize app
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Initialize Capacitor after render
initCapacitor();

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failed, but app still works
    });
  });
}
