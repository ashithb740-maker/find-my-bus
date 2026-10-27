import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, ScreenHeader } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppState } from "@/lib/app-state";

type SeatGroup = "ladies" | "blind" | "disabled" | "senior" | "general" | "conductor" | "driver";
const GROUPS: Record<SeatGroup, { title: string; color: string; soft: string }> = {
  ladies: { title: "Ladies seats", color: "#B4237A", soft: "#FCE7F3" },
  blind: { title: "Seats for blind passengers", color: "#6D28D9", soft: "#EDE9FE" },
  disabled: { title: "Priority space for passengers with disabilities", color: "#0369A1", soft: "#E0F2FE" },
  senior: { title: "Senior citizens", color: "#9A5700", soft: "#FEF3C7" },
  general: { title: "General seating", color: "#64748B", soft: "#F1F5F9" },
  conductor: { title: "Conductor seat", color: "#0F766E", soft: "#CCFBF1" },
  driver: { title: "Driver seat", color: "#374151", soft: "#E5E7EB" },
};
const seatGroup: Record<number, SeatGroup> = {
  1:"ladies",2:"ladies",3:"ladies",10:"ladies",9:"ladies",8:"ladies",11:"ladies",12:"ladies",13:"ladies",
  4:"blind",5:"blind",
  6:"disabled",7:"disabled",
  14:"senior",15:"senior",16:"senior",17:"senior",
  18:"general",19:"general",20:"general",21:"general",22:"general",23:"general",24:"general",25:"general",
  26:"general",27:"general",28:"general",29:"general",30:"general",31:"general",32:"general",33:"general",34:"general",35:"general",
  36:"conductor",
};

export default function SeatLayoutScreen() {
  const params = useLocalSearchParams<{ busId?: string | string[] }>();
  const busId = Array.isArray(params.busId) ? params.busId[0] : params.busId;
  const { buses } = useAppState();
  const bus = buses.find((item) => item.id === busId);
  const c = useColors();
  const [selected, setSelected] = useState<number | null>(null);
  const rows = useMemo(() => [[1,2,3],[10,9,8],[11,12,13],[4,5,6,7],[14,15,16,17],[18,19,20,21],[22,23,24,25],[26,27,28,29],[30,31,32,33],[34,35]], []);

  return <ScreenContainer className="px-4" edges={["top", "left", "right"]}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader title="Bus seating layout" subtitle={bus ? `Bus ${bus.id} · Route ${bus.routeId}` : "Vertical seating plan · illustrative layout"} />
      <View style={{ backgroundColor: c.primary }} className="mt-2 rounded-[24px] p-4">
        <View className="flex-row items-center gap-3"><View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><MaterialIcons name="event-seat" size={25} color="#fff" /></View><View className="flex-1"><Text className="text-xl font-black text-white">Seat positions & priority areas</Text><Text className="mt-1 text-xs leading-5 text-white/85">Tap a seat to see its designated category.</Text></View></View>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {(["ladies","blind","disabled","senior","general"] as SeatGroup[]).map((group) => <View key={group} className="flex-row items-center gap-1.5 rounded-full border px-2.5 py-1.5" style={{ borderColor: GROUPS[group].color, backgroundColor: GROUPS[group].soft }}><View className="h-2 w-2 rounded-full" style={{ backgroundColor: GROUPS[group].color }} /><Text style={{ color: GROUPS[group].color }} className="text-[10px] font-extrabold">{group === "ladies" ? "Ladies" : group === "blind" ? "Blind passengers" : group === "disabled" ? "Accessible priority" : group === "senior" ? "Senior citizens" : "General"}</Text></View>)}
      </View>

      <View style={{ borderColor: c.border, backgroundColor: c.surface }} className="mt-4 rounded-[28px] border-2 p-3">
        <View className="mb-3 items-center"><Text className="text-[10px] font-extrabold tracking-[2px] text-muted">FRONT / ENTRANCE</Text><View style={{ backgroundColor: c.surfaceAlt }} className="mt-2 w-full flex-row items-center justify-between rounded-xl px-3 py-3">
          <View className="flex-row items-center gap-2"><MaterialIcons name="steering" size={21} color={GROUPS.driver.color}/><Text className="text-xs font-black text-foreground">DRIVER SEAT</Text></View>
          <View className="flex-row items-center gap-2"><MaterialIcons name="door-front" size={21} color={c.primary}/><Text className="text-xs font-black text-foreground">DOOR</Text></View>
        </View></View>

        <View className="flex-row items-stretch gap-2">
          <View className="flex-1 gap-2">
            {rows.map((row, index) => <View key={index} className="flex-row justify-center gap-1.5">
              {row.map((number) => {
                const group = seatGroup[number] ?? "general";
                const meta = GROUPS[group];
                const active = selected === number;
                return <Pressable key={number} accessibilityRole="button" accessibilityLabel={`Seat ${number}, ${meta.title}`} onPress={() => setSelected(number)} style={{ backgroundColor: active ? meta.color : meta.soft, borderColor: active ? meta.color : meta.color + "80" }} className="h-[48px] min-w-[37px] flex-1 items-center justify-center rounded-lg border">
                  <MaterialIcons name="event-seat" size={17} color={active ? "#FFFFFF" : meta.color}/><Text style={{ color: active ? "#FFFFFF" : meta.color }} className="text-[10px] font-black">{number}</Text>
                </Pressable>;
              })}
            </View>)}
          </View>
          <View className="w-[58px] items-center justify-between rounded-xl py-2" style={{ backgroundColor: c.surfaceAlt }}>
            <Text className="text-[9px] font-extrabold text-muted">AISLE</Text>
            <View className="flex-1 my-2 w-[2px] rounded-full" style={{ backgroundColor: c.border }} />
            <Pressable onPress={() => setSelected(36)} accessibilityRole="button" accessibilityLabel="Seat 36, conductor seat" className="items-center rounded-lg p-1" style={{ backgroundColor: selected === 36 ? GROUPS.conductor.color : GROUPS.conductor.soft }}><Text style={{ color: selected === 36 ? "#FFFFFF" : GROUPS.conductor.color }} className="text-[9px] font-black">36</Text><MaterialIcons name="event-seat" size={21} color={selected === 36 ? "#FFFFFF" : GROUPS.conductor.color}/><Text style={{ color: selected === 36 ? "#FFFFFF" : GROUPS.conductor.color }} className="text-center text-[8px] font-extrabold">CONDUCTOR</Text></Pressable>
          </View>
        </View>
        <View className="mt-3 items-center rounded-xl py-3" style={{ backgroundColor: c.surfaceAlt }}><Text className="text-[10px] font-extrabold tracking-[2px] text-muted">REAR OF BUS</Text></View>
      </View>

      <Card className="mt-4">
        {selected !== null ? (() => { const group = seatGroup[selected] ?? "general"; const meta = GROUPS[group]; return <View className="flex-row items-center gap-3"><View style={{ backgroundColor: meta.soft }} className="h-12 w-12 items-center justify-center rounded-2xl"><MaterialIcons name="event-seat" size={24} color={meta.color}/></View><View className="flex-1"><Text className="font-black text-foreground">{selected === 36 ? "Seat 36 · Conductor" : `Seat ${selected}`}</Text><Text style={{ color: meta.color }} className="mt-1 text-sm font-extrabold">{meta.title}</Text><Text className="mt-1 text-xs text-muted">Category shown from your requested layout.</Text></View><Pressable onPress={() => setSelected(null)}><MaterialIcons name="close" size={21} color={c.muted}/></Pressable></View>; })() : <View className="flex-row items-center gap-3"><MaterialIcons name="touch-app" size={22} color={c.primary}/><Text className="flex-1 text-sm text-muted">Select any numbered seat to view its category.</Text></View>}
      </Card>
      <View className="mt-3 gap-2 rounded-2xl p-4" style={{ backgroundColor: c.surfaceAlt }}>
        <Text className="font-black text-foreground">Priority seating</Text>
        <Text className="text-xs leading-5 text-muted">Ladies: seats 1, 2, 3, 8, 9, 10, 11, 12 and 13. Blind passengers: seats 4 and 5. The next marked area is reserved as an illustrative accessible-priority zone, followed by senior-citizen seating.</Text>
        <Text className="text-xs leading-5 text-muted">This is a configurable seating diagram, not a verified drawing for every bus model. Seat 36 and the adjacent conductor position are shown separately as requested. Confirm exact numbered positions with the bus operator before treating this as an official seating chart.</Text>
      </View>
      <Pressable onPress={() => bus ? router.replace(`/bus/${encodeURIComponent(bus.id)}` as never) : router.back()} style={{ backgroundColor: c.primary }} className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-4"><MaterialIcons name="arrow-back" size={19} color="#fff"/><Text className="font-extrabold text-white">Back to bus details</Text></Pressable>
    </ScrollView>
  </ScreenContainer>;
}
