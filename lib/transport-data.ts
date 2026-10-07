export type Stop = {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  facilities: string[];
};

export type Route = {
  id: string;
  label: string;
  origin: string;
  destination: string;
  stopIds: string[];
  duration: number;
  fare: number;
  frequency: string;
  firstBus: string;
  lastBus: string;
  color: string;
};

export type BusSeed = {
  id: string;
  routeId: string;
  vehicle: string;
  departureTime: string;
  lastTripTime: string;
  progress: number;
  status: "ON TIME" | "DELAYED" | "STOPPED";
};

export type LiveBus = BusSeed & {
  latitude: number;
  longitude: number;
  currentStop: string;
  nextStop: string;
  eta: number;
  speed: number;
  heading: number;
  lastUpdated: number;
};

export const DEMO_CENTER = { latitude: 12.9102, longitude: 74.8465 };

export const STOPS: Stop[] = [
  { id: "statebank", name: "Statebank", area: "Central Mangaluru", latitude: 12.8698, longitude: 74.8423, facilities: ["Shelter", "Information"] },
  { id: "hampankatta", name: "Hampankatta", area: "Central Mangaluru", latitude: 12.8667, longitude: 74.8432, facilities: ["Shelter", "Retail"] },
  { id: "kottara", name: "Kottara", area: "North Mangaluru", latitude: 12.9109, longitude: 74.856, facilities: ["Shelter", "Lighting"] },
  { id: "kuloor", name: "Kuloor", area: "North Mangaluru", latitude: 12.93, longitude: 74.8514, facilities: ["Shelter"] },
  { id: "surathkal", name: "Surathkal", area: "North Mangaluru", latitude: 12.9724, longitude: 74.7948, facilities: ["Shelter", "Restrooms"] },
  { id: "panambur", name: "Panambur", area: "North Mangaluru", latitude: 12.9532, longitude: 74.8117, facilities: ["Shelter"] },
  { id: "nitk", name: "NITK", area: "Surathkal", latitude: 12.9456, longitude: 74.7973, facilities: ["Shelter", "Information"] },
  { id: "mulki", name: "Mulki", area: "Dakshina Kannada", latitude: 13.091, longitude: 74.793, facilities: ["Shelter", "Parking"] },
  { id: "udupi", name: "Udupi", area: "Udupi District", latitude: 13.3409, longitude: 74.7421, facilities: ["Shelter", "Retail", "Information"] },
  { id: "kankanady", name: "Kankanady", area: "South Mangaluru", latitude: 12.861, longitude: 74.855, facilities: ["Shelter", "Lighting"] },
  { id: "pumpwell", name: "Pumpwell", area: "South Mangaluru", latitude: 12.8625, longitude: 74.8705, facilities: ["Shelter"] },
  { id: "bantwal", name: "Bantwal", area: "Dakshina Kannada", latitude: 12.8905, longitude: 75.034, facilities: ["Shelter", "Parking"] },
  { id: "bc-road", name: "BC Road", area: "Dakshina Kannada", latitude: 12.914, longitude: 75.018, facilities: ["Shelter", "Information"] },
  { id: "bejai", name: "Bejai", area: "Mangaluru", latitude: 12.899, longitude: 74.851, facilities: ["Shelter", "Lighting"] },
  { id: "lalbagh", name: "Lalbagh", area: "Mangaluru", latitude: 12.888, longitude: 74.842, facilities: ["Shelter", "Park"] },
  { id: "kadri", name: "Kadri", area: "Mangaluru", latitude: 12.882, longitude: 74.859, facilities: ["Shelter", "Lighting"] },
  { id: "bendoorwell", name: "Bendoorwell", area: "Mangaluru", latitude: 12.88, longitude: 74.848, facilities: ["Shelter"] },
  { id: "kavoor", name: "Kavoor", area: "North Mangaluru", latitude: 12.93, longitude: 74.87, facilities: ["Shelter", "Parking"] },
  { id: "mangaluru-junction", name: "Mangaluru Junction", area: "Kulashekar", latitude: 12.8705, longitude: 74.8864, facilities: ["Shelter", "Information"] },
  { id: "airport", name: "Mangaluru Airport", area: "Bajpe", latitude: 12.9618, longitude: 74.8901, facilities: ["Shelter", "Information", "Parking"] },
  { id: "urva-store", name: "Urva Store", area: "Mangaluru", latitude: 12.902, longitude: 74.842, facilities: ["Shelter"] },
];

export const ROUTES: Route[] = [
  { id: "101", label: "101", origin: "Mangaluru", destination: "Udupi", stopIds: ["statebank", "kottara", "kuloor", "surathkal", "mulki", "udupi"], duration: 80, fare: 55, frequency: "Every 15–20 min", firstBus: "05:30", lastBus: "21:45", color: "#0E7490" },
  { id: "102", label: "102", origin: "Mangaluru", destination: "Surathkal", stopIds: ["hampankatta", "statebank", "lalbagh", "bejai", "kottara", "kuloor", "surathkal"], duration: 42, fare: 35, frequency: "Every 12–15 min", firstBus: "05:45", lastBus: "22:15", color: "#F97316" },
  { id: "103", label: "103", origin: "Mangaluru", destination: "BC Road", stopIds: ["hampankatta", "kankanady", "pumpwell", "bantwal", "bc-road"], duration: 48, fare: 30, frequency: "Every 20 min", firstBus: "06:00", lastBus: "21:00", color: "#7C3AED" },
  { id: "104", label: "104", origin: "Mangaluru", destination: "Kankanady", stopIds: ["statebank", "hampankatta", "bendoorwell", "kankanady"], duration: 25, fare: 20, frequency: "Every 10 min", firstBus: "06:15", lastBus: "22:30", color: "#DB2777" },
  { id: "105", label: "105", origin: "Mangaluru", destination: "Panambur", stopIds: ["statebank", "kadri", "bejai", "kavoor", "kuloor", "panambur"], duration: 34, fare: 25, frequency: "Every 18 min", firstBus: "06:30", lastBus: "20:45", color: "#16A34A" },
];

export const BUS_SEEDS: BusSeed[] = [
  { id: "BUS-101", routeId: "101", vehicle: "KA-19-AB-1234", departureTime: "05:30", lastTripTime: "21:45", progress: 0.23, status: "ON TIME" },
  { id: "BUS-102", routeId: "102", vehicle: "KA-19-AC-2088", departureTime: "05:45", lastTripTime: "22:15", progress: 0.57, status: "ON TIME" },
  { id: "BUS-103", routeId: "103", vehicle: "KA-19-AD-7741", departureTime: "06:00", lastTripTime: "21:00", progress: 0.41, status: "DELAYED" },
  { id: "BUS-104", routeId: "104", vehicle: "KA-19-AE-0412", departureTime: "06:15", lastTripTime: "22:30", progress: 0.76, status: "ON TIME" },
  { id: "BUS-105", routeId: "105", vehicle: "KA-19-AF-9005", departureTime: "06:30", lastTripTime: "20:45", progress: 0.34, status: "ON TIME" },
  { id: "BUS-106", routeId: "102", vehicle: "KA-19-AG-3177", departureTime: "05:45", lastTripTime: "22:15", progress: 0.12, status: "STOPPED" },
  { id: "BUS-107", routeId: "101", vehicle: "KA-19-AH-6120", departureTime: "05:30", lastTripTime: "21:45", progress: 0.68, status: "ON TIME" },
  { id: "BUS-108", routeId: "103", vehicle: "KA-19-AJ-5522", departureTime: "06:00", lastTripTime: "21:00", progress: 0.84, status: "ON TIME" },
];

export function getStop(id: string) {
  return STOPS.find((stop) => stop.id === id);
}

export function getRoute(id: string) {
  return ROUTES.find((route) => route.id === id);
}

export function getBusesForRoute(routeId: string) {
  return BUS_SEEDS.filter((bus) => bus.routeId === routeId);
}

export function hydrateBus(seed: BusSeed, now = Date.now()): LiveBus {
  const route = getRoute(seed.routeId) ?? ROUTES[0];
  const stops = route.stopIds.map((id) => getStop(id)).filter(Boolean) as Stop[];
  const totalSegments = Math.max(stops.length - 1, 1);
  const segmentProgress = Math.min(seed.progress, 0.999) * totalSegments;
  const segmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1);
  const local = segmentProgress - segmentIndex;
  const current = stops[segmentIndex] ?? stops[0];
  const next = stops[segmentIndex + 1] ?? stops[stops.length - 1] ?? stops[0];
  const latitude = current.latitude + (next.latitude - current.latitude) * local;
  const longitude = current.longitude + (next.longitude - current.longitude) * local;
  const eta = Math.max(2, Math.round((1 - local) * 5 + Math.max(0, stops.length - segmentIndex - 2) * 7));
  const heading = Math.round(Math.atan2(next.longitude - current.longitude, next.latitude - current.latitude) * (180 / Math.PI) + 360) % 360;
  const speed = seed.status === "STOPPED" ? 0 : seed.status === "DELAYED" ? 26 : 34 + ((seed.id.charCodeAt(4) || 0) % 8);
  return { ...seed, latitude, longitude, currentStop: current.name, nextStop: next.name, eta, speed, heading, lastUpdated: now };
}

export function advanceBus(bus: LiveBus, seconds = 4): LiveBus {
  const increment = bus.status === "STOPPED" ? 0 : bus.status === "DELAYED" ? seconds / 3600 : seconds / 2800;
  const nextSeed = { ...bus, progress: (bus.progress + increment) % 1 };
  return hydrateBus(nextSeed, Date.now());
}

export function progressFromCoordinates(routeId: string, latitude: number, longitude: number) {
  const route = getRoute(routeId);
  const stops = route?.stopIds.map((id) => getStop(id)).filter(Boolean) as Stop[] | undefined;
  if (!stops || stops.length < 2) return 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestProgress = 0;
  for (let index = 0; index < stops.length - 1; index += 1) {
    const start = stops[index];
    const end = stops[index + 1];
    const dx = end.longitude - start.longitude;
    const dy = end.latitude - start.latitude;
    const lengthSquared = dx * dx + dy * dy || 1;
    const projection = Math.max(0, Math.min(1, ((longitude - start.longitude) * dx + (latitude - start.latitude) * dy) / lengthSquared));
    const projectedLongitude = start.longitude + dx * projection;
    const projectedLatitude = start.latitude + dy * projection;
    const distance = (longitude - projectedLongitude) ** 2 + (latitude - projectedLatitude) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestProgress = (index + projection) / (stops.length - 1);
    }
  }
  return Math.max(0, Math.min(0.999, bestProgress));
}

export function searchTransport(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return { buses: [], routes: [], stops: [] };
  return {
    buses: BUS_SEEDS.filter((bus) => bus.id.toLowerCase().includes(normalized) || bus.vehicle.toLowerCase().includes(normalized) || `${getRoute(bus.routeId)?.origin} ${getRoute(bus.routeId)?.destination}`.toLowerCase().includes(normalized)),
    routes: ROUTES.filter((route) => `${route.label} ${route.origin} ${route.destination}`.toLowerCase().includes(normalized)),
    stops: STOPS.filter((stop) => `${stop.name} ${stop.area}`.toLowerCase().includes(normalized)),
  };
}

export function planJourney(fromId: string, toId: string) {
  const direct = ROUTES.filter((route) => route.stopIds.includes(fromId) && route.stopIds.includes(toId) && route.stopIds.indexOf(fromId) < route.stopIds.indexOf(toId));
  return direct.map((route) => {
    const fromIndex = route.stopIds.indexOf(fromId);
    const toIndex = route.stopIds.indexOf(toId);
    const stopCount = toIndex - fromIndex;
    const journeyMinutes = Math.max(8, Math.round((route.duration / (route.stopIds.length - 1)) * stopCount));
    const activeBus = hydrateBus(BUS_SEEDS.find((bus) => bus.routeId === route.id) ?? BUS_SEEDS[0]);
    return { route, stopCount, journeyMinutes, eta: activeBus.eta, fare: Math.max(10, Math.round((route.fare / (route.stopIds.length - 1)) * stopCount)) };
  });
}

export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const lat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const lon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h = Math.sin(lat / 2) ** 2 + Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * Math.sin(lon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
