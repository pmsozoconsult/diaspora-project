"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { JOURNEY_STEPS, type JourneyPhase } from "@/lib/client-journey";
import Link from "next/link";

export function JourneyStepper({ currentPhase }: { currentPhase: JourneyPhase }) {
  const phaseOrder: JourneyPhase[] = ["account", "poa", "services"];
  const currentIdx = phaseOrder.indexOf(currentPhase);

  return (
    <div className="rounded-2xl border border-brand-200/60 bg-gradient-to-br from-white to-brand-50/50 p-6 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
        Your journey
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Follow these steps — we show where you are at all times.
      </p>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {JOURNEY_STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const href =
            step.id === "poa"
              ? "/portal/poa"
              : step.id === "services"
                ? "/portal/requests"
                : "/portal";

          return (
            <li key={step.id}>
              <Link
                href={href}
                className={cn(
                  "flex h-full flex-col rounded-xl border p-4 transition duration-300",
                  active &&
                    "border-brand-400 bg-white shadow-md ring-2 ring-brand-200/80",
                  done && !active && "border-brand-200/50 bg-brand-50/30",
                  !done && !active && "border-slate-200 bg-slate-50/50 opacity-75"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      done && "bg-brand-600 text-white",
                      active && "bg-brand-600 text-white",
                      !done && !active && "bg-slate-200 text-slate-500"
                    )}
                  >
                    {done ? (
                      <Check className="h-5 w-5" />
                    ) : active ? (
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                      </span>
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </span>
                  <span className="font-semibold text-slate-900">{step.short}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {step.description}
                </p>
                {active && (
                  <span className="mt-3 text-xs font-semibold text-brand-700">
                    You are here →
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
