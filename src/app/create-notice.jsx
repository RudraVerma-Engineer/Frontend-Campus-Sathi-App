import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Chip, Screen, ScreenHeader, TextField } from "../components/ui";
import { noticeService } from "../services/campusServices.js";
import { colors, font } from "../theme/theme.js";
import { capitalize } from "../utils/format.js";

const CATEGORIES = ["academic", "exam", "placement", "scholarship", "event", "holiday", "administration", "other"];
const PRIORITIES = ["low", "medium", "high"];
const AUDIENCE = ["all", "students", "faculty"];

export default function CreateNotice() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("academic");
  const [priority, setPriority] = useState("medium");
  const [audience, setAudience] = useState("all");
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (title.trim().length < 3) return Alert.alert("Title needed", "Give the notice a clear title.");
    if (description.trim().length < 10) return Alert.alert("Add details", "Write at least a short description.");
    try {
      setBusy(true);
      const res = await noticeService.create({
        title: title.trim(), description: description.trim(), category, priority,
        targetAudience: audience, isPinned: pinned,
      });
      Alert.alert("Posted", res.message || "Notice created.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e) {
      Alert.alert("Could not post", e.message);
    } finally {
      setBusy(false);
    }
  };

  const Group = ({ label, items, value, onChange }) => (
    <View style={{ gap: 8 }}>
      <Text style={s.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {items.map((i) => <Chip key={i} label={capitalize(i)} active={value === i} onPress={() => onChange(i)} />)}
      </ScrollView>
    </View>
  );

  return (
    <Screen>
      <ScreenHeader title="New notice" subtitle="Visible to students after approval" />
      <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Mid-sem exam schedule" maxLength={120} />
      <TextField label="Details" value={description} onChangeText={setDescription} multiline placeholder="Write the full notice..." />
      <Group label="Category" items={CATEGORIES} value={category} onChange={setCategory} />
      <Group label="Priority" items={PRIORITIES} value={priority} onChange={setPriority} />
      <Group label="Audience" items={AUDIENCE} value={audience} onChange={setAudience} />
      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Pin to top</Text>
          <Text style={font.small}>Keep this notice at the top of the board</Text>
        </View>
        <Switch value={pinned} onValueChange={setPinned} trackColor={{ true: colors.primary }} />
      </View>
      <Button title="Post notice" onPress={submit} loading={busy} />
    </Screen>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: colors.text },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
});
