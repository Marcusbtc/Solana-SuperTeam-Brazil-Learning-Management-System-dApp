# Superteam Academy

Decentralized learning platform on Solana. Learners enroll in courses, complete lessons to earn soulbound XP tokens, receive Metaplex Core credential NFTs, and collect achievements. Course creators earn XP rewards. Platform governed by multisig authority.

## Monorepo Structure

```
superteam-academy/
├── onchain-academy/          ← Anchor program (deployed on devnet)
│   ├── programs/             ← Rust program source (16 instructions)
│   ├── tests/                ← 77 Rust + 62 TypeScript tests
│   ├── scripts/              ← Devnet interaction scripts
│   ├── app/                  ← Next.js frontend client
│   ├── backend/              ← Fastify + Prisma API
│   └── cms/                  ← Sanity schemas and studio config
├── docker-compose.yml        ← Local PostgreSQL for development
├── ARCHITECTURE.md           ← App + backend architecture notes
├── CMS_GUIDE.md              ← CMS structure and workflow
├── CUSTOMIZATION.md          ← Theme, i18n, and gamification extension guide
├── sdk/                      ← TypeScript SDK (future)
│   ├── docs/                 ← Documentation
│   │   ├── SPEC.md           ← Program specification
│   │   ├── ARCHITECTURE.md   ← Account maps, data flows, CU budgets
│   │   ├── INTEGRATION.md    ← Frontend integration guide
│   │   └── DEPLOY-PROGRAM.md ← Deploy your own devnet instance
└── wallets/                  ← Keypairs (gitignored)
```

## Quick Start (Application Layer)

```bash
git clone https://github.com/solanabr/superteam-academy.git
cd superteam-academy

# Install app + backend dependencies
npm install

# Copy env vars
cp .env.example .env
cp onchain-academy/app/.env.example onchain-academy/app/.env.local
cp onchain-academy/backend/.env.example onchain-academy/backend/.env

# Start local PostgreSQL
npm run db:up

# Generate Prisma client and migrate schema
npm run db:generate
npm run db:migrate
npm run db:seed

# Start backend (port 4000)
npm run dev:backend

# Start frontend (port 3000)
npm run dev:app
```

## Quick Start (On-Chain Program)

```bash
cd onchain-academy

# Install dependencies
yarn install

# Build the program
anchor build

# Run tests (localnet)
anchor test

# Rust unit tests
cargo test --manifest-path tests/rust/Cargo.toml
```

## Devnet Deployment

The program is live on devnet:

| | Address |
|---|---|
| **Program** | [`ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf`](https://explorer.solana.com/address/ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf?cluster=devnet) |
| **XP Mint** | [`xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3`](https://explorer.solana.com/address/xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3?cluster=devnet) |
| **Authority** | [`ACAd3USj2sMV6drKcMY2wZtNkhVDHWpC4tfJe93hgqYn`](https://explorer.solana.com/address/ACAd3USj2sMV6drKcMY2wZtNkhVDHWpC4tfJe93hgqYn?cluster=devnet) |

Frontend bounty applicants: [deploy your own instance](onchain-academy/docs/DEPLOY-PROGRAM.md) on devnet.

## Database Environments

- Development: local PostgreSQL via Docker Compose (`localhost:5432`)
- Production: Supabase Postgres (`DATABASE_URL` with SSL enabled)
- Migration command in production pipeline: `npm run db:deploy`

## Application Auth

- **Auth.js** session layer in `onchain-academy/app/` with:
  - Google OAuth
  - GitHub OAuth
  - Wallet SIWS credentials provider (nonce + signature verification via backend)
- OAuth-first bootstrap endpoint:
  - `POST /v1/auth/oauth/bootstrap` (creates or links canonical backend user/session)
- Account linking endpoints:
  - `POST /v1/auth/account/link-wallet` (requires bearer backend token)
  - `POST /v1/auth/account/link-oauth` (requires bearer backend token)
  - `GET /v1/auth/account/links/:userId`
- User profile/preferences endpoints:
  - `GET /v1/user/profile/:userId`
  - `PUT /v1/user/profile/:userId`
  - `POST /v1/user/export` (requires bearer backend token)
  - `GET /v1/user/public/:username`

Required frontend auth env vars (`onchain-academy/app/.env.local`):

```bash
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""
NEXTAUTH_SECRET="replace-me"
NEXTAUTH_URL="http://localhost:3000"
```

## CMS Integration (Sanity)

The backend course routes now resolve content through a Sanity adapter with automatic fallback to local mock data when CMS is unavailable.

Backend CMS env vars:

```bash
SANITY_PROJECT_ID=""
SANITY_DATASET="production"
SANITY_API_VERSION="2025-01-01"
SANITY_TOKEN=""
SANITY_USE_CDN="false"
CREDENTIAL_COLLECTIONS=""
```

## Leaderboard Indexing Job

Leaderboard snapshots are rebuilt from Token-2022 XP holder balances and persisted for `weekly`, `monthly`, and `all-time` timeframes.

- Internal endpoint: `POST /v1/internal/jobs/leaderboard/rebuild`
- Header: `x-internal-token: <INTERNAL_JOB_TOKEN>`
- Required backend env:

```bash
SOLANA_RPC_URL="https://api.devnet.solana.com"
XP_MINT="xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3"
INTERNAL_JOB_TOKEN="dev-job-token"
```

Manual rebuild command (pre-demo sync):

```bash
BACKEND_URL="https://<backend-domain>" \
INTERNAL_JOB_TOKEN="<internal-job-token>" \
npm run leaderboard:rebuild
```

## Testing

```bash
npm run lint:app
npm run lint:backend
npm run build:app
npm run build:backend
npm run test:e2e:smoke
npm run qa:release
```

## Frontend Scope (Core Pages)

The frontend includes all required core routes:

- `/`
- `/courses`
- `/courses/[slug]`
- `/courses/[slug]/lessons/[id]`
- `/dashboard`
- `/leaderboard`
- `/profile`
- `/profile/[username]`
- `/settings`
- `/certificates`
- `/certificates/[id]`
- `/admin`

## Analytics & Monitoring

Configured in `onchain-academy/app/`:

- `GA4` with custom events via `trackEvent()` in:
  - course enroll/finalize flow
  - challenge run flow
  - lesson completion flow
  - leaderboard filter flow
- `PostHog` for product analytics + heatmaps/session replay
- `Sentry` (`@sentry/nextjs`) for runtime error monitoring

Frontend analytics env vars:

```bash
NEXT_PUBLIC_GA4_MEASUREMENT_ID=""
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
NEXT_PUBLIC_SENTRY_DSN=""
```

## Deployment (Vercel/Netlify)

Recommended production topology:

- Deploy frontend (`onchain-academy/app`) on Vercel or Netlify with preview deployments enabled.
- Deploy backend (`onchain-academy/backend`) on Render/Fly.io/Railway and set `NEXT_PUBLIC_API_BASE_URL` to its `/v1` URL.
- Use Supabase Postgres (or managed Postgres) for production `DATABASE_URL`.
- Full operational runbook: [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)
- Current frontend production deployment: [app-rho-opal-32.vercel.app](https://app-rho-opal-32.vercel.app)

### Vercel (frontend)

1. Import the GitHub repo into Vercel.
2. Set Root Directory to `onchain-academy/app`.
3. Set Build Command to `npm run build`.
4. Set Install Command to `npm install`.
5. Set Node.js version to `20`.
6. Enable Preview Deployments for PR validation.
7. Configure OAuth callback URLs:
   - Google: `https://<frontend-domain>/api/auth/callback/google`
   - GitHub: `https://<frontend-domain>/api/auth/callback/github`

### Render (backend)

Use `render.yaml` at repo root.

- Build command: `npm install && npm run prisma:deploy && npm run build`
- Start command: `npm run start`
- Cron job: `POST /v1/internal/jobs/leaderboard/rebuild` every 30 minutes

Required frontend production env vars:

```bash
NEXT_PUBLIC_API_BASE_URL="https://<backend-domain>/v1"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_HELIUS_RPC_URL=""
NEXT_PUBLIC_CREDENTIAL_COLLECTIONS=""
NEXT_PUBLIC_PROGRAM_ID="ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf"
NEXT_PUBLIC_XP_MINT="xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3"
NEXT_PUBLIC_SITE_URL="https://<frontend-domain>"
NEXTAUTH_URL="https://<frontend-domain>"
NEXTAUTH_SECRET="<secure-random-value>"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""
ADMIN_TOKEN="<admin-proxy-token>"
```

Required backend production env vars:

```bash
DATABASE_URL="<supabase-postgres-url>"
CORS_ORIGIN="https://<frontend-domain>"
JWT_SECRET="<secure-random-value>"
SOLANA_RPC_URL="https://api.devnet.solana.com"
XP_MINT="xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3"
HELIUS_RPC_URL=""
INTERNAL_JOB_TOKEN="<internal-job-token>"
ADMIN_TOKEN="<admin-token>"
SANITY_PROJECT_ID=""
SANITY_DATASET="production"
SANITY_API_VERSION="2025-01-01"
SANITY_TOKEN=""
SANITY_USE_CDN="false"
CREDENTIAL_COLLECTIONS=""
```

## Lighthouse Targets

Target thresholds for production pages (mobile profile):

- Performance >= 90
- Accessibility >= 95
- Best Practices >= 95
- SEO >= 90

Run locally (against local prod build):

```bash
npm run build:app
npm --workspace onchain-academy/app run start &
npx lighthouse http://localhost:3000 --only-categories=performance,accessibility,best-practices,seo --chrome-flags=\"--headless\" --quiet
```

## Tech Stack

| Layer | Stack |
|---|---|
| **Programs** | Anchor 0.31+, Rust 1.82+ |
| **XP Tokens** | Token-2022 (NonTransferable, PermanentDelegate) |
| **Credentials** | Metaplex Core NFTs (soulbound via PermanentFreezeDelegate) |
| **Testing** | ts-mocha/Chai, Cargo test |
| **Client** | TypeScript, @coral-xyz/anchor, @solana/web3.js |
| **Frontend** | Next.js 14+, React, Tailwind CSS |
| **Backend** | Fastify, Zod, Prisma |
| **Database** | PostgreSQL (local Docker), Supabase Postgres (production) |
| **RPC** | Helius (DAS API for credential queries + XP leaderboard) |
| **Content** | Arweave (immutable course content) |
| **Multisig** | Squads (platform authority) |

## Documentation

- **[Program Specification](onchain-academy/docs/SPEC.md)** — 16 instructions, 6 PDA types, 26 errors, 15 events
- **[Architecture](onchain-academy/docs/ARCHITECTURE.md)** — Account maps, data flows, CU budgets
- **[Frontend Integration](onchain-academy/docs/INTEGRATION.md)** — PDA derivation, instruction usage, events, error handling
- **[Deployment Guide](onchain-academy/docs/DEPLOY-PROGRAM.md)** — Deploy your own program instance on devnet
- **[App Architecture](ARCHITECTURE.md)** — Frontend/backend service contracts and data flow
- **[Requirements Matrix](REQUIREMENTS_MATRIX.md)** — requirement-by-requirement implementation status and evidence
- **[CMS Guide](CMS_GUIDE.md)** — Content schema and editorial workflow
- **[Customization Guide](CUSTOMIZATION.md)** — Theme, i18n, and gamification extension points
- **[Vercel Deploy Runbook](VERCEL_DEPLOY.md)** — backend + frontend production deployment checklist
- **[Submission Checklist](SUBMISSION.md)** — PR, deployment, demo video, and social proof checklist

## Contributing

```bash
# Branch naming
git checkout -b <type>/<scope>-<description>-<DD-MM-YYYY>
# Examples:
#   feat/enrollment-lessons-11-02-2026
#   fix/cooldown-check-12-02-2026
#   onchain-academy/docs/integration-guide-17-02-2026

# Before merging
anchor build
cargo fmt
cargo clippy -- -W clippy::all
cargo test --manifest-path onchain-academy/tests/rust/Cargo.toml
anchor test
```

## License

[MIT](LICENSE)
