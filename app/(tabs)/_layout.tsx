import { Tabs } from "expo-router";
import { View, Platform, ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, FONT_WEIGHTS } from "../../src/constants";

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: ColorValue }) {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    index: focused ? "home" : "home-outline",
    browse: focused ? "search" : "search-outline",
    library: focused ? "book" : "book-outline",
    profile: focused ? "person" : "person-outline",
  };
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={icons[name]} size={24} color={String(color)} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => <TabIcon name="index" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, focused }) => <TabIcon name="browse" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, focused }) => <TabIcon name="library" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <TabIcon name="profile" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}
