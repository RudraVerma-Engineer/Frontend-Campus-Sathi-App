import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import BASE_URL from "../../config/api";

export default function AccountSettings() {
  const { user, token, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    bio: "",
    currentCGPA: "",
    skillInput: "", // temporary input for adding skills
  });
  const [skills, setSkills] = useState([]);

  // Pre-fill from context
  useEffect(() => {
    if (user) {
      setForm({
        firstname: user.fullname?.firstname || "",
        lastname: user.fullname?.lastname || "",
        phone: user.phone || "",
        bio: user.bio || "",
        currentCGPA: user.currentCGPA?.toString() || "",
        skillInput: "",
      });
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const addSkill = () => {
    const s = form.skillInput.trim();
    if (!s) return;
    if (skills.includes(s)) {
      Alert.alert("Duplicate", "This skill is already added.");
      return;
    }
    setSkills((prev) => [...prev, s]);
    setForm((p) => ({ ...p, skillInput: "" }));
  };

  const removeSkill = (skill) =>
    setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSave = async () => {
    if (!form.firstname.trim()) {
      Alert.alert("Validation", "First name is required.");
      return;
    }

    const payload = {
      fullname: {
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
      },
      phone: form.phone.trim(),
      bio: form.bio.trim(),
      skills,
    };
    if (form.currentCGPA) {
      const cgpa = parseFloat(form.currentCGPA);
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        Alert.alert("Validation", "CGPA must be between 0 and 10.");
        return;
      }
      payload.currentCGPA = cgpa;
    }

    try {
      setIsSaving(true);
      const res = await axios.patch(
        `${BASE_URL}/auth/update-profile`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      updateUser(res.data.user);
      Alert.alert("Success ✅", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const Field = ({
    label,
    icon,
    keyName,
    placeholder,
    keyboardType = "default",
    multiline = false,
  }) => (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}</Text>
      <View
        style={[
          s.inputRow,
          multiline && { alignItems: "flex-start", paddingVertical: 10 },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color="#9CA3AF"
          style={{ marginTop: multiline ? 2 : 0 }}
        />
        <TextInput
          style={[
            s.input,
            multiline && { height: 80, textAlignVertical: "top" },
          ]}
          placeholder={placeholder}
          placeholderTextColor="#C4C9D4"
          value={form[keyName]}
          onChangeText={(v) => handleChange(keyName, v)}
          keyboardType={keyboardType}
          multiline={multiline}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Account Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={s.avatarSection}>
          <LinearGradient colors={["#4F46E5", "#0EA5E9"]} style={s.avatar}>
            <Text style={s.avatarTxt}>
              {form.firstname ? form.firstname[0].toUpperCase() : "?"}
            </Text>
          </LinearGradient>
          <TouchableOpacity style={s.changePhotoBtn}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={16}
              color="#4F46E5"
            />
            <Text style={s.changePhotoTxt}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Personal info card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Personal Information</Text>
          <Field
            label="First Name *"
            icon="account-outline"
            keyName="firstname"
            placeholder="Enter first name"
          />
          <Field
            label="Last Name"
            icon="account-outline"
            keyName="lastname"
            placeholder="Enter last name"
          />
          <Field
            label="Phone"
            icon="phone-outline"
            keyName="phone"
            placeholder="10-digit phone"
            keyboardType="phone-pad"
          />
          <Field
            label="Bio"
            icon="text-box-outline"
            keyName="bio"
            placeholder="Tell something about yourself..."
            multiline
          />
          <Field
            label="Current CGPA"
            icon="medal-outline"
            keyName="currentCGPA"
            placeholder="e.g. 8.6"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Skills card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Skills</Text>
          <Text style={s.cardSub}>Add your technical and soft skills</Text>

          {/* Skill input row */}
          <View style={s.skillInputRow}>
            <TextInput
              style={s.skillInput}
              placeholder="e.g. React Native, Node.js..."
              placeholderTextColor="#C4C9D4"
              value={form.skillInput}
              onChangeText={(v) => handleChange("skillInput", v)}
              onSubmitEditing={addSkill}
              returnKeyType="done"
            />
            <TouchableOpacity style={s.addSkillBtn} onPress={addSkill}>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Skill chips */}
          <View style={s.skillChips}>
            {skills.length === 0 && (
              <Text style={s.noSkillTxt}>No skills added yet</Text>
            )}
            {skills.map((skill) => (
              <View key={skill} style={s.chip}>
                <Text style={s.chipTxt}>{skill}</Text>
                <TouchableOpacity onPress={() => removeSkill(skill)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={14}
                    color="#4F46E5"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Read-only academic info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Academic Information</Text>
          <Text style={s.cardSub}>Contact admin to update these fields</Text>
          {[
            {
              label: "Roll Number",
              value: user?.rollNumber,
              icon: "identifier",
            },
            { label: "Department", value: user?.department, icon: "domain" },
            { label: "Course", value: user?.course, icon: "book-open-outline" },
            {
              label: "Semester",
              value: user?.semester?.toString(),
              icon: "numeric",
            },
            {
              label: "Section",
              value: user?.section,
              icon: "account-group-outline",
            },
          ].map((f) => (
            <View key={f.label} style={s.readOnlyRow}>
              <MaterialCommunityIcons name={f.icon} size={18} color="#9CA3AF" />
              <View style={{ flex: 1 }}>
                <Text style={s.readLabel}>{f.label}</Text>
                <Text style={s.readValue}>{f.value || "—"}</Text>
              </View>
              <MaterialCommunityIcons
                name="lock-outline"
                size={16}
                color="#D1D5DB"
              />
            </View>
          ))}
        </View>

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#4F46E5", "#0EA5E9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[s.saveBtn, isSaving && { opacity: 0.7 }]}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.saveTxt}>Save Changes</Text>
            )}
          </LinearGradient>
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

  avatarSection: { alignItems: "center", gap: 10, paddingVertical: 8 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTxt: { fontSize: 34, fontWeight: "800", color: "#fff" },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  changePhotoTxt: { fontSize: 13, fontWeight: "600", color: "#4F46E5" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#07112B" },
  cardSub: { fontSize: 12, color: "#9CA3AF", marginTop: -8 },

  fieldWrap: { gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 10,
    height: 48,
  },
  input: { flex: 1, fontSize: 15, color: "#07112B" },

  skillInputRow: { flexDirection: "row", gap: 10 },
  skillInput: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: "#07112B",
  },
  addSkillBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
  skillChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF2FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipTxt: { fontSize: 13, color: "#4F46E5", fontWeight: "600" },
  noSkillTxt: { fontSize: 13, color: "#C4C9D4", fontStyle: "italic" },

  readOnlyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  readLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "600" },
  readValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 1,
  },

  saveBtn: {
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  saveTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
