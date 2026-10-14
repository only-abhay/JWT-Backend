# Nestro backend

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in the MongoDB URL, JWT/encryption secret, and verified Brevo sender settings.
3. Run `npm run dev`.

The API listens on port `5000` by default. The frontend proxies `/api/*` to this server.

## Deploy to Render

- Create a Web Service with the repository root directory set to `backend`.
- Use `npm install` as the build command and `npm start` as the start command.
- Set the environment variables shown in `.env.example` in the Render dashboard. Set `NODE_ENV=production`, `FRONTEND_URL=https://nestro-frontend-nmcr.vercel.app`, `MONGO_DB_CATEGORY` to your MongoDB connection string, and the backend-only secrets/provider values.
- Deploy the service and confirm that opening the service root URL returns an API-running status.

Render supplies `PORT`; the backend uses it automatically. Keep the MongoDB network access rules configured to allow connections from the deployed service.
