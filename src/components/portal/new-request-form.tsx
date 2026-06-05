"use client";

import { useState } from "react";
import { createServiceRequestDraft } from "@/actions/requests";
import { formatMoney, cn } from "@/lib/utils";
import { getServiceVisual } from "@/lib/service-catalog";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, ShoppingBag } from "lucide-react";
import { RequestSubmittedSuccess } from "@/components/portal/request-submitted-success";

type Service = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
};

export function NewRequestForm({
  userId,
  services,
}: {
  userId: string;
  services: Service[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{
    referenceNo: string;
    requestId: string;
  } | null>(null);

  const selectedServices = services.filter((s) => selected.includes(s.id));
  const total = selectedServices.reduce((sum, s) => sum + s.priceCents, 0);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function submit() {
    setLoading(true);
    setError(null);
    const result = await createServiceRequestDraft(userId, selected);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.success && result.referenceNo && result.requestId) {
      setSubmitted({
        referenceNo: result.referenceNo,
        requestId: result.requestId,
      });
    }
  }

  return (
    <div className="space-y-8">
      {submitted && (
        <RequestSubmittedSuccess
          referenceNo={submitted.referenceNo}
          requestId={submitted.requestId}
        />
      )}
      <div className="grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => {
          const isSelected = selected.includes(s.id);
          const visual = getServiceVisual(s.name);
          const Icon = visual.icon;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              aria-pressed={isSelected}
              className={cn(
                "group flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 text-left transition duration-200",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                isSelected
                  ? "border-brand-600 shadow-lg shadow-brand-600/20 ring-4 ring-brand-200"
                  : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              )}
            >
              <div
                className={cn(
                  "relative bg-gradient-to-r px-5 py-5 text-white",
                  visual.accent,
                  isSelected && "brightness-[0.92] saturate-[1.05]"
                )}
              >
                {isSelected && (
                  <span className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 shadow-md ring-2 ring-white">
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </span>
                )}

                <div className={cn("flex items-start gap-4", isSelected && "pr-12")}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/20 text-white ring-1 ring-white/30 backdrop-blur-sm">
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                      {visual.tagline}
                    </p>
                    <p className="mt-1 text-lg font-bold leading-snug">{s.name}</p>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "flex flex-1 flex-col p-5",
                  isSelected
                    ? "border-t-2 border-brand-200 bg-brand-50"
                    : "border-t border-slate-100 bg-white"
                )}
              >
                {isSelected && (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                    Selected
                  </span>
                )}
                {s.description ? (
                  <p className="flex-1 text-sm leading-relaxed text-slate-600">
                    {s.description}
                  </p>
                ) : (
                  <p className="flex-1 text-sm text-slate-400">No description provided.</p>
                )}
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Price
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-base font-bold text-slate-900">
                    {formatMoney(s.priceCents)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10 lg:p-8">
          <div className="min-w-0 space-y-4">
            <div className="flex items-center gap-2 text-brand-700">
              <ShoppingBag className="h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold text-slate-900">Your selection</p>
            </div>

            {selectedServices.length === 0 ? (
              <p className="text-sm text-slate-500">
                Choose one or more services above. Your total amount updates as you select.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/60">
                {selectedServices.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-800">{s.name}</span>
                    <span className="shrink-0 font-semibold text-slate-900">
                      {formatMoney(s.priceCents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-sm font-medium text-slate-500">Total amount</p>
              <p className="text-3xl font-bold tracking-tight text-slate-900">
                {formatMoney(total)}
              </p>
              {selectedServices.length > 0 && (
                <p className="w-full text-xs text-slate-500 sm:w-auto">
                  {selectedServices.length}{" "}
                  {selectedServices.length === 1 ? "service" : "services"} · charged on submit
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
            <Button
              size="lg"
              className="w-full min-w-[220px] sm:w-auto lg:w-full"
              disabled={loading || selected.length === 0}
              onClick={submit}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {loading ? "Processing…" : "Pay & submit request"}
            </Button>
            <p className="text-center text-xs text-slate-500 lg:text-left">
              Payment is required before your request is sent to our team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
