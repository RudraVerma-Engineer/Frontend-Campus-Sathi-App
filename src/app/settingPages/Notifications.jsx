import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import BASE_URL from "../../config/api";

export default function Notifications() {
  const { user, token, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    allowNotifications: true,
    email: true,
    push: true,
    assignmentReminder: true,
  });

  useEffect(() => {
    if (user) {
      setSettings({
        allowNotifications: user.allowNotifications ?? true,
        email: user.notificationSettings?.email ?? true,
        push: user.notificationSettings?.push ?? true,
        assignmentReminder:
          user.notificationSettings?.assignmentReminder ?? true,
      });
    }
  }, [user]);

  const toggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        allowNotifications: settings.allowNotifications,
        notificationSettings: {
          email: settings.email,
          push: settings.push,
          assignmentReminder: settings.assignmentReminder,
        },
      };
      const res = await axios.patch(
        `${BASE_URL}/auth/update-profile`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      updateUser(res.data.user);
      Alert.alert("Saved ✅", "Notification preferences updated.");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const Row = ({ icon, iconBg, title, sub, keyName, disabled = false }) => (
    <View style={[s.row, disabled && { opacity: 0.4 }]}>
      <View style={[s.iconBox, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={20} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        {sub && <Text style={s.rowSub}>{sub}</Text>}
      </View>
      <Switch
        value={settings[keyName]}
        onValueChange={() => !disabled && toggle(keyName)}
        trackColor={{ false: "#E5E7EB", true: "#C7D2FE" }}
        thumbColor={settings[keyName] ? "#4F46E5" : "#9CA3AF"}
        disabled={disabled}
      />
    </View>
  );

  const masterOff = !settings.allowNotifications;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Notifications</Text>
          <Text style={s.headerSub}>Manage your alert preferences</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Master toggle */}
        <View style={s.card}>
          <Row
            icon="bell"
            iconBg="#4F46E5"
            title="Allow All Notifications"
            sub="Master switch for all alerts"
            keyName="allowNotifications"
          />
        </View>

        {/* Individual toggles */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Notification Channels</Text>
          <Row
            icon="email-outline"
            iconBg="#0EA5E9"
            title="Email Notifications"
            sub="Notices and updates via email"
            keyName="email"
            disabled={masterOff}
          />
          <View style={s.divider} />
          <Row
            icon="cellphone"
            iconBg="#10B981"
            title="Push Notifications"
            sub="Real-time alerts on your phone"
            keyName="push"
            disabled={masterOff}
          />
          <View style={s.divider} />
          <Row
            icon="calendar-clock"
            iconBg="#F59E0B"
            title="Assignment Reminders"
            sub="Get reminded before deadlines"
            keyName="assignmentReminder"
            disabled={masterOff}
          />
        </View>

        {/* Info box */}
        <View style={s.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color="#4F46E5"
          />
          <Text style={s.infoTxt}>
            Turning off master switch will silence all Campus Sathi
            notifications. You can re-enable them anytime.
          </Text>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[s.saveBtn, isSaving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.saveTxt}>Save Preferences</Text>
          )}
        </TouchableOpacity>

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
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#07112B",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
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
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 4 },

  infoBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#EEF2FF",
    borderRadius: 14,
    padding: 14,
    alignItems: "flex-start",
  },
  infoTxt: { flex: 1, fontSize: 13, color: "#4F46E5", lineHeight: 18 },

  saveBtn: {
    backgroundColor: "#4F46E5",
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  saveTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
