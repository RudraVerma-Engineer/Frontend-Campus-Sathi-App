import { useEffect, useRef } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const ids = {
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};

// Google sign-in: calls onIdToken(idToken) after the user approves. The backend
// verifies the token, so the app never trusts anything but the signed ID token.
export default function useGoogleAuth(onIdToken, onError) {
  const configured = Boolean(ids.web || ids.android || ids.ios);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: ids.web || "not-configured",
    androidClientId: ids.android || "not-configured",
    iosClientId: ids.ios || "not-configured",
  });

  const cb = useRef({ onIdToken, onError });
  cb.current = { onIdToken, onError };

  useEffect(() => {
    if (!response) return;
    if (response.type === "success") {
      const idToken = response.params?.id_token || response.authentication?.idToken;
      if (idToken) cb.current.onIdToken(idToken);
      else cb.current.onError?.("Google did not return an ID token");
    } else if (response.type === "error") {
      cb.current.onError?.(response.error?.message || "Google sign-in failed");
    }
  }, [response]);

  return { configured, ready: Boolean(request), signIn: () => promptAsync() };
}
