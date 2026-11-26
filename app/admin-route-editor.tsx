import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader, PrimaryButton } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppState } from "@/lib/app-state";

type Point = { latitude:number; longitude:number };
type NamedPoint = Point & { name:string };
type Mode = "route" | "stop" | "erase";

export default function AdminRouteEditorScreen(){
 const colors=useColors();
 const params=useLocalSearchParams<{routeId?:string|string[]}>();
 const routeId=Array.isArray(params.routeId)?params.routeId[0]:params.routeId;
 const {routes,updateRoute}=useAppState();
 const route=routes.find(r=>r.id===routeId);
 const frame=useRef<any>(null);
 const [mode,setMode]=useState<Mode>("route");
 const [stopName,setStopName]=useState("");
 const [path,setPath]=useState<Point[]>(route?.routePath??[]);
 const [stops,setStops]=useState<NamedPoint[]>(route?.routeStops??[]);
 const [canUndo,setCanUndo]=useState(false),[canRedo,setCanRedo]=useState(false);
 const [message,setMessage]=useState("");
 useEffect(()=>{if(route){const nextPath=Array.isArray(route.routePath)?route.routePath:[];const nextStops=Array.isArray(route.routeStops)?route.routeStops:[];setPath(nextPath);setStops(nextStops);if(frame.current?.contentWindow){frame.current.contentWindow.postMessage({type:"route-editor-load",path:nextPath,stops:nextStops},"*");}}},[routeId,route?.id,route?.routePath,route?.routeStops]);
 useEffect(()=>{if(Platform.OS!=="web")return;const listener=(event:MessageEvent)=>{const d=event.data;if(d?.type==="route-editor-stop-added"){setStopName("");return}if(d?.type!=="route-editor-data")return;setPath(Array.isArray(d.path)?d.path:[]);setStops(Array.isArray(d.stops)?d.stops:[]);setCanUndo(!!d.canUndo);setCanRedo(!!d.canRedo)};window.addEventListener("message",listener);return()=>window.removeEventListener("message",listener)},[]);
 const html=useMemo(()=>`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{height:100%;margin:0}.hint{position:absolute;z-index:1000;top:10px;left:50%;transform:translateX(-50%);background:#17212b;color:#fff;padding:9px 14px;border-radius:20px;font:bold 12px Arial;box-shadow:0 2px 8px #0005;white-space:nowrap}.leaflet-container{background:#e8eee9}</style></head><body><div id="map"></div><div class="hint" id="hint">Tap along the road to draw</div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
const map=L.map('map').setView([12.88,74.86],13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
let mode='route',path=[],stops=[],name='',undoStack=[],redoStack=[];let line=L.polyline([],{color:'#078fa8',weight:6,lineCap:'round',lineJoin:'round'}).addTo(map);let layers=L.layerGroup().addTo(map);
function snapshot(){return JSON.stringify({path,stops})}
function remember(){undoStack.push(snapshot());if(undoStack.length>200)undoStack.shift();redoStack=[]}
function report(){parent.postMessage({type:'route-editor-data',path,stops,canUndo:undoStack.length>0,canRedo:redoStack.length>0},'*')}
function draw(){line.setLatLngs(path.map(p=>[p.latitude,p.longitude]));layers.clearLayers();stops.forEach((s,i)=>L.circleMarker([s.latitude,s.longitude],{radius:9,color:'#fff',weight:2,fillColor:'#087f52',fillOpacity:1}).bindTooltip(s.name).addTo(layers));path.forEach((p,i)=>L.circleMarker([p.latitude,p.longitude],{radius:4,color:'#fff',weight:1,fillColor:'#078fa8',fillOpacity:1}).addTo(layers));report()}
function restore(raw){const s=JSON.parse(raw);path=s.path||[];stops=s.stops||[];draw()}
function setMode(m,n){mode=m;name=n||'';document.getElementById('hint').textContent=m==='route'?'Tap along the road to draw':m==='stop'?'Enter a stop name, then tap its location':'Tap a stop or route point to delete'}
map.on('click',e=>{const p={latitude:e.latlng.lat,longitude:e.latlng.lng};if(mode==='route'){remember();path.push(p);draw()}else if(mode==='stop'){if(!name.trim()){alert('Enter a stop name first');return}remember();
function positionOnPath(point){
 if(path.length<2)return Number.POSITIVE_INFINITY;
 let cumulative=0,bestDistance=Number.POSITIVE_INFINITY,bestPosition=Number.POSITIVE_INFINITY;
 const lat0=point.latitude*Math.PI/180,scaleX=111320*Math.cos(lat0),scaleY=111320;
 const lengths=path.slice(0,-1).map((a,i)=>Math.hypot((path[i+1].longitude-a.longitude)*scaleX,(path[i+1].latitude-a.latitude)*scaleY));
 for(let i=0;i<path.length-1;i++){
  const a=path[i],b=path[i+1],ax=(a.longitude-point.longitude)*scaleX,ay=(a.latitude-point.latitude)*scaleY,bx=(b.longitude-point.longitude)*scaleX,by=(b.latitude-point.latitude)*scaleY,dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy||1;
  const t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/len)),dist=(ax+t*dx)**2+(ay+t*dy)**2;
  if(dist<bestDistance){bestDistance=dist;bestPosition=cumulative+lengths[i]*t;}
  cumulative+=lengths[i];
 }
 return bestPosition;
}
const added={...p,name:name.trim()};
const addedPosition=positionOnPath(added);
if(Number.isFinite(addedPosition)){
 const ordered=stops.map(s=>({stop:s,position:positionOnPath(s)}));
 ordered.push({stop:added,position:addedPosition});
 ordered.sort((a,b)=>a.position-b.position);
 stops=ordered.map(item=>item.stop);
}else{stops.push(added)}
name='';parent.postMessage({type:'route-editor-stop-added'},'*');draw()}else{const click=map.latLngToContainerPoint(e.latlng);let best={kind:'',index:-1,distance:25};stops.forEach((s,i)=>{const d=click.distanceTo(map.latLngToContainerPoint([s.latitude,s.longitude]));if(d<best.distance)best={kind:'stop',index:i,distance:d}});path.forEach((p,i)=>{const d=click.distanceTo(map.latLngToContainerPoint([p.latitude,p.longitude]));if(d<best.distance)best={kind:'point',index:i,distance:d}});if(best.index<0){return}remember();if(best.kind==='stop')stops.splice(best.index,1);else path.splice(best.index,1);draw()}});
window.addEventListener('message',e=>{const d=e.data||{};if(d.type==='route-editor-mode')setMode(d.mode,d.name);if(d.type==='route-editor-undo'&&undoStack.length){redoStack.push(snapshot());restore(undoStack.pop())}if(d.type==='route-editor-redo'&&redoStack.length){undoStack.push(snapshot());restore(redoStack.pop())}if(d.type==='route-editor-clear'){if(path.length||stops.length){remember();path=[];stops=[];draw()}}if(d.type==='route-editor-load'){path=d.path||[];stops=d.stops||[];undoStack=[];redoStack=[];draw();if(path.length)map.fitBounds(L.latLngBounds(path.map(p=>[p.latitude,p.longitude])).pad(.15))}});
draw();</script></body></html>`,[]);
 const send=(data:any)=>frame.current?.contentWindow?.postMessage(data,"*");
 const chooseMode=(m:Mode)=>{setMode(m);send({type:"route-editor-mode",mode:m,name:stopName})};
 const save=()=>{if(!route){setMessage("Route not found. Return to Admin and open its map editor again.");return}if(path.length<2){setMessage("Add at least two road points before saving.");return}if(stops.length<2){setMessage("Add at least a starting stop and destination stop.");return}const names=stops.map(s=>s.name);updateRoute(route.id,{origin:names[0],destination:names[names.length-1],stopNames:names.slice(1,-1),routePath:path,routeStops:stops});setMessage("Map changes saved to this route.");};
 const tool=(label:string,icon:keyof typeof MaterialIcons.glyphMap,onPress:()=>void,active:boolean,bg:string,fg:string,disabled=false)=><Pressable disabled={disabled} onPress={onPress} style={{backgroundColor:disabled?colors.surfaceAlt:bg,opacity:disabled?.45:1,borderWidth:active?2:0,borderColor:active?"#fff":"transparent"}} className="min-w-[74px] flex-1 items-center justify-center rounded-xl px-2 py-3"><MaterialIcons name={icon} size={21} color={disabled?colors.muted:fg}/><Text style={{color:disabled?colors.muted:fg}} className="mt-1 text-[11px] font-black">{label}</Text></Pressable>;
 if(!route)return <ScreenContainer className="px-5"><ScreenHeader title="Edit route map" subtitle="Route not found"/><Text className="text-foreground">Return to Admin and select a route.</Text></ScreenContainer>;
 return <ScreenContainer className="px-4" edges={["top","left","right"]}><ScreenHeader title="Edit route map" subtitle={`Route ${route.label} · edit existing drawing`}/>
 <View className="mb-2 rounded-xl bg-surface p-3"><Text className="font-black text-foreground">Editing existing map</Text><Text className="mt-1 text-xs text-muted">Your saved road and stops are loaded. Add to them or remove individual points and stops.</Text></View>
 <View className="mb-2 flex-row gap-2">{tool("Draw road","timeline",()=>chooseMode("route"),mode==="route",mode==="route"?"#087f9b":"#e5eef0",mode==="route"?"#fff":"#17343b")}{tool("Add stop","add-location-alt",()=>chooseMode("stop"),mode==="stop",mode==="stop"?"#087f52":"#e5f3eb",mode==="stop"?"#fff":"#155b39")}{tool("Erase","backspace",()=>chooseMode("erase"),mode==="erase",mode==="erase"?"#b42318":"#fce9e7",mode==="erase"?"#fff":"#8f1d16")}</View>
 <View className="mb-3 flex-row gap-2">{tool("Undo","undo",()=>send({type:"route-editor-undo"}),false,"#253344","#fff",!canUndo)}{tool("Redo","redo",()=>send({type:"route-editor-redo"}),false,"#253344","#fff",!canRedo)}{tool("Clear all","delete-sweep",()=>{if(typeof window!=="undefined"&&window.confirm("Clear the entire route drawing and all stops?"))send({type:"route-editor-clear"})},false,"#8f1d16","#fff",path.length===0&&stops.length===0)}</View>
 <TextInput value={stopName} onChangeText={v=>{setStopName(v);if(mode==="stop")send({type:"route-editor-mode",mode:"stop",name:v})}} placeholder="Enter stop name before tapping map" placeholderTextColor={colors.muted} className="mb-3 h-12 rounded-xl border border-border bg-background px-3 text-foreground"/>
 <View style={{height:440,borderRadius:18,overflow:"hidden",backgroundColor:"#eaf0ed"}}>{Platform.OS==="web"?React.createElement("iframe" as any,{ref:frame,title:"Admin route map editor",srcDoc:html,onLoad:()=>send({type:"route-editor-load",path:route?.routePath??path,stops:route?.routeStops??stops}),style:{width:"100%",height:"100%",border:0},sandbox:"allow-scripts allow-same-origin"}):<View className="flex-1 items-center justify-center p-5"><Text className="text-center text-foreground">Map drawing editor is currently available in the web Admin console. Open it in your phone browser.</Text></View>}</View>
 <View className="mt-3 rounded-xl bg-surface p-3"><Text className="font-black text-foreground">Road points: {path.length} · Stops: {stops.length}</Text><Text className="mt-1 text-xs text-muted">{mode==="erase"?"Tap an existing stop marker or blue road point to remove it.":mode==="stop"?"Enter a stop name above, then tap its exact map location.":"Tap the map along the road, including each bend."}</Text><ScrollView horizontal className="mt-2"><Text className="text-xs font-bold text-foreground">{stops.map(s=>s.name).join(" → ")||"No named stops yet"}</Text></ScrollView></View>
 <PrimaryButton title="Save map changes" icon="save" onPress={save} style={{marginTop:14}}/>
 {message?<Text className="mt-3 text-center text-xs font-bold text-primary">{message}</Text>:null}
 <Pressable onPress={()=>router.back()} className="mt-3 rounded-xl border border-border py-3"><Text className="text-center font-bold text-foreground">Back to Admin</Text></Pressable>
 </ScreenContainer>;
}
