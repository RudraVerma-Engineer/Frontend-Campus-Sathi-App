import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext.jsx";
import useAsync from "../../hooks/useAsync.js";
import {
  Avatar,
  Badge,
  Card,
  ProgressBar,
  Screen,
  SectionTitle,
} from "../../components/ui";
import {
  attendanceService,
  eventService,
  noticeService,
  timetableService,
} from "../../services/campusServices.js";
import {
  attendanceColor,
  colors,
  font,
  gradients,
  priorityStyle,
  radius,
  shadow,
} from "../../theme/theme.js";
import {
  firstName,
  formatDate,
  greeting,
  timeAgo,
  to12h,
} from "../../utils/format.js";

const STUDENT_ACTIONS = [
  {
    icon: "calendar-clock",
    label: "Timetable",
    route: "/timetable",
    colors: gradients.brand,
  },
  {
    icon: "qrcode-scan",
    label: "Scan QR",
    route: "/attendance/scan",
    colors: gradients.emerald,
  },
  {
    icon: "chart-donut",
    label: "Attendance",
    route: "/attendance",
    colors: gradients.violet,
  },
  {
    icon: "clipboard-text-outline",
    label: "Assignments",
    route: "/assignments",
    colors: gradients.amber,
  },
];
const FACULTY_ACTIONS = [
  {
    icon: "calendar-clock",
    label: "Timetable",
    route: "/timetable",
    colors: gradients.brand,
  },
  {
    icon: "account-check-outline",
    label: "Take attendance",
    route: "/attendance/take",
    colors: gradients.emerald,
  },
  {
    icon: "clipboard-text-outline",
    label: "Assignments",
    route: "/assignments",
    colors: gradients.amber,
  },
  {
    icon: "bullhorn-outline",
    label: "Post notice",
    route: "/create-notice",
    colors: gradients.violet,
  },
];

const settled = (r) => (r.status === "fulfilled" ? r.value : null);

export default function HomeScreen() {
  const { user, isFaculty } = useAuth();

  const state = useAsync(async () => {
    const [tt, notices, events, att] = await Promise.allSettled([
      timetableService.mine(),
      noticeService.list({ limit: 3 }),
      eventService.list({ limit: 3 }),
      isFaculty ? Promise.resolve(null) : attendanceService.summary(user._id),
    ]);
    return {
      tt: settled(tt),
      notices: settled(notices),
      events: settled(events),
      att: settled(att),
    };
  }, [user?._id]);

  const d = state.data;
  const today = d?.tt?.today;
  const todaysClasses = (today && d?.tt?.days?.[today]) || [];
  const pct = d?.att?.attendancePercentage ?? 0;
  const actions = isFaculty ? FACULTY_ACTIONS : STUDENT_ACTIONS;

  return (
    <Screen onRefresh={state.refresh} refreshing={state.refreshing}>
      {/* header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.greet}>{greeting().toUpperCase()}</Text>
          <Text style={s.name}>{firstName(user)} 👋</Text>
          <Text style={font.small}>
            {isFaculty
              ? `${user?.department} • ${user?.role}`
              : `${user?.department} • Semester ${user?.semester} • Sec ${user?.section || "-"}`}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <Avatar user={user} size={52} />
        </TouchableOpacity>
      </View>

      {/* attendance hero (students) */}
      {!isFaculty && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/attendance")}
        >
          <LinearGradient
            colors={gradients.night}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={s.heroLabel}>OVERALL ATTENDANCE</Text>
              <Text style={s.heroPct}>
                {state.loading && !d ? "--" : `${pct}%`}
              </Text>
              <ProgressBar value={pct} color={attendanceColor(pct)} />
              <Text style={s.heroSub}>
                {d?.att
                  ? d.att.totalClasses
                    ? `${d.att.totalPresent} of ${d.att.totalClasses} classes attended`
                    : "No classes recorded yet"
                  : "Tap to view details"}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={28}
              color="rgba(255,255,255,0.7)"
            />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* quick actions */}
      <View style={s.grid}>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.label}
            style={s.action}
            activeOpacity={0.85}
            onPress={() => router.push(a.route)}
          >
            <LinearGradient colors={a.colors} style={s.actionIcon}>
              <MaterialCommunityIcons name={a.icon} size={24} color="#fff" />
            </LinearGradient>
            <Text style={s.actionLabel} numberOfLines={1}>
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* today's classes */}
      <View style={{ gap: 10 }}>
        <SectionTitle
          title={`Today${today ? ` • ${today}` : ""}`}
          action="Full timetable"
          onAction={() => router.push("/timetable")}
        />
        {d?.tt?.needsSection ? (
          <Card>
            <Text style={font.body}>
              Add your section in Profile → Account settings to see your
              timetable.
            </Text>
          </Card>
        ) : todaysClasses.length === 0 ? (
          <Card>
            <Text style={font.body}>
              {state.loading && !d
                ? "Loading classes..."
                : "No classes scheduled today 🎉"}
            </Text>
          </Card>
        ) : (
          todaysClasses.map((c) => (
            <Card key={c._id} style={s.classRow}>
              <View style={s.timeCol}>
                <Text style={s.time}>{to12h(c.startTime)}</Text>
                <Text style={font.small}>{to12h(c.endTime)}</Text>
              </View>
              <View style={s.divider} />
              <View style={{ flex: 1 }}>
                <Text style={font.h3} numberOfLines={1}>
                  {c.subject?.name}
                </Text>
                <Text style={font.small} numberOfLines={1}>
                  {isFaculty
                    ? `Sec ${c.section?.name}`
                    : c.faculty?.fullname?.firstname
                      ? `${c.faculty.fullname.firstname} ${c.faculty.fullname.lastname || ""}`
                      : "Faculty"}
                  {c.room ? ` • Room ${c.room}` : ""}
                </Text>
              </View>
              {c.lectureType === "lab" && (
                <Badge label="LAB" bg={colors.warningSoft} color="#B45309" />
              )}
            </Card>
          ))
        )}
      </View>

      {/* notices */}
      <View style={{ gap: 10 }}>
        <SectionTitle
          title="Latest notices"
          action="See all"
          onAction={() => router.push("/(tabs)/notices")}
        />
        {(d?.notices?.notices || []).length === 0 ? (
          <Card>
            <Text style={font.body}>
              {state.loading && !d ? "Loading..." : "No notices right now."}
            </Text>
          </Card>
        ) : (
          d.notices.notices.map((n) => {
            const p = priorityStyle[n.priority] || priorityStyle.low;
            return (
              <Card
                key={n._id}
                onPress={() => router.push(`/notice/${n._id}`)}
                style={{ gap: 6 }}
              >
                <View style={s.rowBetween}>
                  <Badge label={p.label} bg={p.bg} color={p.text} />
                  <Text style={font.small}>{timeAgo(n.createdAt)}</Text>
                </View>
                <Text
                  style={[font.h3, !n.isRead && { color: colors.primary }]}
                  numberOfLines={2}
                >
                  {n.title}
                </Text>
              </Card>
            );
          })
        )}
      </View>

      {/* events */}
      <View style={{ gap: 10 }}>
        <SectionTitle
          title="Upcoming events"
          action="See all"
          onAction={() => router.push("/(tabs)/events")}
        />
        {(d?.events?.events || []).length === 0 ? (
          <Card>
            <Text style={font.body}>
              {state.loading && !d ? "Loading..." : "No upcoming events."}
            </Text>
          </Card>
        ) : (
          d.events.events.map((e) => (
            <Card
              key={e._id}
              onPress={() => router.push(`/event/${e._id}`)}
              style={s.eventRow}
            >
              <LinearGradient colors={gradients.brand} style={s.dateBox}>
                <Text style={s.dateDay}>{new Date(e.startDate).getDate()}</Text>
                <Text style={s.dateMon}>
                  {formatDate(e.startDate, { month: "short" }).toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={font.h3} numberOfLines={1}>
                  {e.title}
                </Text>
                <Text style={font.small} numberOfLines={1}>
                  {e.venue || e.mode}
                </Text>
              </View>
              {e.isRegistered && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={22}
                  color={colors.success}
                />
              )}
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  greet: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textSoft,
  },
  name: { ...font.h1, marginVertical: 2 },
  hero: {
    borderRadius: radius.xl,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    ...shadow.lift,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  heroPct: { color: colors.white, fontSize: 40, fontWeight: "800" },
  heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  grid: { flexDirection: "row", justifyContent: "space-between" },
  action: { width: "23%", alignItems: "center", gap: 8 },
  actionIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  classRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  timeCol: { width: 62, alignItems: "flex-start" },
  time: { fontWeight: "700", fontSize: 13, color: colors.primary },
  divider: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
    backgroundColor: colors.primarySoft,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  dateBox: {
    width: 50,
    height: 54,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  dateDay: { color: "#fff", fontSize: 18, fontWeight: "800" },
  dateMon: { color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: "700" },
});
