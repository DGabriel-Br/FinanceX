import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.financex.app',
  appName: 'FinanceX',
  webDir: 'dist',
  backgroundColor: '#0a0f1a',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#0a0f1a',
      showSpinner: false
    }
  },
  android: {
    backgroundColor: '#0a0f1a'
  },
  ios: {
    backgroundColor: '#0a0f1a'
  }
};

export default config;
