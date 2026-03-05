# Superteam Academy Application Architecture

## Scope

This document describes the application layer delivered for the frontend bounty:

- `onchain-academy/app/` Next.js 14 App Router client
- `onchain-academy/backend/` Fastify API
- PostgreSQL local (Docker Compose) and Supabase Postgres in production
- Service abstractions for on-chain and off-chain behavior

## High-Level Data Flow

1. User authenticates with wallet or OAuth and receives app session context.
2. OAuth sign-in calls backend `auth/oauth/bootstrap` to create/link canonical backend identity.
3. Frontend pulls catalog and lesson content from CMS adapters.
4. Progress operations call backend APIs through `LearningProgressService`.
5. On-chain reads (XP, credentials) use `OnchainAcademyService` directly with Solana RPC + Helius DAS.
6. Enrollment transactions are signed by the learner wallet in the frontend.
7. Backend-signer flows are exposed as pending-action stubs (`PendingAction` table) for future replacement.
8. Leaderboard snapshots are periodically rebuilt by an internal job endpoint.

## Service Contracts

### Frontend

- `ContentService`: course and lesson content with `search`, `difficulty`, `topic`, and `duration` filters
- `LearningProgressService`: progress, streak, leaderboard, credentials
- `OnchainAcademyService`: PDAs, enroll, close enrollment, XP and credential reads
- `ChallengeExecutionService`: challenge execution and pass/fail feedback
- `AchievementService` (stub): public badge source abstraction for profile views

### Interface Freeze (Submission Lock)

The following interfaces are treated as stable contracts for bounty delivery:

- `ContentService`
  - `getCourses(filters?: { search?: string; difficulty?: "beginner" | "intermediate" | "advanced"; topic?: string; duration?: "short" | "medium" | "long" })`
  - `getCourseBySlug(slug: string)`
- `LearningProgressService`
  - `getProgress(userId: string, courseId: string)`
  - `completeLesson(input: { courseId: string; lessonId: string; xpReward?: number }, token?: string)`
  - `finalizeCourse(input: { courseId: string }, token?: string)`
  - `claimAchievement(input: { achievementTypeId: string }, token?: string)`
  - `getXpBalance(walletAddress: string)`
  - `getStreak(userId: string)`
  - `getLeaderboard(timeframe: "weekly" | "monthly" | "all-time", courseId?: string)`
  - `getCredentials(walletAddress: string)`
  - `getUserAllProgress(userId: string)`
- `OnchainAcademyService`
  - `derivePdas`, `fetchConfig`, `fetchCourse`, `fetchEnrollment`
  - `enroll`, `closeEnrollment`
  - `fetchXpBalance`, `fetchCredentials`

Compatibility rule:

- Stubbed calls (`completeLesson`, `finalizeCourse`, `claimAchievement`) must keep response envelope shape (`status`, `pendingBackendSigner`, `requestId`) so signer-worker implementation can be swapped in without UI refactor.

## On-Chain Integration Points

Application-layer integration with Solana program (`ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf`) happens at the following boundaries:

1. Enrollment transactions:
   - Frontend signs and sends learner transactions (`enroll`, `close_enrollment`) through wallet adapters.
   - RPC endpoint controlled by `NEXT_PUBLIC_SOLANA_RPC_URL`.
2. On-chain reads:
   - Frontend `OnchainAcademyService` fetches course/config/enrollment account data and XP token balance.
   - Credential views filter Helius assets by credential attributes and optional collection allow-list (`CREDENTIAL_COLLECTIONS` / `NEXT_PUBLIC_CREDENTIAL_COLLECTIONS`).
   - Backend credential endpoint remains the primary source, frontend has a direct Helius fallback.
3. Backend-triggered writes (stub-ready):
   - `complete_lesson`, `finalize_course`, and `issue_credential` currently flow through backend request contracts (`PendingAction`) and are designed for signer-worker execution.
4. Leaderboard indexing:
   - Backend internal job rebuilds leaderboard snapshots from Token-2022 holder data for the configured XP mint.

All on-chain interactions are behind service interfaces to keep UI components decoupled from protocol transport changes.

### Backend

- `auth`: wallet nonce/signature verification, OAuth bootstrap, account link endpoints (session-bound)
- `courses`: catalog and course detail via Sanity adapter with local fallback
- `progress`: per-course progress and completion/finalization stubs with request IDs
- `challenges`: challenge runner endpoint
- `leaderboard`: weekly, monthly, all-time leaderboard
- `credentials`: wallet credential listing (Helius or cache)
- `streak`: frontend-managed streak persistence and calendar API
- `achievements`: claim request stub endpoint
- `internal/jobs`: secured leaderboard rebuild job trigger
- `admin`: KPI and management endpoints

### Backend `/v1` Surface (Frozen for Submission)

- Auth + account linking:
  - `POST /v1/auth/wallet/nonce`
  - `POST /v1/auth/wallet/verify`
  - `POST /v1/auth/oauth/bootstrap`
  - `POST /v1/auth/account/link-wallet`
  - `POST /v1/auth/account/link-oauth`
  - `GET /v1/auth/account/links/:userId`
- Courses/content:
  - `GET /v1/courses`
  - `GET /v1/courses/:slug`
- Progress/challenges/streak:
  - `GET /v1/progress/:courseId`
  - `GET /v1/progress/user/:userId`
  - `POST /v1/progress/lesson/complete` (stubbed signer flow)
  - `POST /v1/progress/course/finalize` (stubbed signer flow)
  - `POST /v1/challenges/:id/run`
  - `GET /v1/streak/:userId`
  - `POST /v1/streak/activity`
- Leaderboard/credentials/achievements:
  - `GET /v1/leaderboard`
  - `GET /v1/credentials/:wallet`
  - `POST /v1/achievements/claim` (stubbed signer flow)
- User/admin/jobs:
  - `GET /v1/user/profile/:userId`
  - `PUT /v1/user/profile/:userId`
  - `POST /v1/user/export`
  - `GET /v1/user/public/:username`
  - `GET /v1/admin/overview`
  - `GET /v1/admin/users`
  - `PATCH /v1/admin/users/:id`
  - `POST /v1/internal/jobs/leaderboard/rebuild`

## Database Model Summary

Postgres tables include:

- `User`, `WalletLink`, `OAuthLink`
- `AuthSession`, `AuthProviderLink`
- `UserProgress`, `LessonAttempt`, `StreakEvent`
- `StreakState`, `StreakDayEvent`
- `LeaderboardSnapshot`, `CredentialCache`
- `LeaderboardBalanceSnapshot`, `JobRun`
- `PendingAction`
- `NonceChallenge`, `ActivityFeed`

## Deployment Notes

- Development DB: `docker-compose.yml` postgres service.
- Production DB: Supabase Postgres using SSL-enabled `DATABASE_URL`.
- Migrations: `prisma migrate deploy` on production pipeline.
- Frontend: Vercel root `onchain-academy/app`.
- Backend: Render web service root `onchain-academy/backend` + cron for leaderboard rebuild.
