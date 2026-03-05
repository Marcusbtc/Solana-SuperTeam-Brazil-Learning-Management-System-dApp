"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  BookOpen,
  LayoutDashboard,
  Trophy,
  User,
  Globe,
  Menu,
  Zap,
} from "lucide-react";
import { useLocale } from "@/providers/locale-provider";
import type { Locale } from "@/types/domain";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user-store";

// UI Components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/courses", labelKey: "nav.courses", icon: BookOpen },
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/leaderboard", labelKey: "nav.leaderboard", icon: Trophy },
  { href: "/profile", labelKey: "nav.profile", icon: User },
] as const;

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (module) => module.WalletMultiButton,
    ),
  { ssr: false },
);

export function Header(): JSX.Element {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLocale();
  const locales: Locale[] = ["en", "pt-BR", "es"];
  const { publicKey } = useWallet();
  const setWalletAddress = useUserStore((state) => state.setWalletAddress);
  const { xp, level, isLoading } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWalletAddress(publicKey ? publicKey.toBase58() : null);
  }, [publicKey, setWalletAddress]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHome = pathname === "/";
  const localeLabel: Record<Locale, string> = {
    en: t("header.localeEnglish"),
    "pt-BR": t("header.localePortuguese"),
    es: t("header.localeSpanish"),
  };

  return (
    <header
      className={
        isHome
          ? "absolute top-0 left-0 right-0 z-40 w-full"
          : "sticky top-0 z-40 w-full border-b border-white/10 bg-black/70 backdrop-blur-[12px]"
      }
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <Image
              src="/superteam-logo.svg"
              alt="Superteam"
              width={132}
              height={28}
              className="h-7 w-auto"
              priority
            />
            <span className="font-display text-lg font-semibold tracking-tight text-primary">
              Academy
            </span>
          </Link>

          <nav className="ml-6 hidden items-center rounded-full border border-white/10 bg-black/35 p-1 backdrop-blur-xl md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {publicKey && !isLoading && (
            <div className="hidden sm:flex items-center gap-2.5 bg-muted/30 border border-border/40 px-3 py-1.5 rounded-full">
              <Badge
                variant="secondary"
                className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/20 text-xs font-mono font-bold tracking-wide"
              >
                LVL {level}
              </Badge>
              <div className="flex items-center gap-1">
                <Zap
                  className="h-3.5 w-3.5 fill-current"
                  style={{ color: "#f59e0b" }}
                />
                <span
                  className="text-sm font-mono font-bold"
                  style={{
                    color: "#f59e0b",
                    textShadow: "0 0 10px rgba(245,158,11,0.35)",
                  }}
                >
                  {xp.toLocaleString()}
                </span>
                <span className="text-muted-foreground text-[10px] font-mono">
                  {t("header.xp")}
                </span>
              </div>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex h-9 w-9 rounded-full"
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">{t("header.toggleLanguage")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[120px] bg-background/95 backdrop-blur-md border-border/50"
            >
              {locales.map((l) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => setLocale(l)}
                  className={cn(
                    "cursor-pointer focus:bg-primary/10 font-medium",
                    locale === l && "text-primary",
                  )}
                >
                  {localeLabel[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {mounted ? (
            <WalletMultiButton className="wallet-pill !h-12 !rounded-full !border !border-primary/50 !bg-primary/10 !px-6 !text-sm !font-semibold !text-primary !transition-all hover:!bg-primary/20 hover:!border-primary hover:!shadow-[0_0_15px_rgba(52,211,153,0.3)] !font-display" />
          ) : (
            <Button
              type="button"
              className="h-12 rounded-full border border-primary/50 bg-primary/10 px-6 text-sm font-semibold text-primary font-display"
              disabled
            >
              Connect Wallet
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("header.toggleMobileMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] bg-background/95 backdrop-blur-xl border-l-border/30 pt-10"
            >
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                      pathname === item.href
                        ? "bg-secondary/15 text-secondary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {t(item.labelKey)}
                  </Link>
                ))}

                <div className="h-px w-full bg-border/40 my-2" />

                <div className="grid grid-cols-3 gap-2 px-2">
                  {locales.map((l) => (
                    <Button
                      key={l}
                      variant={locale === l ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setLocale(l)}
                      className="text-xs w-full"
                    >
                      {l === "pt-BR" ? "PT" : l.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
