import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { advanceBus, BUS_SEEDS, hydrateBus, type LiveBus, type BusSeed } from "./transport-data";

type Alert = { id: string; busId: string; stopName: string; threshold: number; enabled: boolean };
type AppStateValue = {
  buses: LiveBus[];
  savedBuses: string[];
  savedRoutes: string[];
  savedStops: string[];
  alerts: Alert[];
  isOffline: boolean;
  demoLocation: boolean;
  toggleSaved: (kind: "bus" | "route" | "stop", id: string) => void;
  addAlert: (busId: string, stopName: string) => void;
  removeAlert: (id: string) => void;
  setOffline: (value: boolean) => void;
  setDemoLocation: (value: boolean) => void;
  addBus: (bus: { id: string; routeId: string; vehicle: string }) => void;
  removeBus: (id: string) => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);
const STORAGE_KEY = "find-my-bus-local-state";

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [buses, setBuses] = useState<LiveBus[]>(() => BUS_SEEDS.map((bus) => hydrateBus(bus)));
  const [savedBuses, setSavedBuses] = useState<string[]>(["BUS-101"]);
  const [savedRoutes, setSavedRoutes] = useState<string[]>(["102"]);
  const [savedStops, setSavedStops] = useState<string[]>(["kottara"]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOffline, setOffline] = useState(false);
  const [demoLocation, setDemoLocation] = useState(true);
  const [customBuses, setCustomBuses] = useState<BusSeed[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored);
        setSavedBuses(parsed.savedBuses ?? []);
        setSavedRoutes(parsed.savedRoutes ?? []);
        setSavedStops(parsed.savedStops ?? []);
        setAlerts(parsed.alerts ?? []);
        setOffline(Boolean(parsed.isOffline));
        setDemoLocation(parsed.demoLocation !== false);
        setCustomBuses(parsed.customBuses ?? []);
        setBuses([...BUS_SEEDS, ...(parsed.customBuses ?? [])].map((bus) => hydrateBus(bus)));
      } catch {
        // Keep safe in-memory defaults if local storage is unavailable.
      }
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isOffline) setBuses((current) => current.map((bus) => advanceBus(bus)));
    }, 4000);
    return () => clearInterval(timer);
  }, [isOffline]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ savedBuses, savedRoutes, savedStops, alerts, isOffline, demoLocation, customBuses })).catch(() => undefined);
  }, [savedBuses, savedRoutes, savedStops, alerts, isOffline, demoLocation, customBuses]);

  const value = useMemo<AppStateValue>(() => ({
    buses,
    savedBuses,
    savedRoutes,
    savedStops,
    alerts,
    isOffline,
    demoLocation,
    toggleSaved: (kind, id) => {
      const setter = kind === "bus" ? setSavedBuses : kind === "route" ? setSavedRoutes : setSavedStops;
      setter((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    },
    addAlert: (busId, stopName) => setAlerts((current) => current.some((item) => item.busId === busId && item.stopName === stopName) ? current : [...current, { id: `${busId}-${stopName}`, busId, stopName, threshold: 5, enabled: true }]),
    removeAlert: (id) => setAlerts((current) => current.filter((item) => item.id !== id)),
    setOffline,
    setDemoLocation,
    addBus: ({ id, routeId, vehicle }) => {
      const seed = { id, routeId, vehicle, progress: 0.08, status: "ON TIME" as const };
      setCustomBuses((current) => [...current, seed]);
      setBuses((current) => [...current, hydrateBus(seed)]);
    },
    removeBus: (id) => {
      setCustomBuses((current) => current.filter((bus) => bus.id !== id));
      setBuses((current) => current.filter((bus) => bus.id !== id));
    },
  }), [alerts, buses, customBuses, demoLocation, isOffline, savedBuses, savedRoutes, savedStops]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error("useAppState must be used inside AppStateProvider");
  return value;
}
