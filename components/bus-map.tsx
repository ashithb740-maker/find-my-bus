import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { DEMO_CENTER, STOPS, type LiveBus } from "@/lib/transport-data";

const MAP_HEIGHT = 320;

function findNamedStop(name: string) {
  return STOPS.find((stop) => stop.name.toLowerCase() === name.toLowerCase() || stop.id === name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
}

function WebMap({ buses, selectedBusId, onSelectBus }: { buses: LiveBus[]; selectedBusId?: string; onSelectBus?: (id: string) => void }) {
  const colors = useColors();
  const frameRef = useRef<any>(null);
  const selected = buses.find((bus) => bus.id === selectedBusId) ?? buses[0];
  const stopData = STOPS.map((stop) => ({ id: stop.id, name: stop.name, lat: stop.latitude, lng: stop.longitude }));
  const routeNames = selected?.stopNames ?? [];
  const orderedNames = selected?.direction === "REVERSE" ? [...routeNames].reverse() : routeNames;
  const routeData = orderedNames.map(findNamedStop).filter((stop): stop is NonNullable<typeof stop> => Boolean(stop)).map((stop) => ({ name: stop.name, lat: stop.latitude, lng: stop.longitude }));
  const busData = buses.map((bus) => ({ id: bus.id, vehicle: bus.vehicle || bus.id, lat: bus.latitude, lng: bus.longitude, currentStop: bus.currentStop, nextStop: bus.nextStop, eta: bus.eta, status: bus.status }));
  const mapHtml = useMemo(() => {
    const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
    return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#map{height:100%;width:100%;margin:0;padding:0;background:#eaf0ed;font-family:Arial,sans-serif}.leaflet-container{font:12px Arial,sans-serif}.bus-dot{background:#07875f;border:3px solid #fff;border-radius:50%;box-shadow:0 1px 6px #2348;width:18px;height:18px}.stop-dot{background:#fff;border:2px solid #07875f;border-radius:50%;width:8px;height:8px}.map-tag{background:#fff;border-radius:18px;padding:7px 10px;color:#087451;font-weight:800;box-shadow:0 1px 5px #0002}.leaflet-control-attribution{font-size:9px!important}</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function(){
 const stops=${safeJson(stopData)};
 const buses=${safeJson(busData)};
 const route=${safeJson(routeData)};
 const fallback=[${DEMO_CENTER.latitude},${DEMO_CENTER.longitude}];
 const center=buses.length?[buses[0].lat,buses[0].lng]:fallback;
 const map=L.map('map',{zoomControl:true}).setView(center,11);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
 const tag=L.control({position:'topleft'});
 tag.onAdd=function(){const d=L.DomUtil.create('div','map-tag');d.textContent='FIND MY BUS · OPENSTREETMAP';return d};tag.addTo(map);
 const locate=L.control({position:'topright'});
 locate.onAdd=function(){const b=L.DomUtil.create('button','map-tag');b.type='button';b.textContent='◎ My location';b.onclick=function(){map.locate({setView:true,maxZoom:15,enableHighAccuracy:true})};return b};locate.addTo(map);
 map.on('locationerror',function(){});
 stops.forEach(function(s){L.circleMarker([s.lat,s.lng],{radius:4,color:'#07875f',weight:2,fillColor:'#fff',fillOpacity:1}).bindTooltip(s.name,{direction:'top'}).addTo(map)});
 if(route.length>1){L.polyline(route.map(function(s){return [s.lat,s.lng]}),{color:'#07875f',weight:5,opacity:.9}).addTo(map)}
 buses.forEach(function(b){const marker=L.marker([b.lat,b.lng],{icon:L.divIcon({className:'',html:'<div class="bus-dot"></div>',iconSize:[18,18],iconAnchor:[9,9]})}).addTo(map);marker.bindPopup('<b>'+String(b.vehicle).replace(/[&<>"]/g,'')+'</b><br>'+String(b.currentStop).replace(/[&<>"]/g,'')+' → '+String(b.nextStop).replace(/[&<>"]/g,'')+'<br>ETA '+b.eta+' min');marker.on('click',function(){try{window.parent.postMessage({type:'find-my-bus-select',id:b.id},'*')}catch(e){}})});
 if(route.length>1){const bounds=L.latLngBounds(route.map(function(s){return [s.lat,s.lng]}));map.fitBounds(bounds.pad(.18),{maxZoom:12})}
 setTimeout(function(){map.invalidateSize()},200);
})();
</script></body></html>`;
  }, [JSON.stringify(stopData), JSON.stringify(busData), JSON.stringify(routeData)]);
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "find-my-bus-select" && typeof event.data.id === "string" && buses.some((bus) => bus.id === event.data.id)) onSelectBus?.(event.data.id);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [buses, onSelectBus]);
  return <View style={{ height: MAP_HEIGHT, backgroundColor: "#eaf0ed", borderRadius: 24, overflow: "hidden" }}>
    {React.createElement("iframe" as any, { ref: frameRef, title: "Find My Bus live OpenStreetMap", srcDoc: mapHtml, style: { width: "100%", height: MAP_HEIGHT, border: 0, display: "block" }, sandbox: "allow-scripts allow-same-origin allow-popups" })}
    <View pointerEvents="none" className="absolute bottom-2 left-2 rounded-full bg-white/95 px-3 py-1.5">
      <Text style={{ color: colors.primary }} className="text-[10px] font-bold">{buses.length ? `${buses.length} bus marker${buses.length === 1 ? "" : "s"} · select a marker for details` : "OpenStreetMap · waiting for driver GPS"}</Text>
    </View>
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
  const selected = buses.find((bus) => bus.id === selectedBusId) ?? buses[0];
  const routeNames = selected?.stopNames ?? [];
  const orderedNames = selected?.direction === "REVERSE" ? [...routeNames].reverse() : routeNames;
  const coordinates = orderedNames.map(findNamedStop).filter((stop): stop is NonNullable<typeof stop> => Boolean(stop)).map((stop) => ({ latitude: stop.latitude, longitude: stop.longitude }));
  return <View style={styles.nativeMap}><MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={{ ...DEMO_CENTER, latitudeDelta: 0.32, longitudeDelta: 0.32 }} showsUserLocation={false}><PolylineNative coordinates={coordinates} strokeColor={colors.primary} strokeWidth={5} />{STOPS.map((stop) => <Marker key={stop.id} coordinate={{ latitude: stop.latitude, longitude: stop.longitude }} title={stop.name} pinColor={colors.primary} />)}{buses.map((bus) => <Marker key={bus.id} coordinate={{ latitude: bus.latitude, longitude: bus.longitude }} title={bus.vehicle || bus.id} description={`${bus.currentStop} → ${bus.nextStop}`} pinColor={bus.id === selectedBusId ? colors.primary : colors.success} onPress={() => onSelectBus?.(bus.id)} />)}</MapView><View pointerEvents="none" className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5"><Text style={{ color: colors.primary }} className="text-[10px] font-extrabold tracking-widest">BUS TRACKING MAP</Text></View></View>;
}

const styles = StyleSheet.create({ nativeMap: { height: MAP_HEIGHT, overflow: "hidden", borderRadius: 24 } });
