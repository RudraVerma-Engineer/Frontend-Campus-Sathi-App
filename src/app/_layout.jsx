import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext.jsx";
import { colors } from "../theme/theme.js";

// screens a signed-out visitor may open
const PUBLIC = ["index", "signin", "signup", "otp-verify", "forgot-password"];

// Redirects based on auth state so protected screens can never be reached signed out,
// and a returning user skips straight to the app.
function AuthGate({ children }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const first = segments[0] ?? "index";
    const isPublic = PUBLIC.includes(first);
    if (!user && !isPublic) router.replace("/signin");
    else if (user && isPublic && first !== "otp-verify") router.replace("/(tabs)");
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return children;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <AuthGate>
            <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
          </AuthGate>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
