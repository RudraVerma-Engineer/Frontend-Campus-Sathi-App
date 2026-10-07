import { StyleSheet, Text, View } from "react-native";
import { radius } from "../../theme/theme.js";

export default function Badge({ label, bg, color, style }) {
  return (
    <View style={[s.b, { backgroundColor: bg }, style]}>
      <Text style={[s.t, { color }]}>{label}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  b: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: "flex-start" },
  t: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
});
