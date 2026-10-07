import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext.jsx";
import useAsync from "../../hooks/useAsync.js";
import { AsyncBoundary, Badge, Card, Chip, EmptyView, Screen, ScreenHeader } from "../../components/ui";
import { assignmentService } from "../../services/campusServices.js";
import { colors, font, assignmentStateStyle as STATE_STYLE } from "../../theme/theme.js";
import { daysUntil, formatDate } from "../../utils/format.js";

const FILTERS = ["Pending", "Done", "All"];

export default function AssignmentsScreen() {
  const { isFaculty } = useAuth();
  const [filter, setFilter] = useState("Pending");
  const state = useAsync(() => assignmentService.list(), []);

  const list = useMemo(() => {
    const all = state.data?.assignments || [];
    if (isFaculty || filter === "All") return all;
    return all.filter((a) => (filter === "Pending" ? ["pending", "overdue"].includes(a.state) : ["submitted", "graded"].includes(a.state)));
  }, [state.data, filter, isFaculty]);

  return (
    <Screen onRefresh={state.refresh} refreshing={state.refreshing}>
      <ScreenHeader title="Assignments" subtitle={isFaculty ? "Assignments you created" : "Your coursework"} />
      {!isFaculty && (
        <View style={{ flexDirection: "row", gap: 8 }}>
          {FILTERS.map((f) => <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />)}
        </View>
      )}
      <AsyncBoundary
        state={state}
        isEmpty={list.length === 0}
        empty={<EmptyView icon="clipboard-check-outline" title={filter === "Pending" && !isFaculty ? "All caught up!" : "No assignments"}
          message="New assignments from your teachers will appear here." />}
      >
        {list.map((a) => {
          const st = STATE_STYLE[a.state];
          const left = daysUntil(a.dueDate);
          return (
            <Card key={a._id} onPress={() => router.push(`/assignments/${a._id}`)} style={{ gap: 8 }}>
              <View style={s.row}>
                <Badge label={a.subject?.code || "SUBJ"} bg={colors.primarySoft} color={colors.primary} />
                {isFaculty ? (
                  <Badge label={`${a.submissionCount} submitted`} bg={colors.successSoft} color="#047857" />
                ) : (
                  <Badge label={st.label} bg={st.bg} color={st.text} />
                )}
              </View>
              <Text style={font.h3} numberOfLines={2}>{a.title}</Text>
              <View style={s.row}>
                <Text style={font.small}>{a.subject?.name}</Text>
                <Text style={[font.small, !isFaculty && a.state === "pending" && left <= 2 && { color: colors.danger, fontWeight: "700" }]}>
                  Due {formatDate(a.dueDate, { day: "numeric", month: "short" })}{a.state === "pending" && left >= 0 ? ` • ${left}d left` : ""}
                </Text>
              </View>
              {a.mySubmission?.marks !== undefined && (
                <Text style={[font.body, { fontWeight: "700", color: "#6D28D9" }]}>Score: {a.mySubmission.marks} / {a.maxMarks}</Text>
              )}
            </Card>
          );
        })}
      </AsyncBoundary>
    </Screen>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 } });
