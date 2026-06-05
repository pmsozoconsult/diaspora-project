"use client";

import { ServiceRequestStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateRequestItemStatus } from "@/actions/requests";
import {
  ITEM_STAFF_TRANSITIONS,
  ITEM_STATUS_SHORT,
  REQUEST_STATUS_LABELS,
  STATUS_TRANSITION_META,
} from "@/lib/requests";
import { StatusConfirmDialog } from "@/components/ui/status-confirm-dialog";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export function RequestItemStatusPanel({
  staffId,
  itemId,
  serviceName,
  currentStatus,
}: {
  staffId: string;
  itemId: string;
  serviceName: string;
  currentStatus: ServiceRequestStatus;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pending, setPending] = useState<ServiceRequestStatus | null>(null);

  const safeStatus =
    currentStatus && currentStatus in ITEM_STAFF_TRANSITIONS
      ? currentStatus
      : ServiceRequestStatus.IN_PROGRESS;
  const allowed = ITEM_STAFF_TRANSITIONS[safeStatus] ?? [];

  async function confirmChange() {
    if (!pending) return;
    setLoading(true);
    setError(null);
    const result = await updateRequestItemStatus(staffId, itemId, pending);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPending(null);
    setSuccessMsg(
      `${serviceName} updated to ${ITEM_STATUS_SHORT[pending]}.` +
        (result.requestStatus === ServiceRequestStatus.COMPLETED
          ? " All services are complete — request marked completed."
          : "")
    );
    router.refresh();
  }

  if (allowed.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <CheckCircle2 className="mb-1 inline h-4 w-4 text-emerald-600" /> No further
        status changes for this service.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {successMsg && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          {successMsg}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <p className="text-xs text-slate-500">
        Choose the next status for <strong className="text-slate-700">{serviceName}</strong>.
        You will confirm before the client sees the update.
      </p>

      <div className="flex w-full flex-col gap-2">
        {allowed.map((next) => {
          const meta = STATUS_TRANSITION_META[next];
          if (!meta) return null;
          const Icon = meta.icon;
          const cardTone =
            meta.tone === "positive"
              ? "hover:border-emerald-300 hover:bg-emerald-50/50"
              : meta.tone === "warning"
                ? "hover:border-amber-300 hover:bg-amber-50/50"
                : meta.tone === "danger"
                  ? "hover:border-red-300 hover:bg-red-50/50"
                  : "hover:border-brand-300 hover:bg-brand-50/50";

          return (
            <button
              key={next}
              type="button"
              disabled={loading}
              onClick={() => setPending(next)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-4 text-left transition duration-200",
                cardTone
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  meta.tone === "positive" && "bg-emerald-100 text-emerald-700",
                  meta.tone === "warning" && "bg-amber-100 text-amber-700",
                  meta.tone === "danger" && "bg-red-100 text-red-700",
                  meta.tone === "neutral" && "bg-brand-100 text-brand-700"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-900">
                  {meta.title}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500 line-clamp-2">
                  {ITEM_STATUS_SHORT[next]}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {pending && STATUS_TRANSITION_META[pending] && (
        <StatusConfirmDialog
          open
          meta={STATUS_TRANSITION_META[pending]!}
          serviceName={serviceName}
          fromLabel={REQUEST_STATUS_LABELS[safeStatus]}
          toLabel={REQUEST_STATUS_LABELS[pending]}
          loading={loading}
          onConfirm={confirmChange}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
