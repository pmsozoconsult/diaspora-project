"use client";

import { AuthSessionProvider } from "@/components/providers/auth-session-provider";
import { Suspense } from "react";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { NavigationLoadingProvider } from "@/components/layout/navigation-loading-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <Suspense fallback={null}>
        <NavigationLoadingProvider>
          <NavigationProgress />
          {children}
        </NavigationLoadingProvider>
      </Suspense>
    </AuthSessionProvider>
  );
}
