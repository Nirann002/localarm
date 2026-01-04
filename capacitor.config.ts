import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f72f8d57e4c44f929e4dde356c619112',
  appName: 'LocAlarm',
  webDir: 'dist',
  // Remove server config for production build - uncomment for dev hot-reload
  // server: {
  //   url: 'https://f72f8d57-e4c4-4f92-9e4d-de356c619112.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
    Haptics: {
      // Use native haptics for vibration
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0f172a',
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  ios: {
    backgroundColor: '#0f172a',
    contentInset: 'automatic',
  },
};

export default config;
