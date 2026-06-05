"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initiatePoaPayment } from "@/actions/poa";
import {
  POA_TERMS_SECTIONS,
  POA_TERMS_TITLE,
  POA_TERMS_VERSION,
} from "@/lib/poa-terms";
import { Button } from "@/components/ui/button";
import { formatMoney, cn } from "@/lib/utils";
import { FileText, Scale, X } from "lucide-react";

export function PoaPayButton({
  userId,
  feeCents,
}: {
  userId: string;
  feeCents: number;
}) {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    if (loading) return;
    setOpen(false);
    setAccepted(false);
    setError(null);
  }

  async function pay() {
    if (!accepted) return;
    setLoading(true);
    setError(null);
    const result = await initiatePoaPayment(userId, true);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    window.location.reload();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="shrink-0">
        <Scale className="mr-2 h-4 w-4" />
        Review terms & pay {formatMoney(feeCents)}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="poa-terms-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex items-start gap-3 border-b border-slate-200 bg-brand-50/60 px-6 py-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1 pr-8">
                  <h2 id="poa-terms-title" className="text-lg font-bold text-slate-900">
                    {POA_TERMS_TITLE}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Version {POA_TERMS_VERSION} · Please read before payment
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  disabled={loading}
                  className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-5 text-sm leading-relaxed text-slate-700">
                  {POA_TERMS_SECTIONS.map((section) => (
                    <section key={section.heading}>
                      <h3 className="font-bold text-slate-900">{section.heading}</h3>
                      <p className="mt-1.5">{section.body}</p>
                    </section>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50/80 px-6 py-5">
                {error && (
                  <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-200 bg-white p-4">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-slate-700">
                    I have read and agree to the Terms & Conditions. I understand this
                    is a binding agreement between myself and Sozo Diaspora Services
                    before proceeding with the POA engagement fee of{" "}
                    <strong>{formatMoney(feeCents)}</strong>.
                  </span>
                </label>
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={close}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={!accepted || loading}
                    onClick={pay}
                    className={cn(!accepted && "opacity-60")}
                  >
                    {loading
                      ? "Processing payment…"
                      : `Accept and pay ${formatMoney(feeCents)}`}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
