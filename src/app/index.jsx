import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import GradientText from "../components/GradientText";
import { router } from "expo-router";

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipBtn}>
        <Ionicons name="play-outline" size={18} color="#6B7280" />
        <Text style={styles.skipText}>Skip intro</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoShadow}>
          <LinearGradient
            colors={["#5865F2", "#00A3FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoContainer}
          >
            <MaterialCommunityIcons
              name="school-outline"
              size={52}
              color="#FFFFFF"
            />
          </LinearGradient>
        </View>

        {/* App Name */}
        <View style={styles.titleRow}>
          <GradientText style={styles.campusText}>Campus</GradientText>

          <Text style={styles.sathiText}>Sathi</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Your AI-powered campus, in one app.</Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featurePill}>
            <Feather name="zap" size={18} color="#6B7280" />
            <Text style={styles.featureText}> Notices</Text>
          </View>

          <View style={styles.featurePill}>
            <Feather name="book-open" size={18} color="#6B7280" />
            <Text style={styles.featureText}> Events</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featurePill}>
            <Feather name="briefcase" size={18} color="#6B7280" />
            <Text style={styles.featureText}> Placements</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featurePill}>
            <Feather name="users" size={18} color="#6B7280" />
            <Text style={styles.featureText}> Community</Text>
          </View>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.navigate('/signin')}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressWrapper}>
          <LinearGradient
            colors={["#5865F2", "#00A3FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressBar}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
  },

  skipBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    zIndex: 100,
  },

  skipText: {
    marginLeft: 6,
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logoShadow: {
    shadowColor: "#3B82F6",
    shadowOpacity: 0.25,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 12,
  },

  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
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
  //   sathiText: {
  //     fontSize: 58,
  //     fontWeight: "900",
  //     color: "#07112B",
  //     marginLeft: -2,
  //   },

  subtitle: {
    marginTop: 16,
    fontSize: 20,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },

  featuresContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    columnGap:12,
  },

  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  featureText: {
    fontSize: 18,
    color: "#4B5563",
    fontWeight: "600",
  },

  progressWrapper: {
    width: "85%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 90,
  },

  getStartedButton: {
    marginTop: 40,
    width: "85%",
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5865F2",

    shadowColor: "#5865F2",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },

  getStartedText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  progressBar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});
