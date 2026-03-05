# Vercel Deployment Runbook (Frontend First)

This runbook implements the delivery topology locked for submission:

- Frontend: **Vercel** (`onchain-academy/app`)
- Backend: **Render** (`onchain-academy/backend`)
- Database: **Supabase Postgres**
- CMS: **Sanity**

## 1) Prerequisites

1. GitHub repo connected to Vercel and Render.
2. Supabase project created with Postgres URL ready.
3. OAuth apps configured:
   - Google OAuth client
   - GitHub OAuth app
4. Sanity project/dataset provisioned.
5. Devnet RPC and optional Helius endpoint available.

## 2) Backend Deployment (Render + Supabase)

Use [render.yaml](/Users/marcus/Documents/solana/render.yaml) from repo root.

### 2.1 Render service settings

- Service type: `web`
- Root directory: `onchain-academy/backend`
- Build command: `npm install && npm run prisma:deploy && npm run build`
- Start command: `npm run start`
- Node version: `20`

### 2.2 Required backend env vars

| Variable | Required | Example |
|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://...sslmode=require` |
| `BACKEND_PORT` | Yes | `4000` |
| `CORS_ORIGIN` | Yes | `https://<frontend-domain>` |
| `JWT_SECRET` | Yes | `long-random-secret` |
| `SOLANA_RPC_URL` | Yes | `https://api.devnet.solana.com` |
| `XP_MINT` | Yes | `xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3` |
| `INTERNAL_JOB_TOKEN` | Yes | `long-random-token` |
| `ADMIN_TOKEN` | Yes | `long-random-token` |
| `HELIUS_RPC_URL` | No | `https://mainnet.helius-rpc-url` |
| `HELIUS_API_KEY` | No | `...` |
| `CREDENTIAL_COLLECTIONS` | No | `collectionA,collectionB` |
| `SANITY_PROJECT_ID` | Yes | `abcd1234` |
| `SANITY_DATASET` | Yes | `production` |
| `SANITY_API_VERSION` | Yes | `2025-01-01` |
| `SANITY_TOKEN` | Optional* | `...` |
| `SANITY_USE_CDN` | Yes | `false` |

`*` optional when public content reads are enough.

### 2.3 Render cron job

Enable the cron service in `render.yaml`:

- Name: `superteam-leaderboard-rebuild`
- Schedule: every 30 minutes (`*/30 * * * *`)
- Required env: `BACKEND_URL`, `INTERNAL_JOB_TOKEN`

### 2.4 Backend post-deploy checks

1. `GET https://<backend-domain>/health` returns `{ "status": "ok" }`
2. `GET https://<backend-domain>/v1/courses` returns course list
3. `POST /v1/internal/jobs/leaderboard/rebuild` with `x-internal-token` succeeds

## 3) Frontend Deployment (Vercel)

### 3.1 Project configuration

1. Import repository in Vercel.
2. Root Directory: `onchain-academy/app`
3. Install Command: `npm install`
4. Build Command: `npm run build`
5. Output: Next.js default
6. Node.js: `20`
7. Enable Preview Deployments.

### 3.2 Required frontend env vars (Preview + Production)

| Variable | Required | Example |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `https://<backend-domain>/v1` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Yes | `https://api.devnet.solana.com` |
| `NEXT_PUBLIC_PROGRAM_ID` | Yes | `ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf` |
| `NEXT_PUBLIC_XP_MINT` | Yes | `xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3` |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://<frontend-domain>` |
| `NEXTAUTH_URL` | Yes | `https://<frontend-domain>` |
| `NEXTAUTH_SECRET` | Yes | `long-random-secret` |
| `GOOGLE_CLIENT_ID` | Yes | `...` |
| `GOOGLE_CLIENT_SECRET` | Yes | `...` |
| `GITHUB_ID` | Yes | `...` |
| `GITHUB_SECRET` | Yes | `...` |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Yes | `G-XXXXXXX` |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | `phc_...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | `https://app.posthog.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | `https://...@...ingest.sentry.io/...` |
| `ADMIN_TOKEN` | Yes | same token family as backend admin proxy |
| `NEXT_PUBLIC_HELIUS_RPC_URL` | No | `https://...` |
| `NEXT_PUBLIC_CREDENTIAL_COLLECTIONS` | No | `collectionA,collectionB` |

If the Vercel project is not Git-connected, preview env scoping by branch is unavailable in CLI and production envs become the primary source of truth.

### 3.3 Preview access note

If your Vercel team has Deployment Protection enabled, preview URLs may return `401` to external reviewers.

- For a publicly reviewable submission demo, use the production URL or disable preview protection for the project.

## 4) OAuth Callback Lock (Must Match Production URL)

Google callback URL:

- `https://<frontend-domain>/api/auth/callback/google`

GitHub callback URL:

- `https://<frontend-domain>/api/auth/callback/github`

Also set backend `CORS_ORIGIN` to `https://<frontend-domain>`.

## 5) Release Gate (Automated)

Run from repo root:

```bash
npm run qa:release
```

Expanded command list:

```bash
npm run lint:app
npm run lint:backend
npm run build:app
npm run build:backend
npm run test:e2e:smoke
```

## 6) Manual Smoke Checklist (Pre-Submission)

1. Home renders and language switch works (`PT-BR`, `ES`, `EN`).
2. Catalog search + difficulty/topic/duration filters work.
3. Course detail shows modules/lessons/progress and enrollment CTA.
4. Lesson split-pane resize persists and challenge run returns pass/fail.
5. Wallet enrollment transaction signs and sends on Devnet.
6. Dashboard displays XP/level/streak.
7. Profile and public profile show credentials.
8. Leaderboard switches weekly/monthly/all-time.
9. Settings saves profile/preferences and account linking.
10. Certificate detail renders verification and export action.
11. GA4/PostHog events are visible in debug tools.
12. Sentry receives a test event.

## 7) Rollout Order

1. Deploy backend on Render.
2. Verify backend API health and cron.
3. Deploy frontend Preview (Vercel) against production backend.
4. Validate smoke checklist in Preview.
5. Promote frontend Production.
6. Run smoke checklist again in production.
7. Publish final submission artifacts.

## 8) Rollback

1. Revert Vercel project to previous stable deployment.
2. If backend regression: rollback Render service to previous deploy.
3. If migration-related: restore Supabase backup and redeploy previous backend image.
4. Re-run smoke checklist on rollback version before announcing recovery.
