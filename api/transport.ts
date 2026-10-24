import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DATABASE || "findmybus";
const collectionName = "transport_state";

let clientPromise: Promise<MongoClient> | undefined;

function getClient() {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET" && req.method !== "PUT") {
    res.setHeader("Allow", "GET, PUT, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await getClient();
    const collection = client.db(databaseName).collection(collectionName);
    const id = "main";

    if (req.method === "GET") {
      const state = await collection.findOne({ _id: id });
      return res.status(200).json({
        exists: Boolean(state),
        routes: state?.routes ?? [],
        trips: state?.trips ?? [],
        buses: state?.buses ?? [],
        updatedAt: state?.updatedAt ?? null,
      });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!body || !Array.isArray(body.routes) || !Array.isArray(body.trips) || !Array.isArray(body.buses)) {
      return res.status(400).json({ error: "Expected routes, trips and buses arrays" });
    }

    await collection.updateOne(
      { _id: id },
      { $set: { routes: body.routes, trips: body.trips, buses: body.buses, updatedAt: new Date() } },
      { upsert: true },
    );
    return res.status(200).json({ ok: true, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Transport database API error:", error instanceof Error ? error.message : "Unknown error");
    return res.status(500).json({ error: "Database unavailable. Check MONGODB_URI and Atlas network access." });
  }
}
