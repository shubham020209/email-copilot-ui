"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // SessionProvider makes NextAuth's session available to all client components
  return <SessionProvider>{children}</SessionProvider>;
}
