import { useEffect, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext.jsx";
import useAsync from "../../hooks/useAsync.js";
import { Badge, Card, Chip, EmptyView, ErrorView, LoadingView } from "../../components/ui";
import { noticeService } from "../../services/campusServices.js";
import { colors, font, gradients, priorityStyle, radius, shadow } from "../../theme/theme.js";
import { capitalize, timeAgo } from "../../utils/format.js";
import { LinearGradient } from "expo-linear-gradient";

const CATEGORIES = ["all", "academic", "exam", "placement", "scholarship", "event", "holiday", "administration"];

export default function NoticesScreen() {
  const { isFaculty } = useAuth();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("all");

  // wait for the user to stop typing before hitting the server
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const state = useAsync(
    () => noticeService.list({ limit: 50, search: debounced || undefined, category: category === "all" ? undefined : category }),
    [debounced, category],
  );
  const notices = state.data?.notices || [];
  const unread = notices.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <View>
          <Text style={font.h1}>Notice Board</Text>
          <Text style={font.small}>{state.data ? `${unread} unread • ${state.data.totalNotices} total` : "Stay updated"}</Text>
        </View>
      </View>

      <View style={s.search}>
        <MaterialCommunityIcons name="magnify" size={22} color={colors.textMute} />
        <TextInput style={s.input} placeholder="Search notices" placeholderTextColor={colors.textMute}
          value={query} onChangeText={setQuery} returnKeyType="search" />
        {query ? (
          <TouchableOpacity onPress={() => setQuery("")}>
            <MaterialCommunityIcons name="close-circle" size={20} color={colors.textMute} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={{ height: 52 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {CATEGORIES.map((c) => (
            <Chip key={c} label={capitalize(c)} active={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      </View>

      {state.loading && !state.data ? (
        <LoadingView />
      ) : state.error && !state.data ? (
        <ErrorView message={state.error} onRetry={state.reload} />
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(n) => n._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 12, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={state.refreshing} onRefresh={state.refresh} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyView icon="bell-off-outline" title="No notices found"
            message={debounced || category !== "all" ? "Try a different search or category." : "New notices will show up here."} />}
          renderItem={({ item: n }) => {
            const p = priorityStyle[n.priority] || priorityStyle.low;
            return (
              <Card onPress={() => router.push(`/notice/${n._id}`)} style={[{ gap: 8 }, n.isPinned && s.pinned]}>
                <View style={s.rowBetween}>
                  <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                    <Badge label={p.label} bg={p.bg} color={p.text} />
                    <Badge label={capitalize(n.category || "other")} bg={colors.primarySoft} color={colors.primary} />
                  </View>
                  {!n.isRead && <View style={s.dot} />}
                </View>
                <Text style={font.h3} numberOfLines={2}>{n.title}</Text>
                <Text style={font.body} numberOfLines={2}>{n.description}</Text>
                <View style={s.rowBetween}>
                  <Text style={font.small} numberOfLines={1}>
                    {n.isPinned ? "📌 " : ""}{n.createdBy?.fullname?.firstname || "Campus"}{n.createdBy?.role ? ` • ${capitalize(n.createdBy.role)}` : ""}
                  </Text>
                  <Text style={font.small}>{timeAgo(n.createdAt)}</Text>
                </View>
              </Card>
            );
          }}
        />
      )}

      {isFaculty && (
        <TouchableOpacity style={s.fabWrap} activeOpacity={0.9} onPress={() => router.push("/create-notice")}>
          <LinearGradient colors={gradients.brand} style={s.fab}>
            <MaterialCommunityIcons name="plus" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  search: {
    marginHorizontal: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: 14, height: 48,
    borderWidth: 1, borderColor: colors.border,
  },
  input: { flex: 1, fontSize: 15, color: colors.text },
  chips: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  pinned: { borderColor: colors.primary, borderWidth: 1.5 },
  fabWrap: { position: "absolute", right: 20, bottom: 24, ...shadow.lift },
  fab: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
});
