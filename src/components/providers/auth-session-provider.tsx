"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Session fetch uses /api/auth/session — AUTH_URL in .env must match the URL
 * in your browser (e.g. http://localhost:3001 when using an SSH tunnel).
 */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/api/auth" refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}
