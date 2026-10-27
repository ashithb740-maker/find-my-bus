import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, ScreenHeader } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppState } from "@/lib/app-state";

export default function SeatLayoutScreen() {
  const params = useLocalSearchParams<{ busId?: string | string[] }>();
  const busId = Array.isArray(params.busId) ? params.busId[0] : params.busId;
  const { buses } = useAppState();
  const bus = buses.find((item) => item.id === busId);
  const c = useColors();
  const [selected, setSelected] = useState<number | null>(null);
  const rows = useMemo(() => Array.from({ length: 10 }, (_, i) => [i * 4 + 1, i * 4 + 2, i * 4 + 3, i * 4 + 4]), []);

  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader title="Seat layout" subtitle={bus ? `Bus ${bus.id} · Route ${bus.routeId}` : "Explore a typical city bus layout"} />
      <View style={{ backgroundColor: c.primary }} className="mt-2 rounded-[26px] p-5">
        <View className="flex-row items-center gap-3"><View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><MaterialIcons name="event-seat" size={26} color="#fff" /></View><View className="flex-1"><Text className="text-xl font-black text-white">Know your seating</Text><Text className="mt-1 text-xs leading-5 text-white/80">Choose a seat to preview its position inside the bus.</Text></View></View>
        <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-white/15 px-3 py-2"><MaterialIcons name="info-outline" size={17} color="#fff" /><Text className="flex-1 text-xs leading-4 text-white">Seat availability is not connected to a live occupancy sensor or booking system.</Text></View>
      </View>

      <View className="mt-5 flex-row flex-wrap gap-3">
        <Legend color={c.primarySoft} border={c.primary} label="Selected preview" />
        <Legend color={c.surface} border={c.border} label="Seat layout" />
      </View>

      <View style={{ borderColor: c.border, backgroundColor: c.surface }} className="mt-5 rounded-[30px] border-2 p-4">
        <View className="mb-4 flex-row items-center justify-between rounded-2xl px-3 py-3" style={{ backgroundColor: c.surfaceAlt }}>
          <View className="flex-row items-center gap-2"><MaterialIcons name="airline-seat-recline-normal" size={20} color={c.primary} /><Text className="font-black text-foreground">FRONT OF BUS</Text></View>
          <View className="flex-row items-center gap-1"><MaterialIcons name="steering" size={20} color={c.muted} /><Text className="text-xs font-bold text-muted">Driver</Text></View>
        </View>
        <View className="mb-4 flex-row items-center justify-center gap-2"><View style={{ backgroundColor: c.surfaceAlt }} className="rounded-lg px-3 py-2"><Text className="text-[10px] font-extrabold text-muted">DOOR</Text></View><View className="h-1 flex-1 rounded-full" style={{ backgroundColor: c.border }} /><Text className="text-[10px] font-bold text-muted">WINDSCREEN</Text></View>
        {rows.map((row, index) => <View key={index} className="mb-2 flex-row items-center justify-between gap-2">
          <View className="flex-row gap-2">{row.slice(0, 2).map((seat) => <Seat key={seat} number={seat} selected={selected === seat} onPress={() => setSelected(seat)} />)}</View>
          <View className="h-9 w-5 items-center justify-center"><View style={{ backgroundColor: c.border }} className="h-full w-[2px] rounded-full" /></View>
          <View className="flex-row gap-2">{row.slice(2).map((seat) => <Seat key={seat} number={seat} selected={selected === seat} onPress={() => setSelected(seat)} />)}</View>
        </View>)}
        <View style={{ backgroundColor: c.surfaceAlt }} className="mt-3 items-center rounded-xl py-3"><Text className="text-xs font-extrabold text-muted">REAR OF BUS</Text></View>
      </View>

      <Card className="mt-5">
        {selected ? <View className="flex-row items-center gap-3"><View style={{ backgroundColor: c.primarySoft }} className="h-12 w-12 items-center justify-center rounded-2xl"><MaterialIcons name="event-seat" size={24} color={c.primary} /></View><View className="flex-1"><Text className="font-black text-foreground">Seat {selected} selected</Text><Text className="mt-1 text-xs text-muted">This is a layout preview only. It does not reserve the seat.</Text></View><Pressable onPress={() => setSelected(null)}><MaterialIcons name="close" size={21} color={c.muted} /></Pressable></View> : <View className="flex-row items-center gap-3"><MaterialIcons name="touch-app" size={22} color={c.primary} /><Text className="flex-1 text-sm text-muted">Tap any seat to highlight it and see where it is located.</Text></View>}
      </Card>
      <Pressable onPress={() => bus ? router.replace(`/bus/${encodeURIComponent(bus.id)}` as never) : router.back()} style={{ backgroundColor: c.primary }} className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-4"><MaterialIcons name="arrow-back" size={19} color="#fff" /><Text className="font-extrabold text-white">Back to bus details</Text></Pressable>
      <Text className="mt-4 text-center text-xs leading-5 text-muted">Layout is illustrative; seat configuration varies by vehicle. Live occupancy and reservations require operator-provided data.</Text>
    </ScrollView>
  </ScreenContainer>;
}

function Seat({ number, selected, onPress }: { number: number; selected: boolean; onPress: () => void }) {
  const c = useColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={`Preview seat ${number}`} onPress={onPress} style={{ backgroundColor: selected ? c.primary : c.surfaceAlt, borderColor: selected ? c.primary : c.border }} className="h-10 w-10 items-center justify-center rounded-xl border"><MaterialIcons name="event-seat" size={19} color={selected ? "#FFFFFF" : c.foreground} /><Text style={{ color: selected ? "#FFFFFF" : c.foreground }} className="text-[10px] font-extrabold">{number}</Text></Pressable>;
}
function Legend({ color, border, label }: { color: string; border: string; label: string }) { return <View className="flex-row items-center gap-2"><View style={{ backgroundColor: color, borderColor: border }} className="h-3.5 w-3.5 rounded border" /><Text className="text-xs text-muted">{label}</Text></View>; }
