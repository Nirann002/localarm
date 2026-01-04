import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f72f8d57e4c44f929e4dde356c619112',
  appName: 'localarm',
  webDir: 'dist',
  server: {
    url: 'https://f72f8d57-e4c4-4f92-9e4d-de356c619112.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
