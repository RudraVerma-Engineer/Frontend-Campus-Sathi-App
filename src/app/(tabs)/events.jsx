import { useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import useAsync from "../../hooks/useAsync.js";
import { Badge, Chip, EmptyView, ErrorView, LoadingView } from "../../components/ui";
import { eventService } from "../../services/campusServices.js";
import { colors, font, gradients, radius, shadow } from "../../theme/theme.js";
import { capitalize, formatDate, formatTime } from "../../utils/format.js";

const PALETTE = [gradients.violet, gradients.emerald, gradients.amber, gradients.brand];
const TYPES = ["all", "workshop", "seminar", "hackathon", "fest", "sports", "webinar", "competition"];
const FILTERS = ["Upcoming", "Registered"];

export default function EventsScreen() {
  const [type, setType] = useState("all");
  const [filter, setFilter] = useState("Upcoming");
  const state = useAsync(() => eventService.list({ limit: 50, eventType: type === "all" ? undefined : type }), [type]);

  const events = useMemo(() => {
    const all = state.data?.events || [];
    return filter === "Registered" ? all.filter((e) => e.isRegistered) : all;
  }, [state.data, filter]);

  const thisWeek = (state.data?.events || []).filter(
    (e) => new Date(e.startDate) - Date.now() < 7 * 86400000 && !e.isRegistered,
  ).length;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Text style={font.h1}>Events</Text>
        <Text style={font.small}>Workshops, fests & talks</Text>
      </View>

      {state.loading && !state.data ? (
        <LoadingView />
      ) : state.error && !state.data ? (
        <ErrorView message={state.error} onRetry={state.reload} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={state.refreshing} onRefresh={state.refresh} tintColor={colors.primary} />}
          ListHeaderComponent={
            <View style={{ gap: 14 }}>
              <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.banner}>
                <Text style={s.bannerSub}>THIS WEEK</Text>
                <Text style={s.bannerTitle}>{thisWeek > 0 ? `${thisWeek} event${thisWeek > 1 ? "s" : ""} you can join` : "Nothing new this week"}</Text>
                <Text style={s.bannerDesc}>Register early - seats fill up fast.</Text>
              </LinearGradient>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {FILTERS.map((f) => <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />)}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {TYPES.map((t) => <Chip key={t} label={capitalize(t)} active={type === t} onPress={() => setType(t)} />)}
              </ScrollView>
            </View>
          }
          ListEmptyComponent={<EmptyView icon="calendar-blank-outline" title={filter === "Registered" ? "No registrations yet" : "No events found"}
            message={filter === "Registered" ? "Events you register for will appear here." : "Check back soon for new events."} />}
          renderItem={({ item: e, index }) => (
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push(`/event/${e._id}`)} style={s.card}>
              <LinearGradient colors={PALETTE[index % PALETTE.length]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cardTop}>
                <View style={s.dateBox}>
                  <Text style={s.day}>{new Date(e.startDate).getDate()}</Text>
                  <Text style={s.mon}>{formatDate(e.startDate, { month: "short" }).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle} numberOfLines={2}>{e.title}</Text>
                  <Text style={s.cardSub} numberOfLines={1}>{capitalize(e.eventType)} • {capitalize(e.mode)}</Text>
                </View>
              </LinearGradient>
              <View style={s.cardBody}>
                <View style={s.meta}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSoft} />
                  <Text style={font.small}>{formatTime(e.startDate)}</Text>
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textSoft} style={{ marginLeft: 8 }} />
                  <Text style={[font.small, { flex: 1 }]} numberOfLines={1}>{e.venue || (e.mode === "online" ? "Online" : "TBA")}</Text>
                </View>
                {e.isRegistered ? (
                  <Badge label="✓ REGISTERED" bg={colors.successSoft} color="#047857" />
                ) : new Date(e.registrationDeadline) < new Date() ? (
                  <Badge label="REGISTRATION CLOSED" bg={colors.borderSoft} color={colors.textSoft} />
                ) : (
                  <Badge label={`${e.registrationCount || 0} registered`} bg={colors.primarySoft} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  banner: { borderRadius: radius.xl, padding: 20, gap: 4, ...shadow.lift },
  bannerSub: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  bannerTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  bannerDesc: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, overflow: "hidden", ...shadow.card },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  dateBox: { width: 54, height: 58, borderRadius: radius.md, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  day: { color: "#fff", fontSize: 22, fontWeight: "800" },
  mon: { color: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: "700" },
  cardTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  cardSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  cardBody: { padding: 14, gap: 10 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
});
