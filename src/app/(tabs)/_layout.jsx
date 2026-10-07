import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/theme.js";

// TabIcon — plain View, NO SafeAreaView inside icon
function TabIcon({ name, focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <MaterialCommunityIcons
        name={name}
        size={24}
        color={focused ? colors.primary : colors.textMute}
      />
    </View>
  );
}

export default function TabLayout() {
  // Gets real bottom inset:
  //   Gesture nav phones  → ~34px (the home bar area)
  //   Button nav phones   → ~0–16px
  //   No nav bar          → 0
  const insets = useSafeAreaInsets();

  // Total tab bar height = content (icon+label) + device bottom inset
  const TAB_HEIGHT = 58 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: TAB_HEIGHT,
            paddingBottom: insets.bottom + 4,
          },
        ],
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMute,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          title: "Notices",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "bell" : "bell-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ focused }) => (
            // Fixed typo: "calender-month" → "calendar-month"
            <TabIcon
              name={focused ? "calendar-month" : "calendar-month-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="placements"
        options={{
          title: "Placements",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "briefcase" : "briefcase-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "account" : "account-outline"}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
    // height + paddingBottom set dynamically via insets above
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  iconWrap: {
    width: 44,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapActive: {
    backgroundColor: colors.primarySoft,
  },
});
