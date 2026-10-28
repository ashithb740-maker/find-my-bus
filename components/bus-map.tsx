import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { DEMO_CENTER, STOPS, type LiveBus } from "@/lib/transport-data";

const MAP_HEIGHT = 320;

function findNamedStop(name: string) {
  const normalized = name.trim().toLowerCase().replace(/[.]/g, "");
  const aliases: Record<string, string> = {
    subramanya: "subrahmanya",
    "subramanya temple": "subrahmanya",
    subrahmanya: "subrahmanya",
    uppinangadi: "uppinangady",
    uppinangady: "uppinangady",
  };
  const target = aliases[normalized] ?? normalized;
  return STOPS.find((stop) =>
    stop.name.toLowerCase() === target ||
    stop.id === target ||
    stop.id === target.replace(/[^a-z0-9]+/g, "-")
  );
}

function WebMap({ buses, selectedBusId, onSelectBus, routeStopNames }: { buses: LiveBus[]; selectedBusId?: string; onSelectBus?: (id: string) => void; routeStopNames?: string[] }) {
  const colors = useColors();
  const frameRef = useRef<any>(null);
  const selected = buses.find((bus) => bus.id === selectedBusId) ?? buses[0];
  const stopData = STOPS.map((stop) => ({ id: stop.id, name: stop.name, lat: stop.latitude, lng: stop.longitude }));
  const isLalbaghPadilBus = !!selected && (/lalbagh/i.test(selected.currentStop) || /KA-19-F-1999|61K/i.test(selected.id) || /lalbagh.*padil/i.test(selected.routeName || ""));
  const isTargetLalbaghPadilBus = !!selected && (/KA-19-F-1999|61K/i.test(selected.id) || /lalbagh.*padil/i.test(selected.routeName || ""));
  const routeNames = isTargetLalbaghPadilBus ? ["Lalbagh (KSRTC Bus Stand)", "Bejai Circle", "KPT", "Nanthoor", "Lower Bendoor Road", "Kankanady Bypass", "Pumpwell", "Padil"] : routeStopNames?.length ? routeStopNames : (selected?.stopNames?.length ? selected.stopNames : isLalbaghPadilBus ? ["Lalbagh (KSRTC Bus Stand)", "Bejai Circle", "KPT", "Nanthoor", "Lower Bendoor Road", "Kankanady Bypass", "Pumpwell", "Padil"] : []);
  const orderedNames = routeStopNames?.length ? routeNames : selected?.direction === "REVERSE" ? [...routeNames].reverse() : routeNames;
  const routeData = orderedNames.map((name) => {
    // Route-specific landmarks/road corridor for the Lalbagh–Padil service.
    // These positions are kept separate from the general stop catalogue.
    const key = name.toLowerCase();
    const custom: Record<string, { name: string; lat: number; lng: number }> = {
      "lalbagh": { name: "Lalbagh KSRTC Bus Stand", lat: 12.88470, lng: 74.84170 },
      "lalbagh (ksrtc bus stand)": { name: "Lalbagh KSRTC Bus Stand", lat: 12.88470, lng: 74.84170 },
      "bejai circle": { name: "Bejai Circle", lat: 12.89120, lng: 74.84970 },
      "kpt": { name: "KPT · Basaveshwara Circle", lat: 12.89135, lng: 74.85320 },
      "nanthoor": { name: "Nanthoor", lat: 12.88477, lng: 74.86077 },
      "lower bendoor road": { name: "Lower Bendoor Road", lat: 12.87590, lng: 74.85820 },
      "kankanady bypass": { name: "Kankanady Bypass", lat: 12.86960, lng: 74.86360 },
      "pumpwell": { name: "Pumpwell", lat: 12.86250, lng: 74.87050 },
      "padil": { name: "Padil", lat: 12.87150, lng: 74.88340 },
    };
    if (isTargetLalbaghPadilBus || isLalbaghPadilBus) { const customStop = custom[key]; if (customStop) return customStop; const fallbackStop = findNamedStop(name); return fallbackStop ? { name: fallbackStop.name, lat: fallbackStop.latitude, lng: fallbackStop.longitude } : null; }
    const stop = findNamedStop(name);
    return stop ? { name: stop.name, lat: stop.latitude, lng: stop.longitude } : null;
  }).filter((stop): stop is { name: string; lat: number; lng: number } => Boolean(stop));
  const busData = buses.map((bus) => ({ id: bus.id, vehicle: bus.vehicle || bus.id, lat: bus.latitude, lng: bus.longitude, currentStop: bus.currentStop, nextStop: bus.nextStop, eta: bus.eta, status: bus.status }));
  const mapHtml = useMemo(() => {
    const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
    return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#map{height:100%;width:100%;margin:0;padding:0;background:#eaf0ed;font-family:Arial,sans-serif}.leaflet-container{font:12px Arial,sans-serif}.bus-emoji{display:flex;align-items:center;justify-content:center;width:var(--bus-size,48px);height:var(--bus-size,48px);border-radius:calc(var(--bus-size,48px)*.33);background:#087f9b;border:2px solid #fff;box-shadow:0 2px 9px #2348;line-height:1;box-sizing:border-box}.bus-emoji svg{width:72%;height:72%;display:block}.stop-emoji{display:block;width:16px;height:16px;border-radius:50%;background:#006b45;border:3px solid #ffffff;box-shadow:0 0 0 2px #004b32,0 2px 7px #0008;box-sizing:border-box}.route-stop-label{background:#fff;border:1px solid #006b45;border-radius:6px;color:#004b32;font-weight:800;padding:2px 5px;box-shadow:0 1px 4px #0003}.map-tag{background:#fff;border-radius:18px;padding:7px 10px;color:#087451;font-weight:800;box-shadow:0 1px 5px #0002}.leaflet-control-attribution{font-size:9px!important}</style>
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
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,maxNativeZoom:19,subdomains:'abc',updateWhenZooming:false,updateWhenIdle:true,keepBuffer:4,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
 const tag=L.control({position:'topleft'});
 tag.onAdd=function(){const d=L.DomUtil.create('div','map-tag');d.textContent='FIND MY BUS · OPENSTREETMAP';return d};tag.addTo(map);
 const locate=L.control({position:'topright'});
 locate.onAdd=function(){const b=L.DomUtil.create('button','map-tag');b.type='button';b.textContent='◎ My location';b.onclick=function(){map.locate({setView:true,maxZoom:15,enableHighAccuracy:true})};return b};locate.addTo(map);
 map.on('locationerror',function(){});
 const addStopMarkers=function(snappedCoords){
   route.forEach(function(s,i){
     const pos=snappedCoords&&snappedCoords[i]?[snappedCoords[i][1],snappedCoords[i][0]]:[s.lat,s.lng];
     const icon=L.divIcon({className:'',html:'<div class="stop-emoji"></div>',iconSize:[16,16],iconAnchor:[8,8]});
     L.marker(pos,{icon,zIndexOffset:5000,keyboard:true}).bindTooltip(s.name,{permanent:false,direction:'top',offset:[0,-12],sticky:true,opacity:0.98,className:'route-stop-label'}).addTo(map);
   });
 };
  const busMarkers=[];
 const markerById={};
 window.addEventListener('message',function(event){const msg=event.data;if(!msg||msg.type!=='find-my-bus-update')return;(msg.buses||[]).forEach(function(b){const marker=markerById[b.id];if(marker&&Number.isFinite(b.lat)&&Number.isFinite(b.lng)){marker.setLatLng([b.lat,b.lng]);}})});
 const getBusIconSize=function(){
   const z=map.getZoom();
   // Keep the bus prominent when zoomed in and scale it down as the map zooms out.
   return Math.max(22,Math.min(48,22+(z-7)*4.3));
 };
 const refreshBusIcons=function(){
   const size=getBusIconSize();
   busMarkers.forEach(function(marker){
     const px=Math.round(size);
     marker.setIcon(L.divIcon({className:'',html:'<div class="bus-emoji" style="--bus-size:'+px+'px"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 5h24c3.9 0 6 2.8 6 6.5V34a3 3 0 0 1-3 3h-2v3.5a2.5 2.5 0 0 1-5 0V37H16v3.5a2.5 2.5 0 0 1-5 0V37H9a3 3 0 0 1-3-3V11.5C6 7.8 8.1 5 12 5Z" fill="#fff"/><path d="M12 10h24v14H12z" fill="#52d8ef"/><path d="M12 27h24v5H12z" fill="#52d8ef"/><path d="M10 34h4v3h-4zM34 34h4v3h-4z" fill="#fff"/><circle cx="12" cy="39" r="2.5" fill="#fff"/><circle cx="36" cy="39" r="2.5" fill="#fff"/></svg></div>',iconSize:[px,px],iconAnchor:[px/2,px/2]}));
   });
 };
 const addBusMarkers=function(){
   buses.forEach(function(b){
     const size=getBusIconSize();
     const marker=L.marker([b.lat,b.lng],{zIndexOffset:10000,icon:L.divIcon({className:'',html:'<div class="bus-emoji" style="--bus-size:'+size+'px"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 5h24c3.9 0 6 2.8 6 6.5V34a3 3 0 0 1-3 3h-2v3.5a2.5 2.5 0 0 1-5 0V37H16v3.5a2.5 2.5 0 0 1-5 0V37H9a3 3 0 0 1-3-3V11.5C6 7.8 8.1 5 12 5Z" fill="#fff"/><path d="M12 10h24v14H12z" fill="#52d8ef"/><path d="M12 27h24v5H12z" fill="#52d8ef"/><path d="M10 34h4v3h-4zM34 34h4v3h-4z" fill="#fff"/><circle cx="12" cy="39" r="2.5" fill="#fff"/><circle cx="36" cy="39" r="2.5" fill="#fff"/></svg></div>',iconSize:[size,size],iconAnchor:[size/2,size/2]})}).addTo(map);
     busMarkers.push(marker); markerById[b.id]=marker;
     marker.bindPopup('<b>'+String(b.vehicle).replace(/[&<>"]/g,'')+'</b><br>'+String(b.currentStop).replace(/[&<>"]/g,'')+' → '+String(b.nextStop).replace(/[&<>"]/g,'')+'<br>Bus location · GPS / simulation');
     marker.on('click',function(){try{window.parent.postMessage({type:'find-my-bus-select',id:b.id},'*')}catch(e){}});
   });
   map.on('zoomend',refreshBusIcons);
 };
 if(route.length>1){
   const roadUrl='https://router.project-osrm.org/route/v1/driving/'+route.map(function(s){return s.lng+','+s.lat}).join(';')+'?overview=full&geometries=geojson&steps=false&alternatives=false&continue_straight=true';
   fetch(roadUrl).then(function(response){if(!response.ok)throw new Error('Road route unavailable');return response.json()}).then(function(data){
     if(data.code!=='Ok'||!data.routes||!data.routes[0]||!data.routes[0].geometry)throw new Error('No road geometry');
     const coords=data.routes[0].geometry.coordinates.map(function(p){return [p[1],p[0]]});
     L.polyline(coords,{color:'#07875f',weight:6,opacity:.9,lineJoin:'round',lineCap:'round'}).addTo(map);
     // OSRM returns the actual snapped road-network waypoint for each requested stop.
     // Use those exact coordinates for markers so they sit on the routed path.
     const waypoints=(data.waypoints||[]).map(function(w){return w.location;});
     const snapped=waypoints.length===route.length?waypoints:null;
     // Draw the stop markers at the same snapped road coordinates used by OSRM.
     addStopMarkers(snapped);
   }).catch(function(){
     const coords=route.map(function(s){return [s.lat,s.lng]});
     // If the routing service fails, do not pretend a straight stop-to-stop line follows roads.
     addStopMarkers(null);
   });
 }else{addStopMarkers([]);}
 addBusMarkers();
 if(route.length>1){const bounds=L.latLngBounds(route.map(function(s){return [s.lat,s.lng]}));map.fitBounds(bounds.pad(.18),{maxZoom:15})}else if(buses.length){map.setView([buses[0].lat,buses[0].lng],13)}
 setTimeout(function(){map.invalidateSize()},200);
})();
</script></body></html>`;
  }, [JSON.stringify(stopData), JSON.stringify(routeData)]);
  useEffect(() => {
    if (Platform.OS !== "web" || !frameRef.current?.contentWindow) return;
    frameRef.current.contentWindow.postMessage({ type: "find-my-bus-update", buses: busData }, "*");
  }, [JSON.stringify(busData)]);
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

export function BusMap({ buses, selectedBusId, onSelectBus, routeStopNames }: { buses: LiveBus[]; selectedBusId?: string; onSelectBus?: (id: string) => void; routeStopNames?: string[] }) {
  const colors = useColors();
  const mapRef = useRef<any>(null);
  const native = useMemo(() => {
    if (Platform.OS === "web") return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("react-native-maps");
    } catch { return null; }
  }, []);
  if (Platform.OS === "web" || !native) return <WebMap buses={buses} selectedBusId={selectedBusId} onSelectBus={onSelectBus} routeStopNames={routeStopNames} />;
  const MapView = native.default;
  const Marker = native.Marker;
  const PolylineNative = native.Polyline;
  const selected = buses.find((bus) => bus.id === selectedBusId) ?? buses[0];
  const routeNames = routeStopNames?.length ? routeStopNames : (selected?.stopNames ?? []);
  const orderedNames = selected?.direction === "REVERSE" ? [...routeNames].reverse() : routeNames;
  const coordinates = orderedNames.map(findNamedStop).filter((stop): stop is NonNullable<typeof stop> => Boolean(stop)).map((stop) => ({ latitude: stop.latitude, longitude: stop.longitude }));
  return <View style={styles.nativeMap}><MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={{ ...DEMO_CENTER, latitudeDelta: 0.32, longitudeDelta: 0.32 }} showsUserLocation={false}><PolylineNative coordinates={coordinates} strokeColor={colors.primary} strokeWidth={5} />{STOPS.map((stop) => <Marker key={stop.id} coordinate={{ latitude: stop.latitude, longitude: stop.longitude }} title={stop.name} pinColor={colors.primary} />)}{buses.map((bus) => <Marker key={bus.id} coordinate={{ latitude: bus.latitude, longitude: bus.longitude }} title={bus.vehicle || bus.id} description={`${bus.currentStop} → ${bus.nextStop}`} pinColor={bus.id === selectedBusId ? colors.primary : colors.success} onPress={() => onSelectBus?.(bus.id)} />)}</MapView><View pointerEvents="none" className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5"><Text style={{ color: colors.primary }} className="text-[10px] font-extrabold tracking-widest">BUS TRACKING MAP</Text></View></View>;
}

const styles = StyleSheet.create({ nativeMap: { height: MAP_HEIGHT, overflow: "hidden", borderRadius: 24 } });
