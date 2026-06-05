"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function SignOutButton({
  callbackUrl = "/",
  variant = "client",
  collapsed = false,
}: {
  callbackUrl?: string;
  variant?: "client" | "staff";
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirmLogout() {
    setLoading(true);
    await signOut({ callbackUrl });
  }

  const isStaff = variant === "staff";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl border-2 text-sm font-semibold transition duration-200",
          collapsed ? "px-2 py-2.5" : "px-3 py-3",
          isStaff
            ? "border-red-900/40 bg-red-950/50 text-red-200 hover:border-red-400 hover:bg-red-900/80 hover:text-white"
            : "border-red-200 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100 hover:text-red-800"
        )}
        title={collapsed ? "Sign out" : undefined}
      >
        <LogOut className="h-5 w-5 shrink-0" strokeWidth={2.25} />
        {!collapsed && "Sign out"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="w-full max-w-sm animate-slide-up rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <LogOut className="h-6 w-6" />
            </div>
            <h2 id="logout-title" className="mt-4 text-lg font-semibold text-slate-900">
              Sign out?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              You will need to sign in again to access your portal.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                disabled={loading}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
