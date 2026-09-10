import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useRef } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { useColors } from "@/hooks/use-colors";
import { DEMO_CENTER, getRoute, getStop, type LiveBus } from "@/lib/transport-data";

const WEB_WIDTH = Dimensions.get("window").width;
const WEB_HEIGHT = 280;

function project(latitude: number, longitude: number, width = WEB_WIDTH, height = WEB_HEIGHT) {
  const x = ((longitude - 74.72) / (74.91 - 74.72)) * (width - 36) + 18;
  const y = height - (((latitude - 12.84) / (13.36 - 12.84)) * (height - 36) + 18);
  return { x, y };
}

function WebMap({ buses, selectedBusId, onSelectBus }: { buses: LiveBus[]; selectedBusId?: string; onSelectBus?: (id: string) => void }) {
  const colors = useColors();
  const route = selectedBusId ? getRoute(buses.find((bus) => bus.id === selectedBusId)?.routeId ?? "") : getRoute("101");
  const routePoints = route?.stopIds.map((id) => project(getStop(id)!.latitude, getStop(id)!.longitude)) ?? [];
  return <View style={{ backgroundColor: colors.mapBase }} className="overflow-hidden rounded-[28px]">
    <View className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1.5"><Text style={{ color: colors.primary }} className="text-[11px] font-extrabold tracking-widest">MANGALURU • DEMO MAP</Text></View>
    <Svg width="100%" height={WEB_HEIGHT} viewBox={`0 0 ${WEB_WIDTH} ${WEB_HEIGHT}`}>
      <Line x1="0" y1="70" x2={WEB_WIDTH} y2="35" stroke={colors.mapRoad} strokeWidth="18" opacity="0.55" />
      <Line x1="-20" y1="190" x2={WEB_WIDTH + 20} y2="235" stroke={colors.mapRoad} strokeWidth="15" opacity="0.55" />
      <Line x1="70" y1="0" x2={WEB_WIDTH - 40} y2={WEB_HEIGHT} stroke={colors.mapRoad} strokeWidth="11" opacity="0.55" />
      <Line x1="0" y1="140" x2={WEB_WIDTH} y2="115" stroke={colors.mapRoad} strokeWidth="6" opacity="0.55" />
      {routePoints.length > 1 ? <Polyline points={routePoints.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke={route?.color ?? colors.primary} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {route?.stopIds.map((id) => { const stop = getStop(id)!; const point = project(stop.latitude, stop.longitude); return <React.Fragment key={id}><Circle cx={point.x} cy={point.y} r="5" fill="#FFFFFF" stroke={route.color} strokeWidth="3" /><SvgText x={point.x + 8} y={point.y - 8} fill={colors.foreground} fontSize="9" fontWeight="700">{stop.name}</SvgText></React.Fragment>; })}
      {buses.map((bus) => { const point = project(bus.latitude, bus.longitude); const selected = bus.id === selectedBusId; return <React.Fragment key={bus.id}><Circle cx={point.x} cy={point.y} r={selected ? 12 : 9} fill={selected ? colors.primary : colors.success} opacity="0.2" /><Circle cx={point.x} cy={point.y} r={selected ? 7 : 5} fill={selected ? colors.primary : colors.success} stroke="#FFFFFF" strokeWidth="2" /></React.Fragment>; })}
    </Svg>
    <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between"><View className="rounded-full bg-white/90 px-3 py-2"><Text className="text-xs font-bold text-slate-800">◉ Your location · Demo</Text></View><View className="flex-row gap-2"><Pressable onPress={() => undefined} className="rounded-full bg-white p-2"><MaterialIcons name="my-location" size={18} color={colors.primary} /></Pressable><Pressable onPress={() => undefined} className="rounded-full bg-white p-2"><MaterialIcons name="add" size={18} color={colors.primary} /></Pressable></View></View>
    {onSelectBus ? <View className="absolute right-3 top-14 gap-1">{buses.slice(0, 4).map((bus) => <Pressable key={bus.id} onPress={() => onSelectBus(bus.id)} className="rounded-full bg-white/90 px-2 py-1"><Text className="text-[10px] font-bold text-slate-800">{bus.id}</Text></Pressable>)}</View> : null}
  </View>;
}

export function BusMap({ buses, selectedBusId, onSelectBus }: { buses: LiveBus[]; selectedBusId?: string; onSelectBus?: (id: string) => void }) {
  const colors = useColors();
  const mapRef = useRef<any>(null);
  const native = useMemo(() => {
    if (Platform.OS === "web") return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("react-native-maps");
    } catch { return null; }
  }, []);
  if (Platform.OS === "web" || !native) return <WebMap buses={buses} selectedBusId={selectedBusId} onSelectBus={onSelectBus} />;
  const MapView = native.default;
  const Marker = native.Marker;
  const PolylineNative = native.Polyline;
  const route = selectedBusId ? getRoute(buses.find((bus) => bus.id === selectedBusId)?.routeId ?? "") : getRoute("101");
  const coordinates = route?.stopIds.map((id) => { const stop = getStop(id)!; return { latitude: stop.latitude, longitude: stop.longitude }; }) ?? [];
  return <View style={styles.nativeMap}><MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={{ ...DEMO_CENTER, latitudeDelta: 0.32, longitudeDelta: 0.32 }} showsUserLocation={false}><PolylineNative coordinates={coordinates} strokeColor={route?.color ?? colors.primary} strokeWidth={5} />{route?.stopIds.map((id) => { const stop = getStop(id)!; return <Marker key={id} coordinate={{ latitude: stop.latitude, longitude: stop.longitude }} title={stop.name} pinColor={route.color} />; })}{buses.map((bus) => <Marker key={bus.id} coordinate={{ latitude: bus.latitude, longitude: bus.longitude }} title={bus.id} description={`${bus.currentStop} → ${bus.nextStop}`} pinColor={bus.id === selectedBusId ? colors.primary : colors.success} onPress={() => onSelectBus?.(bus.id)} />)}</MapView><View className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5"><Text style={{ color: colors.primary }} className="text-[11px] font-extrabold tracking-widest">LIVE MAP • DEMO GPS</Text></View></View>;
}

const styles = StyleSheet.create({ nativeMap: { height: WEB_HEIGHT, overflow: "hidden", borderRadius: 28 } });
