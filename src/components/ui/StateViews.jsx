import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, font } from "../../theme/theme.js";
import Button from "./Button.jsx";

export const LoadingView = ({ label = "Loading..." }) => (
  <View style={s.center}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={[font.small, { marginTop: 10 }]}>{label}</Text>
  </View>
);

export const ErrorView = ({ message, onRetry }) => (
  <View style={s.center}>
    <MaterialCommunityIcons name="wifi-alert" size={44} color={colors.danger} />
    <Text style={s.title}>Couldn't load this</Text>
    <Text style={[font.small, s.msg]}>{message}</Text>
    {onRetry ? <Button title="Try again" variant="soft" small onPress={onRetry} style={{ marginTop: 14 }} /> : null}
  </View>
);

export const EmptyView = ({ icon = "inbox-outline", title, message, action }) => (
  <View style={s.center}>
    <View style={s.iconWrap}>
      <MaterialCommunityIcons name={icon} size={34} color={colors.primary} />
    </View>
    <Text style={s.title}>{title}</Text>
    {message ? <Text style={[font.small, s.msg]}>{message}</Text> : null}
    {action}
  </View>
);

// shows loading / error / empty / content for a useAsync result
export function AsyncBoundary({ state, isEmpty, empty, children }) {
  if (state.loading && !state.data) return <LoadingView />;
  if (state.error && !state.data) return <ErrorView message={state.error} onRetry={state.reload} />;
  if (isEmpty) return empty;
  return children;
}

const s = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", padding: 36 },
  iconWrap: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  title: { ...font.h3, marginTop: 14, textAlign: "center" },
  msg: { textAlign: "center", marginTop: 6, maxWidth: 280 },
});
