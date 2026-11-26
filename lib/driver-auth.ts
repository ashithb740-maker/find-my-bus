import AsyncStorage from "@react-native-async-storage/async-storage";
import {Platform} from "react-native";
const API_BASE=process.env.EXPO_PUBLIC_API_BASE_URL||"https://find-my-bus-api-8yqn.onrender.com";
export const DRIVER_API_BASE=API_BASE.endsWith("/")?API_BASE.slice(0,-1):API_BASE;
const TOKEN="fmb-driver-session",ADMIN="fmb-admin-session";
async function get(k:string){return Platform.OS==="web"?(typeof window!=="undefined"?window.localStorage.getItem(k):null):AsyncStorage.getItem(k);}
async function set(k:string,v:string){if(Platform.OS==="web"){if(typeof window!=="undefined")window.localStorage.setItem(k,v);}else await AsyncStorage.setItem(k,v);}
async function del(k:string){if(Platform.OS==="web"){if(typeof window!=="undefined")window.localStorage.removeItem(k);}else await AsyncStorage.removeItem(k);}
export const getDriverToken=()=>get(TOKEN),setDriverToken=(v:string)=>set(TOKEN,v),clearDriverToken=()=>del(TOKEN);
export const getAdminPin=()=>get(ADMIN),setAdminPin=(v:string)=>set(ADMIN,v),clearAdminPin=()=>del(ADMIN);
export async function driverApi(path:string,init:RequestInit={},token?:string|null){const t=token===undefined?await getDriverToken():token;const headers=new Headers(init.headers||{});if(init.body&&!headers.has("Content-Type"))headers.set("Content-Type","application/json");if(t)headers.set("Authorization",`Bearer ${t}`);const r=await fetch(DRIVER_API_BASE+path,{...init,headers});const d=await r.json().catch(()=>({error:"Unexpected server response"}));if(!r.ok)throw new Error(d.error||"Request failed");return d;}
export async function adminApi(path:string,init:RequestInit={}){const pin=await getAdminPin(),headers=new Headers(init.headers||{});headers.set("X-Admin-Pin",pin||"");if(init.body&&!headers.has("Content-Type"))headers.set("Content-Type","application/json");const r=await fetch(DRIVER_API_BASE+path,{...init,headers});const d=await r.json().catch(()=>({error:"Unexpected server response"}));if(!r.ok)throw new Error(d.error||"Admin request failed");return d;}
