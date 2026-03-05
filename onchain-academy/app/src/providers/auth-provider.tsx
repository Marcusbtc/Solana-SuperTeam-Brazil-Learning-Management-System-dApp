"use client";

import type { PropsWithChildren } from "react";
import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}
