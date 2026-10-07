import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Screen, ScreenHeader } from "../../components/ui";
import { attendanceService } from "../../services/campusServices.js";
import { colors, font, radius } from "../../theme/theme.js";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState(null); // { ok, message }
  const [busy, setBusy] = useState(false);
  const locked = useRef(false); // camera fires many events per second

  const onScan = async ({ data }) => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    try {
      const res = await attendanceService.scan(data);
      setResult({ ok: true, message: res.subject?.name ? `Marked present in ${res.subject.name}` : res.message });
    } catch (e) {
      setResult({ ok: false, message: e.message });
    } finally {
      setBusy(false);
    }
  };

  const retry = () => {
    locked.current = false;
    setResult(null);
  };

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Scan attendance QR" subtitle="Point at the code on your teacher's screen" />

      {!permission ? null : !permission.granted ? (
        <View style={s.center}>
          <MaterialCommunityIcons name="camera-off-outline" size={56} color={colors.textMute} />
          <Text style={[font.h3, { marginTop: 12 }]}>Camera access needed</Text>
          <Text style={[font.small, { textAlign: "center", marginVertical: 8 }]}>
            Campus Sathi only uses the camera to read the attendance QR code.
          </Text>
          <Button title="Allow camera" onPress={requestPermission} style={{ marginTop: 8, alignSelf: "stretch" }} />
        </View>
      ) : result ? (
        <View style={s.center}>
          <View style={[s.resultIcon, { backgroundColor: result.ok ? colors.successSoft : colors.dangerSoft }]}>
            <MaterialCommunityIcons name={result.ok ? "check-bold" : "close-thick"} size={52} color={result.ok ? colors.success : colors.danger} />
          </View>
          <Text style={[font.h2, { marginTop: 18, textAlign: "center" }]}>{result.ok ? "Attendance marked!" : "Couldn't mark attendance"}</Text>
          <Text style={[font.body, { textAlign: "center", marginTop: 6, color: colors.textSoft }]}>{result.message}</Text>
          <View style={{ alignSelf: "stretch", gap: 10, marginTop: 24 }}>
            {result.ok ? (
              <Button title="View my attendance" onPress={() => router.replace("/attendance")} />
            ) : (
              <Button title="Scan again" onPress={retry} />
            )}
            <Button title="Done" variant="soft" onPress={() => router.back()} />
          </View>
        </View>
      ) : (
        <View style={s.cameraWrap}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={busy ? undefined : onScan}
          />
          <View style={s.overlay} pointerEvents="none">
            <View style={s.frame}>
              {["tl", "tr", "bl", "br"].map((c) => <View key={c} style={[s.corner, s[c]]} />)}
            </View>
            <Text style={s.hint}>{busy ? "Marking attendance..." : "Align the QR code inside the frame"}</Text>
          </View>
        </View>
      )}
    </Screen>
  );
}

const C = 28;
const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 12 },
  cameraWrap: { flex: 1, borderRadius: radius.xl, overflow: "hidden", backgroundColor: "#000", marginTop: 8 },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24 },
  frame: { width: 240, height: 240 },
  corner: { position: "absolute", width: C, height: C, borderColor: "#fff", borderWidth: 4 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 14 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 14 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 14 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 14 },
  hint: { color: "#fff", fontSize: 14, fontWeight: "600", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, overflow: "hidden" },
  resultIcon: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
});
