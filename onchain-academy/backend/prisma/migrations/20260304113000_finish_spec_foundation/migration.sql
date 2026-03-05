-- CreateEnum
CREATE TYPE "PendingActionType" AS ENUM ('lesson_complete', 'course_finalize', 'achievement_claim');

-- CreateEnum
CREATE TYPE "PendingActionStatus" AS ENUM ('accepted', 'processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthProviderLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthProviderLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PendingActionType" NOT NULL,
    "status" "PendingActionStatus" NOT NULL DEFAULT 'accepted',
    "courseId" TEXT,
    "lessonId" TEXT,
    "achievementTypeId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentDays" INTEGER NOT NULL DEFAULT 0,
    "longestDays" INTEGER NOT NULL DEFAULT 0,
    "freezesLeft" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDay" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreakState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakDayEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityDay" TIMESTAMP(3) NOT NULL,
    "bonusApplied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreakDayEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardBalanceSnapshot" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "xpBalance" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardBalanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_sessionToken_key" ON "AuthSession"("sessionToken");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthProviderLink_provider_providerAccountId_key" ON "AuthProviderLink"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "AuthProviderLink_userId_idx" ON "AuthProviderLink"("userId");

-- CreateIndex
CREATE INDEX "PendingAction_userId_type_status_idx" ON "PendingAction"("userId", "type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StreakState_userId_key" ON "StreakState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StreakDayEvent_userId_activityDay_key" ON "StreakDayEvent"("userId", "activityDay");

-- CreateIndex
CREATE INDEX "StreakDayEvent_userId_activityDay_idx" ON "StreakDayEvent"("userId", "activityDay");

-- CreateIndex
CREATE INDEX "LeaderboardBalanceSnapshot_capturedAt_idx" ON "LeaderboardBalanceSnapshot"("capturedAt");

-- CreateIndex
CREATE INDEX "LeaderboardBalanceSnapshot_walletAddress_capturedAt_idx" ON "LeaderboardBalanceSnapshot"("walletAddress", "capturedAt" DESC);

-- CreateIndex
CREATE INDEX "JobRun_jobName_startedAt_idx" ON "JobRun"("jobName", "startedAt" DESC);

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthProviderLink" ADD CONSTRAINT "AuthProviderLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingAction" ADD CONSTRAINT "PendingAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreakState" ADD CONSTRAINT "StreakState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreakDayEvent" ADD CONSTRAINT "StreakDayEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
