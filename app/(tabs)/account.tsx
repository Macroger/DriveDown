import { getSupabase } from "@/supabase/supabaseClient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

export default function AccountScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [password] = useState<string | null>(null); // intentionally not read
  const router = useRouter();

  const supabase = getSupabase();

  useEffect(() => {
    let subscription: any | null = null;
    let stopped = false;

    const load = async () => {
      try {
        if (supabase?.auth?.getUser) {
          const { data, error } = await supabase.auth.getUser();
          if (!error && data?.user?.email && !stopped) {
            setEmail(data.user.email);
            return;
          }
        }

        if (supabase?.auth?.getSession) {
          try {
            const { data } = await supabase.auth.getSession();
            const e = data?.session?.user?.email;
            if (e && !stopped) {
              setEmail(e);
              return;
            }
          } catch {}
        }
      } catch (err) {
        console.warn("Account load error:", err);
      }
    };

    load();

    try {
      const res = supabase?.auth?.onAuthStateChange?.((event: any, session: any) => {
        if (stopped) return;
        setEmail(session?.user?.email ?? null);
      });

      subscription = res?.data?.subscription ?? res ?? null;
    } catch (e) {
      // ignore subscription errors
    }

    return () => {
      stopped = true;
      try {
        if (!subscription) return;
        if (typeof subscription === "function") subscription();
        else if (subscription?.unsubscribe) subscription.unsubscribe();
        else if (subscription?.remove) subscription.remove();
      } catch {}
    };
  }, [supabase]);

  /**
   * Logs out the current user and redirects to the login screen.
   * @throws Will throw an error if the sign-out process fails.
   */
  const handleLogout = async () => {
    const client = getSupabase();
    const { error } = await client.auth.signOut();
    if (error) {
      throw new Error(error.message);
    } else {
      router.replace("/(auth)/login"); // Redirect to login after logout
    }
  };

  const handleLogoutPress = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: handleLogout },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Details</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email ?? "Not available"}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Password</Text>
        <Text style={styles.value}>{password ?? "••••••••"}</Text>
      </View>

      <View style={styles.buttonRow}>
        <View style={styles.button}>
          <Button title="Log Out" onPress={handleLogoutPress} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0f0f0" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 20, textAlign: "center" },
  row: { marginBottom: 14 },
  label: { fontWeight: "600", marginBottom: 4 },
  value: { color: "#333" },
  buttonRow: { marginTop: 24, flexDirection: "row", justifyContent: "center" },
  button: { width: "40%" },
});