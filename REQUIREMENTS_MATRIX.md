# Superteam Brazil LMS Requirements Matrix

Last validation date: **2026-03-04**

Legend:
- `Implemented`: fully delivered in the current repo/app stack.
- `Stubbed by design`: implemented with stable typed contracts, intentionally pending signer/on-chain wiring.
- `Pending external artifact`: requires publication outside codebase (URLs/media/social post).

## 1) Core Build Requirements (Implement vs Stub)

| Requirement | Status | Route/UI | Service/API | Evidence | Validation |
|---|---|---|---|---|---|
| Multi-wallet auth | Implemented | Header wallet connect, settings auth actions | `/v1/auth/wallet/nonce`, `/v1/auth/wallet/verify` | `onchain-academy/app/src/providers/solana-provider.tsx`, `onchain-academy/app/src/app/settings/page.tsx`, `onchain-academy/backend/src/routes/auth.ts` | `npm run lint:app`, wallet flow smoke |
| Google sign-in | Implemented | Settings OAuth actions | NextAuth + `/v1/auth/oauth/bootstrap` | `onchain-academy/app/src/lib/auth-options.ts`, `onchain-academy/backend/src/routes/auth.ts` | Build + manual OAuth callback check |
| GitHub sign-in (bonus) | Implemented | Settings OAuth actions | NextAuth + `/v1/auth/oauth/bootstrap` | `onchain-academy/app/src/lib/auth-options.ts` | Build + manual OAuth callback check |
| XP balance from Token-2022 | Implemented | Header XP pill, dashboard/profile usage | `LearningProgressService.getXpBalance`, `OnchainAcademyService.fetchXpBalance` | `onchain-academy/app/src/services/learning-progress-service.ts`, `onchain-academy/app/src/services/onchain-academy-service.ts` | Build + manual wallet XP fetch |
| Credential display + verification | Implemented | `/certificates`, `/certificates/[id]`, profile views | `/v1/credentials/:wallet` + Helius fallback | `onchain-academy/app/src/app/certificates/page.tsx`, `onchain-academy/app/src/app/certificates/[id]/page.tsx`, `onchain-academy/backend/src/routes/credentials.ts` | Build + credential manual smoke |
| Leaderboard by indexed XP balances | Implemented | `/leaderboard` | `/v1/leaderboard`, `/v1/internal/jobs/leaderboard/rebuild` | `onchain-academy/app/src/app/leaderboard/page.tsx`, `onchain-academy/backend/src/routes/leaderboard.ts`, `onchain-academy/backend/src/routes/internal-jobs.ts` | Build + job trigger/manual API check |
| Course enrollment (learner signs tx) | Implemented | Course detail enroll CTA | `OnchainAcademyService.enroll` | `onchain-academy/app/src/services/onchain-academy-service.ts`, `onchain-academy/app/src/app/courses/[slug]/page.tsx` | Devnet wallet manual smoke |
| Lesson completion (backend-signed) | Stubbed by design | Lesson page completion UX | `/v1/progress/lesson/complete` => `PendingAction` | `onchain-academy/backend/src/routes/progress.ts`, `onchain-academy/app/src/services/learning-progress-service.ts` | API response shape stable |
| Course finalization + credential issuance | Stubbed by design | Course flow request UX | `/v1/progress/course/finalize` => `PendingAction` | `onchain-academy/backend/src/routes/progress.ts`, `onchain-academy/app/src/services/interfaces.ts` | API response shape stable |
| Achievement claiming | Stubbed by design | Profile/settings surfaced via service contracts | `/v1/achievements/claim` => `PendingAction` | `onchain-academy/backend/src/routes/achievements.ts`, `onchain-academy/app/src/services/interfaces.ts` | API response shape stable |
| Streak tracking frontend-managed | Implemented | Dashboard/profile streak calendar and updates | `/v1/streak/:userId`, `/v1/streak/activity` + local UI state | `onchain-academy/app/src/store/user-store.ts`, `onchain-academy/backend/src/routes/streak.ts` | Manual streak smoke + build |

## 2) Scope of Work Pages

| Scope page / feature | Status | Route | Evidence | Validation |
|---|---|---|---|---|
| Landing page | Implemented | `/` | `onchain-academy/app/src/app/page.tsx` | E2E smoke + manual |
| Course catalog + filters/search | Implemented | `/courses` | `onchain-academy/app/src/app/courses/page.tsx`, `onchain-academy/backend/src/routes/courses.ts` | E2E smoke + manual |
| Course detail + modules/enroll CTA | Implemented | `/courses/[slug]` | `onchain-academy/app/src/app/courses/[slug]/page.tsx` | Build + manual |
| Lesson split view + editor + challenge | Implemented | `/courses/[slug]/lessons/[id]` | `onchain-academy/app/src/app/courses/[slug]/lessons/[id]/page.tsx` | Build + manual |
| Dashboard | Implemented | `/dashboard` | `onchain-academy/app/src/app/dashboard/page.tsx` | Build + manual |
| Profile (self) | Implemented | `/profile` | `onchain-academy/app/src/app/profile/page.tsx` | Build + manual |
| Profile (public) | Implemented | `/profile/[username]` | `onchain-academy/app/src/app/profile/[username]/page.tsx` | Build + manual |
| Leaderboard | Implemented | `/leaderboard` | `onchain-academy/app/src/app/leaderboard/page.tsx` | E2E smoke + manual |
| Settings + account linking | Implemented | `/settings` | `onchain-academy/app/src/app/settings/page.tsx` | E2E smoke + manual |
| Certificate detail | Implemented | `/certificates/[id]` | `onchain-academy/app/src/app/certificates/[id]/page.tsx` | Build + manual |

## 3) Required Technology Stack

| Requirement | Status | Evidence |
|---|---|---|
| Next.js 14+ App Router | Implemented | `onchain-academy/app/package.json` (`next@14.2.29`), routes in `src/app/*` |
| TypeScript strict, no `any` policy in project code | Implemented | `onchain-academy/app/tsconfig.json`, `onchain-academy/backend/tsconfig.json` (`strict: true`) |
| Tailwind CSS with design tokens | Implemented | `onchain-academy/app/tailwind.config.ts`, `onchain-academy/app/src/app/globals.css` |
| Accessible primitives (Radix/shadcn) | Implemented | Radix deps in `onchain-academy/app/package.json`, component usage in `src/components/ui/*` |
| Headless CMS (Sanity) | Implemented | `onchain-academy/cms/sanity/*`, backend adapter in `onchain-academy/backend/src/lib/content-repository.ts` |
| Solana Wallet Adapter + Google sign-in | Implemented | `solana-provider.tsx`, `auth-options.ts` |
| Analytics stack (GA4 + heatmap + Sentry) | Implemented | `layout.tsx` (GA4), `analytics-provider.tsx` (PostHog + Sentry), `lib/analytics.ts` (event tracking) |
| i18n PT-BR/ES/EN from day one | Implemented | `onchain-academy/app/src/i18n/locales/en.ts`, `ptBR.ts`, `es.ts`, header switcher in `header.tsx` |
| Vercel/Netlify deployment readiness | Implemented | Frontend build scripts + env docs in `README.md`, detailed runbook in `VERCEL_DEPLOY.md` |

## 4) Service Interface Freeze (Phase 3 Lock)

| Interface / API | Status | Evidence |
|---|---|---|
| `ContentService` (`getCourses`, `getCourseBySlug`) | Frozen | `onchain-academy/app/src/services/interfaces.ts` |
| `LearningProgressService` (`getProgress`, `completeLesson`, `finalizeCourse`, `claimAchievement`, `getXpBalance`, `getStreak`, `getLeaderboard`, `getCredentials`, `getUserAllProgress`) | Frozen | `onchain-academy/app/src/services/interfaces.ts` |
| `OnchainAcademyService` (PDA derivation, enroll/close enrollment, XP/credential reads) | Frozen | `onchain-academy/app/src/services/onchain-academy-service.ts` |
| Backend `/v1` surface (auth, courses, progress, challenges, streak, leaderboard, credentials, achievements, user, internal jobs, admin) | Frozen | `onchain-academy/backend/src/routes/index.ts` |

## 5) Quality Gate Status

| Gate command | Status | Notes |
|---|---|---|
| `npm run lint:app` | Passing | ESLint checks clean |
| `npm run lint:backend` | Passing | TypeScript no-emit check clean |
| `npm run build:app` | Passing | Next production build succeeds |
| `npm run build:backend` | Passing | Backend TypeScript build succeeds |
| `npm run test:e2e:smoke` | Passing | Uses `tests/e2e/smoke.spec.ts` |

## 6) Pending External Submission Artifacts

| Required artifact | Status | Owner action |
|---|---|---|
| PR URL | Pending external artifact | Open PR in `github.com/solanabr/superteam-academy` and update `SUBMISSION.md` |
| Live demo URL | Implemented (frontend URL published) | `https://app-rho-opal-32.vercel.app` |
| Demo video (3-5 min) | Pending external artifact | Upload recording and add link in `SUBMISSION.md` |
| Twitter post tagging `@SuperteamBR` | Pending external artifact | Publish post and add link in `SUBMISSION.md` |
