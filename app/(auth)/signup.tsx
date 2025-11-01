import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput
} from "react-native";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = () => {
    console.log("Signup button clicked!"); // Debug log
    
    // Validation
    if (!email || !password || !confirmPassword) {
      if (Platform.OS === 'web') {
        alert("Please fill in all fields");
      } else {
        Alert.alert("Error", "Please fill in all fields");
      }
      return;
    }

    if (!validateEmail(email)) {
      if (Platform.OS === 'web') {
        alert("Please enter a valid email address");
      } else {
        Alert.alert("Error", "Please enter a valid email address");
      }
      return;
    }

    if (password.length < 6) {
      if (Platform.OS === 'web') {
        alert("Password must be at least 6 characters long");
      } else {
        Alert.alert("Error", "Password must be at least 6 characters long");
      }
      return;
    }

    if (password !== confirmPassword) {
      if (Platform.OS === 'web') {
        alert("Passwords do not match");
      } else {
        Alert.alert("Error", "Passwords do not match");
      }
      return;
    }

    // Success - just show message and navigate
    if (Platform.OS === 'web') {
      alert(`Account created for ${email}`);
      router.replace("/(tabs)");
    } else {
      Alert.alert(
        "Success!",
        `Account created for ${email}`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(tabs)");
            },
          },
        ]
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Create Account
      </ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>
        Sign up to get started
      </ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed
        ]}
        onPress={handleSignup}
        accessible={true}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(auth)/login")}
        style={styles.link}
      >
        <ThemedText type="link">
          Already have an account? Log in
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    cursor: "pointer",
    zIndex: 10,
    position: "relative",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 12,
    alignSelf: "center",
    cursor: "pointer",
  },
});