import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, ScreenHeader } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppState } from "@/lib/app-state";

type Kind = "ladies" | "blind" | "accessible" | "senior" | "regular" | "conductor";
const META: Record<Kind, { title: string; fill: string; ink: string }> = {
  ladies: { title: "Ladies' seats", fill: "#F58BBB", ink: "#9D174D" },
  blind: { title: "Blind seats", fill: "#B5AEFF", ink: "#4338CA" },
  accessible: { title: "Accessible seats", fill: "#078CE0", ink: "#FFFFFF" },
  senior: { title: "Senior-citizen seats", fill: "#FFD94F", ink: "#795500" },
  regular: { title: "Regular seat", fill: "#E8E8E8", ink: "#20252B" },
  conductor: { title: "Conductor seat", fill: "#65D985", ink: "#075B2A" },
};
const kindOf = (n: number): Kind => [1,2,3,8,9,10,11,12,13].includes(n) ? "ladies" : [4,5].includes(n) ? "blind" : [6,7].includes(n) ? "accessible" : [14,15].includes(n) ? "senior" : n === 36 ? "conductor" : "regular";
// Exact reference layout, columns listed top-to-bottom.
const upper = [[1,2,3],[10,9,8],[11,12,13],[20,19,18],[21,22,23],[30,29,28],[31,32,33],[40,39,38],[41,42,43],[46,45,44],[47,48,49]];
const lower = [[4,5],[7,6],[14,15],[17,16],[24,25],[27,26],[34,35],[37,36]];

export default function SeatLayoutScreen() {
  const params = useLocalSearchParams<{ busId?: string | string[] }>();
  const busId = Array.isArray(params.busId) ? params.busId[0] : params.busId;
  const { buses } = useAppState();
  const bus = buses.find((item) => item.id === busId);
  const c = useColors();
  const [selected, setSelected] = useState<number | null>(null);
  const seat = (n: number, h = 44, w = 47) => {
    const meta = META[kindOf(n)], active = selected === n;
    return <Pressable key={n} onPress={() => setSelected(n)} accessibilityRole="button" accessibilityLabel={`Seat ${n}, ${meta.title}`} style={{ width: w, height: h, marginBottom: 4, borderRadius: 5, borderWidth: active ? 2 : 1, borderColor: active ? "#111827" : meta.ink, backgroundColor: meta.fill, alignItems: "center", justifyContent: "center" }}>
      {kindOf(n) === "accessible" ? <MaterialIcons name="accessible" size={14} color="#fff" /> : null}
      <Text style={{ fontSize: 13, fontWeight: "900", color: meta.ink }}>{n}</Text>
    </Pressable>;
  };
  const legend: Array<[Kind,string,string]> = [
    ["ladies","Ladies' seats","1, 2, 3, 8–13"],["blind","Blind seats","4, 5"],["accessible","Accessible seats","6, 7"],["senior","Senior citizens","14, 15"],["conductor","Conductor seat","36"],["regular","Regular seats","All other seats"],
  ];
  return <ScreenContainer className="px-3" edges={["top","left","right"]}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader title="Bus seating layout" subtitle={bus ? `Bus ${bus.id} · Route ${bus.routeId}` : "Horizontal seating plan"} />
      <View className="mt-2 rounded-2xl p-4" style={{ backgroundColor: c.primary }}>
        <View className="flex-row items-center gap-3"><View className="h-11 w-11 items-center justify-center rounded-xl bg-white/15"><MaterialIcons name="event-seat" size={25} color="#fff"/></View><View className="flex-1"><Text className="text-xl font-black text-white">Seat positions</Text><Text className="mt-1 text-xs leading-5 text-white/85">Driver and front on the left; rear on the right. Tap any seat for details.</Text></View></View>
      </View>
      <View className="mt-4 rounded-2xl border p-3" style={{ borderColor:c.border, backgroundColor:c.surface }}>
        <Text className="mb-2 text-[10px] font-extrabold tracking-widest text-muted">BUS INTERIOR · SWIPE SIDEWAYS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom:8 }}>
          <View style={{ width:1050, padding:9, borderWidth:3, borderColor:"#22272D", borderRadius:26, backgroundColor:"#F8FAFC" }}>
            <View className="mb-2 flex-row justify-around">{Array.from({length:15},(_,i)=><View key={i} style={{width:40,height:5,borderRadius:4,backgroundColor:"#39C9E7"}}/>)}</View>
            <View className="flex-row items-stretch">
              <View style={{width:88,justifyContent:"space-between",alignItems:"center",paddingVertical:8}}>
                <View style={{width:76,height:80,borderRadius:12,backgroundColor:"#DDE3E8",alignItems:"center",justifyContent:"center"}}><MaterialIcons name="steering" size={31} color="#273746"/><Text style={{fontSize:11,fontWeight:"900",color:"#273746"}}>DRIVER</Text></View>
                <View style={{width:74,height:70,borderRadius:7,borderWidth:1,borderColor:"#CBD5E1",backgroundColor:"#fff",alignItems:"center",justifyContent:"center"}}><MaterialIcons name="arrow-upward" size={24} color="#DC2626"/><Text style={{fontSize:10,fontWeight:"900",color:"#DC2626"}}>FRONT DOOR</Text></View>
              </View>
              <View style={{flex:1,paddingHorizontal:8}}>
                <View style={{flexDirection:"row",justifyContent:"space-between",gap:4}}>{upper.map((col,i)=><View key={i} style={{alignItems:"center"}}>{col.map(n=>seat(n,42,47))}</View>)}</View>
                <View style={{height:20,justifyContent:"center"}}><View style={{height:2,backgroundColor:"#CBD5E1"}}/></View>
                <View style={{flexDirection:"row",justifyContent:"space-between",gap:4}}>{lower.map((col,i)=><View key={i} style={{alignItems:"center"}}>{col.map(n=>seat(n,48,47))}</View>)}</View>
              </View>
              <View style={{width:78,alignItems:"center",justifyContent:"flex-end",paddingBottom:8}}><View style={{width:70,height:70,borderRadius:7,borderWidth:1,borderColor:"#CBD5E1",backgroundColor:"#fff",alignItems:"center",justifyContent:"center"}}><MaterialIcons name="arrow-upward" size={24} color="#DC2626"/><Text style={{fontSize:10,fontWeight:"900",color:"#DC2626"}}>BACK DOOR</Text></View></View>
              <View style={{alignItems:"center",paddingLeft:3}}>{[50,51,52,53,54,55].map(n=>seat(n,49,48))}</View>
            </View>
            <View className="mt-2 flex-row justify-around">{Array.from({length:15},(_,i)=><View key={i} style={{width:40,height:5,borderRadius:4,backgroundColor:"#39C9E7"}}/>)}</View>
          </View>
        </ScrollView>
        <Text className="mt-2 text-[11px] leading-4 text-muted">On mobile, swipe left or right inside the diagram to view the full bus.</Text>
      </View>
      <View className="mt-4 flex-row flex-wrap gap-2">{legend.map(([k,title,desc])=><View key={k} className="min-w-[145px] flex-1 flex-row items-center gap-2 rounded-xl border px-3 py-2" style={{borderColor:META[k].fill,backgroundColor:META[k].fill+"30"}}><View style={{width:14,height:14,borderRadius:3,backgroundColor:META[k].fill,borderWidth:1,borderColor:META[k].ink}}/><View className="flex-1"><Text style={{color:"#17212B"}} className="text-[11px] font-black">{title}</Text><Text style={{color:"#374151"}} className="text-[10px]">{desc}</Text></View></View>)}</View>
      <Card className="mt-4">{selected !== null ? <View className="flex-row items-center gap-3"><View style={{width:46,height:46,borderRadius:12,backgroundColor:META[kindOf(selected)].fill,alignItems:"center",justifyContent:"center"}}><MaterialIcons name="event-seat" size={24} color={META[kindOf(selected)].ink}/></View><View className="flex-1"><Text className="font-black text-foreground">Seat {selected}{selected===36?" · Conductor":""}</Text><Text style={{color:META[kindOf(selected)].ink}} className="mt-1 text-sm font-extrabold">{META[kindOf(selected)].title}</Text></View><Pressable onPress={()=>setSelected(null)}><MaterialIcons name="close" size={21} color={c.muted}/></Pressable></View> : <View className="flex-row items-center gap-3"><MaterialIcons name="touch-app" size={22} color={c.primary}/><Text className="flex-1 text-sm text-muted">Tap a numbered seat to see its category.</Text></View>}</Card>
      <View className="mt-3 gap-2 rounded-2xl p-4" style={{backgroundColor:c.surfaceAlt}}><Text className="font-black text-foreground">Priority seating</Text><Text className="text-xs leading-5 text-muted">Ladies: 1, 2, 3, 8, 9, 10, 11, 12, 13 · Blind passengers: 4, 5 · Accessible: 6, 7 · Senior citizens: 14, 15 · Conductor: 36.</Text><Text className="text-xs leading-5 text-muted">Illustrative layout based on your reference; verify exact seat positions with the bus operator.</Text></View>
      <Pressable onPress={()=>bus?router.replace(`/bus/${encodeURIComponent(bus.id)}` as never):router.back()} style={{backgroundColor:c.primary}} className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-4"><MaterialIcons name="arrow-back" size={19} color="#fff"/><Text className="font-extrabold text-white">Back to bus details</Text></Pressable>
    </ScrollView>
  </ScreenContainer>;
}
