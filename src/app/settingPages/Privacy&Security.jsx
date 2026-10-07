import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import BASE_URL from "../../config/api";

export default function PrivacySecurity() {
  const { user, token, updateUser, replaceToken } = useAuth();
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [isSaving, setIsSaving] = useState(false);

  // Change password state
  const [showPwSection, setShowPwSection] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({
    current: false,
    newPw: false,
    confirm: false,
  });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) setProfileVisibility(user.profileVisibility || "public");
  }, [user]);

  const saveVisibility = async (val) => {
    setProfileVisibility(val);
    try {
      setIsSaving(true);
      const res = await axios.patch(
        `${BASE_URL}/auth/update-profile`,
        { profileVisibility: val },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      updateUser(res.data.user);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      Alert.alert("Missing fields", "Please fill all password fields.");
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      Alert.alert("Mismatch", "New passwords do not match.");
      return;
    }
    if (pwForm.newPw.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }
    try {
      setPwLoading(true);
      const res = await axios.patch(
        `${BASE_URL}/auth/change-password`,
        { currentPassword: pwForm.current, newPassword: pwForm.newPw },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // the server invalidates old tokens on a password change; keep this device signed in
      if (res.data?.token) await replaceToken(res.data.token);
      Alert.alert("Success ✅", "Password changed successfully.");
      setPwForm({ current: "", newPw: "", confirm: "" });
      setShowPwSection(false);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setPwLoading(false);
    }
  };

  const PwInput = ({ label, keyName }) => (
    <View style={s.pwFieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.pwInputRow}>
        <TextInput
          style={s.pwInput}
          secureTextEntry={!showPw[keyName]}
          value={pwForm[keyName]}
          onChangeText={(v) => setPwForm((p) => ({ ...p, [keyName]: v }))}
          placeholder="••••••••"
          placeholderTextColor="#C4C9D4"
        />
        <TouchableOpacity
          onPress={() => setShowPw((p) => ({ ...p, [keyName]: !p[keyName] }))}
        >
          <Feather
            name={showPw[keyName] ? "eye" : "eye-off"}
            size={18}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Privacy & Security</Text>
          <Text style={s.headerSub}>Manage your privacy settings</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile visibility */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Profile Visibility</Text>
          <Text style={s.cardSub}>
            Who can see your profile on Campus Sathi
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            {["public", "private"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  s.visOption,
                  profileVisibility === opt && s.visOptionActive,
                ]}
                onPress={() => saveVisibility(opt)}
              >
                <MaterialCommunityIcons
                  name={opt === "public" ? "earth" : "lock-outline"}
                  size={20}
                  color={profileVisibility === opt ? "#fff" : "#6B7280"}
                />
                <Text
                  style={[
                    s.visTxt,
                    profileVisibility === opt && s.visTxtActive,
                  ]}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
                {isSaving && profileVisibility === opt && (
                  <ActivityIndicator size="small" color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Security options */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Security</Text>
          {[
            {
              icon: "key-outline",
              iconBg: "#4F46E5",
              title: "Change Password",
              sub: "Update your account password",
              action: () => setShowPwSection((v) => !v),
            },
            {
              icon: "shield-lock-outline",
              iconBg: "#10B981",
              title: "Two-Factor Auth",
              sub: "Coming soon",
              action: () =>
                Alert.alert(
                  "Coming Soon",
                  "2FA will be available in next update.",
                ),
            },
            {
              icon: "devices",
              iconBg: "#F59E0B",
              title: "Active Sessions",
              sub: "Manage logged-in devices",
              action: () =>
                Alert.alert("Sessions", "Session management coming soon."),
            },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.title}>
              <TouchableOpacity style={s.secRow} onPress={item.action}>
                <View style={[s.iconBox, { backgroundColor: item.iconBg }]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={18}
                    color="#fff"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{item.title}</Text>
                  <Text style={s.rowSub}>{item.sub}</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
              {idx < arr.length - 1 && <View style={s.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Change password form */}
        {showPwSection && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Change Password</Text>
            <PwInput label="Current Password" keyName="current" />
            <PwInput label="New Password" keyName="newPw" />
            <PwInput label="Confirm New Password" keyName="confirm" />
            <TouchableOpacity
              style={[s.saveBtn, pwLoading && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={pwLoading}
            >
              {pwLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.saveTxt}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Data info */}
        <View style={s.infoBox}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={18}
            color="#4F46E5"
          />
          <Text style={s.infoTxt}>
            Your data is encrypted and never shared with third parties without
            your consent.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F7FC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#07112B" },
  headerSub: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#07112B" },
  cardSub: { fontSize: 12, color: "#9CA3AF", marginTop: -6 },

  visOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  visOptionActive: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
  visTxt: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  visTxtActive: { color: "#fff" },

  secRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  rowTitle: { fontSize: 15, fontWeight: "600", color: "#07112B" },
  rowSub: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },
  divider: { height: 1, backgroundColor: "#F3F4F6" },

  pwFieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  pwInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  pwInput: { flex: 1, fontSize: 15, color: "#07112B" },

  saveBtn: {
    backgroundColor: "#4F46E5",
    height: 50,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  saveTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },

  infoBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#EEF2FF",
    borderRadius: 14,
    padding: 14,
    alignItems: "flex-start",
  },
  infoTxt: { flex: 1, fontSize: 13, color: "#4F46E5", lineHeight: 18 },
});
