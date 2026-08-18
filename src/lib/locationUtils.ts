import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Haversine formula to calculate distance between two coordinates in meters
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Destination data structure
export interface Destination {
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

// Local storage keys
const DESTINATION_KEY = 'localarm_destination';
const LOCATION_KEY = 'localarm_last_location';

// Cache destination to localStorage for offline use
export function cacheDestination(destination: Destination): void {
  localStorage.setItem(DESTINATION_KEY, JSON.stringify(destination));
}

// Get cached destination from localStorage
export function getCachedDestination(): Destination | null {
  const cached = localStorage.getItem(DESTINATION_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }
  return null;
}

// Clear cached destination
export function clearCachedDestination(): void {
  localStorage.removeItem(DESTINATION_KEY);
}

// Cache last known location for offline use
export function cacheLocation(lat: number, lng: number): void {
  localStorage.setItem(LOCATION_KEY, JSON.stringify({ lat, lng, timestamp: Date.now() }));
}

// Get last known location
export function getCachedLocation(): { lat: number; lng: number } | null {
  const cached = localStorage.getItem(LOCATION_KEY);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      // Only use if less than 1 hour old
      if (Date.now() - data.timestamp < 3600000) {
        return { lat: data.lat, lng: data.lng };
      }
    } catch {
      return null;
    }
  }
  return null;
}

// Reverse geocode coordinates to place name using Nominatim
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    
    const addr = data.address;
    if (addr) {
      const parts: string[] = [];
      
      if (data.name && data.name !== addr.road) {
        parts.push(data.name);
      }
      
      if (addr.road) parts.push(addr.road);
      
      if (addr.neighbourhood) parts.push(addr.neighbourhood);
      else if (addr.suburb) parts.push(addr.suburb);
      
      if (addr.city) parts.push(addr.city);
      else if (addr.town) parts.push(addr.town);
      else if (addr.village) parts.push(addr.village);
      
      if (addr.state) parts.push(addr.state);
      
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
    
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// Search places using Nominatim
export interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  } catch {
    throw new Error('Search needs internet connection');
  }
}

// Vibration interval reference
let vibrationInterval: number | null = null;

// Trigger haptic vibration using Capacitor Haptics (native) with web fallback
export async function triggerVibration(): Promise<void> {
  try {
    // Try Capacitor Haptics first (works on native)
    await Haptics.vibrate({ duration: 1000 });
  } catch {
    // Fallback to web vibration API
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500, 200, 500, 200, 500]);
    }
  }
}

// Start continuous vibration alarm
export function startVibrationAlarm(): void {
  if (vibrationInterval) return;
  
  // Trigger immediately
  triggerVibration();
  
  // Keep vibrating every 2 seconds
  vibrationInterval = window.setInterval(() => {
    triggerVibration();
  }, 2000);
}

// Stop vibration alarm
export function stopVibrationAlarm(): void {
  if (vibrationInterval) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
  }
  
  // Stop any ongoing vibration
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}

// Single impact haptic for UI feedback
export async function impactHaptic(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }
}

// Notification haptic for arrival
export async function notificationHaptic(): Promise<void> {
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Calculate ETA based on distance and average speed
export function calculateETA(distanceMeters: number, speedKmh: number = 30): { minutes: number; text: string } {
  const distanceKm = distanceMeters / 1000;
  const hoursToArrive = distanceKm / speedKmh;
  const minutesToArrive = Math.ceil(hoursToArrive * 60);
  
  if (minutesToArrive < 1) {
    return { minutes: 0, text: "Less than a minute" };
  } else if (minutesToArrive === 1) {
    return { minutes: 1, text: "~1 minute" };
  } else if (minutesToArrive < 60) {
    return { minutes: minutesToArrive, text: `~${minutesToArrive} minutes` };
  } else {
    const hours = Math.floor(minutesToArrive / 60);
    const mins = minutesToArrive % 60;
    if (mins === 0) {
      return { minutes: minutesToArrive, text: `~${hours} hour${hours > 1 ? 's' : ''}` };
    }
    return { minutes: minutesToArrive, text: `~${hours}h ${mins}m` };
  }
}

// Background-capable alarm audio lives in alarmAudio.ts
export {
  playAlarmSound,
  stopAlarmSound,
  primeAudio,
  keepAudioSessionAlive,
  releaseAudioSession,
} from "./alarmAudio";
