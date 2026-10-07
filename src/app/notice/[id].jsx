import { useEffect } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import useAsync from "../../hooks/useAsync.js";
import { AsyncBoundary, Badge, Card, Screen, ScreenHeader } from "../../components/ui";
import { noticeService } from "../../services/campusServices.js";
import { colors, font, priorityStyle } from "../../theme/theme.js";
import { capitalize, fullName, formatDate, formatTime } from "../../utils/format.js";

export default function NoticeDetail() {
  const { id } = useLocalSearchParams();
  const state = useAsync(() => noticeService.get(id), [id]);
  const n = state.data?.notice;

  // opening a notice marks it as read (fire and forget)
  useEffect(() => {
    if (n) noticeService.markRead(id).catch(() => {});
  }, [n, id]);

  const p = priorityStyle[n?.priority] || priorityStyle.low;

  return (
    <Screen onRefresh={state.refresh} refreshing={state.refreshing}>
      <ScreenHeader title="Notice" />
      <AsyncBoundary state={state}>
        {n && (
          <>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <Badge label={p.label} bg={p.bg} color={p.text} />
              <Badge label={capitalize(n.category || "other")} bg={colors.primarySoft} color={colors.primary} />
              {n.isPinned && <Badge label="📌 Pinned" bg={colors.warningSoft} color="#B45309" />}
            </View>
            <Text style={s.title}>{n.title}</Text>
            <View style={s.meta}>
              <MaterialCommunityIcons name="account-circle-outline" size={18} color={colors.textSoft} />
              <Text style={font.small}>
                {fullName(n.createdBy) || "Campus"}{n.createdBy?.role ? ` • ${capitalize(n.createdBy.role)}` : ""}
              </Text>
            </View>
            <View style={s.meta}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.textSoft} />
              <Text style={font.small}>{formatDate(n.createdAt)} • {formatTime(n.createdAt)}</Text>
              <MaterialCommunityIcons name="eye-outline" size={18} color={colors.textSoft} style={{ marginLeft: 10 }} />
              <Text style={font.small}>{n.views || 0}</Text>
            </View>
            <Card><Text style={s.body}>{n.description}</Text></Card>

            {n.attachments?.length > 0 && (
              <View style={{ gap: 8 }}>
                <Text style={font.h3}>Attachments</Text>
                {n.attachments.map((a, i) => (
                  <Card key={i} onPress={() => Linking.openURL(a.url)} style={s.file}>
                    <MaterialCommunityIcons name="paperclip" size={22} color={colors.primary} />
                    <Text style={[font.body, { flex: 1 }]} numberOfLines={1}>{a.originalName || `Attachment ${i + 1}`}</Text>
                    <MaterialCommunityIcons name="open-in-new" size={20} color={colors.textMute} />
                  </Card>
                ))}
              </View>
            )}
            {n.expiresAt && <Text style={font.small}>Valid until {formatDate(n.expiresAt)}</Text>}
          </>
        )}
      </AsyncBoundary>
    </Screen>
  );
}

const s = StyleSheet.create({
  title: { ...font.h1, fontSize: 24, lineHeight: 30 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  body: { ...font.body, fontSize: 15, lineHeight: 23 },
  file: { flexDirection: "row", alignItems: "center", gap: 10 },
});
