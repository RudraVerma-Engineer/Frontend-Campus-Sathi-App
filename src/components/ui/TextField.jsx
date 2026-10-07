import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, font, radius } from "../../theme/theme.js";

export default function TextField({ label, error, multiline, style, ...props }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMute}
        multiline={multiline}
        style={[s.input, multiline && s.multi, error && s.err, style]}
        {...props}
      />
      {error ? <Text style={[font.small, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}
const s = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: colors.text },
  input: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: 14, height: 50, fontSize: 15, color: colors.text,
  },
  multi: { height: 120, textAlignVertical: "top", paddingTop: 12 },
  err: { borderColor: colors.danger },
});
