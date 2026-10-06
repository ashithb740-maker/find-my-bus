import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, SectionTitle, StatusPill } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppState } from "@/lib/app-state";
import { DEMO_CENTER, distanceKm, STOPS } from "@/lib/transport-data";

type Coordinates = { latitude: number; longitude: number };

export default function NearbyScreen() {
  const colors = useColors();
  const { buses, demoLocation } = useAppState();
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const center = location ?? DEMO_CENTER;
  const nearbyBuses = useMemo(() => buses.filter((bus) => bus.status !== "STOPPED").map((bus) => ({ bus, distance: distanceKm(center, bus) })).sort((a, b) => a.distance - b.distance), [buses, center]);
  const nearbyStops = useMemo(() => STOPS.map((stop) => ({ stop, distance: distanceKm(center, stop) })).sort((a, b) => a.distance - b.distance).slice(0, 7), [center]);
  const useDeviceLocation = async () => {
    setLocationMessage("Requesting location permission…");
    if (Platform.OS === "web") {
      if (!globalThis.navigator?.geolocation) { setLocationMessage("Browser location is not available. Showing Mangaluru demo area."); return; }
      globalThis.navigator.geolocation.getCurrentPosition(
        (current) => { setLocation({ latitude: current.coords.latitude, longitude: current.coords.longitude }); setLocationMessage("Using your current location."); },
        () => setLocationMessage("Location permission was not granted. Showing Mangaluru demo area."),
        { enableHighAccuracy: false, timeout: 8000 },
      );
      return;
    }
    const Location = await import("expo-location");
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") { setLocationMessage("Location permission was not granted. Showing Mangaluru demo area."); return; }
    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setLocation({ latitude: current.coords.latitude, longitude: current.coords.longitude });
    setLocationMessage("Using your current location.");
  };
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}><View className="flex-row items-center justify-between pt-2"><View><Text className="text-3xl font-black text-foreground">Nearby</Text><Text className="mt-1 text-sm text-muted">Find stops and buses around you.</Text></View><View style={{ backgroundColor: colors.primarySoft }} className="h-11 w-11 items-center justify-center rounded-full"><MaterialIcons name="my-location" size={21} color={colors.primary} /></View></View><View style={{ backgroundColor: colors.primarySoft }} className="mt-5 rounded-2xl px-4 py-3"><View className="flex-row items-center gap-2"><MaterialIcons name="location-on" size={17} color={colors.primary} /><Text style={{ color: colors.primary }} className="flex-1 text-xs font-bold">{location ? "Using your current device location." : demoLocation ? "Using Mangaluru demo area." : "Location is not available."}</Text><Pressable onPress={useDeviceLocation} className="rounded-lg bg-white px-2.5 py-1.5"><Text style={{ color: colors.primary }} className="text-[10px] font-black">USE MY LOCATION</Text></Pressable></View>{locationMessage ? <Text style={{ color: colors.primary }} className="mt-2 text-[10px] font-semibold">{locationMessage}</Text> : null}</View><View className="mt-6"><SectionTitle title="Nearby buses" /><View className="gap-3">{nearbyBuses.slice(0, 5).map(({ bus, distance }) => <Pressable key={bus.id} onPress={() => router.push(`/bus/${bus.id}`)}><Card><View className="flex-row items-center"><View style={{ backgroundColor: colors.primarySoft }} className="mr-3 h-11 w-11 items-center justify-center rounded-xl"><MaterialIcons name="directions-bus" size={21} color={colors.primary} /></View><View className="flex-1"><View className="flex-row items-center gap-2"><Text className="font-black text-foreground">{bus.id}</Text><StatusPill label={bus.status === "DELAYED" ? "DELAYED" : "LIVE"} tone={bus.status === "DELAYED" ? "warning" : "success"} /></View><Text className="mt-1 text-xs text-muted">{(distance * 1000).toFixed(0)} m away · {bus.currentStop}</Text></View><View className="items-end"><Text style={{ color: colors.primary }} className="text-lg font-black">{bus.eta} min</Text><Text className="text-[10px] text-muted">to {bus.nextStop}</Text></View></View></Card></Pressable>)}</View></View><View className="mt-6"><SectionTitle title="Nearby stops" /><View className="gap-3">{nearbyStops.map(({ stop, distance }) => <Pressable key={stop.id} onPress={() => router.push(`/stop/${stop.id}`)}><Card><View className="flex-row items-center"><View style={{ backgroundColor: colors.surfaceAlt }} className="mr-3 h-11 w-11 items-center justify-center rounded-xl"><MaterialIcons name="location-on" size={21} color={colors.primary} /></View><View className="flex-1"><Text className="font-black text-foreground">{stop.name}</Text><Text className="mt-1 text-xs text-muted">{(distance * 1000).toFixed(0)} m · {stop.area}</Text></View><MaterialIcons name="chevron-right" size={21} color={colors.muted} /></View></Card></Pressable>)}</View></View></ScrollView></ScreenContainer>;
}
