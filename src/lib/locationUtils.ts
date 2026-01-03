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

// Reverse geocode coordinates to place name using Nominatim
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
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

// Trigger strong repeating vibration pattern
export function triggerVibration(): void {
  if ('vibrate' in navigator) {
    // Strong repeating vibration pattern: vibrate 500ms, pause 200ms, repeat
    const pattern = [500, 200, 500, 200, 500, 200, 500, 200, 500, 200, 500];
    navigator.vibrate(pattern);
  }
}

// Stop vibration
export function stopVibration(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}
