import { StyleSheet, View } from "react-native";
import { colors, radius } from "../../theme/theme.js";

export default function ProgressBar({ value = 0, color = colors.primary, height = 8 }) {
  return (
    <View style={[s.track, { height }]}>
      <View style={[s.fill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} />
    </View>
  );
}
const s = StyleSheet.create({
  track: { backgroundColor: colors.borderSoft, borderRadius: radius.pill, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radius.pill },
});
