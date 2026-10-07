import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Set EXPO_PUBLIC_API_URL in .env (see .env.example). The fallback is only a
// convenience for the Android emulator.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5000/api/v1";

export default BASE_URL;
export const TOKEN_KEY = "token";

const api = axios.create({ baseURL: BASE_URL, timeout: 20000 });

// AuthContext registers a callback so a rejected token logs the user out once.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isCredentialCall = /\/auth\/(login|register|verify-otp|reset-password|google)/.test(url);
    if (status === 401 && !isCredentialCall && onUnauthorized) onUnauthorized();
    return Promise.reject(error);
  },
);

// Turns any axios/network failure into a short, human-readable string.
export const getErrorMessage = (error) => {
  if (error?.response?.data) {
    const d = error.response.data;
    const msg = d.message || d.error;
    if (Array.isArray(msg)) return msg.join(", ");
    if (msg) return String(msg);
  }
  if (error?.code === "ECONNABORTED") return "The server took too long to respond.";
  if (error?.message === "Network Error")
    return "Can't reach the server. Check your internet connection.";
  return error?.message || "Something went wrong";
};

export { api };
export const authAxios = api; // backwards compatible name
