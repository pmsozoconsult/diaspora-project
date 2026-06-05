import { getPoaSubsteps } from "@/lib/client-journey";
import { PoaStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Check, MessageCircle } from "lucide-react";

export function PoaProgress({
  status,
  showChatLink = false,
}: {
  status: PoaStatus;
  showChatLink?: boolean;
}) {
  const { steps, currentIndex } = getPoaSubsteps(status);
  const chatAvailable =
    showChatLink &&
    status !== PoaStatus.NOT_STARTED &&
    status !== PoaStatus.CANCELLED;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        POA process
      </h3>
      <ul className="mt-6 space-y-0">
        {steps.map((step, i) => {
          const done = step.done;
          const current = i === currentIndex;
          return (
            <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5",
                    done ? "bg-brand-400" : "bg-slate-200"
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                  done && "border-brand-600 bg-brand-600 text-white",
                  current && !done && "border-brand-500 bg-brand-50 text-brand-700",
                  !done && !current && "border-slate-200 bg-white text-slate-400"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <div className="pt-0.5">
                <p
                  className={cn(
                    "font-medium",
                    current ? "text-brand-800" : done ? "text-slate-800" : "text-slate-500"
                  )}
                >
                  {step.label}
                </p>
                {current && (
                  <p className="mt-0.5 text-xs text-brand-600">Current step</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {chatAvailable && (
        <div className="mt-6 rounded-xl border border-violet-200 bg-violet-50/80 p-4">
          <p className="text-sm leading-relaxed text-violet-900">
            <strong className="font-semibold">Need help at any stage?</strong> Use POA chat
            below — our team can answer questions and receive attachments.
          </p>
          <a
            href="#poa-chat"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-white px-3 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-100"
          >
            <MessageCircle className="h-4 w-4" />
            Open POA chat below
          </a>
        </div>
      )}

      {status === PoaStatus.POA_COMPLETED && (
        <p className="mt-4 text-xs text-slate-500">
          Service-request chat opens after POA is complete. POA chat is closed.
        </p>
      )}
    </div>
  );
}
