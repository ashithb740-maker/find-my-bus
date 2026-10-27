import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, ScreenHeader } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppState } from "@/lib/app-state";

export default function ProfileScreen() {
  const c = useColors();
  const { savedBuses, savedRoutes, savedStops, alerts } = useAppState();
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader title="Your profile" subtitle="Your travel shortcuts and preferences" back={false} />
      <View style={{ backgroundColor: c.primary }} className="mt-3 items-center rounded-[28px] px-5 py-7">
        <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-white/60 bg-white/15"><MaterialIcons name="person" size={43} color="#fff" /></View>
        <Text className="mt-4 text-2xl font-black text-white">Passenger</Text>
        <Text className="mt-1 text-sm text-white/80">Guest profile · No account required</Text>
        <View className="mt-5 flex-row gap-3">
          <ProfileStat label="Saved buses" value={String(savedBuses.length)} />
          <ProfileStat label="Saved routes" value={String(savedRoutes.length)} />
          <ProfileStat label="Alerts" value={String(alerts.length)} />
        </View>
      </View>
      <Text className="mb-3 mt-7 text-lg font-black text-foreground">Your travel tools</Text>
      <View className="gap-3">
        <ProfileRow icon="favorite-border" title="Saved items" subtitle={`${savedBuses.length} buses · ${savedRoutes.length} routes · ${savedStops.length} stops`} onPress={() => router.push("/saved")} />
        <ProfileRow icon="notifications-none" title="Arrival alerts" subtitle={alerts.length ? `${alerts.length} alerts configured` : "No alerts set yet"} onPress={() => router.push("/alerts")} />
        <ProfileRow icon="schedule" title="Timetables" subtitle="Browse scheduled departures" onPress={() => router.push("/timetable")} />
        <ProfileRow icon="settings" title="App settings & more" subtitle="Connection mode and passenger tools" onPress={() => router.push("/(tabs)/more")} />
      </View>
      <Card className="mt-6">
        <View className="flex-row items-start gap-3"><MaterialIcons name="info-outline" size={21} color={c.primary} /><View className="flex-1"><Text className="font-extrabold text-foreground">Guest mode</Text><Text className="mt-1 text-xs leading-5 text-muted">You can use Find My Bus without signing in. Saved items and preferences stay on this device. An account system can be added later if you need profiles shared across devices.</Text></View></View>
      </Card>
    </ScrollView>
  </ScreenContainer>;
}
function ProfileStat({label,value}:{label:string;value:string}) { return <View className="min-w-[86px] items-center rounded-2xl bg-white/15 px-3 py-3"><Text className="text-xl font-black text-white">{value}</Text><Text className="mt-1 text-[10px] font-bold text-white/80">{label}</Text></View>; }
function ProfileRow({icon,title,subtitle,onPress}:{icon:keyof typeof MaterialIcons.glyphMap;title:string;subtitle:string;onPress:()=>void}) { const c=useColors();return <Pressable onPress={onPress} className="flex-row items-center rounded-2xl border border-border bg-surface px-4 py-4"><View style={{backgroundColor:c.primarySoft}} className="mr-3 h-11 w-11 items-center justify-center rounded-xl"><MaterialIcons name={icon} size={21} color={c.primary}/></View><View className="flex-1"><Text className="font-extrabold text-foreground">{title}</Text><Text className="mt-1 text-xs text-muted">{subtitle}</Text></View><MaterialIcons name="chevron-right" size={21} color={c.muted}/></Pressable>; }
