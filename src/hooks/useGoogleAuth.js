import { useEffect, useRef } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export default function useGoogleAuth(onIdToken, onError) {
  const configured = Boolean(webClientId);
  const cb = useRef({ onIdToken, onError });
  cb.current = { onIdToken, onError };
  useEffect(() => {
    if (!webClientId) {
      console.warn(
        "Google Sign-In: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not confiured.",
      );
      return;
    }

    GoogleSignin.configure({
      webClientId,
      ...(iosClientId ? { iosClientId } : {}),
    });
  }, []);

  const signIn = async () => {
    if (!configured) {
      cb.current.onError?.(
        "Google Sign-In is not configured. Please add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.",
      );
      return;
    }
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();
      if (response.type === "cancelled") {
        return;
      }

      const idToken = response.data?.idToken;
      if (!idToken) {
        cb.current.onError?.(
          "Google did not return an ID token. Check your Web Client ID configuration.",
        );
        return;
      }

      cb.current.onIdToken(idToken);
    } catch (error) {
      console.error("Google Sign-In error:", error);

      cb.current.onError?.(error?.message || "Google sign-in failed");
    }
  };

  return {
    configured,
    ready: configured,
    signIn,
  };
}
