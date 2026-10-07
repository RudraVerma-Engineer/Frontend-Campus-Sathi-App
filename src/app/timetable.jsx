import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext.jsx";
import useAsync from "../hooks/useAsync.js";
import { AsyncBoundary, Badge, Card, EmptyView, Screen, ScreenHeader } from "../components/ui";
import { timetableService } from "../services/campusServices.js";
import { colors, font, radius } from "../theme/theme.js";
import { to12h } from "../utils/format.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetableScreen() {
  const { isFaculty } = useAuth();
  const state = useAsync(() => timetableService.mine(), []);
  const [day, setDay] = useState(null);

  const today = state.data?.today;
  useEffect(() => {
    if (day || !today) return;
    setDay(DAYS.includes(today) ? today : "Monday"); // Sunday -> show Monday
  }, [today, day]);

  const slots = (day && state.data?.days?.[day]) || [];

  return (
    <Screen onRefresh={state.refresh} refreshing={state.refreshing}>
      <ScreenHeader title="Timetable" subtitle={isFaculty ? "Your lectures this week" : "Your weekly schedule"} />
      <AsyncBoundary
        state={state}
        isEmpty={state.data?.needsSection}
        empty={<EmptyView icon="account-group-outline" title="Section not set"
          message="Add your section in Profile → Account settings and your timetable will appear here." />}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {DAYS.map((d) => {
            const active = d === day;
            const count = state.data?.days?.[d]?.length || 0;
            return (
              <TouchableOpacity key={d} onPress={() => setDay(d)} style={[s.tab, active && s.tabActive]} activeOpacity={0.8}>
                <Text style={[s.tabDay, active && s.tabTxtActive]}>{d.slice(0, 3)}</Text>
                <Text style={[s.tabCount, active && s.tabTxtActive]}>{count} cls</Text>
                {d === today && <View style={[s.todayDot, active && { backgroundColor: "#fff" }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {slots.length === 0 ? (
          <EmptyView icon="coffee-outline" title="No classes" message={`Nothing scheduled on ${day || "this day"}.`} />
        ) : (
          slots.map((c) => {
            const isNow = day === today && isCurrent(c.startTime, c.endTime);
            return (
              <Card key={c._id} style={[s.slot, isNow && s.now]}>
                <View style={s.timeCol}>
                  <Text style={s.start}>{to12h(c.startTime)}</Text>
                  <Text style={font.small}>{to12h(c.endTime)}</Text>
                </View>
                <View style={[s.bar, { backgroundColor: c.lectureType === "lab" ? colors.warning : colors.primary }]} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={font.h3} numberOfLines={1}>{c.subject?.name}</Text>
                  <Text style={font.small} numberOfLines={1}>
                    {isFaculty
                      ? `Section ${c.section?.name} • Sem ${c.section?.semester}`
                      : `${c.faculty?.fullname?.firstname || ""} ${c.faculty?.fullname?.lastname || ""}`.trim() || "Faculty"}
                  </Text>
                  <Text style={font.small}>
                    {[c.room && `Room ${c.room}`, c.building].filter(Boolean).join(" • ") || "Room TBA"}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  {isNow && <Badge label="NOW" bg={colors.successSoft} color="#047857" />}
                  {c.lectureType === "lab" && <Badge label="LAB" bg={colors.warningSoft} color="#B45309" />}
                </View>
              </Card>
            );
          })
        )}
      </AsyncBoundary>
    </Screen>
  );
}

function isCurrent(start, end) {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return cur >= sh * 60 + sm && cur < eh * 60 + em;
}

const s = StyleSheet.create({
  tab: { width: 64, paddingVertical: 10, borderRadius: radius.lg, backgroundColor: colors.white, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabDay: { fontSize: 14, fontWeight: "800", color: colors.text },
  tabCount: { fontSize: 10, color: colors.textSoft, marginTop: 2 },
  tabTxtActive: { color: "#fff" },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginTop: 4 },
  slot: { flexDirection: "row", alignItems: "center", gap: 12 },
  now: { borderColor: colors.success, borderWidth: 1.5 },
  timeCol: { width: 66 },
  start: { fontWeight: "800", fontSize: 13, color: colors.primary },
  bar: { width: 4, alignSelf: "stretch", borderRadius: 2 },
});
