import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../../context/AuthContext.jsx";
import useAsync from "../../hooks/useAsync.js";
import { AsyncBoundary, Badge, Button, Card, Screen, ScreenHeader, TextField } from "../../components/ui";
import { assignmentService } from "../../services/campusServices.js";
import { colors, font } from "../../theme/theme.js";
import { formatDate, formatTime, fullName } from "../../utils/format.js";

export default function AssignmentDetail() {
  const { id } = useLocalSearchParams();
  const { isFaculty } = useAuth();
  const state = useAsync(() => assignmentService.get(id), [id]);
  const a = state.data?.assignment;

  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [grading, setGrading] = useState({}); // { studentId: { marks, feedback } }

  const mine = a?.mySubmission;
  const overdue = a && new Date(a.dueDate) < new Date();
  const graded = mine?.marks !== undefined;

  const submit = async () => {
    if (!text.trim() && !link.trim()) return Alert.alert("Nothing to submit", "Write your answer or paste a link to your work.");
    try {
      setBusy(true);
      const res = await assignmentService.submit(id, { text: text.trim() || undefined, link: link.trim() || undefined });
      Alert.alert("Done", res.message);
      await state.refresh();
    } catch (e) {
      Alert.alert("Could not submit", e.message);
    } finally {
      setBusy(false);
    }
  };

  const grade = async (studentId) => {
    const g = grading[studentId] || {};
    try {
      await assignmentService.grade(id, studentId, { marks: Number(g.marks), feedback: g.feedback });
      await state.refresh();
    } catch (e) {
      Alert.alert("Could not grade", e.message);
    }
  };

  return (
    <Screen onRefresh={state.refresh} refreshing={state.refreshing}>
      <ScreenHeader title="Assignment" />
      <AsyncBoundary state={state}>
        {a && (
          <>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Badge label={a.subject?.code || "SUBJ"} bg={colors.primarySoft} color={colors.primary} />
              <Badge label={`${a.maxMarks} marks`} bg={colors.borderSoft} color={colors.textSoft} />
            </View>
            <Text style={s.title}>{a.title}</Text>
            <Text style={font.small}>{a.subject?.name} • by {fullName(a.faculty)}</Text>
            <Card style={{ gap: 4 }}>
              <Text style={font.small}>DUE</Text>
              <Text style={[font.h3, overdue && !mine && { color: colors.danger }]}>
                {formatDate(a.dueDate)} • {formatTime(a.dueDate)}{overdue && !mine ? "  (overdue)" : ""}
              </Text>
            </Card>
            {a.description ? <Text style={[font.body, { lineHeight: 22 }]}>{a.description}</Text> : null}

            {/* ───── student view ───── */}
            {!isFaculty && (
              <>
                {mine && (
                  <Card style={{ gap: 6, backgroundColor: graded ? "#F5F3FF" : colors.successSoft }}>
                    <Text style={font.h3}>{graded ? `Graded: ${mine.marks} / ${a.maxMarks}` : "✓ Submitted"}{mine.isLate ? " (late)" : ""}</Text>
                    <Text style={font.small}>On {formatDate(mine.submittedAt)} • {formatTime(mine.submittedAt)}</Text>
                    {mine.feedback ? <Text style={font.body}>Feedback: {mine.feedback}</Text> : null}
                  </Card>
                )}
                {!graded && (
                  <View style={{ gap: 12 }}>
                    <Text style={font.h3}>{mine ? "Update your submission" : "Your submission"}</Text>
                    <TextField label="Answer / notes" value={text} onChangeText={setText} multiline placeholder="Type your answer..." />
                    <TextField label="Link (GitHub, Drive...)" value={link} onChangeText={setLink} autoCapitalize="none" placeholder="https://" />
                    <Button title={mine ? "Resubmit" : overdue ? "Submit late" : "Submit"} onPress={submit} loading={busy} />
                  </View>
                )}
              </>
            )}

            {/* ───── faculty view ───── */}
            {isFaculty && (
              <View style={{ gap: 10 }}>
                <Text style={font.h3}>Submissions ({a.submissions?.length || 0})</Text>
                {(a.submissions || []).length === 0 && <Text style={font.small}>No submissions yet.</Text>}
                {(a.submissions || []).map((sub) => {
                  const sid = sub.student._id;
                  const g = grading[sid] || {};
                  return (
                    <Card key={sid} style={{ gap: 8 }}>
                      <Text style={font.h3}>{fullName(sub.student)}</Text>
                      <Text style={font.small}>{sub.student.rollNumber} • {formatDate(sub.submittedAt)}{sub.isLate ? " • LATE" : ""}</Text>
                      {sub.text ? <Text style={font.body}>{sub.text}</Text> : null}
                      {sub.link ? <Text style={[font.body, { color: colors.primary }]}>{sub.link}</Text> : null}
                      {sub.marks !== undefined ? (
                        <Text style={[font.body, { fontWeight: "700", color: "#6D28D9" }]}>Graded {sub.marks}/{a.maxMarks}</Text>
                      ) : (
                        <View style={{ gap: 8 }}>
                          <TextField placeholder={`Marks (0-${a.maxMarks})`} keyboardType="decimal-pad" value={g.marks || ""}
                            onChangeText={(v) => setGrading((p) => ({ ...p, [sid]: { ...g, marks: v } }))} />
                          <TextField placeholder="Feedback (optional)" value={g.feedback || ""}
                            onChangeText={(v) => setGrading((p) => ({ ...p, [sid]: { ...g, feedback: v } }))} />
                          <Button title="Save grade" small onPress={() => grade(sid)} />
                        </View>
                      )}
                    </Card>
                  );
                })}
              </View>
            )}
          </>
        )}
      </AsyncBoundary>
    </Screen>
  );
}

const s = StyleSheet.create({ title: { ...font.h1, fontSize: 24, lineHeight: 30 } });
