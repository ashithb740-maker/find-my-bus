import { describe, expect, it } from "vitest";
import { BUS_SEEDS, hydrateBus, planJourney, searchTransport, advanceBus, getRoute } from "../lib/transport-data";

describe("Find My Bus transport data", () => {
  it("hydrates a bus on its configured route with a next stop and ETA", () => {
    const bus = hydrateBus(BUS_SEEDS[0], 1_700_000_000_000);
    expect(bus.id).toBe("BUS-101");
    expect(bus.currentStop).toBeTruthy();
    expect(bus.nextStop).toBeTruthy();
    expect(bus.eta).toBeGreaterThan(0);
    expect(bus.latitude).toBeGreaterThan(12.8);
    expect(bus.longitude).toBeGreaterThan(74.7);
  });

  it("advances a moving bus along its route instead of teleporting randomly", () => {
    const before = hydrateBus({ ...BUS_SEEDS[0], progress: 0.2 }, 1_700_000_000_000);
    const after = advanceBus(before, 4);
    expect(after.progress).toBeGreaterThan(before.progress);
    expect(after.routeId).toBe(before.routeId);
    expect(after.lastUpdated).toBeGreaterThanOrEqual(before.lastUpdated);
  });

  it("keeps stopped buses stationary", () => {
    const stopped = hydrateBus({ ...BUS_SEEDS[0], status: "STOPPED", progress: 0.2 }, 1_700_000_000_000);
    const after = advanceBus(stopped, 4);
    expect(after.progress).toBe(stopped.progress);
    expect(after.speed).toBe(0);
  });

  it("finds buses, routes, and stops from one search interface", () => {
    const results = searchTransport("Udupi");
    expect(results.buses.some((bus) => bus.id === "BUS-101")).toBe(true);
    expect(results.routes.some((route) => route.destination === "Udupi")).toBe(true);
    expect(results.stops.some((stop) => stop.name === "Udupi")).toBe(true);
  });

  it("plans a direct Kottara to Surathkal journey with an estimated fare", () => {
    const results = planJourney("kottara", "surathkal");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].route.id).toBe("101");
    expect(results[0].stopCount).toBeGreaterThan(0);
    expect(results[0].fare).toBeGreaterThan(0);
  });

  it("keeps route stop references valid", () => {
    const route = getRoute("102");
    expect(route?.stopIds.length).toBeGreaterThan(3);
  });
});
