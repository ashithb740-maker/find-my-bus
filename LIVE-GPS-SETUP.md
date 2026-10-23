# Live GPS setup

The driver app posts real device coordinates to `/api/gps`; the passenger bus page polls that endpoint every five seconds. The API stores the latest location per bus in MongoDB Atlas.

## Configure Vercel

In the Vercel project connected to this repository, open **Settings → Environment Variables** and add:

- `MONGODB_URI`: your Atlas connection string (keep this secret).
- `MONGODB_DATABASE`: `findmybus` (or your chosen database name).

Make sure your Atlas database user has read/write access and Atlas Network Access permits the deployed server to connect. Use the narrowest practical IP policy; only use 0.0.0.0/0 if you understand that it allows connections from any IP and your database credentials are strong. Redeploy after setting environment variables.

## Test

1. Open the deployed site using HTTPS on the driver's phone.
2. Start a trip and allow location access. Keep the driver page open while testing.
3. Open that bus's tracking page on a second device. Its map should use the latest shared coordinates after the API responds.
4. If the driver screen reports GPS error, inspect Vercel function logs and confirm the environment variables and Atlas access rules.

## Important limitations

This first iteration stores only the latest coordinate for each bus and polls every five seconds; it does not provide background GPS tracking after the driver closes the app. The GPS endpoint currently does not authenticate driver updates, so it is a project prototype and must not be used for a public production fleet until driver authorization and rate limiting are added. A successful Git commit does not itself verify a Vercel deployment.
