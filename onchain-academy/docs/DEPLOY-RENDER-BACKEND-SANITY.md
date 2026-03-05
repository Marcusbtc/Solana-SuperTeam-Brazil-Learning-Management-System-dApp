# Deploy Backend + Sanity on Render

This repo includes a Render blueprint in `render.yaml` with 3 services:

1. `superteam-academy-backend` (web service)
2. `superteam-academy-sanity-studio` (static site)
3. `superteam-leaderboard-rebuild` (cron job)

## 1) Create services from blueprint

1. Open Render Dashboard.
2. New -> Blueprint.
3. Select this GitHub repo and branch.
4. Render reads `render.yaml` and creates all 3 services.

## 2) Backend env vars

Set these on `superteam-academy-backend`:

- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_TOKEN`
- `INTERNAL_JOB_TOKEN`
- `CORS_ORIGIN` (frontend domain, e.g. `https://your-frontend.vercel.app`)
- `SOLANA_RPC_URL` (devnet or your RPC)
- `HELIUS_RPC_URL` (optional)
- `HELIUS_API_KEY` (optional)
- `CREDENTIAL_COLLECTIONS` (optional)
- `XP_MINT` (optional)
- `SANITY_PROJECT_ID`
- `SANITY_TOKEN` (Sanity read token)

Already set by blueprint defaults:

- `SANITY_DATASET=production`
- `SANITY_API_VERSION=2025-01-01`
- `SANITY_USE_CDN=false`

## 3) Sanity Studio env vars

Set these on `superteam-academy-sanity-studio`:

- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET=production`

## 4) Frontend env update (where frontend is hosted)

- `NEXT_PUBLIC_API_BASE_URL=https://<backend-render-domain>/v1`
- `ADMIN_TOKEN=<same value as backend ADMIN_TOKEN>`

## 5) Post-deploy checks

- Backend health: `GET https://<backend-domain>/health`
- Backend content: `GET https://<backend-domain>/v1/courses`
- Sanity studio opens: `https://<sanity-studio-domain>`
- Cron job succeeds with `200` calling `/v1/internal/jobs/leaderboard/rebuild`

## Notes

- Backend port automatically follows Render `PORT` via fallback in backend env parsing.
- Prisma migrations run at service start (`npm run prisma:deploy && npm run start`).
