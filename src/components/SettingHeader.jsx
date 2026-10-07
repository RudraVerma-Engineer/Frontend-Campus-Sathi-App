import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function SettingHeader({ title, subtitle }) {
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{title}</Text>
          {subtitle && <Text style={s.sub}>{subtitle}</Text>}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { backgroundColor: "#F5F7FC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  title: { fontSize: 20, fontWeight: "800", color: "#07112B" },
  sub: { fontSize: 13, color: "#6B7280", marginTop: 1 },
});
