import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import useAsync from "../../hooks/useAsync.js";
import { AsyncBoundary, Badge, Button, Card, Screen, ScreenHeader } from "../../components/ui";
import { placementService } from "../../services/campusServices.js";
import { applicationStatusStyle, colors, font, radius } from "../../theme/theme.js";
import { capitalize, daysUntil, formatDate } from "../../utils/format.js";

const Fact = ({ icon, label, value }) => (
  <View style={s.fact}>
    <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
    <Text style={s.factVal}>{value}</Text>
    <Text style={font.small}>{label}</Text>
  </View>
);

export default function PlacementDetail() {
  const { id } = useLocalSearchParams();
  const state = useAsync(() => placementService.get(id), [id]);
  const [busy, setBusy] = useState(false);
  const d = state.data?.drive;

  const apply = () =>
    Alert.alert("Apply to this drive?", `${d.company?.companyName} • ${d.role}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Apply",
        onPress: async () => {
          try {
            setBusy(true);
            await placementService.apply(id);
            await state.refresh();
          } catch (e) {
            Alert.alert("Could not apply", e.message);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);

  const st = d?.myStatus ? applicationStatusStyle[d.myStatus] : null;
  const left = d ? daysUntil(d.applicationDeadline) : 0;
  const canApply = d && !d.myStatus && d.status === "open" && !d.deadlinePassed && d.isEligible;

  return (
    <Screen onRefresh={state.refresh} refreshing={state.refreshing}>
      <ScreenHeader title="Placement drive" />
      <AsyncBoundary state={state}>
        {d && (
          <>
            <Card style={{ gap: 6 }}>
              <Text style={s.company}>{d.company?.companyName}</Text>
              <Text style={font.h3}>{d.role}</Text>
              <Text style={font.small}>{d.company?.industry} • {capitalize(d.jobType)}{d.location ? ` • ${d.location}` : ""}</Text>
              {st && <Badge label={`Your status: ${st.label}`} bg={st.bg} color={st.text} style={{ marginTop: 8 }} />}
            </Card>

            <View style={s.facts}>
              <Fact icon="currency-inr" label="Package" value={d.packageLPA ? `₹${d.packageLPA}L` : "—"} />
              <Fact icon="school-outline" label="Min CGPA" value={d.minCGPA || "Any"} />
              <Fact icon="account-multiple-outline" label="Applied" value={d.applicantCount} />
            </View>

            <Card style={{ gap: 10 }}>
              <Text style={font.h3}>Eligibility</Text>
              <Text style={font.body}>Departments: {d.departments?.length ? d.departments.join(", ") : "All departments"}</Text>
              <Text style={font.body}>Minimum CGPA: {d.minCGPA || "No minimum"}</Text>
              {!d.isEligible && <Text style={[font.body, { color: colors.danger, fontWeight: "700" }]}>✗ {d.ineligibleReason}</Text>}
              {d.isEligible && <Text style={[font.body, { color: "#047857", fontWeight: "700" }]}>✓ You meet the criteria</Text>}
            </Card>

            <Card style={{ gap: 6 }}>
              <Text style={font.h3}>Dates</Text>
              <Text style={font.body}>Apply by {formatDate(d.applicationDeadline)} {d.deadlinePassed ? "(closed)" : `• ${Math.max(left, 0)} day(s) left`}</Text>
              {d.driveDate && <Text style={font.body}>Drive on {formatDate(d.driveDate)}</Text>}
            </Card>

            {d.description ? (
              <View style={{ gap: 6 }}>
                <Text style={font.h3}>About the role</Text>
                <Text style={[font.body, { lineHeight: 22 }]}>{d.description}</Text>
              </View>
            ) : null}

            {canApply ? (
              <Button title="Apply now" onPress={apply} loading={busy} />
            ) : !d.myStatus ? (
              <Button title={d.deadlinePassed || d.status !== "open" ? "Applications closed" : "Not eligible"} disabled variant="soft" />
            ) : null}
          </>
        )}
      </AsyncBoundary>
    </Screen>
  );
}

const s = StyleSheet.create({
  company: { fontSize: 24, fontWeight: "800", color: colors.text },
  facts: { flexDirection: "row", gap: 10 },
  fact: { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, alignItems: "center", paddingVertical: 14, gap: 4, borderWidth: 1, borderColor: colors.borderSoft },
  factVal: { fontSize: 18, fontWeight: "800", color: colors.text },
});
