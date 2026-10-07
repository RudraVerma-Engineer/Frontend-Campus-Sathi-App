import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import GradientText from "../components/GradientText.jsx";
import { verifyOTP, resendOTP } from "../services/authServices.js";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function OtpVerify() {
  // email is passed as a route param from signup screen
  // e.g. router.push({ pathname: "/otp-verify", params: { email: "user@mail.com" } })
  const { email } = useLocalSearchParams();

  useEffect(() => {
    // console.log("OTP screen email param:", email); // check this in terminal
    if (!email) {
      Alert.alert("Error", "Email not found. Please register again.", [
        { text: "Go Back", onPress: () => router.replace("/signup") },
      ]);
    }
  }, []);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  // One ref per OTP box for auto-focus
  const inputRefs = useRef([]);

  // Shake animation for wrong OTP
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ─── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ─── Shake animation ───────────────────────────────────────────────────────
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ─── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (value, index) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    setError("");
    const newOtp = [...otp];

    if (value.length > 1) {
      // Handle paste: spread digits across boxes
      const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
      const filled = digits.split("");
      filled.forEach((d, i) => {
        if (index + i < OTP_LENGTH) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      // Focus last filled box or the next empty one
      const nextIndex = Math.min(index + filled.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next box
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // On backspace in an empty box, go back to previous box
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ─── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    const otpString = otp.join("");

    if (otpString.length < OTP_LENGTH) {
      setError("Please enter all 6 digits");
      triggerShake();
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      console.log("email:",email)

      await verifyOTP(email, otpString);

      Alert.alert(
        "Account Verified! 🎉",
        "Your account has been activated successfully. You can now log in.",
        [{ text: "Go to Login", onPress: () => router.replace("/signin") }],
      );
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
      triggerShake();
      // Clear boxes on wrong OTP
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return;
    try {
      setCanResend(false);
      setCountdown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");
      await resendOTP(email);
      Alert.alert("OTP Sent", "A new OTP has been sent to your email.");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Try again.");
      setCanResend(true);
    }
  };

  // Masked email display e.g. "ru***@gmail.com"
  const maskedEmail = email
    ? email.replace(
        /^(.{2})(.*)(@.*)$/,
        (_, a, b, c) => a + "*".repeat(b.length) + c,
      )
    : "";

  const isOtpComplete = otp.every((d) => d !== "");

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color="#4F46E5"
            />
          </TouchableOpacity>

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

          {/* Title */}
          <View style={styles.titleRow}>
            <GradientText style={styles.campusText}>Campus</GradientText>
            <Text style={styles.sathiText}>Sathi</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Email icon */}
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={["#EEF2FF", "#DBEAFE"]}
                style={styles.iconBg}
              >
                <MaterialCommunityIcons
                  name="email-check-outline"
                  size={38}
                  color="#4F46E5"
                />
              </LinearGradient>
            </View>

            <Text style={styles.heading}>Verify Your Email</Text>
            <Text style={styles.subText}>We've sent a 6-digit OTP to</Text>
            <Text style={styles.emailText}>{maskedEmail}</Text>

            {/* OTP Boxes */}
            <Animated.View
              style={[
                styles.otpRow,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpBox,
                    digit && styles.otpBoxFilled,
                    error && styles.otpBoxError,
                  ]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH} // allows paste
                  textAlign="center"
                  selectTextOnFocus
                  caretHidden
                />
              ))}
            </Animated.View>

            {/* Inline error */}
            {error ? (
              <View style={styles.errorRow}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={15}
                  color="#EF4444"
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Verify button */}
            <TouchableOpacity
              onPress={handleVerify}
              disabled={isLoading || !isOtpComplete}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#4F46E5", "#0EA5E9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.verifyButton,
                  (!isOtpComplete || isLoading) && styles.verifyButtonDisabled,
                ]}
              >
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <MaterialCommunityIcons
                      name="loading"
                      size={22}
                      color="#fff"
                    />
                    <Text style={styles.verifyText}> Verifying...</Text>
                  </View>
                ) : (
                  <Text style={styles.verifyText}>Verify Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend */}
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>Didn't receive the code?</Text>
              {canResend ? (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendLink}> Resend OTP</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.resendTimer}>
                  {" "}
                  Resend in <Text style={styles.timerCount}>{countdown}s</Text>
                </Text>
              )}
            </View>
          </View>

          {/* Footer hint */}
          <View style={styles.hintRow}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={16}
              color="#9CA3AF"
            />
            <Text style={styles.hintText}>
              OTP expires in 10 minutes. Check your spam folder if not received.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FC",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    alignSelf: "flex-start",
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 28,
  },
  campusText: {
    fontSize: 46,
    fontWeight: "900",
  },
  sathiText: {
    fontSize: 46,
    fontWeight: "900",
    color: "#07112B",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#07112B",
    marginBottom: 8,
  },
  subText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  emailText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4F46E5",
    marginBottom: 28,
    marginTop: 2,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#F3F6FD",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    fontSize: 22,
    fontWeight: "700",
    color: "#07112B",
  },
  otpBoxFilled: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  otpBoxError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
    marginTop: 4,
    gap: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
  },
  verifyButton: {
    width: "100%",
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
    minWidth: 280,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendLabel: {
    color: "#6B7280",
    fontSize: 14,
  },
  resendLink: {
    color: "#4F46E5",
    fontWeight: "700",
    fontSize: 14,
  },
  resendTimer: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  timerCount: {
    color: "#4F46E5",
    fontWeight: "700",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 24,
    paddingHorizontal: 8,
  },
  hintText: {
    flex: 1,
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 18,
  },
});
