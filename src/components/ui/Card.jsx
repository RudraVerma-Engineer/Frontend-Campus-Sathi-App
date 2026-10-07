import { StyleSheet, TouchableOpacity, View } from "react-native";
import { colors, radius, shadow, spacing } from "../../theme/theme.js";

export default function Card({ children, onPress, style, padded = true }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      activeOpacity={0.85}
      onPress={onPress}
      style={[s.card, padded && { padding: spacing.lg }, style]}
    >
      {children}
    </Wrapper>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.borderSoft, ...shadow.card,
  },
});
