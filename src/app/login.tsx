import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = "http://localhost:5000";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      console.log("LOGIN STARTED");
      console.log("Email:", cleanEmail);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password,
        }),
      });

      console.log("LOGIN RESPONSE STATUS:", response.status);

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        setErrorMessage(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (!data.token || !data.user) {
        setErrorMessage("Login response is missing user or token.");
        setLoading(false);
        return;
      }

      // Save JWT token
      await AsyncStorage.setItem("myntra_token", data.token);

      // Save user information
      await AsyncStorage.setItem("myntra_user", JSON.stringify(data.user));

      // Save login status
      await AsyncStorage.setItem("myntra_logged_in", "true");

      console.log("LOGIN SUCCESS");
      console.log("User:", data.user);

      // Go directly to Home
      router.replace("/");
    } catch (error) {
      console.log("LOGIN ERROR:", error);

      setErrorMessage(
        "Cannot connect to the backend. Make sure the backend is running on port 5000.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <Text style={styles.logo}>MYNTRA</Text>

        <Text style={styles.subtitle}>FASHION SHOPPING</Text>

        <Text style={styles.title}>Login</Text>

        <Text style={styles.description}>
          Login to access your Myntra account
        </Text>

        {/* ERROR MESSAGE */}
        {errorMessage !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* EMAIL */}
        <Text style={styles.label}>Email</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        {/* PASSWORD */}
        <Text style={styles.label}>Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          value={password}
          onChangeText={setPassword}
        />

        {/* FORGOT PASSWORD */}
        <Pressable
          style={styles.forgot}
          onPress={() =>
            setErrorMessage("Forgot Password feature will be added soon.")
          }
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </Pressable>

        {/* LOGIN BUTTON */}
        <Pressable
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#fff" />

              <Text style={styles.loadingText}>LOGGING IN...</Text>
            </View>
          ) : (
            <Text style={styles.loginButtonText}>LOGIN</Text>
          )}
        </Pressable>

        {/* DIVIDER */}
        <View style={styles.divider}>
          <View style={styles.line} />

          <Text style={styles.or}>OR</Text>

          <View style={styles.line} />
        </View>

        {/* SIGNUP */}
        <Pressable
          style={styles.signupButton}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.signupText}>CREATE NEW ACCOUNT</Text>
        </Pressable>

        <Text style={styles.terms}>
          By continuing, you agree to our Terms & Conditions and Privacy Policy.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    padding: 25,
    paddingTop: 55,
  },

  logo: {
    color: "#ff3f6c",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#777",
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 3,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 55,
    color: "#222",
  },

  description: {
    color: "#777",
    marginTop: 7,
    marginBottom: 30,
  },

  errorBox: {
    backgroundColor: "#ffe5e5",
    borderWidth: 1,
    borderColor: "#ffb3b3",
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },

  errorText: {
    color: "#d00000",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 15,
    fontSize: 15,
    marginBottom: 20,
    color: "#222",
  },

  forgot: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },

  forgotText: {
    color: "#ff3f6c",
    fontWeight: "600",
  },

  loginButton: {
    height: 52,
    backgroundColor: "#ff3f6c",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  loadingText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
  },

  or: {
    marginHorizontal: 15,
    color: "#999",
    fontSize: 12,
  },

  signupButton: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  signupText: {
    color: "#ff3f6c",
    fontWeight: "900",
  },

  terms: {
    textAlign: "center",
    color: "#999",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 30,
  },
});
