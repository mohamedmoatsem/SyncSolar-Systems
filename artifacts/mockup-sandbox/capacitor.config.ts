import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.syncsolar.app",
  appName: "SyncSolar",
  webDir: "dist",
  android: {
    buildOptions: {
      releaseType: "APK",
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#090e1a",
      showSpinner: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#090e1a",
    },
  },
};

export default config;
