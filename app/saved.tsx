import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { EmptyState, ScreenHeader } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppState } from "@/lib/app-state";
import { getRoute, getStop } from "@/lib/transport-data";

export default function SavedScreen() {
  const { savedBuses, savedRoutes, savedStops, toggleSaved } = useAppState();
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}><ScreenHeader title="Saved" subtitle="Your favourite transit shortcuts" /><View className="gap-6"><SavedGroup title="Buses" icon="directions-bus">{savedBuses.map((id) => <SavedRow key={id} label={id} detail="Live tracking shortcut" onPress={() => router.push(`/bus/${id}`)} onRemove={() => toggleSaved("bus", id)} />)}</SavedGroup><SavedGroup title="Routes" icon="route">{savedRoutes.map((id) => { const route = getRoute(id); return <SavedRow key={id} label={`Route ${id}`} detail={`${route?.origin} → ${route?.destination}`} onPress={() => router.push(`/route/${id}`)} onRemove={() => toggleSaved("route", id)} />; })}</SavedGroup><SavedGroup title="Stops" icon="location-on">{savedStops.map((id) => { const stop = getStop(id); return <SavedRow key={id} label={stop?.name ?? id} detail={stop?.area ?? "Bus stop"} onPress={() => router.push(`/stop/${id}`)} onRemove={() => toggleSaved("stop", id)} />; })}</SavedGroup></View></ScrollView></ScreenContainer>;
}
function SavedGroup({ title, icon, children }: { title: string; icon: keyof typeof MaterialIcons.glyphMap; children: React.ReactNode }) { const colors = useColors(); return <View><View className="mb-3 flex-row items-center gap-2"><MaterialIcons name={icon} size={18} color={colors.primary} /><Text className="text-lg font-black text-foreground">{title}</Text></View>{children || <EmptyState title={`No saved ${title.toLowerCase()}`} message="Tap the heart icon on a bus, route, or stop to save it here." />}</View>; }
function SavedRow({ label, detail, onPress, onRemove }: { label: string; detail: string; onPress: () => void; onRemove: () => void }) { const colors = useColors(); return <Pressable onPress={onPress} className="mb-2 flex-row items-center rounded-2xl bg-surface px-4 py-3"><View className="flex-1"><Text className="font-black text-foreground">{label}</Text><Text className="mt-1 text-xs text-muted">{detail}</Text></View><Pressable onPress={onRemove} className="p-2"><MaterialIcons name="favorite" size={20} color={colors.error} /></Pressable><MaterialIcons name="chevron-right" size={20} color={colors.muted} /></Pressable>; }
