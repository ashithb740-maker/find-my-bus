import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, PrimaryButton, ScreenHeader } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { ROUTES } from "@/lib/transport-data";

export default function FareScreen() {
  const colors = useColors();
  const [routeId, setRouteId] = useState("102");
  const route = useMemo(() => ROUTES.find((item) => item.id === routeId) ?? ROUTES[1], [routeId]);
  const [fromIndex, setFromIndex] = useState(0);
  const [toIndex, setToIndex] = useState(Math.min(4, route.stopIds.length - 1));
  const fare = Math.max(10, Math.round((route.fare / (route.stopIds.length - 1)) * Math.max(1, toIndex - fromIndex)));
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}><ScreenHeader title="Fare calculator" subtitle="Estimate your trip cost" /><Card><Text className="mb-3 text-sm font-bold text-foreground">Choose a route</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}><View className="flex-row gap-2">{ROUTES.map((item) => <Pressable key={item.id} onPress={() => { setRouteId(item.id); setFromIndex(0); setToIndex(Math.min(2, item.stopIds.length - 1)); }} style={{ backgroundColor: item.id === route.id ? colors.primary : colors.surfaceAlt }} className="rounded-xl px-4 py-3"><Text style={{ color: item.id === route.id ? "#FFFFFF" : colors.foreground }} className="text-xs font-black">{item.label} · {item.destination}</Text></Pressable>)}</View></ScrollView><View className="mt-5 flex-row items-center justify-between"><FareStop label="From" name={route.origin} /><MaterialIcons name="arrow-forward" size={20} color={colors.muted} /><FareStop label="To" name={route.destination} /></View><PrimaryButton title="Calculate estimate" icon="calculate" onPress={() => undefined} style={{ marginTop: 20 }} /></Card><View style={{ backgroundColor: colors.primary }} className="mt-5 items-center rounded-[28px] p-7"><MaterialIcons name="currency-rupee" size={32} color="#FFFFFF" /><Text className="mt-3 text-xs font-bold uppercase tracking-widest text-white/80">Estimated fare</Text><Text className="mt-1 text-5xl font-black text-white">₹{fare}</Text><Text className="mt-2 text-sm text-white/80">{route.origin} → {route.destination}</Text></View><View style={{ backgroundColor: colors.warningSoft }} className="mt-5 flex-row items-start gap-2 rounded-2xl px-4 py-3"><MaterialIcons name="info-outline" size={18} color={colors.warning} /><Text style={{ color: colors.warning }} className="flex-1 text-xs leading-5 font-semibold">Fare shown is an estimate for demonstration purposes. It is not official fare information.</Text></View></ScrollView></ScreenContainer>;
}
function FareStop({ label, name }: { label: string; name: string }) { const colors = useColors(); return <View style={{ borderColor: colors.border }} className="flex-1 rounded-xl border p-3"><Text className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</Text><Text style={{ color: colors.primary }} className="mt-1 font-black">{name}</Text></View>; }
