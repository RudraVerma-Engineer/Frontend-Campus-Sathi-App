import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, radius } from "../../theme/theme.js";

export default function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[s.chip, active && s.active]}>
      <Text style={[s.txt, active && s.txtActive]}>{label}</Text>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  txt: { fontSize: 13, fontWeight: "600", color: colors.textSoft },
  txtActive: { color: "#fff" },
});
