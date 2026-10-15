# Find My Bus transport API

The Vercel function at `/api/transport` stores shared routes, trips, and buses in MongoDB Atlas.

Required Vercel environment variable:
- `MONGODB_URI`: server-side MongoDB connection string (never prefix with `EXPO_PUBLIC_`).
Optional:
- `MONGODB_DATABASE`: database name (defaults to `findmybus`).

This API is intended for the project's prototype. Before public production use, protect write access with administrator authentication and add request-size/rate limits.
