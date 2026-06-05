"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

function isChunkLoadError(error: Error) {
  return (
    error.name === "ChunkLoadError" ||
    error.message.includes("Loading chunk") ||
    error.message.includes("ChunkLoadError")
  );
}

export default function ChunkLoadError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const chunk = isChunkLoadError(error);

  useEffect(() => {
    if (!chunk || typeof window === "undefined") return;
    const key = `chunk-reload:${window.location.pathname}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      window.location.reload();
    }
  }, [chunk]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
      <h2 className="text-xl font-bold text-slate-900">
        {chunk ? "Updating the app…" : "Something went wrong"}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {chunk
          ? "The page was out of date after a server restart. If you are not redirected automatically, reload once (Ctrl+Shift+R or Cmd+Shift+R)."
          : error.message || "An unexpected error occurred."}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          onClick={() => {
            if (typeof window !== "undefined") {
              sessionStorage.removeItem(`chunk-reload:${window.location.pathname}`);
              window.location.reload();
            }
          }}
        >
          Reload page
        </Button>
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
