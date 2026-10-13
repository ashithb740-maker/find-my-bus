import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState, useWindowDimensions } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Image as SvgImage, Polyline, Text as SvgText } from "react-native-svg";
import { useColors } from "@/hooks/use-colors";
import { DEMO_CENTER, getStop, STOPS, type LiveBus } from "@/lib/transport-data";

const WEB_HEIGHT = 300;
const TILE_SIZE = 256;
const DEFAULT_ZOOM = 11;

function worldPixel(latitude: number, longitude: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const lat = Math.max(-85.0511, Math.min(85.0511, latitude)) * Math.PI / 180;
  return {
    x: ((longitude + 180) / 360) * scale,
    y: ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * scale,
  };
}

function findNamedStop(name: string) {
  return STOPS.find((stop) => stop.name.toLowerCase() === name.toLowerCase() || stop.id === name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
}

function WebMap({ buses, selectedBusId, onSelectBus }: { buses: LiveBus[]; selectedBusId?: string; onSelectBus?: (id: string) => void }) {
  const colors = useColors();
  const dimensions = useWindowDimensions();
  const width = Math.max(300, Math.min(dimensions.width - 40, 1140));
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [center, setCenter] = useState(DEMO_CENTER);
  const selectedBus = buses.find((bus) => bus.id === selectedBusId) ?? buses[0];
  const centerPx = worldPixel(center.latitude, center.longitude, zoom);
  const left = centerPx.x - width / 2;
  const top = centerPx.y - WEB_HEIGHT / 2;
  const firstTileX = Math.floor(left / TILE_SIZE);
  const firstTileY = Math.floor(top / TILE_SIZE);
  const tileColumns = Math.ceil(width / TILE_SIZE) + 1;
  const tileRows = Math.ceil(WEB_HEIGHT / TILE_SIZE) + 1;
  const tiles = [];
  for (let row = 0; row < tileRows; row++) {
    for (let column = 0; column < tileColumns; column++) {
      const x = firstTileX + column;
      const y = firstTileY + row;
      if (y < 0 || y >= 2 ** zoom) continue;
      tiles.push({
        key: `${zoom}-${x}-${y}`,
        x: x * TILE_SIZE - left,
        y: y * TILE_SIZE - top,
        href: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
      });
    }
  }
  const project = (latitude: number, longitude: number) => {
    const p = worldPixel(latitude, longitude, zoom);
    return { x: p.x - left, y: p.y - top };
  };
  const routeStops = (selectedBus?.stopNames ?? []).map(findNamedStop).filter((stop): stop is NonNullable<typeof stop> => Boolean(stop));
  const orderedRouteStops = selectedBus?.direction === "REVERSE" ? [...routeStops].reverse() : routeStops;
  const routePoints = orderedRouteStops.map((stop) => project(stop.latitude, stop.longitude));
  const visibleStops = STOPS.map((stop) => ({ stop, point: project(stop.latitude, stop.longitude) }))
    .filter(({ point }) => point.x > -15 && point.x < width + 15 && point.y > -15 && point.y < WEB_HEIGHT + 15);
  const busPoints = buses.map((bus) => ({ bus, point: project(bus.latitude, bus.longitude) }))
    .filter(({ point }) => point.x > -20 && point.x < width + 20 && point.y > -20 && point.y < WEB_HEIGHT + 20);

  const locateMe = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setCenter({ latitude: coords.latitude, longitude: coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return <View style={{ backgroundColor: "#e8eef0", height: WEB_HEIGHT }} className="overflow-hidden rounded-[24px]">
    <Svg width="100%" height={WEB_HEIGHT} viewBox={`0 0 ${width} ${WEB_HEIGHT}`}>
      <Circle cx={width / 2} cy={WEB_HEIGHT / 2} r={width} fill="#e8eef0" />
      {tiles.map((tile) => <SvgImage key={tile.key} x={tile.x} y={tile.y} width={TILE_SIZE} height={TILE_SIZE} href={tile.href} />)}
      {routePoints.length > 1 ? <Polyline points={routePoints.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke={colors.primary} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {visibleStops.map(({ stop, point }) => <React.Fragment key={stop.id}>
        <Circle cx={point.x} cy={point.y} r={routeStops.some((s) => s.id === stop.id) ? 5 : 3} fill="#ffffff" stroke={colors.primary} strokeWidth="2" />
        {routeStops.some((s) => s.id === stop.id) ? <SvgText x={point.x + 7} y={point.y - 7} fill="#17212b" fontSize="10" fontWeight="700">{stop.name}</SvgText> : null}
      </React.Fragment>)}
      {busPoints.map(({ bus, point }) => <React.Fragment key={bus.id}>
        <Circle cx={point.x} cy={point.y} r={bus.id === selectedBusId ? 13 : 10} fill={colors.primary} opacity="0.2" />
        <Circle cx={point.x} cy={point.y} r={bus.id === selectedBusId ? 7 : 5} fill={colors.primary} stroke="#ffffff" strokeWidth="2" />
        <SvgText x={point.x + 9} y={point.y - 9} fill="#12352a" fontSize="10" fontWeight="700">{bus.vehicle || bus.id}</SvgText>
      </React.Fragment>)}
    </Svg>
    <View className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5">
      <Text style={{ color: colors.primary }} className="text-[10px] font-extrabold tracking-widest">OPENSTREETMAP · LIVE BUS LAYER</Text>
    </View>
    <View className="absolute right-3 top-3 gap-2">
      <Pressable accessibilityLabel="Zoom in" onPress={() => setZoom((value) => Math.min(16, value + 1))} className="h-9 w-9 items-center justify-center rounded-xl bg-white shadow"><MaterialIcons name="add" size={20} color={colors.primary} /></Pressable>
      <Pressable accessibilityLabel="Zoom out" onPress={() => setZoom((value) => Math.max(8, value - 1))} className="h-9 w-9 items-center justify-center rounded-xl bg-white shadow"><MaterialIcons name="remove" size={20} color={colors.primary} /></Pressable>
      <Pressable accessibilityLabel="Locate me" onPress={locateMe} className="h-9 w-9 items-center justify-center rounded-xl bg-white shadow"><MaterialIcons name="my-location" size={18} color={colors.primary} /></Pressable>
    </View>
    <View className="absolute bottom-2 left-3 right-3 flex-row items-center justify-between">
      <View className="rounded-full bg-white/95 px-3 py-1.5"><Text className="text-[10px] font-bold text-slate-800">{buses.length ? `${buses.length} bus marker${buses.length === 1 ? "" : "s"} · GPS updates` : "Stops around Mangaluru · waiting for bus GPS"}</Text></View>
      <Text className="rounded bg-white/90 px-1.5 py-1 text-[9px] text-slate-700">© OpenStreetMap</Text>
    </View>
    {onSelectBus && buses.length > 1 ? <View className="absolute bottom-12 right-3 gap-1">{buses.slice(0, 4).map((bus) => <Pressable key={bus.id} onPress={() => onSelectBus(bus.id)} className="rounded-full bg-white/95 px-2 py-1"><Text className="text-[10px] font-bold text-slate-800">{bus.vehicle || bus.id}</Text></Pressable>)}</View> : null}
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
  const routeStops = (buses.find((bus) => bus.id === selectedBusId) ?? buses[0])?.stopNames ?? [];
  const orderedNames = (buses.find((bus) => bus.id === selectedBusId) ?? buses[0])?.direction === "REVERSE" ? [...routeStops].reverse() : routeStops;
  const coordinates = orderedNames.map(findNamedStop).filter((stop): stop is NonNullable<typeof stop> => Boolean(stop)).map((stop) => ({ latitude: stop.latitude, longitude: stop.longitude }));
  return <View style={styles.nativeMap}><MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={{ ...DEMO_CENTER, latitudeDelta: 0.32, longitudeDelta: 0.32 }} showsUserLocation={false}><PolylineNative coordinates={coordinates} strokeColor={colors.primary} strokeWidth={5} />{STOPS.map((stop) => <Marker key={stop.id} coordinate={{ latitude: stop.latitude, longitude: stop.longitude }} title={stop.name} pinColor={colors.primary} />)}{buses.map((bus) => <Marker key={bus.id} coordinate={{ latitude: bus.latitude, longitude: bus.longitude }} title={bus.vehicle || bus.id} description={`${bus.currentStop} → ${bus.nextStop}`} pinColor={bus.id === selectedBusId ? colors.primary : colors.success} onPress={() => onSelectBus?.(bus.id)} />)}</MapView><View className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5"><Text style={{ color: colors.primary }} className="text-[10px] font-extrabold tracking-widest">BUS TRACKING MAP</Text></View></View>;
}

const styles = StyleSheet.create({ nativeMap: { height: WEB_HEIGHT, overflow: "hidden", borderRadius: 24 } });
