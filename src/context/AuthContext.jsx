import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TOKEN_KEY, setUnauthorizedHandler } from "../config/api.js";
import { getProfile, logoutRequest } from "../services/authServices.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while restoring the session

  const clearSession = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // restore the saved session on app start
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(TOKEN_KEY);
        if (saved) {
          setToken(saved);
          const data = await getProfile();
          setUser(data.user);
        }
      } catch (err) {
        // only a rejected token ends the session; being offline must not log you out
        if (err.status === 401 || err.status === 403) await clearSession();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clearSession]);

  // any 401 from the API logs the user out once, from one place
  useEffect(() => {
    setUnauthorizedHandler(() => clearSession());
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const login = useCallback(async ({ token: newToken, user: userData }) => {
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      /* offline logout is fine */
    }
    await clearSession();
  }, [clearSession]);

  // replace the stored token (e.g. after a password change)
  const replaceToken = useCallback(async (newToken) => {
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  const updateUser = useCallback((fields) => setUser((prev) => ({ ...prev, ...fields })), []);

  const refreshUser = useCallback(async () => {
    const data = await getProfile();
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isFaculty: ["faculty", "admin", "superAdmin"].includes(user?.role),
      isAdmin: ["admin", "superAdmin"].includes(user?.role),
      login,
      logout,
      updateUser,
      refreshUser,
      replaceToken,
    }),
    [user, token, isLoading, login, logout, updateUser, refreshUser, replaceToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
