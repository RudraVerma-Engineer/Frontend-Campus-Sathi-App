import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Screen, ScreenHeader, TextField } from "../components/ui";
import { forgotPassword, resetPassword } from "../services/authServices.js";
import { colors, font, gradients, radius } from "../theme/theme.js";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1); // 1 = ask email, 2 = OTP + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return Alert.alert("Check email", "Enter a valid email address.");
    try {
      setBusy(true);
      await forgotPassword(email.trim().toLowerCase());
      setStep(2);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async () => {
    if (otp.length !== 6) return Alert.alert("Check OTP", "Enter the 6-digit code from your email.");
    if (password.length < 8) return Alert.alert("Weak password", "Use at least 8 characters.");
    if (password !== confirm) return Alert.alert("Mismatch", "Passwords do not match.");
    try {
      setBusy(true);
      await resetPassword(email.trim().toLowerCase(), otp, password);
      Alert.alert("Password updated", "You can sign in with your new password.", [
        { text: "Sign in", onPress: () => router.replace("/signin") },
      ]);
    } catch (e) {
      Alert.alert("Could not reset", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ gap: 20 }}>
        <ScreenHeader title="Forgot password" onBack={() => (step === 2 ? setStep(1) : router.back())} />

        <LinearGradient colors={gradients.brand} style={s.hero}>
          <MaterialCommunityIcons name={step === 1 ? "lock-reset" : "email-check-outline"} size={40} color="#fff" />
          <Text style={s.heroTitle}>{step === 1 ? "Reset your password" : "Check your inbox"}</Text>
          <Text style={s.heroSub}>
            {step === 1
              ? "Enter your registered email and we'll send you a 6-digit code."
              : `We sent a code to ${email.trim().toLowerCase()}. It expires in 10 minutes.`}
          </Text>
        </LinearGradient>

        <View style={{ gap: 14 }}>
          {step === 1 ? (
            <>
              <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@college.edu"
                autoCapitalize="none" keyboardType="email-address" />
              <Button title="Send code" onPress={sendCode} loading={busy} />
            </>
          ) : (
            <>
              <TextField label="6-digit code" value={otp} onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad" placeholder="123456" maxLength={6} />
              <TextField label="New password" value={password} onChangeText={setPassword}
                secureTextEntry placeholder="At least 8 characters" />
              <TextField label="Confirm password" value={confirm} onChangeText={setConfirm}
                secureTextEntry placeholder="Repeat password" />
              <Button title="Reset password" onPress={submitReset} loading={busy} />
              <Button title="Resend code" variant="soft" small onPress={sendCode} disabled={busy} />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: radius.xl, padding: 24, gap: 8, alignItems: "flex-start" },
  heroTitle: { ...font.h2, color: colors.white, marginTop: 6 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 20 },
});
