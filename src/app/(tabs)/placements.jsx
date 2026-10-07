import { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import useAsync from "../../hooks/useAsync.js";
import { Badge, Card, Chip, EmptyView, ErrorView, LoadingView } from "../../components/ui";
import { placementService } from "../../services/campusServices.js";
import { applicationStatusStyle as STATUS_STYLE, colors, font, gradients, radius, shadow } from "../../theme/theme.js";
import { capitalize, daysUntil, formatDate } from "../../utils/format.js";

const FILTERS = ["Open", "Applied", "All"];
const COLORS = ["#4285F4", "#00A4EF", "#FF9900", "#10B981", "#EC4899", "#6D28D9"];

export default function PlacementsScreen() {
  const [filter, setFilter] = useState("Open");
  const state = useAsync(async () => {
    const [drives, stats] = await Promise.all([placementService.list(), placementService.stats()]);
    return { drives: drives.drives, stats };
  }, []);

  const stats = state.data?.stats;
  const drives = useMemo(() => {
    const all = state.data?.drives || [];
    if (filter === "Applied") return all.filter((d) => d.myStatus);
    if (filter === "Open") return all.filter((d) => d.status === "open" && !d.deadlinePassed);
    return all;
  }, [state.data, filter]);

  const mine = stats?.mine || {};
  const overall = stats?.overall || {};
  const pipeline = [
    { n: mine.applied || 0, label: "APPLIED", color: colors.navy },
    { n: mine.shortlisted || 0, label: "SHORTLIST", color: colors.success },
    { n: mine.interview || 0, label: "INTERVIEW", color: colors.warning },
    { n: mine.offers || 0, label: "OFFERS", color: colors.primary },
  ];

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Text style={font.h1}>Placements</Text>
        <Text style={font.small}>Drives, deadlines and your applications</Text>
      </View>

      {state.loading && !state.data ? (
        <LoadingView />
      ) : state.error && !state.data ? (
        <ErrorView message={state.error} onRetry={state.reload} />
      ) : (
        <FlatList
          data={drives}
          keyExtractor={(d) => d._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={state.refreshing} onRefresh={state.refresh} tintColor={colors.primary} />}
          ListHeaderComponent={
            <View style={{ gap: 14, marginBottom: 2 }}>
              <LinearGradient colors={gradients.night} style={s.pipeline}>
                <Text style={s.pipeTitle}>MY APPLICATIONS</Text>
                <View style={s.pipeRow}>
                  {pipeline.map((p) => (
                    <View key={p.label} style={s.pipeItem}>
                      <Text style={s.pipeNum}>{p.n}</Text>
                      <Text style={s.pipeLabel}>{p.label}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>

              <View style={s.metrics}>
                {[
                  { icon: "trending-up", v: `${overall.placementRate ?? 0}%`, l: "Placed" },
                  { icon: "currency-inr", v: overall.averagePackage ? `₹${overall.averagePackage}L` : "—", l: "Avg package" },
                  { icon: "trophy-outline", v: overall.highestPackage ? `₹${overall.highestPackage}L` : "—", l: "Highest" },
                ].map((m) => (
                  <Card key={m.l} style={s.metric}>
                    <MaterialCommunityIcons name={m.icon} size={20} color={colors.primary} />
                    <Text style={s.metricVal}>{m.v}</Text>
                    <Text style={font.small}>{m.l}</Text>
                  </Card>
                ))}
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                {FILTERS.map((f) => <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />)}
              </View>
            </View>
          }
          ListEmptyComponent={<EmptyView icon="briefcase-search-outline"
            title={filter === "Applied" ? "No applications yet" : "No drives right now"}
            message={filter === "Applied" ? "Apply to an open drive to track it here." : "New campus drives will appear here."} />}
          renderItem={({ item: d, index }) => {
            const st = d.myStatus ? STATUS_STYLE[d.myStatus] : null;
            const left = daysUntil(d.applicationDeadline);
            return (
              <Card onPress={() => router.push(`/placement/${d._id}`)} style={{ gap: 12 }}>
                <View style={s.row}>
                  <View style={[s.logo, { backgroundColor: COLORS[index % COLORS.length] }]}>
                    <Text style={s.logoTxt}>{d.company?.companyName?.[0] || "?"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={font.h3} numberOfLines={1}>{d.company?.companyName}</Text>
                    <Text style={font.small} numberOfLines={1}>{d.role} • {capitalize(d.jobType)}</Text>
                  </View>
                  <Text style={s.pkg}>{d.packageLPA ? `₹${d.packageLPA} LPA` : "—"}</Text>
                </View>
                <View style={s.row}>
                  <Badge label={`CGPA ≥ ${d.minCGPA || 0}`} bg={colors.borderSoft} color={colors.textSoft} />
                  <Text style={[font.small, { flex: 1 }, left <= 2 && left >= 0 && { color: colors.danger, fontWeight: "700" }]}>
                    {d.deadlinePassed ? "Deadline passed" : left <= 0 ? "Closes today" : `Closes ${formatDate(d.applicationDeadline, { day: "numeric", month: "short" })} • ${left}d left`}
                  </Text>
                  {st ? (
                    <Badge label={st.label} bg={st.bg} color={st.text} />
                  ) : !d.isEligible ? (
                    <Badge label="Not eligible" bg={colors.dangerSoft} color={colors.danger} />
                  ) : null}
                </View>
              </Card>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  pipeline: { borderRadius: radius.xl, padding: 18, ...shadow.lift },
  pipeTitle: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  pipeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  pipeItem: { alignItems: "center", flex: 1 },
  pipeNum: { color: "#fff", fontSize: 28, fontWeight: "800" },
  pipeLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "700", marginTop: 2 },
  metrics: { flexDirection: "row", gap: 10 },
  metric: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 14, paddingHorizontal: 6 },
  metricVal: { fontSize: 18, fontWeight: "800", color: colors.text },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  logoTxt: { color: "#fff", fontSize: 20, fontWeight: "800" },
  pkg: { fontSize: 14, fontWeight: "800", color: colors.success },
});
