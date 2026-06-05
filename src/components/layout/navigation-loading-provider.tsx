"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/layout/page-loader";

type NavLoadingContextValue = {
  startNavigation: () => void;
};

const NavLoadingContext = createContext<NavLoadingContextValue | null>(null);

export function useNavLoading() {
  const ctx = useContext(NavLoadingContext);
  return ctx ?? { startNavigation: () => {} };
}

export function NavigationLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const prevPath = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef(0);

  const startNavigation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startedAt.current = Date.now();
    setIsNavigating(true);
  }, []);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      const elapsed = Date.now() - startedAt.current;
      const minDisplay = 450;
      const delay = Math.max(0, minDisplay - elapsed);
      timerRef.current = setTimeout(() => setIsNavigating(false), delay);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  return (
    <NavLoadingContext.Provider value={{ startNavigation }}>
      {isNavigating && <PageLoader />}
      <div
        onClickCapture={(e) => {
          const target = (e.target as HTMLElement).closest("a");
          if (!target) return;
          const href = target.getAttribute("href");
          if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            target.getAttribute("target") === "_blank" ||
            target.hasAttribute("download")
          ) {
            return;
          }
          if (href.startsWith("http") && !href.startsWith(window.location.origin)) {
            return;
          }
          const path = href.startsWith("http")
            ? new URL(href).pathname
            : href.split("?")[0];
          if (path !== pathname) startNavigation();
        }}
      >
        {children}
      </div>
    </NavLoadingContext.Provider>
  );
}
