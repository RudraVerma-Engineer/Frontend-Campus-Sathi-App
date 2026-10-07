import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, font } from "../../theme/theme.js";

export default function SectionTitle({ title, action, onAction }) {
  return (
    <View style={s.row}>
      <Text style={font.h3}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={s.action}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  action: { color: colors.primary, fontWeight: "700", fontSize: 13 },
});
