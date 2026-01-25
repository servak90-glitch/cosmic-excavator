import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cosmic.app',
  appName: 'Cosmic Excavator',
  webDir: 'dist',
  android: {
    fullscreen: true
  }
};

export default config;
