"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StatusTransitionMeta } from "@/lib/requests";
import { AlertTriangle, X } from "lucide-react";

export function StatusConfirmDialog({
  open,
  meta,
  serviceName,
  fromLabel,
  toLabel,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  meta: StatusTransitionMeta;
  serviceName: string;
  fromLabel: string;
  toLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const Icon = meta.icon;
  const toneRing =
    meta.tone === "positive"
      ? "ring-emerald-200"
      : meta.tone === "warning"
        ? "ring-amber-200"
        : meta.tone === "danger"
          ? "ring-red-200"
          : "ring-brand-200";
  const toneIcon =
    meta.tone === "positive"
      ? "bg-emerald-100 text-emerald-700"
      : meta.tone === "warning"
        ? "bg-amber-100 text-amber-700"
        : meta.tone === "danger"
          ? "bg-red-100 text-red-700"
          : "bg-brand-100 text-brand-700";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn(
              "relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-4",
              toneRing
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onCancel}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4 pr-6">
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                  toneIcon
                )}
              >
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{meta.title}</h3>
                <p className="mt-1 text-sm font-medium text-brand-700">{serviceName}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">{meta.description}</p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status change
              </p>
              <p className="mt-1 font-medium text-slate-800">
                {fromLabel}{" "}
                <span className="text-slate-400">→</span> {toLabel}
              </p>
            </div>

            <div className="mt-4 flex gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-xs text-amber-950">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>{meta.clientNotice}</p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant={meta.tone === "danger" ? "danger" : "primary"}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? "Updating…" : "Confirm change"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
