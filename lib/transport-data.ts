export type Stop = {
  id: string; name: string; area: string; latitude: number; longitude: number; facilities: string[];
};
export type Route = {
  id: string; label: string; origin: string; destination: string; stopNames: string[]; stopIds: string[];
  duration: number; fare: number; frequency: string; firstBus: string; lastBus: string; color: string;
};
export type Trip = {
  id: string; routeId: string; busId: string; direction: "FORWARD" | "REVERSE";
  fromStop: string; toStop: string; departureTime: string; arrivalTime: string; breakMinutes?: number;
};
export type BusSeed = {
  id: string; routeId: string; vehicle: string; routeName?: string; stopNames?: string[];
  direction?: "FORWARD" | "REVERSE"; tripId?: string; departureTime: string; lastTripTime: string;
  progress: number; status: "ON TIME" | "DELAYED" | "STOPPED";
};
export type LiveBus = BusSeed & {
  latitude: number; longitude: number; currentStop: string; nextStop: string;
  eta: number; speed: number; heading: number; lastUpdated: number;
};
export const DEMO_CENTER = { latitude: 12.9102, longitude: 74.8465 };
export const STOPS: Stop[] = [
  { id:"statebank",name:"Statebank",area:"Central Mangaluru",latitude:12.8698,longitude:74.8423,facilities:["Shelter","Information"] },
  { id:"hampankatta",name:"Hampankatta",area:"Central Mangaluru",latitude:12.8667,longitude:74.8432,facilities:["Shelter","Retail"] },
  { id:"kottara",name:"Kottara",area:"North Mangaluru",latitude:12.9109,longitude:74.856,facilities:["Shelter","Lighting"] },
  { id:"kuloor",name:"Kuloor",area:"North Mangaluru",latitude:12.93,longitude:74.8514,facilities:["Shelter"] },
  { id:"surathkal",name:"Surathkal",area:"North Mangaluru",latitude:12.9724,longitude:74.7948,facilities:["Shelter","Restrooms"] },
  { id:"panambur",name:"Panambur",area:"North Mangaluru",latitude:12.9532,longitude:74.8117,facilities:["Shelter"] },
  { id:"nitk",name:"NITK",area:"Surathkal",latitude:12.9456,longitude:74.7973,facilities:["Shelter","Information"] },
  { id:"mulki",name:"Mulki",area:"Dakshina Kannada",latitude:13.091,longitude:74.793,facilities:["Shelter","Parking"] },
  { id:"udupi",name:"Udupi",area:"Udupi District",latitude:13.3409,longitude:74.7421,facilities:["Shelter","Retail","Information"] },
  { id:"kankanady",name:"Kankanady",area:"South Mangaluru",latitude:12.861,longitude:74.855,facilities:["Shelter","Lighting"] },
  { id:"pumpwell",name:"Pumpwell",area:"South Mangaluru",latitude:12.8625,longitude:74.8705,facilities:["Shelter"] },
  { id:"bantwal",name:"Bantwal",area:"Dakshina Kannada",latitude:12.8905,longitude:75.034,facilities:["Shelter","Parking"] },
  { id:"bc-road",name:"BC Road",area:"Dakshina Kannada",latitude:12.914,longitude:75.018,facilities:["Shelter","Information"] },
  { id:"bejai",name:"Bejai",area:"Mangaluru",latitude:12.899,longitude:74.851,facilities:["Shelter","Lighting"] },
  { id:"lalbagh",name:"Lalbagh",area:"Mangaluru",latitude:12.888,longitude:74.842,facilities:["Shelter","Park"] },
  { id:"kadri",name:"Kadri",area:"Mangaluru",latitude:12.882,longitude:74.859,facilities:["Shelter","Lighting"] },
  { id:"bendoorwell",name:"Bendoorwell",area:"Mangaluru",latitude:12.88,longitude:74.848,facilities:["Shelter"] },
  { id:"kavoor",name:"Kavoor",area:"North Mangaluru",latitude:12.93,longitude:74.87,facilities:["Shelter","Parking"] },
  { id:"mangaluru-junction",name:"Mangaluru Junction",area:"Kulashekar",latitude:12.8705,longitude:74.8864,facilities:["Shelter","Information"] },
  { id:"airport",name:"Mangaluru Airport",area:"Bajpe",latitude:12.9618,longitude:74.8901,facilities:["Shelter","Information","Parking"] },
  { id:"urva-store",name:"Urva Store",area:"Mangaluru",latitude:12.902,longitude:74.842,facilities:["Shelter"] },
  { id:"subrahmanya",name:"Subrahmanya",area:"Kadaba",latitude:12.6638,longitude:75.6154,facilities:["Shelter","Information"] },
  { id:"nettana",name:"Nettana",area:"Kadaba",latitude:12.7262,longitude:75.5538,facilities:["Shelter"] },
  { id:"mardala",name:"Mardala",area:"Dakshina Kannada",latitude:12.7428,longitude:75.508,facilities:["Shelter","Information"] },
  { id:"kadaba",name:"Kadaba",area:"Dakshina Kannada",latitude:12.743,longitude:75.4709,facilities:["Shelter","Retail","Information"] },
  { id:"alankaru",name:"Alankaru",area:"Dakshina Kannada",latitude:12.7774,longitude:75.3519,facilities:["Shelter"] },
  { id:"uppinangady",name:"Uppinangady",area:"Dakshina Kannada",latitude:12.835,longitude:75.2592,facilities:["Shelter","Information"] }
];
export const ROUTES: Route[] = [];
export const BUS_SEEDS: BusSeed[] = [];
export function slug(value:string){return value.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
export function routeStopIds(stopNames:string[]){return stopNames.map(slug);}
export function getStop(id:string){return STOPS.find(stop=>stop.id===id);}
export function getRoute(id:string){return ROUTES.find(route=>route.id===id);}
export function getBusesForRoute(routeId:string){return BUS_SEEDS.filter(bus=>bus.routeId===routeId);}
function stopCoordinates(name:string){const stop=STOPS.find(item=>item.name.toLowerCase()===name.toLowerCase());return stop?{latitude:stop.latitude,longitude:stop.longitude}:DEMO_CENTER;}
function orderedStops(bus:BusSeed){const names=bus.stopNames?.length?bus.stopNames:[];const ordered=bus.direction==="REVERSE"?[...names].reverse():names;return ordered.length?ordered:[bus.routeName||"Route"];}
export function hydrateBus(seed:BusSeed,now=Date.now()):LiveBus{
  const names=orderedStops(seed);const totalSegments=Math.max(names.length-1,1);const segmentProgress=Math.min(seed.progress,0.999)*totalSegments;
  const segmentIndex=Math.min(Math.floor(segmentProgress),totalSegments-1);const local=segmentProgress-segmentIndex;
  const currentName=names[segmentIndex]??names[0];const nextName=names[segmentIndex+1]??names[names.length-1]??currentName;
  const current=stopCoordinates(currentName);const next=stopCoordinates(nextName);
  const latitude=current.latitude+(next.latitude-current.latitude)*local;const longitude=current.longitude+(next.longitude-current.longitude)*local;
  const eta=Math.max(2,Math.round((1-local)*5+Math.max(0,names.length-segmentIndex-2)*7));
  const heading=Math.round(Math.atan2(next.longitude-current.longitude,next.latitude-current.latitude)*(180/Math.PI)+360)%360;
  const speed=seed.status==="STOPPED"?0:seed.status==="DELAYED"?26:34;
  return {...seed,latitude,longitude,currentStop:currentName,nextStop:nextName,eta,speed,heading,lastUpdated:now};
}
export function advanceBus(bus:LiveBus,seconds=4){const increment=bus.status==="STOPPED"?0:bus.status==="DELAYED"?seconds/3600:seconds/2800;return hydrateBus({...bus,progress:(bus.progress+increment)%1},Date.now());}
export function progressFromCoordinates(stopNames:string[]|undefined,latitude:number,longitude:number){
  const stops=(stopNames??[]).map(stopCoordinates);if(stops.length<2)return 0;let best=Number.POSITIVE_INFINITY;let bestProgress=0;
  for(let i=0;i<stops.length-1;i++){const a=stops[i],b=stops[i+1],dx=b.longitude-a.longitude,dy=b.latitude-a.latitude,len=dx*dx+dy*dy||1;
    const p=Math.max(0,Math.min(1,((longitude-a.longitude)*dx+(latitude-a.latitude)*dy)/len));const x=a.longitude+dx*p,y=a.latitude+dy*p;
    const d=(longitude-x)**2+(latitude-y)**2;if(d<best){best=d;bestProgress=(i+p)/(stops.length-1);}
  }return Math.max(0,Math.min(0.999,bestProgress));
}
export function planJourney(routes:Route[],trips:Trip[],from:string,to:string){
  const a=from.trim().toLowerCase(),b=to.trim().toLowerCase();if(!a||!b||a===b)return [];
  const matches:Array<{route:Route;trip:Trip;stopCount:number;journeyMinutes:number;fare:number}>= [];
  for(const route of routes){const names=route.stopNames.map(x=>x.toLowerCase());const fi=names.indexOf(a),ti=names.indexOf(b);if(fi<0||ti<0||fi===ti)continue;
    const direction=fi<ti?"FORWARD":"REVERSE";const start=Math.min(fi,ti),end=Math.max(fi,ti);const count=end-start;
    const journeyMinutes=Math.max(5,Math.round((route.duration/Math.max(route.stopNames.length-1,1))*count));const fare=Math.max(5,Math.round((route.fare/Math.max(route.stopNames.length-1,1))*count));
    trips.filter(t=>t.routeId===route.id&&t.direction===direction).forEach(trip=>matches.push({route,trip,stopCount:count,journeyMinutes,fare}));
  }return matches.sort((x,y)=>x.trip.departureTime.localeCompare(y.trip.departureTime));
}
