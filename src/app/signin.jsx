import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Feather, AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { loginUser, googleLogin } from "../services/authServices.js";
import useGoogleAuth from "../hooks/useGoogleAuth.js";
import GradientText from "../components/GradientText.jsx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signin() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Per-field error state
  const [errors, setErrors] = useState({ email: "", password: "" });
  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Clear error for a field as user types
  const handleEmailChange = (value) => {
    setEmail(value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);
      const data = await loginUser(email, password);
      // AuthGate (root layout) moves the user into the app once `user` is set
      await login(data);
    } catch (error) {
      // account exists but the OTP step was never finished
      if (error.status === 403 && /verify/i.test(error.message)) {
        Alert.alert("Verify your account", "Enter the OTP we emailed you. You can resend it too.", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Verify now",
            onPress: () =>
              router.push({ pathname: "/otp-verify", params: { email: email.trim().toLowerCase() } }),
          },
        ]);
      } else {
        Alert.alert("Login Failed", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleToken = async (idToken) => {
    try {
      setIsLoading(true);
      const data = await googleLogin(idToken);
      if (data.needsRegistration) {
        Alert.alert("No account yet", data.message, [
          { text: "Sign up", onPress: () => router.push("/signup") },
          { text: "Cancel", style: "cancel" },
        ]);
        return;
      }
      await login(data);
    } catch (error) {
      Alert.alert("Google sign-in failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const google = useGoogleAuth(handleGoogleToken, (msg) => Alert.alert("Google sign-in", msg));

  const onGooglePress = () => {
    if (!google.configured) {
      Alert.alert(
        "Google sign-in not set up",
        "Add the EXPO_PUBLIC_GOOGLE_*_CLIENT_ID values to frontend .env (see .env.example).",
      );
      return;
    }
    google.signIn();
  };

  // ─── Reusable error text ───────────────────────────────────────────────────
  const ErrorText = ({ field }) =>
    errors[field] ? (
      <Text style={styles.errorText}>{errors[field]}</Text>
    ) : null;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <LinearGradient
              colors={["#4F46E5", "#0EA5E9"]}
              style={styles.logoContainer}
            >
              <MaterialCommunityIcons
                name="school-outline"
                size={42}
                color="#fff"
              />
            </LinearGradient>

            {/* Header */}
            <View style={styles.titleRow}>
              <GradientText style={styles.campusText}>Campus</GradientText>
              <Text style={styles.sathiText}>Sathi</Text>
            </View>
            <Text style={styles.subtitle}>Welcome Back</Text>

            {/* Login Card */}
            <View style={styles.card}>
              {/* Email */}
              <Text style={styles.label}>COLLEGE EMAIL</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.email && styles.inputError,
                ]}
              >
                <MaterialCommunityIcons
                  name="email-outline"
                  size={24}
                  color={errors.email ? "#EF4444" : "#9CA3AF"}
                />
                <TextInput
                  placeholder="student@university.edu"
                  placeholderTextColor="#B0B7C3"
                  style={styles.input}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={handleEmailChange}
                />
              </View>
              <ErrorText field="email" />

              {/* Password */}
              <View style={styles.passwordRow}>
                <Text style={styles.label}>PASSWORD</Text>
                <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.inputContainer,
                  errors.password && styles.inputError,
                ]}
              >
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={24}
                  color={errors.password ? "#EF4444" : "#9CA3AF"}
                />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#B0B7C3"
                  secureTextEntry={!passwordVisible}
                  value={password}
                  style={styles.input}
                  onChangeText={handlePasswordChange}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Feather
                    name={passwordVisible ? "eye" : "eye-off"}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              <ErrorText field="password" />

              {/* Remember Me */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={styles.checkbox}>
                    {rememberMe && (
                      <AntDesign name="check" size={14} color="#4F46E5" />
                    )}
                  </View>
                  <Text style={styles.rememberText}>Remember Me</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.biometricRow}>
                  <MaterialCommunityIcons
                    name="fingerprint"
                    size={28}
                    color="#222"
                  />
                  <Text style={styles.biometricText}>BIOMETRIC</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={["#4338CA", "#0284C7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
                >
                  <Text style={styles.loginText}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.divider} />
              </View>

              {/* Google Signin */}
              <TouchableOpacity style={styles.googleButton} onPress={onGooglePress} disabled={isLoading}>
                <AntDesign name="google" size={30} color="#EA4335" />
                <Text style={styles.googleText}>Sign in with Google</Text>
              </TouchableOpacity>
            </View>

            {/* Register */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.navigate("/signup")}>
                <Text style={styles.registerLink}> Register</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FC",
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  campusText: {
    fontSize: 58,
    fontWeight: "900",
  },
  sathiText: {
    fontSize: 58,
    fontWeight: "900",
    color: "#07112B",
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 18,
    color: "#6B7280",
  },
  card: {
    width: "100%",
    marginTop: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  label: {
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F6FD",
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 64,
    marginBottom: 4, // reduced — ErrorText sits below
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 6,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    color: "#111827",
  },
  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  forgotText: {
    color: "#4338CA",
    fontWeight: "600",
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  rememberText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#374151",
  },
  biometricRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  biometricText: {
    marginLeft: 6,
    letterSpacing: 2,
    fontSize: 14,
    color: "#222",
  },
  loginButton: {
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#9CA3AF",
    fontSize: 12,
    letterSpacing: 2,
  },
  googleButton: {
    height: 65,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  googleText: {
    marginLeft: 12,
    fontSize: 20,
    color: "#111827",
    fontWeight: "500",
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 30,
  },
  registerText: {
    fontSize: 18,
    color: "#374151",
  },
  registerLink: {
    fontSize: 18,
    color: "#4338CA",
    fontWeight: "700",
  },
});
