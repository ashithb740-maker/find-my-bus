import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";

type GpsUpdate = { busId: string; latitude: number; longitude: number; speed: number; heading: number; updatedAt: number };
let clientPromise: Promise<MongoClient> | undefined;
function database() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!clientPromise) clientPromise = new MongoClient(uri).connect();
  return clientPromise.then((client) => client.db(process.env.MONGODB_DATABASE || "findmybus"));
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const db = await database();
    const collection = db.collection<GpsUpdate>("live_gps");
    if (req.method === "GET") {
      const busId = String(req.query.busId || "").trim().toUpperCase();
      if (!busId) return res.status(400).json({ error: "busId is required" });
      const location = await collection.findOne({ busId }, { projection: { _id: 0 } });
      return location ? res.status(200).json(location) : res.status(404).json({ error: "No GPS update for this bus yet" });
    }
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const busId = typeof body?.busId === "string" ? body.busId.trim().toUpperCase() : "";
      const latitude = Number(body?.latitude), longitude = Number(body?.longitude);
      const speed = Number(body?.speed), heading = Number(body?.heading);
      if (!busId || busId.length > 40 || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: "Valid busId, latitude and longitude are required" });
      }
      const update: GpsUpdate = { busId, latitude, longitude, speed: Number.isFinite(speed) ? Math.max(0, speed) : 0, heading: Number.isFinite(heading) ? heading : 0, updatedAt: Date.now() };
      await collection.updateOne({ busId }, { $set: update }, { upsert: true });
      return res.status(200).json({ ok: true, location: update });
    }
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("[gps-api]", error);
    return res.status(503).json({ error: "GPS service unavailable. Check MongoDB environment configuration." });
  }
}