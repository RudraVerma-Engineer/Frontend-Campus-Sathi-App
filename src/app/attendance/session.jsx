import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import useAsync from "../../hooks/useAsync.js";
import { AsyncBoundary, Button, Card, Chip, ProgressBar, Screen, ScreenHeader } from "../../components/ui";
import { attendanceService } from "../../services/campusServices.js";
import { colors, font, radius, shadow } from "../../theme/theme.js";

const STATUSES = [
  { key: "present", label: "P", color: colors.success },
  { key: "late", label: "L", color: colors.warning },
  { key: "absent", label: "A", color: colors.danger },
];

export default function SessionScreen() {
  const { id } = useLocalSearchParams();
  const [mode, setMode] = useState("qr"); // qr | manual
  const roster = useAsync(() => attendanceService.roster(id), [id]);
  const [marks, setMarks] = useState({}); // manual edits: { studentId: status }

  // QR state
  const [qr, setQr] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [qrError, setQrError] = useState(null);
  const refreshing = useRef(false);

  const loadQR = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const res = await attendanceService.generateQR(id);
      setQr(res);
      setSecondsLeft(res.ttlSeconds);
      setQrError(null);
    } catch (e) {
      setQrError(e.message);
    } finally {
      refreshing.current = false;
    }
  }, [id]);

  // generate on open, then re-generate shortly before expiry so the code never goes stale
  useEffect(() => {
    if (mode !== "qr") return;
    loadQR();
  }, [mode, loadQR]);

  useEffect(() => {
    if (mode !== "qr" || !qr) return;
    const t = setInterval(() => {
      setSecondsLeft((n) => {
        if (n <= 10) loadQR();
        return Math.max(n - 1, 0);
      });
    }, 1000);
    return () => clearInterval(t);
  }, [mode, qr, loadQR]);

  // live "who has scanned" while the QR is open
  useEffect(() => {
    if (mode !== "qr") return;
    const t = setInterval(() => roster.refresh(), 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const list = roster.data?.roster || [];
  const statusOf = (r) => marks[r.student._id] || r.status;
  const presentCount = list.filter((r) => ["present", "late"].includes(statusOf(r))).length;
  const session = roster.data?.session;

  const markAll = (status) => setMarks(Object.fromEntries(list.map((r) => [r.student._id, status])));

  const submit = () => {
    // anyone not explicitly marked is recorded absent
    const records = list.map((r) => ({ student: r.student._id, status: statusOf(r) || "absent" }));
    Alert.alert("Submit attendance?", `${records.filter((r) => r.status !== "absent").length} of ${records.length} present. This closes the session.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        onPress: async () => {
          try {
            await attendanceService.mark(id, records);
            Alert.alert("Saved", "Attendance has been recorded.", [{ text: "Done", onPress: () => router.replace("/(tabs)") }]);
          } catch (e) {
            Alert.alert("Could not save", e.message);
          }
        },
      },
    ]);
  };

  return (
    <Screen onRefresh={roster.refresh} refreshing={roster.refreshing}>
      <ScreenHeader title={session?.subject?.name || "Attendance"} subtitle={session ? `Section ${session.section?.name} • ${session.startTime}–${session.endTime}` : ""} />

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Chip label="QR code" active={mode === "qr"} onPress={() => setMode("qr")} />
        <Chip label="Manual" active={mode === "manual"} onPress={() => setMode("manual")} />
      </View>

      <AsyncBoundary state={roster}>
        {mode === "qr" && (
          <Card style={s.qrCard}>
            {qrError ? (
              <>
                <MaterialCommunityIcons name="alert-circle-outline" size={42} color={colors.danger} />
                <Text style={[font.body, { textAlign: "center" }]}>{qrError}</Text>
                <Button title="Retry" small variant="soft" onPress={loadQR} />
              </>
            ) : qr ? (
              <>
                <Image source={{ uri: qr.qrImage }} style={s.qr} resizeMode="contain" />
                <Text style={font.small}>Students scan this with Campus Sathi</Text>
                <ProgressBar value={(secondsLeft / qr.ttlSeconds) * 100} color={secondsLeft < 20 ? colors.warning : colors.success} />
                <Text style={[font.small, { fontWeight: "700" }]}>Refreshes automatically • {secondsLeft}s</Text>
              </>
            ) : (
              <Text style={font.body}>Generating QR...</Text>
            )}
          </Card>
        )}

        <View style={s.summary}>
          <Text style={font.h3}>{presentCount} / {list.length} present</Text>
          {mode === "manual" && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Chip label="All present" onPress={() => markAll("present")} />
              <Chip label="All absent" onPress={() => markAll("absent")} />
            </View>
          )}
        </View>

        {list.map((r) => {
          const st = statusOf(r);
          return (
            <Card key={r.student._id} style={s.student}>
              <View style={{ flex: 1 }}>
                <Text style={font.body} numberOfLines={1}>
                  {r.student.fullname?.firstname} {r.student.fullname?.lastname}
                </Text>
                <Text style={font.small}>{r.student.rollNumber}</Text>
              </View>
              {mode === "manual" ? (
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {STATUSES.map((o) => (
                    <TouchableOpacity key={o.key} onPress={() => setMarks((m) => ({ ...m, [r.student._id]: o.key }))}
                      style={[s.pill, st === o.key && { backgroundColor: o.color, borderColor: o.color }]}>
                      <Text style={[s.pillTxt, st === o.key && { color: "#fff" }]}>{o.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <MaterialCommunityIcons
                  name={["present", "late"].includes(st) ? "check-circle" : "circle-outline"}
                  size={26}
                  color={["present", "late"].includes(st) ? colors.success : colors.border}
                />
              )}
            </Card>
          );
        })}

        {mode === "manual" && list.length > 0 && <Button title="Submit attendance" onPress={submit} />}
        {mode === "qr" && (
          <Button title="Finish & close session" variant="outline" onPress={() => { setMode("manual"); submit(); }} />
        )}
      </AsyncBoundary>
    </Screen>
  );
}

const s = StyleSheet.create({
  qrCard: { alignItems: "center", gap: 12, paddingVertical: 20 },
  qr: { width: 250, height: 250, borderRadius: radius.md, backgroundColor: "#fff", ...shadow.card },
  summary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  student: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  pill: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  pillTxt: { fontWeight: "800", color: colors.textSoft },
});
