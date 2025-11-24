import { getSupabase } from "@/supabase/supabaseClient";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";

export default function driverScoreScreen() {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScore() {
      try {
        const supabase = getSupabase();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          setLoading(false);
          return;
        }

        if (!user) {
          console.warn("No authenticated user found.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke(
          "calculate-driver-score",
          {
            body: { user_id: user.id },
          }
        );

        if (error) {
          console.error("Driver score function error:", error);
          setScore(null);
        } else {
          setScore(data?.driver_score ?? null);
        }
      } catch (err) {
        console.error("Unexpected error loading driver score:", err);
      }
      setLoading(false);
    }

    loadScore();
  }, []);

  if (score === null) {
    return (
      <View style={styles.container}>
        <Text> No trips yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Score</Text>
      <CircularProgress
        value={score}
        maxValue={100}
        radius={120}
        activeStrokeWidth={18}
        inActiveStrokeWidth={18}
        activeStrokeColor="#4ade80"
        inActiveStrokeColor="#e5e7eb"
        progressValueColor="#fff"
        progressValueStyle={{ fontSize: 48, fontWeight: "bold" }}
      />
      <Text style={styles.subtitle}>Out of 100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#f9fafb",
  },
  subtitle: { fontSize: 18, color: "#9ca3af", marginTop: 10 },
  noTripText: { fontSize: 20, color: "#9ca3af" },
});
