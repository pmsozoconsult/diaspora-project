"use client";

import { useMemo, useState } from "react";
import { createServiceRequestDraft } from "@/actions/requests";
import { formatMoney, cn } from "@/lib/utils";
import { getServiceVisual } from "@/lib/service-catalog";
import {
  getCategoryVisual,
  groupServicesByCategory,
} from "@/lib/service-categories";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, CreditCard, ShoppingBag } from "lucide-react";
import { RequestSubmittedSuccess } from "@/components/portal/request-submitted-success";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category?: string | null;
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set()
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{
    referenceNo: string;
    requestId: string;
  } | null>(null);

  const categories = useMemo(() => groupServicesByCategory(services), [services]);
  const selectedServices = services.filter((s) => selected.includes(s.id));
  const total = selectedServices.reduce((sum, s) => sum + s.priceCents, 0);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleCategory(category: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
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

      <div className="space-y-4">
        {categories.map(({ category, services: categoryServices }) => {
          const isExpanded = expandedCategories.has(category);
          const categoryVisual = getCategoryVisual(category);
          const CategoryIcon = categoryVisual.icon;
          const selectedInCategory = categoryServices.filter((s) =>
            selected.includes(s.id)
          ).length;

          return (
            <section
              key={category}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                aria-expanded={isExpanded}
                className={cn(
                  "flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                )}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r text-white shadow-sm",
                    categoryVisual.accent
                  )}
                >
                  <CategoryIcon className="h-5 w-5" strokeWidth={2} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold text-slate-900">
                    {category}
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-500">
                    {categoryVisual.description} · {categoryServices.length}{" "}
                    {categoryServices.length === 1 ? "service" : "services"}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  {selectedInCategory > 0 && (
                    <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-800">
                      {selectedInCategory} selected
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-slate-400 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/40 p-4 sm:p-5">
                  <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {categoryServices.map((s) => {
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
                              ? "border-brand-600 bg-white shadow-lg shadow-brand-600/20 ring-4 ring-brand-200"
                              : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                          )}
                        >
                          <div
                            className={cn(
                              "relative bg-gradient-to-r px-5 py-4 text-white",
                              visual.accent,
                              isSelected && "brightness-[0.92] saturate-[1.05]"
                            )}
                          >
                            {isSelected && (
                              <span className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 shadow-md ring-2 ring-white">
                                <Check className="h-4 w-4 text-white" strokeWidth={3} />
                              </span>
                            )}

                            <div
                              className={cn(
                                "flex items-start gap-3",
                                isSelected && "pr-12"
                              )}
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/20 text-white ring-1 ring-white/30 backdrop-blur-sm">
                                <Icon className="h-5 w-5" strokeWidth={2} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-lg font-bold leading-snug">
                                  {s.name}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "flex flex-1 flex-col p-4",
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
                              <p className="flex-1 text-sm text-slate-400">
                                No description provided.
                              </p>
                            )}
                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
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
                </div>
              )}
            </section>
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
                Expand a category above and choose the services you need. Your total
                updates as you select.
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
                  {selectedServices.length === 1 ? "service" : "services"} · charged on
                  submit
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
