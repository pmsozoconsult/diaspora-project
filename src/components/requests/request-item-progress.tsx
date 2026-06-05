"use client";

import { ServiceRequestStatus } from "@prisma/client";
import { Check, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ITEM_STATUS_SHORT,
  ITEM_WORKFLOW_STEPS,
  getItemProgressIndex,
} from "@/lib/requests";

export function RequestItemProgress({
  status,
  serviceName,
  compact,
}: {
  status: ServiceRequestStatus;
  serviceName: string;
  compact?: boolean;
}) {
  const isTerminal =
    status === ServiceRequestStatus.CANCELLED ||
    status === ServiceRequestStatus.REJECTED;
  const isCompleted = status === ServiceRequestStatus.COMPLETED;
  const activeIdx = getItemProgressIndex(status);

  const receivedDone =
    status !== ServiceRequestStatus.DRAFT &&
    status !== ServiceRequestStatus.SUBMITTED;

  const steps = [
    {
      key: "received",
      label: "Received",
      description: "Request is in our queue for this service.",
      done: receivedDone,
      active: receivedDone && activeIdx < 0 && !isTerminal && !isCompleted,
      failed: false,
    },
    ...ITEM_WORKFLOW_STEPS.map((step, i) => {
      const done = isCompleted || activeIdx > i;
      const active = activeIdx === i && !isTerminal && !isCompleted;
      return {
        key: step.status,
        label: step.label,
        description: step.description,
        done,
        active,
        failed: false,
      };
    }),
  ];

  if (isTerminal) {
    const failLabel =
      status === ServiceRequestStatus.CANCELLED ? "Cancelled" : "Rejected";
    steps.push({
      key: "terminal",
      label: failLabel,
      description: `This service was ${failLabel.toLowerCase()}.`,
      done: false,
      active: true,
      failed: true,
    });
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-card",
        compact ? "p-4" : "p-6"
      )}
    >
      {!compact && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Service progress
          </p>
          <p className="mt-1 font-semibold text-slate-900">{serviceName}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            Current:{" "}
            <span className="font-medium text-slate-700">
              {ITEM_STATUS_SHORT[status]}
            </span>
          </p>
        </div>
      )}

      <ol className={cn("grid gap-0", compact ? "gap-3" : "md:grid-cols-4 md:gap-2")}>
        {steps.map((step, i) => (
          <li
            key={step.key}
            className={cn(
              "relative flex gap-3 md:flex-col md:items-center md:text-center",
              !compact && i < steps.length - 1 && "md:pb-0"
            )}
          >
            {!compact && i < steps.length - 1 && (
              <span
                className="absolute left-[1.125rem] top-10 hidden h-full w-0.5 bg-slate-200 md:hidden"
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition",
                step.failed && "bg-red-100 text-red-700 ring-2 ring-red-200",
                step.done && !step.failed && "bg-brand-600 text-white",
                step.active && !step.failed && "bg-brand-600 text-white ring-4 ring-brand-200",
                !step.done && !step.active && !step.failed && "bg-slate-100 text-slate-400"
              )}
            >
              {step.failed ? (
                <X className="h-4 w-4" strokeWidth={3} />
              ) : step.done ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : step.active ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                </span>
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 flex-1 pb-4 md:pb-0">
              <p
                className={cn(
                  "text-sm font-semibold",
                  step.active || step.done
                    ? "text-slate-900"
                    : "text-slate-500",
                  step.failed && "text-red-800"
                )}
              >
                {step.label}
              </p>
              {!compact && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                  {step.description}
                </p>
              )}
              {step.active && !step.failed && (
                <p className="mt-1 text-xs font-semibold text-brand-700 md:hidden">
                  You are here
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
