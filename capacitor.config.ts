import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.panini.vasari",
  appName: "paninivasari",
  webDir: "build",
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchDuration: 0,
      launchShowDuration: 0,
      backgroundColor: "#121212",
      launchAutoHide: true,
      androidSplashResourceName: "launch_splash",
    },
  },
};

export default config;
