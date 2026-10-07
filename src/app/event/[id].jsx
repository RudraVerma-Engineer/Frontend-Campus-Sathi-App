import { useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import useAsync from "../../hooks/useAsync.js";
import { AsyncBoundary, Badge, Button, Card, Screen, ScreenHeader } from "../../components/ui";
import { eventService } from "../../services/campusServices.js";
import { colors, font, gradients, radius, shadow } from "../../theme/theme.js";
import { capitalize, formatDate, formatTime } from "../../utils/format.js";

const Row = ({ icon, text }) =>
  text ? (
    <View style={s.row}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      <Text style={[font.body, { flex: 1 }]}>{text}</Text>
    </View>
  ) : null;

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const state = useAsync(() => eventService.get(id), [id]);
  const [busy, setBusy] = useState(false);
  const e = state.data?.event;

  const closed = e && new Date(e.registrationDeadline) < new Date();
  const started = e && new Date(e.startDate) <= new Date();
  const full = e?.maxParticipants && e.registrationCount >= e.maxParticipants;

  const toggle = async () => {
    try {
      setBusy(true);
      if (e.isRegistered) await eventService.cancel(id);
      else await eventService.register(id);
      await state.refresh();
    } catch (err) {
      Alert.alert(e.isRegistered ? "Could not cancel" : "Could not register", err.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = () =>
    Alert.alert("Cancel registration?", "You can register again while seats are available.", [
      { text: "Keep it", style: "cancel" },
      { text: "Cancel registration", style: "destructive", onPress: toggle },
    ]);

  return (
    <Screen onRefresh={state.refresh} refreshing={state.refreshing}>
      <ScreenHeader title="Event" />
      <AsyncBoundary state={state}>
        {e && (
          <>
            <LinearGradient colors={gradients.violet} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
              <Badge label={capitalize(e.eventType).toUpperCase()} bg="rgba(255,255,255,0.22)" color="#fff" />
              <Text style={s.title}>{e.title}</Text>
              <Text style={s.by}>Organised by {e.organizedBy}</Text>
            </LinearGradient>

            <Card style={{ gap: 14 }}>
              <Row icon="calendar-blank" text={`${formatDate(e.startDate)} • ${formatTime(e.startDate)}`} />
              <Row icon="calendar-end" text={`Ends ${formatDate(e.endDate)} • ${formatTime(e.endDate)}`} />
              <Row icon="map-marker-outline" text={e.venue || (e.mode === "online" ? "Online event" : undefined)} />
              <Row icon="laptop" text={`${capitalize(e.mode)} event`} />
              <Row icon="account-group-outline" text={`${e.registrationCount || 0}${e.maxParticipants ? ` / ${e.maxParticipants}` : ""} registered`} />
              <Row icon="clock-alert-outline" text={`Register by ${formatDate(e.registrationDeadline)}`} />
              <Row icon="currency-inr" text={e.isPaid ? `Fee ₹${e.fee}` : "Free entry"} />
              <Row icon="certificate-outline" text={e.certificateProvided ? "Certificate provided" : undefined} />
            </Card>

            <View style={{ gap: 8 }}>
              <Text style={font.h3}>About</Text>
              <Text style={[font.body, { lineHeight: 22 }]}>{e.description}</Text>
            </View>

            {e.meetingLink && e.isRegistered ? (
              <Button title="Join online" variant="soft" onPress={() => Linking.openURL(e.meetingLink)} />
            ) : null}

            {e.isRegistered ? (
              <Button title="Cancel registration" variant="outline" loading={busy} disabled={started} onPress={confirmCancel} />
            ) : (
              <Button
                title={started ? "Event started" : closed ? "Registration closed" : full ? "Event is full" : "Register now"}
                loading={busy}
                disabled={closed || full || started}
                onPress={toggle}
              />
            )}
            {e.isRegistered && <Text style={[font.small, { textAlign: "center", color: "#047857" }]}>✓ You're registered for this event</Text>}
          </>
        )}
      </AsyncBoundary>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: radius.xl, padding: 22, gap: 8, ...shadow.lift },
  title: { color: "#fff", fontSize: 24, fontWeight: "800", lineHeight: 30 },
  by: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
});
