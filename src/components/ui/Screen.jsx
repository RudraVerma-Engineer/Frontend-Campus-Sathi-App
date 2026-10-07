import { RefreshControl, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../theme/theme.js";

// Standard page wrapper: safe area + optional pull-to-refresh scrolling.
export default function Screen({
  children,
  scroll = true,
  onRefresh,
  refreshing = false,
  edges = ["top"],
  padded = true,
  style,
  contentStyle,
}) {
  return (
    <SafeAreaView style={[s.safe, style]} edges={edges}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[padded && s.padded, contentStyle]}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, padded && s.padded, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  padded: { padding: spacing.lg, paddingBottom: 40, gap: spacing.lg },
});
