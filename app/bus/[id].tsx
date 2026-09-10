import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BusMap } from "@/components/bus-map";
import { Card, IconButton, PrimaryButton, ScreenHeader, StatusPill } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppState } from "@/lib/app-state";
import { getRoute } from "@/lib/transport-data";

export default function BusDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { buses, savedBuses, toggleSaved, addAlert, isOffline } = useAppState();
  const bus = useMemo(() => buses.find((item) => item.id === id) ?? buses[0], [buses, id]);
  const route = getRoute(bus.routeId);
  const saved = savedBuses.includes(bus.id);
  const progress = Math.round(bus.progress * 100);
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}><ScreenHeader title={bus.id} subtitle={bus.vehicle} right={<IconButton icon={saved ? "favorite" : "favorite-border"} color={saved ? colors.error : colors.muted} onPress={() => toggleSaved("bus", bus.id)} />} /><View className="flex-row items-center gap-2"><StatusPill label={isOffline ? "OFFLINE" : bus.status === "DELAYED" ? "DELAYED" : "LIVE"} tone={isOffline || bus.status === "DELAYED" ? "warning" : "success"} /><Text className="text-sm text-muted">Route {route?.label} · {route?.origin} → {route?.destination}</Text></View><View className="mt-4"><BusMap buses={[bus]} selectedBusId={bus.id} /></View><Card className="mt-4"><View className="flex-row items-center"><View className="flex-1"><Text className="text-xs font-bold uppercase tracking-wider text-muted">Current location</Text><Text className="mt-1 text-xl font-black text-foreground">{bus.currentStop}</Text></View><MaterialIcons name="arrow-forward" size={22} color={colors.primary} /><View className="flex-1 items-end"><Text className="text-xs font-bold uppercase tracking-wider text-muted">Next stop</Text><Text className="mt-1 text-right text-xl font-black text-foreground">{bus.nextStop}</Text></View></View><View className="mt-5 flex-row justify-between border-t border-border pt-4"><Metric icon="schedule" label="ETA" value={`${bus.eta} min`} /><Metric icon="speed" label="Speed" value={`${bus.speed} km/h`} /><Metric icon="update" label="Updated" value={isOffline ? "Last known" : "just now"} /></View></Card><View className="mt-5"><View className="mb-2 flex-row items-center justify-between"><Text className="font-bold text-foreground">Trip progress</Text><Text style={{ color: colors.primary }} className="font-black">{progress}%</Text></View><View className="h-2 overflow-hidden rounded-full bg-surfaceAlt"><View style={{ width: `${Math.max(5, progress)}%`, backgroundColor: colors.primary }} className="h-full rounded-full" /></View><View className="mt-2 flex-row justify-between"><Text className="text-xs text-muted">{route?.origin}</Text><Text className="text-xs text-muted">{route?.destination}</Text></View></View><View className="mt-6 gap-3"><PrimaryButton title="Set arrival alert" icon="notifications-active" onPress={() => { addAlert(bus.id, bus.nextStop); router.push("/alerts"); }} /><View className="flex-row gap-3"><PrimaryButton title="View route" icon="map" variant="soft" onPress={() => router.push(`/route/${bus.routeId}`)} style={{ flex: 1 }} /><PrimaryButton title="Share" icon="share" variant="outline" onPress={() => undefined} style={{ flex: 1 }} /></View></View><Text className="mt-6 text-center text-xs leading-5 text-muted">This is a simulated GPS demonstration. It is not an official live service feed.</Text></ScrollView></ScreenContainer>;
}
function Metric({ icon, label, value }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string }) { const colors = useColors(); return <View className="flex-1 items-center"><MaterialIcons name={icon} size={18} color={colors.primary} /><Text className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted">{label}</Text><Text className="mt-0.5 text-sm font-black text-foreground">{value}</Text></View>; }
