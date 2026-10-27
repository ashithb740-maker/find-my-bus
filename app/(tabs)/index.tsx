import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, StatusPill } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppState } from "@/lib/app-state";

export default function HomeScreen() {
  const c = useColors();
  const { buses, routes, trips, isOffline } = useAppState();
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const activeBuses = buses.filter((bus) => bus.status !== "STOPPED");
  const search = () => {
    if (!query.trim()) { router.push("/search"); return; }
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };
  return (
    <ScreenContainer edges={["top", "left", "right"]} className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row items-center justify-between pt-3">
          <View className="flex-row items-center gap-2">
            <Pressable accessibilityLabel="Open menu" onPress={() => router.push("/(tabs)/more")} style={{ borderColor: c.border }} className="h-11 w-11 items-center justify-center rounded-2xl border bg-surface"><MaterialIcons name="menu" size={25} color={c.foreground} /></Pressable>
            <View className="flex-row items-center gap-3">
            <View style={{ backgroundColor: c.primary }} className="h-12 w-12 items-center justify-center rounded-2xl">
              <MaterialIcons name="directions-bus" size={27} color="#fff" />
            </View>
            <View>
              <Text className="text-2xl font-black tracking-tight text-foreground">Find My Bus</Text>
              <Text className="mt-0.5 text-xs font-semibold text-muted">Your journey, made simpler.</Text>
            </View>
          </View>
          </View>
          <Pressable accessibilityLabel="Open profile" onPress={() => router.push("/(tabs)/profile")} style={{ borderColor: c.border, backgroundColor: c.primarySoft }} className="h-11 w-11 items-center justify-center rounded-full border">
            <MaterialIcons name="person" size={24} color={c.primary} />
          </Pressable>
        </View>

        <View className="mt-5 flex-row items-center gap-2">
          <MaterialIcons name="location-on" size={17} color={c.primary} />
          <Text className="text-sm font-bold text-foreground">Mangaluru & coastal Karnataka</Text>
          <View className="flex-1" />
          <View style={{ backgroundColor: isOffline ? c.warningSoft : c.successSoft }} className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5">
            <View style={{ backgroundColor: isOffline ? c.warning : c.success }} className="h-1.5 w-1.5 rounded-full" />
            <Text style={{ color: isOffline ? c.warning : c.success }} className="text-[10px] font-extrabold">{isOffline ? "OFFLINE" : "CONNECTED"}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: c.primary }} className="mt-5 overflow-hidden rounded-[28px] p-5">
          <View className="flex-row items-center justify-between">
            <View className="rounded-full bg-white/15 px-3 py-1.5"><Text className="text-[10px] font-extrabold uppercase tracking-widest text-white">Travel with confidence</Text></View>
            <MaterialIcons name="near-me" size={24} color="#FFFFFF" />
          </View>
          <Text className="mt-4 text-[29px] font-black leading-[35px] text-white">Every stop brings you closer.</Text>
          <Text className="mt-2 text-sm leading-5 text-white/80">Find your bus, plan a route, and know when to leave.</Text>
          <View className="mt-5 flex-row items-center rounded-2xl bg-white px-3">
            <MaterialIcons name="search" size={22} color="#687582" />
            <TextInput value={query} onChangeText={setQuery} onSubmitEditing={search} returnKeyType="search" placeholder="Bus number, stop or destination" placeholderTextColor="#8A949E" className="h-14 flex-1 px-3 text-sm text-[#18232D]" />
            <Pressable onPress={search} style={{ backgroundColor: c.primary }} className="h-10 w-10 items-center justify-center rounded-xl"><MaterialIcons name="arrow-forward" size={21} color="#fff" /></Pressable>
          </View>
          <View className="mt-4 flex-row gap-2">
            <QuickAction icon="near-me" label="Nearby" onPress={() => router.push("/(tabs)/nearby")} />
            <QuickAction icon="schedule" label="Timetables" onPress={() => router.push("/timetable")} />
            <QuickAction icon="map" label="All routes" onPress={() => router.push("/(tabs)/routes")} />
          </View>
        </View>

        <View className="mt-7 flex-row items-end justify-between">
          <View><Text className="text-xl font-black text-foreground">Plan your journey</Text><Text className="mt-1 text-sm text-muted">Where are you heading today?</Text></View>
          <Pressable onPress={() => router.push("/plan")}><Text style={{ color: c.primary }} className="text-xs font-extrabold">FULL PLANNER ↗</Text></Pressable>
        </View>
        <Card className="mt-4">
          <View className="flex-row gap-3">
            <View className="items-center pt-3">
              <View style={{ borderColor: c.primary }} className="h-3.5 w-3.5 rounded-full border-[3px]" />
              <View style={{ borderColor: c.border }} className="my-1 h-9 border-l border-dashed" />
              <View style={{ backgroundColor: c.warning }} className="h-3.5 w-3.5 rounded-full" />
            </View>
            <View className="flex-1 gap-2">
              <TextInput value={from} onChangeText={setFrom} placeholder="Starting point" placeholderTextColor={c.muted} className="h-12 rounded-xl bg-background px-3 text-sm text-foreground" />
              <TextInput value={to} onChangeText={setTo} placeholder="Where to?" placeholderTextColor={c.muted} className="h-12 rounded-xl bg-background px-3 text-sm text-foreground" />
            </View>
            <Pressable accessibilityLabel="Swap start and destination" onPress={() => { setFrom(to); setTo(from); }} className="h-10 w-10 items-center justify-center rounded-full bg-surfaceAlt"><MaterialIcons name="swap-vert" size={22} color={c.primary} /></Pressable>
          </View>
          <Pressable onPress={() => router.push(`/plan?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)} style={{ backgroundColor: c.primary }} className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-4">
            <MaterialIcons name="route" size={19} color="#fff" /><Text className="font-extrabold text-white">Find available buses</Text>
          </Pressable>
        </Card>

        <View className="mt-7 flex-row items-end justify-between">
          <View><Text className="text-xl font-black text-foreground">On the move</Text><Text className="mt-1 text-sm text-muted">Buses marked active in the network</Text></View>
          <Pressable onPress={() => router.push("/(tabs)/track")}><Text style={{ color: c.primary }} className="text-xs font-extrabold">VIEW ALL</Text></Pressable>
        </View>
        <View className="mt-4 gap-3">
          {activeBuses.slice(0, 4).map((bus) => (
            <Pressable key={bus.id} onPress={() => router.push(`/bus/${bus.id}`)} style={({ pressed }) => [{ borderColor: c.border, opacity: pressed ? 0.85 : 1 }]} className="flex-row items-center rounded-2xl border bg-surface p-3.5">
              <View style={{ backgroundColor: c.primarySoft }} className="h-12 w-12 items-center justify-center rounded-2xl"><MaterialIcons name="directions-bus" size={23} color={c.primary} /></View>
              <View className="ml-3 flex-1">
                <View className="flex-row items-center gap-2"><Text className="font-black text-foreground">{bus.id}</Text><StatusPill label={bus.status === "DELAYED" ? "DELAYED" : "IN SERVICE"} tone={bus.status === "DELAYED" ? "warning" : "success"} /></View>
                <Text className="mt-1.5 text-xs text-muted">{bus.currentStop}  →  {bus.nextStop}</Text>
              </View>
              <View className="items-end"><Text style={{ color: c.primary }} className="text-lg font-black">{bus.eta} min</Text><Text className="text-[10px] text-muted">to next stop</Text></View>
            </Pressable>
          ))}
          {activeBuses.length === 0 && <Card><View className="items-center py-3"><MaterialIcons name="directions-bus" size={28} color={c.muted} /><Text className="mt-2 text-sm font-bold text-foreground">No live buses yet</Text><Text className="mt-1 text-center text-xs leading-5 text-muted">Once an administrator publishes routes and schedules, active buses will appear here.</Text><Pressable onPress={() => router.push("/(tabs)/routes")} className="mt-3 rounded-xl px-4 py-2" style={{ backgroundColor: c.primarySoft }}><Text style={{ color: c.primary }} className="font-extrabold">Explore routes</Text></Pressable></View></Card>}
        </View>

        <View className="mt-7 flex-row items-end justify-between"><View><Text className="text-xl font-black text-foreground">Explore</Text><Text className="mt-1 text-sm text-muted">Everything you need for the trip</Text></View></View>
        <View className="mt-4 flex-row flex-wrap gap-3">
          <ExploreTile icon="map" title="Route finder" subtitle={`${routes.length} routes available`} onPress={() => router.push("/(tabs)/routes")} />
          <ExploreTile icon="schedule" title="Timetables" subtitle={`${trips.length} scheduled trips`} onPress={() => router.push("/timetable")} />
          <ExploreTile icon="bookmark-border" title="Saved places" subtitle="Your favourites" onPress={() => router.push("/saved")} />
          <ExploreTile icon="notifications-none" title="Arrival alerts" subtitle="Get notified" onPress={() => router.push("/alerts")} />
          <ExploreTile icon="place" title="Nearby stops" subtitle="Stops around you" onPress={() => router.push("/(tabs)/nearby")} />
          <ExploreTile icon="info-outline" title="Service help" subtitle="Travel information" onPress={() => router.push("/(tabs)/more")} />
        </View>

        <View style={{ backgroundColor: c.surfaceAlt }} className="mt-6 rounded-2xl p-4">
          <View className="flex-row items-center gap-2"><MaterialIcons name="verified-user" size={18} color={c.primary} /><Text className="font-extrabold text-foreground">A clearer commute starts here</Text></View>
          <Text className="mt-2 text-xs leading-5 text-muted">Arrival estimates depend on the available bus updates. Confirm the route and timetable before travelling.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function QuickAction({ icon, label, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-white/15 px-2 py-3"><MaterialIcons name={icon} size={16} color="#fff" /><Text className="text-[10px] font-extrabold text-white">{label}</Text></Pressable>;
}
function ExploreTile({ icon, title, subtitle, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; subtitle: string; onPress: () => void }) {
  const c = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [{ borderColor: c.border, opacity: pressed ? 0.8 : 1 }]} className="w-[48%] rounded-2xl border bg-surface p-4">
    <View style={{ backgroundColor: c.primarySoft }} className="h-10 w-10 items-center justify-center rounded-xl"><MaterialIcons name={icon} size={21} color={c.primary} /></View>
    <Text className="mt-3 text-sm font-extrabold text-foreground">{title}</Text><Text className="mt-1 text-xs text-muted">{subtitle}</Text>
  </Pressable>;
}
