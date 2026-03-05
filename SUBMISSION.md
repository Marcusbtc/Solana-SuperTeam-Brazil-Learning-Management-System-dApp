# Submission Checklist

Use this file to track the final required delivery items.

Baseline commit for this checklist: `683a0a6c88510a2932a37e5c08464e8868e20dbe`

Detailed requirement status and evidence are tracked in `REQUIREMENTS_MATRIX.md`.

## 1) Pull Request

- Repository: `github.com/solanabr/superteam-academy`
- Branch: `codex/frontend-production-pass`
- PR URL: `TODO` ← submit PR after final push
- PR scope: full frontend implementation + docs + deployment metadata

## 2) Production Application

Status: `Frontend live on Vercel` (backend production deployment still pending)

Core pages (all functional):
- `/` (Home)
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

Implemented capabilities:
- Wallet auth + OAuth-first bootstrap + account linking (`NextAuth` + SIWS verification)
- Gamification system (XP, streak, badges/achievements, leaderboard)
- Code editor integration (`@monaco-editor/react` in lesson challenge flow)
- i18n locales: `pt-BR`, `es`, `en`
- Light/dark theme support (`next-themes`)
- Responsive UI (mobile/tablet/desktop breakpoints)
- Lighthouse target policy documented in `README.md`
- Catalog filters include difficulty + topic + duration + search
- Lesson challenge layout supports resizable split pane + persisted autosave state
- Certificate page exports downloadable PNG image (with print fallback)

## 3) Analytics

Status: `Implemented`

- GA4: global script + custom events
- Heatmap/session replay solution: PostHog
- Error monitoring: Sentry (`@sentry/nextjs`)

## 4) CMS

Status: `Implemented`

- Sanity configured with schema in `onchain-academy/cms/sanity/schemas/`
- Sample course import file: `onchain-academy/cms/sanity/seed/sample-course.ndjson`
- Import command documented in `CMS_GUIDE.md`

## 5) Deployment

Status: `Live`

- Platform: Vercel (frontend) + Render (backend) + Supabase Postgres + Sanity
- Runbook: `VERCEL_DEPLOY.md`
- Live demo URL: `https://app-rho-opal-32.vercel.app`
- Vercel project: `https://vercel.com/marcusbtcs-projects/app`
- Preview deployment URL (latest): `https://app-eg9yhl108-marcusbtcs-projects.vercel.app` (Vercel deployment auth enabled)

## 6) Documentation

Status: `Implemented`

- `README.md` (overview, stack, setup, env vars, deployment + verification)
- `ARCHITECTURE.md` (system architecture, components, data flow, on-chain integration points)
- `CMS_GUIDE.md` (schema, authoring, import and publishing workflow)
- `CUSTOMIZATION.md` (theme, languages, gamification extension)

## 7) Demo Video (3-5 min)

Status: `Pending upload`

- Recording URL: `TODO`
- Must include:
  - Problem + product overview
  - Feature walkthrough (all required routes)
  - Architecture + service abstraction overview
  - On-chain integration points and intentionally stubbed flows
  - Deployment topology + observability (GA4/PostHog/Sentry)

## 8) Twitter Post

Status: `Pending publication`

- Tweet URL: `TODO`
- Required mention/tag: `@SuperteamBR`

## Final Gate
Automated gate (must pass):

- `npm run lint:app`
- `npm run lint:backend`
- `npm run build:app`
- `npm run build:backend`
- `npm run test:e2e:smoke`

Known accepted limitations (explicitly intentional per bounty scope):

- `completeLesson` backend-signer execution is stubbed via `PendingAction`.
- `finalizeCourse` signer-side issuance flow is stubbed via `PendingAction`.
- `achievements/claim` on-chain mint path is stubbed via `PendingAction`.

Do not submit until all `TODO` fields are replaced with real public URLs and manual smoke checklist in `VERCEL_DEPLOY.md` is completed in production.
