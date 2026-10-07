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
  const [routeId, setRouteId] = useState(ROUTES[0]?.id ?? "201");
  const [departureTime, setDepartureTime] = useState("");
  const [lastTripTime, setLastTripTime] = useState("");
  const [message, setMessage] = useState("");

  const selectedRoute = ROUTES.find((route) => route.id === routeId) ?? ROUTES[0];

  const add = () => {
    const normalized = busNumber.trim().toUpperCase();
    if (!normalized || !selectedRoute || !departureTime.trim() || !lastTripTime.trim()) {
      setMessage("Enter bus number, route, first departure, and last trip.");
      return;
    }
    if (buses.some((bus) => bus.id === normalized)) {
      setMessage("That bus number is already registered.");
      return;
    }

    addBus({
      id: normalized,
      routeId: selectedRoute.id,
      vehicle: normalized,
      routeName: selectedRoute.label,
      departureTime: departureTime.trim(),
      lastTripTime: lastTripTime.trim(),
    });

    setBusNumber("");
    setDepartureTime("");
    setLastTripTime("");
    setMessage(`${normalized} added to the ${selectedRoute.label} route.`);
  };

  const metrics = [
    { label: "Total buses", value: buses.length, icon: "directions-bus", color: colors.primary },
    { label: "Active buses", value: buses.filter((bus) => bus.status !== "STOPPED").length, icon: "wifi-tethering", color: colors.success },
    { label: "Delayed", value: buses.filter((bus) => bus.status === "DELAYED").length, icon: "warning", color: colors.warning },
    { label: "Stopped", value: buses.filter((bus) => bus.status === "STOPPED").length, icon: "pause-circle", color: colors.muted },
  ];

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        <ScreenHeader title="Admin console" subtitle="Manage buses, routes and operating timings" right={<IconButton icon="lock" color={colors.warning} onPress={() => router.replace("/admin-lock")} />} />

        <View className="flex-row flex-wrap justify-between gap-y-3">
          {metrics.map((metric) => (
            <View key={metric.label} className="w-[48%] rounded-2xl bg-surface p-4">
              <MaterialIcons name={metric.icon as keyof typeof MaterialIcons.glyphMap} size={21} color={metric.color} />
              <Text className="mt-3 text-2xl font-black text-foreground">{metric.value}</Text>
              <Text className="mt-1 text-xs text-muted">{metric.label}</Text>
            </View>
          ))}
        </View>

        <Card className="mt-6">
          <View className="flex-row items-center gap-3">
            <View style={{ backgroundColor: colors.primarySoft }} className="h-11 w-11 items-center justify-center rounded-xl">
              <MaterialIcons name="add-business" size={22} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-black text-foreground">Add bus to fleet</Text>
              <Text className="mt-1 text-xs leading-5 text-muted">Bus number is the registration number. No separate registration field is required.</Text>
            </View>
          </View>

          <Field
            label="Bus number / registration number"
            value={busNumber}
            onChangeText={setBusNumber}
            placeholder="e.g. KA-19-AB-1234"
            keyboardType="default"
            autoCapitalize="characters"
          />

          <Text className="mb-2 mt-5 text-xs font-black uppercase tracking-wide text-foreground">Bus route</Text>
          <View className="gap-2">
            {ROUTES.map((route) => {
              const active = route.id === routeId;
              const stops = route.stopIds.map((id) => id.replace(/-/g, " ")).map((name) => name.charAt(0).toUpperCase() + name.slice(1)).join(" → ");
              return (
                <Pressable
                  key={route.id}
                  onPress={() => setRouteId(route.id)}
                  style={{ borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primarySoft : colors.surface }}
                  className="rounded-2xl border px-4 py-3"
                >
                  <View className="flex-row items-center">
                    <View style={{ backgroundColor: active ? colors.primary : colors.surfaceAlt }} className="mr-3 h-9 w-9 items-center justify-center rounded-lg">
                      <MaterialIcons name="route" size={18} color={active ? "#FFFFFF" : colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: active ? colors.primary : colors.foreground }} className="text-sm font-black">{route.label}</Text>
                      <Text className="mt-1 text-[10px] leading-4 text-muted">{stops}</Text>
                    </View>
                    {active ? <MaterialIcons name="check-circle" size={20} color={colors.primary} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-2 flex-row gap-3">
            <View className="flex-1">
              <Field label="First departure" value={departureTime} onChangeText={setDepartureTime} placeholder="05:30" keyboardType="numbers-and-punctuation" autoCapitalize="none" />
            </View>
            <View className="flex-1">
              <Field label="Last trip" value={lastTripTime} onChangeText={setLastTripTime} placeholder="21:45" keyboardType="numbers-and-punctuation" autoCapitalize="none" />
            </View>
          </View>

          {selectedRoute ? (
            <View style={{ backgroundColor: colors.surfaceAlt }} className="mt-4 rounded-xl px-3 py-3">
              <Text className="text-[10px] font-black uppercase tracking-wide text-muted">Selected route</Text>
              <Text className="mt-1 text-sm font-black text-foreground">{selectedRoute.label}</Text>
              <Text className="mt-1 text-xs text-muted">{selectedRoute.origin} → {selectedRoute.destination} · {selectedRoute.duration} min · ₹{selectedRoute.fare}</Text>
            </View>
          ) : null}

          <PrimaryButton title="Add bus to fleet" icon="add-circle" onPress={add} style={{ marginTop: 16 }} />

          {message ? (
            <Text style={{ color: message.includes("added") ? colors.success : colors.error }} className="mt-3 text-center text-xs font-bold">
              {message}
            </Text>
          ) : null}
        </Card>

        <View className="mt-7">
          <View className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-black text-foreground">Registered buses</Text>
              <Text className="mt-1 text-xs text-muted">Bus number, route and operating timings</Text>
            </View>
            <StatusPill label="LOCAL DEMO" tone="warning" />
          </View>

          <View className="gap-3">
            {buses.map((bus) => (
              <Card key={bus.id}>
                <View className="flex-row items-center">
                  <View style={{ backgroundColor: colors.primarySoft }} className="mr-3 h-10 w-10 items-center justify-center rounded-xl">
                    <MaterialIcons name="directions-bus" size={20} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-black text-foreground">{bus.id}</Text>
                      <StatusPill label={bus.status === "STOPPED" ? "STOPPED" : bus.status === "DELAYED" ? "DELAYED" : "ACTIVE"} tone={bus.status === "DELAYED" ? "warning" : bus.status === "STOPPED" ? "muted" : "success"} />
                    </View>
                    <Text className="mt-1 text-xs text-muted">{bus.routeName ?? selectedRoute?.label ?? `Route ${bus.routeId}`}</Text>
                    <Text className="mt-1 text-[10px] font-semibold text-muted">{bus.departureTime} – {bus.lastTripTime}</Text>
                  </View>
                  {!BUS_SEEDS.some((seed) => seed.id === bus.id) ? (
                    <Pressable onPress={() => removeBus(bus.id)} className="rounded-xl bg-error/10 px-3 py-2">
                      <Text style={{ color: colors.error }} className="text-xs font-black">Remove</Text>
                    </Pressable>
                  ) : (
                    <Text className="text-[10px] font-bold text-muted">DEMO</Text>
                  )}
                </View>
              </Card>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: colors.successSoft }} className="mt-6 flex-row items-start gap-2 rounded-2xl px-4 py-3">
          <MaterialIcons name="info-outline" size={18} color={colors.success} />
          <Text style={{ color: colors.success }} className="flex-1 text-xs leading-5 font-semibold">
            Bus number and registration number are treated as the same value. Route and timing are required when adding a bus.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = "characters",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numbers-and-punctuation";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  const colors = useColors();
  return (
    <View className="mt-4">
      <Text className="mb-2 text-xs font-bold text-foreground">{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} autoCapitalize={autoCapitalize} keyboardType={keyboardType ?? "default"} className="h-12 rounded-xl border border-border bg-background px-3 text-sm text-foreground" />
    </View>
  );
}
