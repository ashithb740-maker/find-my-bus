import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, IconButton, PrimaryButton, ScreenHeader, StatusPill } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppState } from "@/lib/app-state";
import { BUS_SEEDS, ROUTES } from "@/lib/transport-data";

export default function AdminScreen() {
  const colors = useColors();
  const { buses, addBus, removeBus } = useAppState();
  const [busNumber, setBusNumber] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [routeId, setRouteId] = useState("101");
  const [message, setMessage] = useState("");
  const add = () => {
    const normalized = busNumber.trim().toUpperCase();
    const registration = vehicle.trim().toUpperCase();
    if (!normalized || !registration) { setMessage("Enter both a bus number and vehicle registration."); return; }
    if (buses.some((bus) => bus.id === normalized || bus.vehicle === registration)) { setMessage("That bus number or vehicle is already registered."); return; }
    addBus({ id: normalized, routeId, vehicle: registration });
    setBusNumber(""); setVehicle(""); setMessage(`${normalized} added to the demo fleet.`);
  };
  const metrics = [{ label: "Total buses", value: buses.length, icon: "directions-bus", color: colors.primary }, { label: "Active buses", value: buses.filter((bus) => bus.status !== "STOPPED").length, icon: "wifi-tethering", color: colors.success }, { label: "Delayed", value: buses.filter((bus) => bus.status === "DELAYED").length, icon: "warning", color: colors.warning }, { label: "Stopped", value: buses.filter((bus) => bus.status === "STOPPED").length, icon: "pause-circle", color: colors.muted }];
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}><ScreenHeader title="Admin console" subtitle="Unlocked fleet management" right={<IconButton icon="lock" color={colors.warning} onPress={() => router.replace("/admin-lock")} />} /><View className="flex-row flex-wrap justify-between gap-y-3">{metrics.map((metric) => <View key={metric.label} className="w-[48%] rounded-2xl bg-surface p-4"><MaterialIcons name={metric.icon as keyof typeof MaterialIcons.glyphMap} size={21} color={metric.color} /><Text className="mt-3 text-2xl font-black text-foreground">{metric.value}</Text><Text className="mt-1 text-xs text-muted">{metric.label}</Text></View>)}</View><Card className="mt-6"><Text className="text-lg font-black text-foreground">Add a bus</Text><Text className="mt-1 text-xs leading-5 text-muted">Added buses are saved locally and immediately appear in passenger search, tracking, and fleet views.</Text><Field label="Bus number" value={busNumber} onChangeText={setBusNumber} placeholder="e.g. BUS-109" /><Field label="Vehicle registration" value={vehicle} onChangeText={setVehicle} placeholder="e.g. KA-19-AK-1099" /><Text className="mb-2 mt-4 text-xs font-bold text-foreground">Assigned route</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}><View className="flex-row gap-2">{ROUTES.map((route) => <Pressable key={route.id} onPress={() => setRouteId(route.id)} style={{ backgroundColor: route.id === routeId ? colors.primary : colors.surfaceAlt }} className="rounded-xl px-3 py-2.5"><Text style={{ color: route.id === routeId ? "#FFFFFF" : colors.foreground }} className="text-xs font-black">Route {route.label}</Text></Pressable>)}</View></ScrollView><PrimaryButton title="Add bus to fleet" icon="add-circle" onPress={add} style={{ marginTop: 16 }} />{message ? <Text style={{ color: message.includes("added") ? colors.success : colors.error }} className="mt-3 text-center text-xs font-bold">{message}</Text> : null}</Card><View className="mt-6"><View className="mb-3 flex-row items-center justify-between"><Text className="text-xl font-black text-foreground">Registered buses</Text><StatusPill label="LOCAL DEMO" tone="warning" /></View><View className="gap-3">{buses.map((bus) => <Card key={bus.id}><View className="flex-row items-center"><View style={{ backgroundColor: colors.primarySoft }} className="mr-3 h-10 w-10 items-center justify-center rounded-xl"><MaterialIcons name="directions-bus" size={20} color={colors.primary} /></View><View className="flex-1"><Text className="font-black text-foreground">{bus.id}</Text><Text className="mt-1 text-xs text-muted">{bus.vehicle} · route {bus.routeId}</Text></View>{!BUS_SEEDS.some((seed) => seed.id === bus.id) ? <Pressable onPress={() => removeBus(bus.id)} className="rounded-xl bg-error/10 px-3 py-2"><Text style={{ color: colors.error }} className="text-xs font-black">Remove</Text></Pressable> : <Text className="text-[10px] font-bold text-muted">DEMO</Text>}</View></Card>)}</View></View><Text className="mt-7 text-center text-xs leading-5 text-muted">This local PIN is only a demonstration lock. Use secure server-side admin authentication before deploying publicly.</Text></ScrollView></ScreenContainer>;
}
function Field({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) { const colors = useColors(); return <View className="mt-4"><Text className="mb-2 text-xs font-bold text-foreground">{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} autoCapitalize="characters" className="h-12 rounded-xl border border-border bg-background px-3 text-sm text-foreground" /></View>; }
