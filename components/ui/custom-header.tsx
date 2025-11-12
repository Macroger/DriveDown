import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface CustomHeaderProps {
    onBack: () => void;
    onLogout: () => void;
    title: string;
    showLogoutButton: boolean;
}

export default function CustomHeader({ onBack, onLogout, title, showLogoutButton }: CustomHeaderProps) {
    const router = useRouter();
    const canGoBack = router.canGoBack();

  return (
    <View style={styles.topBar}>
            {canGoBack ? (
        <Pressable style={styles.sideButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
      ) : (
        <View style={[styles.sideButton, { opacity: 0 }]} />
      )}
      <Text style={styles.title}>{title}</Text>
      {showLogoutButton ? (
        <Pressable style={styles.sideButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </Pressable>
      ) : (
        <View style={[styles.sideButton, { opacity: 0 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    backgroundColor: "#222",
  },
  sideButton: { padding: 8 },
  title: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
});