import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, radius } from "../../theme/theme.js";

// variant: primary (gradient) | outline | soft | danger
export default function Button({ title, onPress, loading, disabled, variant = "primary", icon, style, small }) {
  const off = disabled || loading;
  const body = loading ? (
    <ActivityIndicator color={variant === "primary" || variant === "danger" ? "#fff" : colors.primary} />
  ) : (
    <Text style={[s.txt, textColor[variant], small && { fontSize: 13 }]}>{icon ? `${icon}  ` : ""}{title}</Text>
  );

  if (variant === "primary") {
    return (
      <TouchableOpacity activeOpacity={0.88} disabled={off} onPress={onPress} style={[off && s.off, style]}>
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[s.btn, small && s.small]}>
          {body}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity activeOpacity={0.85} disabled={off} onPress={onPress}
      style={[s.btn, small && s.small, variants[variant], off && s.off, style]}>
      {body}
    </TouchableOpacity>
  );
}

const variants = {
  outline: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: "transparent" },
  soft: { backgroundColor: colors.primarySoft },
  danger: { backgroundColor: colors.danger },
};
const textColor = {
  primary: { color: "#fff" },
  danger: { color: "#fff" },
  outline: { color: colors.primary },
  soft: { color: colors.primary },
};
const s = StyleSheet.create({
  btn: { height: 52, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  small: { height: 40, borderRadius: radius.md },
  txt: { fontSize: 15, fontWeight: "700" },
  off: { opacity: 0.55 },
});
