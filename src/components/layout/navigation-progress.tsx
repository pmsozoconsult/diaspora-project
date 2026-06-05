"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-1.5 overflow-hidden bg-slate-200/90 shadow-sm">
      <div className="h-full w-1/3 animate-progress-indeterminate rounded-full bg-brand-600 shadow-[0_0_8px_rgba(40,117,96,0.6)]" />
    </div>
  );
}
