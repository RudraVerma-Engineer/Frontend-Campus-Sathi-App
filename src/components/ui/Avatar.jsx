import { Image, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "../../theme/theme.js";
import { initials } from "../../utils/format.js";

export default function Avatar({ user, size = 56 }) {
  if (user?.profilePhoto) {
    return <Image source={{ uri: user.profilePhoto }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <LinearGradient colors={gradients.brand} style={[s.box, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[s.txt, { fontSize: size * 0.38 }]}>{initials(user)}</Text>
    </LinearGradient>
  );
}
const s = StyleSheet.create({
  box: { alignItems: "center", justifyContent: "center" },
  txt: { color: "#fff", fontWeight: "800" },
});
