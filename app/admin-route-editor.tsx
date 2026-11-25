import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader, PrimaryButton } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppState } from "@/lib/app-state";

type Point = { latitude:number; longitude:number };
type NamedPoint = Point & { name:string };

export default function AdminRouteEditorScreen(){
 const colors=useColors();
 const params=useLocalSearchParams<{routeId?:string|string[]}>();
 const routeId=Array.isArray(params.routeId)?params.routeId[0]:params.routeId;
 const {routes,updateRoute}=useAppState();
 const route=routes.find(r=>r.id===routeId);
 const frame=useRef<any>(null);
 const [mode,setMode]=useState<"route"|"stop">("route");
 const [stopName,setStopName]=useState("");
 const [path,setPath]=useState<Point[]>(route?.routePath??[]);
 const [stops,setStops]=useState<NamedPoint[]>(route?.routeStops??[]);
 const [message,setMessage]=useState("");
 useEffect(()=>{if(route){setPath(route.routePath??[]);setStops(route.routeStops??[])}},[routeId]);
 useEffect(()=>{if(Platform.OS!=="web")return;const listener=(event:MessageEvent)=>{const d=event.data;if(d?.type==="route-editor-stop-added"){setStopName("");return}if(d?.type!=="route-editor-data")return;setPath(Array.isArray(d.path)?d.path:[]);setStops(Array.isArray(d.stops)?d.stops:[])};window.addEventListener("message",listener);return()=>window.removeEventListener("message",listener)},[]);
 const html=useMemo(()=>`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{height:100%;margin:0} .hint{position:absolute;z-index:1000;top:10px;left:50%;transform:translateX(-50%);background:#fff;padding:8px 12px;border-radius:20px;font: bold 12px Arial;box-shadow:0 2px 8px #0003;white-space:nowrap}</style></head><body><div id="map"></div><div class="hint">Tap along the actual road to draw</div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
const map=L.map('map').setView([12.88,74.86],13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
let mode='route',path=[],stops=[],name='';let line=L.polyline([],{color:'#078fa8',weight:6}).addTo(map);let layers=L.layerGroup().addTo(map);
function draw(){line.setLatLngs(path.map(p=>[p.latitude,p.longitude]));layers.clearLayers();stops.forEach(s=>L.circleMarker([s.latitude,s.longitude],{radius:8,color:'#fff',weight:2,fillColor:'#087f52',fillOpacity:1}).bindTooltip(s.name).addTo(layers));path.forEach(p=>L.circleMarker([p.latitude,p.longitude],{radius:3,color:'#078fa8',fillColor:'#fff',fillOpacity:1}).addTo(layers));parent.postMessage({type:'route-editor-data',path,stops},'*')}
map.on('click',e=>{const p={latitude:e.latlng.lat,longitude:e.latlng.lng};if(mode==='route'){path.push(p)}else{if(!name.trim()){alert('Enter a stop name first');return}stops.push({...p,name:name.trim()});name='';parent.postMessage({type:'route-editor-stop-added'},'*')}draw()});
window.addEventListener('message',e=>{const d=e.data||{};if(d.type==='route-editor-mode'){mode=d.mode;name=d.name||''}if(d.type==='route-editor-undo'){if(mode==='stop')stops.pop();else path.pop();draw()}if(d.type==='route-editor-clear'){path=[];stops=[];draw()}if(d.type==='route-editor-load'){path=d.path||[];stops=d.stops||[];draw();if(path.length)map.fitBounds(L.latLngBounds(path.map(p=>[p.latitude,p.longitude])).pad(.15))}});
draw();</script></body></html>`,[]);
 const send=(data:any)=>frame.current?.contentWindow?.postMessage(data,"*");
 const save=()=>{if(!route){setMessage("Route not found. Return to Admin and open Draw route on map again.");return}if(path.length<2){setMessage("Tap at least two points along the road to draw the route.");return}if(stops.length<2){setMessage("Add at least a starting stop and destination stop.");return}const names=stops.map(s=>s.name);updateRoute(route.id,{origin:names[0],destination:names[names.length-1],stopNames:names.slice(1,-1),routePath:path,routeStops:stops});setMessage("Route drawing saved. Passenger maps will use these exact points.");};
 if(!route)return <ScreenContainer className="px-5"><ScreenHeader title="Draw route" subtitle="Route not found"/><Text className="text-foreground">Please return to Admin and select a route.</Text></ScreenContainer>;
 return <ScreenContainer className="px-4" edges={["top","left","right"]}><ScreenHeader title="Draw route on map" subtitle={`Route ${route.label} · manual road tracing`}/>
 <View className="flex-row flex-wrap gap-2 mb-3"><Pressable onPress={()=>{setMode("route");send({type:"route-editor-mode",mode:"route"})}} style={{backgroundColor:mode==="route"?colors.primary:colors.surfaceAlt}} className="rounded-xl px-4 py-3"><Text style={{color:mode==="route"?"white":colors.foreground}} className="font-bold">Draw road</Text></Pressable><Pressable onPress={()=>{setMode("stop");send({type:"route-editor-mode",mode:"stop",name:stopName})}} style={{backgroundColor:mode==="stop"?colors.primary:colors.surfaceAlt}} className="rounded-xl px-4 py-3"><Text style={{color:mode==="stop"?"white":colors.foreground}} className="font-bold">Add stop</Text></Pressable><Pressable onPress={()=>send({type:"route-editor-undo"})} className="rounded-xl bg-surfaceAlt px-4 py-3"><Text className="font-bold text-foreground">Undo</Text></Pressable><Pressable onPress={()=>{send({type:"route-editor-clear"});setPath([]);setStops([])}} className="rounded-xl bg-surfaceAlt px-4 py-3"><Text className="font-bold text-foreground">Clear</Text></Pressable></View>
 <TextInput value={stopName} onChangeText={v=>{setStopName(v);if(mode==="stop")send({type:"route-editor-mode",mode:"stop",name:v})}} placeholder="Stop name before tapping map" placeholderTextColor={colors.muted} className="mb-3 h-12 rounded-xl border border-border bg-background px-3 text-foreground"/>
 <View style={{height:440,borderRadius:18,overflow:"hidden",backgroundColor:"#eaf0ed"}}>{Platform.OS==="web"?React.createElement("iframe" as any,{ref:frame,title:"Admin manual route editor",srcDoc:html,onLoad:()=>send({type:"route-editor-load",path,stops}),style:{width:"100%",height:"100%",border:0},sandbox:"allow-scripts allow-same-origin"}):<View className="flex-1 items-center justify-center p-5"><Text className="text-center text-foreground">The drawing editor is currently available in the web Admin console. Open Find My Bus in a browser on your Redmi phone or computer.</Text></View>}</View>
 <View className="mt-3 rounded-xl bg-surface p-3"><Text className="font-bold text-foreground">Road points: {path.length} · Named stops: {stops.length}</Text><Text className="mt-1 text-xs text-muted">Tap the map in road mode to trace every bend. Switch to Add stop, enter its name, then tap the exact stop location.</Text><ScrollView horizontal className="mt-2"><Text className="text-xs text-foreground">{stops.map(s=>s.name).join(" → ")||"No stops added yet"}</Text></ScrollView></View>
 <PrimaryButton title="Save drawn route" icon="save" onPress={save} style={{marginTop:14}}/>
 {message?<Text className="mt-3 text-center text-xs font-bold text-primary">{message}</Text>:null}
 <Pressable onPress={()=>router.back()} className="mt-3 rounded-xl border border-border py-3"><Text className="text-center font-bold text-foreground">Back to Admin</Text></Pressable>
 </ScreenContainer>;
}
