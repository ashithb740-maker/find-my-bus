import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BusMap } from "@/components/bus-map";
import { Card, IconButton, PrimaryButton, ScreenHeader, StatusPill } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppState } from "@/lib/app-state";
import { getRoute, getStop } from "@/lib/transport-data";

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { buses, savedRoutes, toggleSaved } = useAppState();
  const route = getRoute(String(id)) ?? getRoute("101")!;
  const routeBuses = buses.filter((bus) => bus.routeId === route.id);
  const saved = savedRoutes.includes(route.id);
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}><ScreenHeader title={`Route ${route.label}`} subtitle={`${route.origin} → ${route.destination}`} right={<IconButton icon={saved ? "favorite" : "favorite-border"} color={saved ? colors.error : colors.muted} onPress={() => toggleSaved("route", route.id)} />} /><View className="flex-row items-center gap-2"><StatusPill label={`${routeBuses.length} active buses`} /><Text className="text-xs text-muted">{route.frequency}</Text></View><View className="mt-4"><BusMap buses={routeBuses} selectedBusId={routeBuses[0]?.id} onSelectBus={(busId) => router.push(`/bus/${busId}`)} /></View><Card className="mt-5"><View className="flex-row justify-between"><RouteMetric label="Journey" value={`${route.duration} min`} /><RouteMetric label="Fare from" value={`₹${route.fare}`} /><RouteMetric label="First bus" value={route.firstBus} /><RouteMetric label="Last bus" value={route.lastBus} /></View></Card><View className="mt-6"><Text className="mb-3 text-xl font-black text-foreground">Stops on this route</Text><View className="gap-0">{route.stopIds.map((stopId, index) => { const stop = getStop(stopId)!; const isLast = index === route.stopIds.length - 1; return <Pressable key={stopId} onPress={() => router.push(`/stop/${stop.id}`)} className="flex-row"><View className="mr-3 w-7 items-center">{!isLast ? <View className="absolute top-5 h-12 w-0.5 bg-border" /> : null}<View style={{ backgroundColor: index === 0 || isLast ? route.color : colors.surface }} className="z-10 h-4 w-4 rounded-full border-2 border-primary" /></View><View className="mb-3 flex-1 rounded-2xl bg-surface px-4 py-3"><View className="flex-row items-center justify-between"><Text className="font-bold text-foreground">{stop.name}</Text><MaterialIcons name="chevron-right" size={18} color={colors.muted} /></View><Text className="mt-1 text-xs text-muted">{index === 0 ? "Origin" : isLast ? "Destination" : `Stop ${index + 1}`}</Text></View></Pressable>; })}</View></View><View className="mt-4 flex-row gap-3"><PrimaryButton title="Timetable" icon="schedule" variant="soft" onPress={() => router.push(`/timetable?route=${route.id}`)} style={{ flex: 1 }} /><PrimaryButton title="Fare calculator" icon="currency-rupee" variant="outline" onPress={() => router.push(`/fare?route=${route.id}`)} style={{ flex: 1 }} /></View><Text className="mt-6 text-center text-xs leading-5 text-muted">Route geometry, fares and timetables are demonstration data.</Text></ScrollView></ScreenContainer>;
}
function RouteMetric({ label, value }: { label: string; value: string }) { const colors = useColors(); return <View className="items-center"><Text className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</Text><Text style={{ color: colors.primary }} className="mt-1 text-xs font-black">{value}</Text></View>; }
