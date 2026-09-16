import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = "http://localhost:5000";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const showMessage = (text: string, isError = false) => {
    setMessage(text);
    setError(isError);
  };

  const handleSignup = async () => {
    setMessage("");
    setError(false);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      showMessage("Please enter your name.", true);
      return;
    }

    if (!cleanEmail) {
      showMessage("Please enter your email.", true);
      return;
    }

    if (!cleanEmail.includes("@")) {
      showMessage("Please enter a valid email address.", true);
      return;
    }

    if (!password) {
      showMessage("Please enter a password.", true);
      return;
    }

    if (password.length < 6) {
      showMessage("Password must contain at least 6 characters.", true);
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.", true);
      return;
    }

    try {
      setLoading(true);

      console.log("Sending signup request...");
      console.log("API:", `${API_URL}/api/auth/signup`);

      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: password,
        }),
      });

      console.log("Response status:", response.status);

      const data = await response.json();

      console.log("Response data:", data);

      if (!response.ok) {
        showMessage(data.message || "Unable to create account.", true);
        return;
      }

      // Save login information
      await AsyncStorage.setItem("myntra_token", data.token);

      await AsyncStorage.setItem("myntra_user", JSON.stringify(data.user));

      await AsyncStorage.setItem("myntra_logged_in", "true");

      showMessage(`Account created successfully! Welcome ${data.user.name}.`);

      // Wait a moment so the success message can be seen
      setTimeout(() => {
        router.replace("/");
      }, 1200);
    } catch (error: any) {
      console.error("SIGNUP ERROR:", error);

      if (
        error?.message?.includes("Network request failed") ||
        error?.message?.includes("Failed to fetch")
      ) {
        showMessage(
          "Cannot connect to backend.\n\nMake sure node server.js is running on port 5000.",
          true,
        );
      } else {
        showMessage(error?.message || "Something went wrong.", true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* LOGO */}
          <View style={styles.header}>
            <Text style={styles.logo}>MYNTRA</Text>

            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <View style={styles.form}>
            {/* MESSAGE */}
            {message ? (
              <View
                style={[
                  styles.messageBox,
                  error ? styles.errorBox : styles.successBox,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    error ? styles.errorText : styles.successText,
                  ]}
                >
                  {message}
                </Text>
              </View>
            ) : null}

            {/* NAME */}
            <Text style={styles.label}>Full Name</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />

            {/* EMAIL */}
            <Text style={styles.label}>Email Address</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            {/* PASSWORD */}
            <Text style={styles.label}>Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            {/* CONFIRM PASSWORD */}
            <Text style={styles.label}>Confirm Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            {/* BUTTON */}
            <Pressable
              onPress={handleSignup}
              disabled={loading}
              style={({ pressed }) => [
                styles.signupButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" />

                  <Text style={styles.buttonText}>Creating Account...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
              )}
            </Pressable>

            {/* LOGIN */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account?</Text>

              <Pressable
                onPress={() => router.push("/login")}
                disabled={loading}
              >
                <Text style={styles.loginLink}> Login</Text>
              </Pressable>
            </View>

            <Text style={styles.terms}>
              By creating an account, you agree to our Terms & Conditions and
              Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  keyboard: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ff3f6c",
    letterSpacing: 2,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  form: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },

  messageBox: {
    padding: 14,
    borderRadius: 6,
    marginBottom: 12,
  },

  errorBox: {
    backgroundColor: "#ffe5e5",
    borderWidth: 1,
    borderColor: "#ffaaaa",
  },

  successBox: {
    backgroundColor: "#e5f8e9",
    borderWidth: 1,
    borderColor: "#9bd6a5",
  },

  messageText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },

  errorText: {
    color: "#d00000",
  },

  successText: {
    color: "#16802b",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 7,
    marginTop: 14,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#222",
    backgroundColor: "#fff",
  },

  signupButton: {
    height: 52,
    backgroundColor: "#ff3f6c",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  loginText: {
    fontSize: 14,
    color: "#666",
  },

  loginLink: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ff3f6c",
  },

  terms: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#999",
    marginTop: 25,
  },
});
