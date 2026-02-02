# 🔔 LocAlarm — Location-Based Alarm for Commuters

LocAlarm is a location-aware alarm system designed for daily commuters who often miss their stop after falling asleep on public transport.  
Unlike traditional time-based alarms, LocAlarm triggers alerts based on **real-time GPS proximity** to a user-defined destination.

Sleep peacefully. Wake up at the right stop.

---

## 🚀 Features

- 📍 Real-time GPS tracking with proximity-based alerts  
- 🗺️ Interactive map using **OpenStreetMap + Leaflet**  
- 🎯 Customizable alert radius (500 m – 5 km)  
- 📳 Loud audio alarm + continuous haptic vibration  
- 🌙 Dark, minimal UI optimized for night/early commutes  
- 📱 Works as a **Progressive Web App (PWA)**  
- 📦 Native Android/iOS support via **Capacitor**  
- 📴 Offline-first support (tracking works without internet)  

---

## 🧠 How It Works

LocAlarm continuously monitors the user’s live GPS position using the browser’s Geolocation API.  
Distance to the destination is calculated using the **Haversine formula**, which accurately measures great-circle distance by accounting for Earth’s curvature.

When the user enters the configured alert radius, the app triggers:
- A full-screen visual alert  
- A pulsing audio alarm  
- Continuous haptic feedback (on supported devices)

---

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

### Maps & Geolocation
- Leaflet.js
- OpenStreetMap
- Nominatim Geocoding API
- Browser Geolocation API

### Mobile & Native APIs
- Capacitor.js
- Haptics API
- Wake Lock API
- Status Bar & Splash Screen integration

### Offline Support
- Service Workers
- Workbox caching strategies
- PWA configuration

---

## 🔒 Privacy & Data Policy

- No user accounts  
- No analytics or tracking  
- No external data storage  
- No Google APIs  
- All location processing happens **on-device**  

---

## 🌐 Live Demo

👉 **https://localarm.lovable.app**

Open the link on your phone and select **“Add to Home Screen”** to use it like a native app.

---

## 📦 Local Development

```bash
npm install
npm run dev
