import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import React, { useState } from "react";

// import the trip detector hook to start detecting trips
import { useTripDetector } from "@/hooks/useTripDetector"; // ensure the hook is used

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<any | null>(null);

  /* useEffect(() => {
    // Check for an active session on mount
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setUser(data.user);
    };

    fetchUser();
  }, []);*/

  const trip = useTripDetector(); // use the trip detector hook to start detecting trips

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: "test",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="smiley.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="databaseTestPage"
        options={{
          title: "Database Test",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="smiley.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
