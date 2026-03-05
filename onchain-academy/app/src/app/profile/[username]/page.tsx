"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Trophy,
  ExternalLink,
  Lock,
  Activity,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";
import { apiFetch } from "@/lib/api-client";
import { learningProgressService } from "@/services/learning-progress-service";
import type { Credential } from "@/types/domain";
import { getPublicAchievements } from "@/services/achievement-service";

type PageProps = {
  params: {
    username: string;
  };
};

type PublicUserProfile = {
  id: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  profileVisibility: "public" | "private";
  walletAddress: string | null;
  xp: number;
  level: number;
};

function avatarInitials(name: string | null, username: string): string {
  const src = name ?? username;
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return src.slice(0, 2).toUpperCase();
}

export default function PublicProfilePage({ params }: PageProps): JSX.Element {
  const { t } = useLocale();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    apiFetch<PublicUserProfile>(
      `/user/public/${encodeURIComponent(params.username)}`,
    )
      .then((p) => {
        setProfile(p);
        if (p.profileVisibility === "public" && p.walletAddress) {
          return learningProgressService
            .getCredentials(p.walletAddress)
            .then(setCredentials)
            .catch(() => setCredentials([]));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.username]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-20 pt-20 text-center text-muted-foreground animate-pulse">
        {t("common.loading")}
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="max-w-4xl mx-auto pb-20 pt-20 text-center space-y-4">
        <p className="text-2xl font-display font-bold text-foreground">
          {t("publicProfilePage.notFound")}
        </p>
        <p className="text-muted-foreground">
          @{params.username} {t("publicProfilePage.notFoundDesc")}
        </p>
        <Button asChild variant="outline">
          <Link href="/leaderboard">
            {t("publicProfilePage.browseBuilders")}
          </Link>
        </Button>
      </div>
    );
  }

  if (profile.profileVisibility === "private") {
    return (
      <div className="max-w-4xl mx-auto pb-20 pt-20 text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 border border-border/40 mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-2xl font-display font-bold text-foreground">
          {t("publicProfilePage.privateProfile")}
        </p>
        <p className="text-muted-foreground">
          @{params.username} {t("publicProfilePage.privateProfileDesc")}
        </p>
      </div>
    );
  }

  const displayName =
    profile.displayName ?? profile.username ?? params.username;
  const initials = avatarInitials(profile.displayName, params.username);
  const topPercent =
    profile.level > 5 ? "Top 10%" : profile.level > 2 ? "Top 25%" : "Top 50%";
  const achievements = getPublicAchievements({
    level: profile.level,
    xp: profile.xp,
    credentialCount: credentials.length,
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 animate-fade-in">
      {/* Header */}
      <div className="relative rounded-3xl border border-border/50 bg-background/50 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 pointer-events-none" />

        <div className="p-8 sm:p-12 relative z-10 pt-20 mt-8 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          <div className="h-32 w-32 shrink-0 rounded-2xl border-4 border-background bg-muted/50 overflow-hidden shadow-xl relative mt-[-60px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="font-display text-4xl text-primary font-bold">
                {initials}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-1">
                  {displayName}
                </h1>
                <p className="text-sm text-muted-foreground font-mono">
                  @{profile.username ?? params.username}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-primary border-primary/30"
                >
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {credentials.length} {t("publicProfilePage.credentials")}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-secondary border-secondary/30"
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  {topPercent}
                </Badge>
              </div>
            </div>

            {profile.bio && (
              <p className="mt-4 text-muted-foreground max-w-xl text-sm leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: t("publicProfilePage.totalXp"),
            value: profile.xp.toLocaleString(),
            sub: "XP",
          },
          {
            label: t("publicProfilePage.level"),
            value: profile.level,
            sub: t("publicProfilePage.developerLevel"),
          },
          {
            label: t("publicProfilePage.credentialsEarned"),
            value: credentials.length,
            sub: t("publicProfilePage.onchain"),
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="bg-background/40 backdrop-blur-md border-border/50 text-center"
          >
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                {stat.label}
              </p>
              <p className="font-display text-3xl font-black text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Credentials */}
        <Card className="bg-background/40 backdrop-blur-md border-border/50 shadow-lg">
          <CardHeader className="border-b border-border/30 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 font-display text-xl">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {t("publicProfilePage.credentialsTitle")}
                </CardTitle>
                <CardDescription>
                  {t("publicProfilePage.credentialsDesc")}
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="font-mono text-xs text-muted-foreground font-normal"
              >
                {credentials.length} {t("publicProfilePage.earned")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {credentials.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("publicProfilePage.noCredentials")}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {credentials.map((credential) => (
                  <div
                    key={credential.credentialId}
                    className="group rounded-2xl border border-border/50 bg-muted/20 p-4 flex flex-col items-center text-center hover:border-primary/50 transition-colors"
                  >
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 mb-3 shadow-inner flex items-center justify-center">
                      <ShieldCheck className="h-8 w-8 text-primary opacity-80" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">
                      {credential.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {credential.track} • {t("publicProfilePage.levelPrefix")}{" "}
                      {credential.level}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8"
                      asChild
                    >
                      <a
                        href={credential.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("publicProfilePage.verifyOnchain")}{" "}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-background/40 backdrop-blur-md border-border/50 shadow-lg">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="flex items-center gap-2 font-display text-xl">
              <Activity className="h-5 w-5 text-secondary" />
              {t("publicProfilePage.achievementsTitle")}
            </CardTitle>
            <CardDescription>
              {t("publicProfilePage.achievementsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((achievement) => {
                const label =
                  achievement.id === "first-blood"
                    ? t("publicProfilePage.achievementFirstBlood")
                    : achievement.id === "rustacean"
                      ? t("publicProfilePage.achievementRustacean")
                      : t("publicProfilePage.achievementAnchorMaster");
                const icon =
                  achievement.id === "first-blood" ? (
                    <Star className="h-6 w-6 text-yellow-500" />
                  ) : achievement.id === "rustacean" ? (
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  ) : (
                    <Trophy className="h-6 w-6 text-secondary" />
                  );

                return (
                  <div
                    key={achievement.id}
                    className={`rounded-xl border p-3 flex flex-col items-center text-center gap-1 transition-colors ${
                      achievement.unlocked
                        ? "border-border/50 bg-muted/20"
                        : "border-border/20 bg-muted/5 opacity-40 grayscale"
                    }`}
                  >
                    {icon}
                    <p className="text-xs font-medium leading-tight">{label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
