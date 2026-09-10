import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, ScreenHeader, StatusPill } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { ROUTES, getRoute } from "@/lib/transport-data";

const departures = ["05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
export default function TimetableScreen() {
  const params = useLocalSearchParams<{ route?: string }>();
  const colors = useColors();
  const selectedRoute = params.route ? getRoute(String(params.route)) : undefined;
  const route = selectedRoute ?? ROUTES[0];
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}><ScreenHeader title="Timetable" subtitle="Scheduled departures by route" /><ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5"><View className="flex-row gap-2">{ROUTES.map((item) => <Pressable key={item.id} onPress={() => undefined} style={{ backgroundColor: item.id === route.id ? colors.primary : colors.surface }} className="rounded-full border border-border px-4 py-2.5"><Text style={{ color: item.id === route.id ? "#FFFFFF" : colors.foreground }} className="text-xs font-black">Route {item.label}</Text></Pressable>)}</View></ScrollView><Card><View className="flex-row items-center"><View style={{ backgroundColor: route.color }} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"><Text className="text-lg font-black text-white">{route.label}</Text></View><View className="flex-1"><Text className="text-lg font-black text-foreground">{route.origin} → {route.destination}</Text><Text className="mt-1 text-xs text-muted">{route.firstBus} first · {route.lastBus} last · {route.frequency}</Text></View></View></Card><View className="mt-6"><View className="mb-3 flex-row items-center justify-between"><Text className="text-xl font-black text-foreground">Scheduled departures</Text><StatusPill label="SCHEDULED" tone="muted" /></View><Card><View className="flex-row flex-wrap gap-2">{departures.map((time) => <View key={time} style={{ backgroundColor: colors.surfaceAlt }} className="w-[22%] rounded-xl px-2 py-3"><Text className="text-center text-xs font-bold text-foreground">{time}</Text></View>)}</View></Card></View><View className="mt-6"><View className="mb-3 flex-row items-center justify-between"><Text className="text-xl font-black text-foreground">Live ETA</Text><StatusPill label="LIVE DEMO" tone="success" /></View><Card><View className="flex-row items-center gap-3"><MaterialIcons name="info-outline" size={20} color={colors.primary} /><Text className="flex-1 text-sm leading-5 text-muted">Live ETAs are powered by the simulated GPS demo and are intentionally shown separately from scheduled departures.</Text></View></Card></View><Text className="mt-6 text-center text-xs leading-5 text-muted">Schedule shown is for demonstration purposes and is not official timetable data.</Text></ScrollView></ScreenContainer>;
}
