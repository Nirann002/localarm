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

// Calculate ETA based on distance and average speed
// Assuming average commuting speed (bus/train) of ~30 km/h in urban areas
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

// Audio alarm using Web Audio API - plays a loud alarm tone
let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let isPlaying = false;

export function playAlarmSound(): void {
  if (isPlaying) return;
  
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for alarm tone
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Alarm frequency pattern - alternating between two tones
    oscillator.frequency.value = 800;
    oscillator.type = 'square';
    
    // Maximum volume
    gainNode.gain.value = 1.0;
    
    oscillator.start();
    isPlaying = true;
    
    // Create pulsing effect by modulating frequency
    let highFreq = true;
    const pulseInterval = setInterval(() => {
      if (oscillator && isPlaying) {
        oscillator.frequency.value = highFreq ? 600 : 900;
        highFreq = !highFreq;
      } else {
        clearInterval(pulseInterval);
      }
    }, 500);
    
  } catch (err) {
    console.error('Audio playback error:', err);
  }
}

export function stopAlarmSound(): void {
  isPlaying = false;
  
  if (oscillator) {
    try {
      oscillator.stop();
      oscillator.disconnect();
    } catch (e) {
      // Ignore errors if already stopped
    }
    oscillator = null;
  }
  
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
  
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
