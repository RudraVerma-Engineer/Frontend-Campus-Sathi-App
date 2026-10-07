import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, font, radius } from "../../theme/theme.js";

// Header for stack screens: back button, title, optional right action.
export default function ScreenHeader({ title, subtitle, right, onBack }) {
  return (
    <View style={s.row}>
      <TouchableOpacity
        style={s.back}
        onPress={onBack || (() => (router.canGoBack() ? router.back() : router.replace("/(tabs)")))}
        accessibilityLabel="Go back"
      >
        <MaterialCommunityIcons name="chevron-left" size={26} color={colors.text} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={s.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={font.small} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  back: {
    width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.white,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border,
  },
  title: { ...font.h2 },
});
