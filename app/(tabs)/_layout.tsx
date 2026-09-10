import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 8 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarStyle: { height: 62 + bottomPadding, paddingBottom: bottomPadding, paddingTop: 8, backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 }, tabBarLabelStyle: { fontSize: 11, fontWeight: "700" } }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={23} color={color} /> }} />
    <Tabs.Screen name="track" options={{ title: "Track", tabBarIcon: ({ color }) => <IconSymbol name="location.fill" size={23} color={color} /> }} />
    <Tabs.Screen name="routes" options={{ title: "Routes", tabBarIcon: ({ color }) => <IconSymbol name="map.fill" size={23} color={color} /> }} />
    <Tabs.Screen name="nearby" options={{ title: "Nearby", tabBarIcon: ({ color }) => <IconSymbol name="mappin.and.ellipse" size={23} color={color} /> }} />
    <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color }) => <IconSymbol name="ellipsis.circle.fill" size={23} color={color} /> }} />
    <Tabs.Screen name="profile" options={{ href: null }} />
  </Tabs>;
}
