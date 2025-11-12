
import CustomHeader from "@/components/ui/custom-header";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import "react-native-reanimated";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { getSupabase } from "@/supabase/supabaseClient";
import { Alert, StyleSheet } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)", // tells Expo Router that tabs are the default navigation anchor
};

export default function RootLayout() {
  const colorScheme = useColorScheme(); // get the current color scheme (dark or light)
  const [ready, setReady] = useState(false); // tracks whether the layout is fully mounted
  const segments = useSegments(); // current route segments (e.g., ["(tabs)"] or ["(auth)", "login"])
  const router = useRouter(); // router object to programmatically navigate
  const [didRedirect, setDidRedirect] = useState(false); // ensures we only redirect to login once for testing purposes

  // Detect if we're on the login page or signup page
  const isAuthScreen = segments[0] === "(auth)" && (segments[1] === "login" || segments[1] === "signup");

  const APP_NAME = "Drive Down";



  /**
 * Logs out the current user and redirects to the login screen.
 * @throws Will throw an error if the sign-out process fails.
 */
const handleLogout = async () => {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  } else {
    router.replace("/(auth)/login"); // Redirect to login after logout
  }
}

const handleLogoutPress = () => {
  Alert.alert(
    "Log Out",
    "Are you sure you want to log out?",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: handleLogout }
    ]
  );
};

/**
 * Handles the back button press by navigating to the previous screen if possible.
 * If there is no previous screen, it does nothing.
 */
function handleBack(): void {
  if(router.canGoBack()) {
    router.back();
  }
  // Optionally, show a message or do nothing if can't go back
}

  // ---------- Ready Flag ----------
  // Small delay to ensure RootLayout is mounted before doing any redirects.
  // Prevents "attempted to navigate before mounting" errors.
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100); // 100ms delay
    return () => clearTimeout(timer);
  }, []);

  // ---------- Redirect Logic ----------
  useEffect(() => {
    // Wait until layout is ready and we haven't redirected yet
    if (!ready || didRedirect) return;

    // Check if the current route is part of the auth group
    const inAuthGroup = segments[0] === "(auth)";

    // If not in the auth group, redirect to the login page
    if (!inAuthGroup) {
      router.replace("/(auth)/login"); // replace so back button doesn't go back to empty root
      setDidRedirect(true); // mark that we already redirected to prevent loops
    }
  }, [ready, segments]);

  // ---------- Theme Provider + Stack ----------
return (
  <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
    <Stack
      screenOptions={{
        header: () =>
          <CustomHeader
              onBack={handleBack}
              onLogout={handleLogoutPress}
              title={APP_NAME}
              showLogoutButton={!isAuthScreen}
           />
      }}
    >
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  </ThemeProvider>
);}


