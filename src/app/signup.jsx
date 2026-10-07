import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useState, useMemo, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import GradientText from "../components/GradientText";
import { registerUser } from "../services/authServices";
import { router } from "expo-router";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    phone: "",
    rollNumber: "",
    course: "",
    department: "",
    semester: "",
    section: "",
    password: "",
    confirmPassword: "",
  });

  // Per-field error state
  const [errors, setErrors] = useState({});

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["28%"], []);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  //validations

  const validate = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    } else if (formData.firstname.trim().length < 3) {
      newErrors.firstname = "First name must be at least 3 characters";
    }

    if (formData.lastname && formData.lastname.trim().length < 3) {
      newErrors.lastname = "Last name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = "Roll number is required";
    }

    if (!formData.course) {
      newErrors.course = "Please select a course";
    }

    if (!formData.department) {
      newErrors.department = "Please select a department";
    }

    if (!formData.semester) {
      newErrors.semester = "Please select a semester";
    }

    if (!formData.section) {
      newErrors.section = "Please select a section";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 5) {
      newErrors.username = "Username must be at least 5 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(formData.password)) {
      newErrors.password =
        "Password must include uppercase, lowercase, and a number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Image Picker ──────────────────────────────────────────────────────────
  const openPhotoOptions = () => bottomSheetRef.current?.expand();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Gallery permission is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera permission is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return; // Stop if any field has an error

    const formDataObj = new FormData();

    if (profileImage) {
      formDataObj.append("profilePhoto", {
        uri: profileImage,
        name: "profile.jpg",
        type: "image/jpeg",
      });
    }

    formDataObj.append(
      "fullname",
      JSON.stringify({
        firstname: formData.firstname,
        lastname: formData.lastname,
      }),
    );
    formDataObj.append("username", formData.username);
    formDataObj.append("email", formData.email);
    formDataObj.append("phone", formData.phone);
    formDataObj.append("rollNumber", formData.rollNumber);
    formDataObj.append("course", formData.course);
    formDataObj.append("department", formData.department);
    formDataObj.append("semester", String(formData.semester));
    formDataObj.append("section", formData.section);
    formDataObj.append("password", formData.password);

    try {
      setIsLoading(true);
      const data = await registerUser(formDataObj);
      // console.log(data);
      // In signup.jsx handleRegister, replace the Alert.alert with:
      router.push({
        pathname: "/otp-verify",
        params: { email: formData.email.trim().toLowerCase() },
      });
    } catch (error) {
      const message = error?.message || "Something went wrong";
      Alert.alert("Registration Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Reusable Components ───────────────────────────────────────────────────
  const SectionTitle = ({ title, icon }) => (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons name={icon} size={22} color="#4F46E5" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  // Shows a red error text below a field
  const ErrorText = ({ field }) =>
    errors[field] ? (
      <Text style={styles.errorText}>{errors[field]}</Text>
    ) : null;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <LinearGradient
            colors={["#4F46E5", "#0EA5E9"]}
            style={styles.logoContainer}
          >
            <MaterialCommunityIcons
              name="school-outline"
              size={42}
              color="#fff"
            />
          </LinearGradient>

          <View style={styles.titleRow}>
            <GradientText style={styles.campusText}>Campus</GradientText>
            <Text style={styles.sathiText}>Sathi</Text>
          </View>
          <Text style={styles.subHeading}>Create Your Account</Text>

          <View style={styles.card}>
            {/* ── Personal Information ── */}
            <SectionTitle
              title="Personal Information"
              icon="account-circle-outline"
            />

            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.profileContainer}
                onPress={openPhotoOptions}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <MaterialCommunityIcons
                      name="camera-plus"
                      size={32}
                      color="#4F46E5"
                    />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.editPhotoButton}
                  onPress={openPhotoOptions}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={16}
                    color="#fff"
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              <Text style={styles.profileText}>Upload Profile Photo</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <TextInput
                  placeholder="First Name"
                  style={[styles.input, errors.firstname && styles.inputError]}
                  value={formData.firstname}
                  onChangeText={(v) => handleChange("firstname", v)}
                />
                <ErrorText field="firstname" />
              </View>
              <View style={styles.half}>
                <TextInput
                  placeholder="Last Name"
                  style={[styles.input, errors.lastname && styles.inputError]}
                  value={formData.lastname}
                  onChangeText={(v) => handleChange("lastname", v)}
                />
                <ErrorText field="lastname" />
              </View>
            </View>

            <TextInput
              placeholder="College Email"
              style={[styles.input, errors.email && styles.inputError]}
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(v) => handleChange("email", v)}
            />
            <ErrorText field="email" />

            <TextInput
              placeholder="Phone Number"
              style={[styles.input, errors.phone && styles.inputError]}
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(v) => handleChange("phone", v)}
            />
            <ErrorText field="phone" />

            {/* ── Academic Information ── */}
            <SectionTitle title="Academic Information" icon="school-outline" />

            <TextInput
              placeholder="Roll Number"
              style={[styles.input, errors.rollNumber && styles.inputError]}
              value={formData.rollNumber}
              onChangeText={(v) => handleChange("rollNumber", v)}
            />
            <ErrorText field="rollNumber" />

            <View style={styles.row}>
              <View style={styles.half}>
                <View
                  style={[
                    styles.pickerContainer,
                    errors.course && styles.inputError,
                  ]}
                >
                  <Picker
                    selectedValue={formData.course}
                    onValueChange={(v) => handleChange("course", v)}
                  >
                    <Picker.Item label="Course" value="" />
                    <Picker.Item label="B.Tech" value="BTech" />
                    <Picker.Item label="M.Tech" value="MTech" />
                    <Picker.Item label="BCA" value="BCA" />
                    <Picker.Item label="MCA" value="MCA" />
                  </Picker>
                </View>
                <ErrorText field="course" />
              </View>
              <View style={styles.half}>
                <View
                  style={[
                    styles.pickerContainer,
                    errors.department && styles.inputError,
                  ]}
                >
                  <Picker
                    selectedValue={formData.department}
                    onValueChange={(v) => handleChange("department", v)}
                  >
                    <Picker.Item label="Department" value="" />
                    <Picker.Item label="CSE" value="CSE" />
                    <Picker.Item label="IT" value="IT" />
                    <Picker.Item label="AI & ML" value="AI & ML" />
                    <Picker.Item label="ECE" value="ECE" />
                    <Picker.Item label="EE" value="EE" />
                  </Picker>
                </View>
                <ErrorText field="department" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <View
                  style={[
                    styles.pickerContainer,
                    errors.semester && styles.inputError,
                  ]}
                >
                  <Picker
                    selectedValue={formData.semester}
                    onValueChange={(v) => handleChange("semester", v)}
                  >
                    <Picker.Item label="Semester" value="" />
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <Picker.Item
                        key={sem}
                        label={`${sem}`}
                        value={`${sem}`}
                      />
                    ))}
                  </Picker>
                </View>
                <ErrorText field="semester" />
              </View>
              <View style={styles.half}>
                <View
                  style={[
                    styles.pickerContainer,
                    errors.section && styles.inputError,
                  ]}
                >
                  <Picker
                    selectedValue={formData.section}
                    onValueChange={(v) => handleChange("section", v)}
                  >
                    <Picker.Item label="Section" value="" />
                    <Picker.Item label="A" value="A" />
                    <Picker.Item label="B" value="B" />
                    <Picker.Item label="C" value="C" />
                    <Picker.Item label="D" value="D" />
                  </Picker>
                </View>
                <ErrorText field="section" />
              </View>
            </View>

            {/* ── Account Details ── */}
            <SectionTitle title="Account Details" icon="account-outline" />

            <TextInput
              placeholder="Username"
              style={[styles.input, errors.username && styles.inputError]}
              autoCapitalize="none"
              value={formData.username}
              onChangeText={(v) => handleChange("username", v)}
            />
            <ErrorText field="username" />

            {/* ── Account Security ── */}
            <SectionTitle title="Account Security" icon="shield-lock-outline" />

            <View
              style={[
                styles.passwordContainer,
                errors.password && styles.inputError,
              ]}
            >
              <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                value={formData.password}
                onChangeText={(v) => handleChange("password", v)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            <ErrorText field="password" />

            <View
              style={[
                styles.passwordContainer,
                errors.confirmPassword && styles.inputError,
              ]}
            >
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                style={styles.passwordInput}
                value={formData.confirmPassword}
                onChangeText={(v) => handleChange("confirmPassword", v)}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Feather
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            <ErrorText field="confirmPassword" />

            <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
              <LinearGradient
                colors={["#4F46E5", "#0EA5E9"]}
                style={[styles.registerButton, isLoading && { opacity: 0.7 }]}
              >
                <Text style={styles.registerText}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.navigate("/signin")}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <Text style={styles.sheetTitle}>Choose Profile Photo</Text>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                takePhoto();
                bottomSheetRef.current?.close();
              }}
            >
              <MaterialCommunityIcons name="camera" size={24} color="#4F46E5" />
              <Text style={styles.sheetText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                pickImage();
                bottomSheetRef.current?.close();
              }}
            >
              <MaterialCommunityIcons name="image" size={24} color="#4F46E5" />
              <Text style={styles.sheetText}>Choose From Gallery</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileContainer: {
    position: "relative",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  campusText: {
    fontSize: 58,
    fontWeight: "900",
  },
  sathiText: {
    fontSize: 58,
    fontWeight: "900",
    color: "#07112B",
  },
  editPhotoButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 5,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  profilePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4F46E5",
    borderStyle: "dashed",
  },
  profileText: {
    marginTop: 10,
    color: "#4F46E5",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#6B7280",
  },
  loginText: {
    color: "#4F46E5",
    fontWeight: "700",
    marginLeft: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 15,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2FF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F7FC",
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 30,
  },
  subHeading: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 18,
    marginTop: 8,
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  input: {
    height: 56,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 4, // reduced — ErrorText sits below
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  half: {
    width: "48%",
  },
  pickerContainer: {
    backgroundColor: "#F3F6FD",
    borderRadius: 14,
    marginBottom: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F6FD",
    borderRadius: 14,
    paddingHorizontal: 15,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  passwordInput: {
    flex: 1,
    height: 55,
  },
  registerButton: {
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  registerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 15,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  sheetText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 15,
  },
});
