import { Capacitor } from '@capacitor/core';
import { BackgroundGeolocation } from '@capacitor-community/background-geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';

export const isNative = Capacitor.isNativePlatform();

export interface TrackedPosition {
  latitude: number;
  longitude: number;
  /** metres per second, when the device reports it */
  speed: number | null;
}

type PositionHandler = (position: TrackedPosition) => void;
type ErrorHandler = (message: string) => void;

export interface TrackerHandle {
  stop: () => Promise<void>;
}

/**
 * Starts location tracking.
 *
 * On a native Android/iOS build this uses a background watcher, which Android
 * keeps alive as a foreground service (with a persistent notification), so
 * updates keep arriving with the screen off and the app in the background.
 * On the web it falls back to `navigator.geolocation.watchPosition`, which the
 * OS may suspend when the app is backgrounded.
 */
export const startLocationTracking = async (
  onPosition: PositionHandler,
  onError?: ErrorHandler
): Promise<TrackerHandle> => {
  if (isNative) {
    const watcherId = await BackgroundGeolocation.addWatcher(
      {
        backgroundTitle: 'Localarm is watching your trip',
        backgroundMessage: 'Tap to open. Your alarm will sound when you arrive.',
        requestPermissions: true,
        stale: false,
        distanceFilter: 10,
      },
      (location, error) => {
        if (error) {
          onError?.(error.message ?? 'Location error');
          return;
        }
        if (!location) return;
        onPosition({
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed ?? null,
        });
      }
    );

    return {
      stop: async () => {
        await BackgroundGeolocation.removeWatcher({ id: watcherId });
      },
    };
  }

  if (!('geolocation' in navigator)) {
    onError?.('Geolocation is not supported on this device');
    return { stop: async () => {} };
  }

  const webWatchId = navigator.geolocation.watchPosition(
    (position) => {
      onPosition({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed ?? null,
      });
    },
    (error) => onError?.(error.message),
    { enableHighAccuracy: true, timeout: 30000, maximumAge: 5000 }
  );

  return {
    stop: async () => {
      navigator.geolocation.clearWatch(webWatchId);
    },
  };
};

/** Asks for permission to post notifications (Android 13+ requires this). */
export const ensureNotificationPermission = async (): Promise<boolean> => {
  if (isNative) {
    try {
      const current = await LocalNotifications.checkPermissions();
      if (current.display === 'granted') return true;
      const requested = await LocalNotifications.requestPermissions();
      return requested.display === 'granted';
    } catch {
      return false;
    }
  }

  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
};

/**
 * Fires a system-level arrival notification. On native this is a full
 * high-priority local notification that wakes the screen and plays sound
 * even while the app is in the background.
 */
export const notifyArrival = async (destinationName: string) => {
  const title = 'You are approaching your destination';
  const body = `Wake up — ${destinationName} is coming up.`;

  if (isNative) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 100000),
            title,
            body,
            sound: undefined,
            smallIcon: 'ic_stat_icon_config_sample',
            channelId: 'localarm-arrival',
            ongoing: false,
            autoCancel: true,
          },
        ],
      });
    } catch (err) {
      console.log('Local notification failed:', err);
    }
    return;
  }

  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, requireInteraction: true, tag: 'localarm-arrival' });
    }
  } catch (err) {
    console.log('Notification error:', err);
  }
};

/** Creates the high-importance Android channel used for arrival alarms. */
export const setupNotificationChannel = async () => {
  if (!isNative || Capacitor.getPlatform() !== 'android') return;
  try {
    await LocalNotifications.createChannel({
      id: 'localarm-arrival',
      name: 'Arrival alarms',
      description: 'Alerts you when you reach your destination',
      importance: 5,
      visibility: 1,
      vibration: true,
      sound: undefined,
    });
  } catch (err) {
    console.log('Channel setup failed:', err);
  }
};
