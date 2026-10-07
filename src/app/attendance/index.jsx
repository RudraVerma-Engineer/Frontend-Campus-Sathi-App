import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext.jsx";
import useAsync from "../../hooks/useAsync.js";
import { AsyncBoundary, Button, Card, EmptyView, ProgressBar, Screen, ScreenHeader } from "../../components/ui";
import { attendanceService } from "../../services/campusServices.js";
import { attendanceColor, colors, font, gradients, radius, shadow } from "../../theme/theme.js";

const TARGET = 75;

// how many more classes can be missed (or must be attended) to stay at/above 75%
function advice(present, total) {
  if (!total) return null;
  const pct = (present / total) * 100;
  if (pct >= TARGET) {
    const canSkip = Math.floor(present / (TARGET / 100) - total);
    return { ok: true, text: canSkip > 0 ? `You can miss ${canSkip} more class${canSkip > 1 ? "es" : ""}` : "Don't miss the next class" };
  }
  const need = Math.ceil((TARGET / 100 * total - present) / (1 - TARGET / 100));
  return { ok: false, text: `Attend the next ${need} class${need > 1 ? "es" : ""} to reach ${TARGET}%` };
}

export default function AttendanceScreen() {
  const { user } = useAuth();
  const state = useAsync(() => attendanceService.summary(user._id), [user?._id]);
  const d = state.data;
  const pct = d?.attendancePercentage ?? 0;
  const tip = d && advice(d.totalPresent, d.totalClasses);

  return (
    <Screen onRefresh={state.refresh} refreshing={state.refreshing}>
      <ScreenHeader title="My attendance" subtitle="Updated after every class" />
      <AsyncBoundary
        state={state}
        isEmpty={d && d.totalClasses === 0}
        empty={
          <EmptyView icon="chart-donut" title="No attendance yet"
            message="Scan the QR code your teacher shows in class and it will be recorded here."
            action={<Button title="Scan QR" small onPress={() => router.push("/attendance/scan")} style={{ marginTop: 16 }} />} />
        }
      >
        {d && (
          <>
            <LinearGradient colors={gradients.night} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
              <View style={[s.ring, { borderColor: attendanceColor(pct) }]}>
                <Text style={s.pct}>{Math.round(pct)}%</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={s.heroTitle}>{pct >= TARGET ? "On track 👍" : "Below requirement ⚠️"}</Text>
                <Text style={s.heroSub}>{d.totalPresent} present • {d.totalAbsent} absent</Text>
                <Text style={s.heroSub}>{d.totalClasses} classes held</Text>
              </View>
            </LinearGradient>

            {tip && (
              <Card style={[s.tip, { backgroundColor: tip.ok ? colors.successSoft : colors.warningSoft }]}>
                <Text style={[font.body, { fontWeight: "700", color: tip.ok ? "#047857" : "#92400E" }]}>{tip.text}</Text>
                <Text style={font.small}>Minimum requirement: {TARGET}%</Text>
              </Card>
            )}

            <Text style={font.h3}>Subject-wise</Text>
            {d.subjectWiseAttendance.map((sub) => {
              const t = advice(sub.totalPresent, sub.totalClasses);
              return (
                <Card key={sub.subjectId} style={{ gap: 8 }}>
                  <View style={s.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={font.h3} numberOfLines={1}>{sub.subjectName}</Text>
                      <Text style={font.small}>{sub.subjectCode} • {sub.totalPresent}/{sub.totalClasses} classes</Text>
                    </View>
                    <Text style={[s.subPct, { color: attendanceColor(sub.attendancePercentage) }]}>
                      {Math.round(sub.attendancePercentage)}%
                    </Text>
                  </View>
                  <ProgressBar value={sub.attendancePercentage} color={attendanceColor(sub.attendancePercentage)} />
                  {t && <Text style={[font.small, { color: t.ok ? "#047857" : colors.danger }]}>{t.text}</Text>}
                </Card>
              );
            })}
            <Button title="Scan QR for attendance" variant="outline" onPress={() => router.push("/attendance/scan")} />
          </>
        )}
      </AsyncBoundary>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: radius.xl, padding: 20, flexDirection: "row", alignItems: "center", gap: 18, ...shadow.lift },
  ring: { width: 92, height: 92, borderRadius: 46, borderWidth: 7, alignItems: "center", justifyContent: "center" },
  pct: { color: "#fff", fontSize: 24, fontWeight: "800" },
  heroTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  tip: { gap: 2, borderWidth: 0 },
  rowBetween: { flexDirection: "row", alignItems: "center", gap: 10 },
  subPct: { fontSize: 20, fontWeight: "800" },
});
