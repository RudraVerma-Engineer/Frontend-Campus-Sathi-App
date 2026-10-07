import { api, getErrorMessage } from "../config/api.js";

// every call resolves with response.data or throws Error(readable message)
const call = async (fn) => {
  try {
    const res = await fn();
    return res.data;
  } catch (error) {
    const err = new Error(getErrorMessage(error));
    err.status = error.response?.status;
    throw err;
  }
};

export const loginUser = (email, password) =>
  call(() => api.post("/auth/login", { email: email.trim().toLowerCase(), password }));

export const registerUser = (formData) =>
  call(() =>
    api.post("/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );

export const verifyOTP = (email, otp) => call(() => api.post("/auth/verify-otp", { email, otp }));
export const resendOTP = (email) => call(() => api.post("/auth/resend-otp", { email }));
export const forgotPassword = (email) => call(() => api.post("/auth/forgot-password", { email }));
export const resetPassword = (email, otp, newPassword) =>
  call(() => api.post("/auth/reset-password", { email, otp, newPassword }));
export const changePassword = (currentPassword, newPassword) =>
  call(() => api.patch("/auth/change-password", { currentPassword, newPassword }));
export const googleLogin = (idToken) => call(() => api.post("/auth/google", { idToken }));
export const getProfile = () => call(() => api.get("/auth/profile"));
export const updateProfile = (fields) => call(() => api.patch("/auth/update-profile", fields));
export const logoutRequest = () => call(() => api.post("/auth/logout"));

export const uploadProfilePhoto = (asset) => {
  const form = new FormData();
  form.append("profilePhoto", {
    uri: asset.uri,
    name: asset.fileName || "profile.jpg",
    type: asset.mimeType || "image/jpeg",
  });
  return call(() =>
    api.patch("/auth/profile-photo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );
};
