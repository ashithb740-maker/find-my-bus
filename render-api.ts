import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const app = express();
const port = Number(process.env.PORT || 3000);
const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DATABASE || "findmybus";

app.use(express.json({ limit: "10mb" }));
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Pin");
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
    if (!(await requireApprovedDriver(req, res, busId))) return;
    await (await getDb()).collection("live_gps").updateOne({ busId }, { $set: update }, { upsert: true });
    res.json({ ok: true, location: update });
  } catch (error) {
    console.error("[gps POST]", error instanceof Error ? error.message : "Unknown error");
    res.status(503).json({ error: "GPS service unavailable. Check MongoDB environment configuration." });
  }
});


const tokenHash=(token:string)=>createHash("sha256").update(token).digest("hex");
const passwordHash=(password:string,salt:string)=>scryptSync(password,salt,64).toString("hex");
function secureEqual(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
function bearer(req:express.Request){const h=req.headers.authorization||"";return h.startsWith("Bearer ")?h.slice(7).trim():"";}
function adminOK(req:express.Request){const pin=process.env.ADMIN_PIN;const supplied=String(req.headers["x-admin-pin"]||"");return !!pin&&!!supplied&&secureEqual(pin,supplied);}
function driverPublic(d:any){return{id:String(d._id),name:d.name,phone:d.phone,status:d.status,assignedBusId:d.assignedBusId||null,createdAt:d.createdAt};}
async function getDriverSession(req:express.Request){
 const token=bearer(req);if(!token)return null;const db=await getDb();
 const session=await db.collection("driver_sessions").findOne({tokenHash:tokenHash(token),expiresAt:{$gt:new Date()}});
 if(!session)return null;const driver=await db.collection("drivers").findOne({_id:session.driverId});
 if(!driver||["removed","rejected"].includes(driver.status))return null;return{driver,session};
}
async function requireApprovedDriver(req:express.Request,res:express.Response,busId:string){
 const auth=await getDriverSession(req);if(!auth){res.status(401).json({error:"Driver sign in required"});return false;}
 if(auth.driver.status!=="approved"||!auth.driver.assignedBusId){res.status(403).json({error:"Your account is awaiting Admin approval and bus assignment"});return false;}
 if(auth.driver.assignedBusId!==busId){res.status(403).json({error:"GPS access is limited to the bus assigned to your driver account"});return false;}return true;
}
app.post("/api/drivers/register",async(req,res)=>{
 const name=String(req.body?.name||"").trim(),phone=String(req.body?.phone||"").replace(/\\D/g,""),password=String(req.body?.password||"");
 if(name.length<2||name.length>80||phone.length<10||phone.length>15||password.length<8||password.length>128)return res.status(400).json({error:"Enter your name, valid mobile number and a password of at least 8 characters."});
 try{const db=await getDb(),drivers=db.collection("drivers");await drivers.createIndex({phone:1},{unique:true});const salt=randomBytes(16).toString("hex");
 const result=await drivers.insertOne({name,phone,passwordSalt:salt,passwordHash:passwordHash(password,salt),status:"pending",assignedBusId:null,createdAt:new Date()});
 const driver=await drivers.findOne({_id:result.insertedId});return res.status(201).json({ok:true,driver:driverPublic(driver),message:"Registration submitted. Waiting for Admin approval."});
 }catch(e:any){if(e?.code===11000)return res.status(409).json({error:"This mobile number is already registered. Please sign in."});console.error("[driver register]",e);return res.status(503).json({error:"Driver registration service unavailable."});}
});
app.post("/api/drivers/login",async(req,res)=>{
 const phone=String(req.body?.phone||"").replace(/\\D/g,""),password=String(req.body?.password||"");
 try{const db=await getDb(),d=await db.collection("drivers").findOne({phone});if(!d||!secureEqual(passwordHash(password,d.passwordSalt),d.passwordHash))return res.status(401).json({error:"Incorrect mobile number or password."});
 if(["removed","rejected"].includes(d.status))return res.status(403).json({error:"This driver account is no longer active. Contact the Admin."});
 const token=randomBytes(32).toString("base64url");await db.collection("driver_sessions").insertOne({tokenHash:tokenHash(token),driverId:d._id,createdAt:new Date(),expiresAt:new Date(Date.now()+365*86400000)});
 return res.json({token,driver:driverPublic(d)});
 }catch(e){console.error("[driver login]",e);return res.status(503).json({error:"Driver login service unavailable."});}
});
app.get("/api/drivers/me",async(req,res)=>{try{const auth=await getDriverSession(req);if(!auth)return res.status(401).json({error:"Session expired. Please sign in again."});return res.json({driver:driverPublic(auth.driver)});}catch(e){console.error(e);return res.status(503).json({error:"Unable to load driver account."});}});
app.post("/api/drivers/logout",async(req,res)=>{try{const token=bearer(req);if(token)await(await getDb()).collection("driver_sessions").deleteOne({tokenHash:tokenHash(token)});return res.json({ok:true});}catch(e){console.error(e);return res.status(503).json({error:"Unable to sign out."});}});
app.post("/api/admin/verify",(req,res)=>adminOK(req)?res.json({ok:true}):res.status(401).json({error:"Incorrect Admin PIN or ADMIN_PIN is not configured on the API server."}));
app.get("/api/admin/drivers",async(req,res)=>{if(!adminOK(req))return res.status(401).json({error:"Admin authentication required."});try{const ds=await(await getDb()).collection("drivers").find({status:{$ne:"removed"}}).sort({createdAt:-1}).toArray();return res.json({drivers:ds.map(driverPublic)});}catch(e){console.error(e);return res.status(503).json({error:"Unable to load driver requests."});}});
app.post("/api/admin/drivers/:id/approve",async(req,res)=>{
 if(!adminOK(req))return res.status(401).json({error:"Admin authentication required."});const busId=String(req.body?.busId||"").trim().toUpperCase();if(!busId)return res.status(400).json({error:"Choose a bus before approving."});
 try{const db=await getDb(),state=await db.collection("transport_state").findOne({_id:"main"});if(!(state?.buses||[]).some((b:any)=>String(b.id).toUpperCase()===busId))return res.status(404).json({error:"Bus not found in fleet."});
 const occupied=await db.collection("drivers").findOne({assignedBusId:busId,status:"approved",_id:{$ne:new ObjectId(req.params.id)}});if(occupied)return res.status(409).json({error:"This bus is already assigned to another active driver."});
 const result=await db.collection("drivers").updateOne({_id:new ObjectId(req.params.id),status:{$in:["pending","approved"]}},{$set:{status:"approved",assignedBusId:busId,approvedAt:new Date()}});if(!result.matchedCount)return res.status(404).json({error:"Driver request not found."});return res.json({ok:true});
 }catch(e){console.error(e);return res.status(503).json({error:"Unable to approve driver."});}
});
app.post("/api/admin/drivers/:id/reject",async(req,res)=>{if(!adminOK(req))return res.status(401).json({error:"Admin authentication required."});try{const db=await getDb(),id=new ObjectId(req.params.id);const result=await db.collection("drivers").updateOne({_id:id,status:"pending"},{$set:{status:"rejected"}});if(!result.matchedCount)return res.status(404).json({error:"Pending request not found."});await db.collection("driver_sessions").deleteMany({driverId:id});return res.json({ok:true});}catch(e){console.error(e);return res.status(503).json({error:"Unable to reject driver."});}});
app.delete("/api/admin/drivers/:id",async(req,res)=>{if(!adminOK(req))return res.status(401).json({error:"Admin authentication required."});try{const db=await getDb(),id=new ObjectId(req.params.id);const result=await db.collection("drivers").updateOne({_id:id},{$set:{status:"removed",assignedBusId:null,removedAt:new Date()}});if(!result.matchedCount)return res.status(404).json({error:"Driver not found."});await db.collection("driver_sessions").deleteMany({driverId:id});return res.json({ok:true});}catch(e){console.error(e);return res.status(503).json({error:"Unable to remove driver."});}});

app.listen(port, "0.0.0.0", () => console.log(`Find My Bus API listening on port ${port}`));
