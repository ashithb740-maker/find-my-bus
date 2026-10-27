import express from "express";
import { MongoClient } from "mongodb";

const app = express();
const port = Number(process.env.PORT || 3000);
const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DATABASE || "findmybus";

app.use(express.json({ limit: "10mb" }));
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

let clientPromise: Promise<MongoClient> | undefined;
function getDb() {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!clientPromise) clientPromise = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 }).connect();
  return clientPromise.then(client => client.db(databaseName));
}

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "find-my-bus-api" }));

app.get("/api/transport", async (_req, res) => {
  try {
    const state = await (await getDb()).collection("transport_state").findOne({ _id: "main" });
    res.json({
      exists: Boolean(state),
      routes: state?.routes ?? [],
      trips: state?.trips ?? [],
      buses: state?.buses ?? [],
      updatedAt: state?.updatedAt ?? null
    });
  } catch (error) {
    console.error("[transport GET]", error instanceof Error ? error.message : "Unknown error");
    res.status(503).json({ error: "Database unavailable. Check MONGODB_URI and Atlas network access." });
  }
});

app.put("/api/transport", async (req, res) => {
  const body = req.body;
  if (!body || !Array.isArray(body.routes) || !Array.isArray(body.trips) || !Array.isArray(body.buses)) {
    return res.status(400).json({ error: "Expected routes, trips and buses arrays" });
  }
  try {
    const updatedAt = new Date();
    await (await getDb()).collection("transport_state").updateOne(
      { _id: "main" },
      { $set: { routes: body.routes, trips: body.trips, buses: body.buses, updatedAt } },
      { upsert: true }
    );
    res.json({ ok: true, updatedAt: updatedAt.toISOString() });
  } catch (error) {
    console.error("[transport PUT]", error instanceof Error ? error.message : "Unknown error");
    res.status(503).json({ error: "Database unavailable. Check MONGODB_URI and Atlas network access." });
  }
});

app.get("/api/gps", async (req, res) => {
  const busId = String(req.query.busId || "").trim().toUpperCase();
  if (!busId) return res.status(400).json({ error: "busId is required" });
  try {
    const location = await (await getDb()).collection("live_gps").findOne({ busId }, { projection: { _id: 0 } });
    if (!location) return res.status(404).json({ error: "No GPS update for this bus yet" });
    res.json(location);
  } catch (error) {
    console.error("[gps GET]", error instanceof Error ? error.message : "Unknown error");
    res.status(503).json({ error: "GPS service unavailable. Check MongoDB environment configuration." });
  }
});

app.post("/api/gps", async (req, res) => {
  const body = req.body;
  const busId = typeof body?.busId === "string" ? body.busId.trim().toUpperCase() : "";
  const latitude = Number(body?.latitude);
  const longitude = Number(body?.longitude);
  const speed = Number(body?.speed);
  const heading = Number(body?.heading);
  if (!busId || busId.length > 40 || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: "Valid busId, latitude and longitude are required" });
  }
  const update = {
    busId, latitude, longitude,
    speed: Number.isFinite(speed) ? Math.max(0, speed) : 0,
    heading: Number.isFinite(heading) ? heading : 0,
    updatedAt: Date.now()
  };
  try {
    await (await getDb()).collection("live_gps").updateOne({ busId }, { $set: update }, { upsert: true });
    res.json({ ok: true, location: update });
  } catch (error) {
    console.error("[gps POST]", error instanceof Error ? error.message : "Unknown error");
    res.status(503).json({ error: "GPS service unavailable. Check MongoDB environment configuration." });
  }
});

app.listen(port, "0.0.0.0", () => console.log(`Find My Bus API listening on port ${port}`));
