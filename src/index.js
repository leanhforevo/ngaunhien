import React, { useEffect } from "react";
import { StyleSheet, View, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import Router from "./router";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import mobileAds from "react-native-google-mobile-ads";

// Prevent auto-hiding the splash screen immediately
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  useEffect(() => {
    // Hide splash screen once the App is mounted
    SplashScreen.hideAsync().catch(() => {});

    // Request App Tracking Transparency permission and initialize Ads
    const initApp = async () => {
      if (Platform.OS === "ios") {
        try {
          // Delay permission request slightly to ensure the window has mounted
          await new Promise((resolve) => setTimeout(resolve, 800));
          const { status } = await requestTrackingPermissionsAsync();
          console.log("App Tracking Transparency status:", status);
        } catch (error) {
          console.warn("Error requesting tracking transparency:", error);
        }
      }

      try {
        await mobileAds().initialize();
        console.log("Mobile Ads SDK initialized successfully");
      } catch (error) {
        console.warn("Failed to initialize Mobile Ads SDK:", error);
      }
    };

    initApp();
  }, []);

  return (
    <View style={styles.container}>
      <Router />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
