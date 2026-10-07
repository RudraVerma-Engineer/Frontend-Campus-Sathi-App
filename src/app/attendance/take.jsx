import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import useAsync from "../../hooks/useAsync.js";
import { AsyncBoundary, Badge, Button, Card, EmptyView, Screen, ScreenHeader } from "../../components/ui";
import { attendanceService, timetableService } from "../../services/campusServices.js";
import { colors, font } from "../../theme/theme.js";
import { to12h } from "../../utils/format.js";

// Faculty: pick one of today's lectures -> opens (or resumes) its attendance session.
export default function TakeAttendance() {
  const state = useAsync(() => timetableService.mine(), []);
  const [busyId, setBusyId] = useState(null);

  const today = state.data?.today;
  const slots = (today && state.data?.days?.[today]) || [];

  const start = async (slot) => {
    try {
      setBusyId(slot._id);
      const res = await attendanceService.startSession(slot._id);
      router.push({ pathname: "/attendance/session", params: { id: res.session._id } });
    } catch (e) {
      Alert.alert("Could not start", e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen onRefresh={state.refresh} refreshing={state.refreshing}>
      <ScreenHeader title="Take attendance" subtitle={today ? `${today}'s lectures` : ""} />
      <AsyncBoundary
        state={state}
        isEmpty={slots.length === 0}
        empty={<EmptyView icon="calendar-check-outline" title="No lectures today"
          message="Lectures assigned to you in the timetable will show up here on their day." />}
      >
        {slots.map((c) => (
          <Card key={c._id} style={{ gap: 12 }}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={font.h3}>{c.subject?.name}</Text>
                <Text style={font.small}>Section {c.section?.name} • Sem {c.section?.semester}{c.room ? ` • Room ${c.room}` : ""}</Text>
              </View>
              {c.lectureType === "lab" && <Badge label="LAB" bg={colors.warningSoft} color="#B45309" />}
            </View>
            <Text style={s.time}>{to12h(c.startTime)} – {to12h(c.endTime)}</Text>
            <Button title="Open attendance" small loading={busyId === c._id} onPress={() => start(c)} />
          </Card>
        ))}
      </AsyncBoundary>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  time: { fontSize: 13, fontWeight: "700", color: colors.primary },
});
