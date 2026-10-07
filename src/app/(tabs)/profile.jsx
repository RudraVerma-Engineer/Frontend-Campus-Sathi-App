import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext.jsx";
import { Avatar, Badge, Card, Screen } from "../../components/ui";
import { uploadProfilePhoto } from "../../services/authServices.js";
import { colors, font, gradients, radius, shadow } from "../../theme/theme.js";
import { capitalize, fullName } from "../../utils/format.js";

const MENU = [
  { icon: "account-cog-outline", label: "Account settings", route: "/settingPages/AccountSettings" },
  { icon: "shield-check-outline", label: "Privacy & Security", route: "/settingPages/Privacy&Security" },
  { icon: "bell-outline", label: "Notifications", route: "/settingPages/Notifications" },
  { icon: "help-circle-outline", label: "Help & Support", route: "/settingPages/Help&Support" },
  { icon: "information-outline", label: "About Campus Sathi", route: "/settingPages/AboutCampusSathi" },
];

// how complete is this profile? drives the progress ring + nudge
const completion = (u) => {
  const checks = [u?.profilePhoto, u?.bio, u?.phone, u?.skills?.length, u?.interests?.length, u?.currentCGPA, u?.section, u?.semester];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const pct = completion(user);

  const changePhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed", "Allow photo access to set a profile picture.");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (res.canceled) return;
    try {
      setUploading(true);
      const data = await uploadProfilePhoto(res.assets[0]);
      updateUser(data.user);
    } catch (e) {
      Alert.alert("Upload failed", e.message);
    } finally {
      setUploading(false);
    }
  };

  const signOut = () =>
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: logout }, // AuthGate sends you to /signin
    ]);

  const stats = [
    { label: "CGPA", value: user?.currentCGPA ?? "—" },
    { label: "Attendance", value: user?.attendancePercentage != null ? `${Math.round(user.attendancePercentage)}%` : "—" },
    { label: "Skills", value: user?.skills?.length ?? 0 },
  ];

  return (
    <Screen>
      <View style={s.topRow}>
        <Text style={font.h1}>Profile</Text>
        <TouchableOpacity style={s.gear} onPress={() => router.push("/settingPages/MainSetting")}>
          <MaterialCommunityIcons name="cog-outline" size={22} color={colors.textSoft} />
        </TouchableOpacity>
      </View>

      <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <TouchableOpacity onPress={changePhoto} disabled={uploading} activeOpacity={0.85}>
          <View style={s.avatarRing}><Avatar user={user} size={78} /></View>
          <View style={s.cam}>
            <MaterialCommunityIcons name={uploading ? "progress-upload" : "camera"} size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={s.name}>{fullName(user)}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.tags}>
          <Badge label={capitalize(user?.role || "student")} bg="rgba(255,255,255,0.22)" color="#fff" />
          {user?.department ? <Badge label={user.department} bg="rgba(255,255,255,0.22)" color="#fff" /> : null}
          {user?.role === "student" && user?.semester ? <Badge label={`Sem ${user.semester}`} bg="rgba(255,255,255,0.22)" color="#fff" /> : null}
        </View>
        {user?.rollNumber ? <Text style={s.roll}>Roll no. {user.rollNumber}</Text> : null}
      </LinearGradient>

      <View style={s.statsRow}>
        {stats.map((st) => (
          <Card key={st.label} style={s.stat}>
            <Text style={s.statVal}>{st.value}</Text>
            <Text style={font.small}>{st.label}</Text>
          </Card>
        ))}
      </View>

      {pct < 100 && (
        <Card onPress={() => router.push("/settingPages/AccountSettings")} style={s.nudge}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={font.h3}>Complete your profile • {pct}%</Text>
            <View style={s.track}><View style={[s.fill, { width: `${pct}%` }]} /></View>
            <Text style={font.small}>Add a photo, bio and skills so recruiters can find you.</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMute} />
        </Card>
      )}

      <Card padded={false}>
        {MENU.map((m, i) => (
          <TouchableOpacity key={m.label} style={[s.item, i < MENU.length - 1 && s.itemBorder]} onPress={() => router.push(m.route)}>
            <View style={s.itemIcon}><MaterialCommunityIcons name={m.icon} size={20} color={colors.primary} /></View>
            <Text style={s.itemTxt}>{m.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMute} />
          </TouchableOpacity>
        ))}
      </Card>

      <TouchableOpacity style={s.logout} onPress={signOut} activeOpacity={0.85}>
        <MaterialCommunityIcons name="logout" size={20} color={colors.danger} />
        <Text style={s.logoutTxt}>Sign out</Text>
      </TouchableOpacity>
      <Text style={[font.small, { textAlign: "center" }]}>Campus Sathi v1.0</Text>
    </Screen>
  );
}

const s = StyleSheet.create({
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  gear: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  hero: { borderRadius: radius.xl, padding: 22, alignItems: "center", gap: 6, ...shadow.lift },
  avatarRing: { padding: 3, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.5)" },
  cam: { position: "absolute", right: 0, bottom: 2, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  name: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 6 },
  email: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  tags: { flexDirection: "row", gap: 6, marginTop: 6 },
  roll: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statVal: { fontSize: 20, fontWeight: "800", color: colors.text },
  nudge: { flexDirection: "row", alignItems: "center", gap: 10 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.borderSoft, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  itemIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  itemTxt: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.text },
  logout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: radius.lg, backgroundColor: colors.dangerSoft },
  logoutTxt: { color: colors.danger, fontSize: 15, fontWeight: "700" },
});
