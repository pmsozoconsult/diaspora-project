"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, MessageSquare } from "lucide-react";

const REDIRECT_SECONDS = 10;

export function RequestSubmittedSuccess({
  referenceNo,
  requestId,
}: {
  referenceNo: string;
  requestId: string;
}) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) {
      router.push("/portal/requests");
    }
  }, [secondsLeft, router]);

  return (
    <motion.div
      role="dialog"
      aria-labelledby="request-success-title"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 shadow-2xl sm:p-10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
            <motion.span
              className="absolute inset-0 rounded-full bg-emerald-400/25"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1.35, opacity: 0 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 0.35,
                ease: "easeOut",
              }}
            />
            <motion.span
              className="absolute inset-2 rounded-full bg-emerald-400/15"
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 0.55,
                ease: "easeOut",
              }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-brand-600 shadow-lg shadow-emerald-600/30"
            >
              <svg
                viewBox="0 0 52 52"
                className="h-12 w-12"
                aria-hidden
              >
                <motion.circle
                  cx="26"
                  cy="26"
                  r="24"
                  fill="none"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
                <motion.path
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 27l8 8 16-18"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
                />
              </svg>
            </motion.div>
          </div>

          <motion.h2
            id="request-success-title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.35 }}
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Request submitted successfully
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.35 }}
            className="mt-4 max-w-md text-base leading-relaxed text-slate-600"
          >
            Thank you for your payment. Our team has received your service request
            and will get back to you shortly. You can track progress and message us
            from your requests dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.35 }}
            className="mt-6 rounded-xl border border-brand-200/80 bg-brand-50/80 px-5 py-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-800">
              Reference number
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-slate-900">
              {referenceNo}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.35 }}
            className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Link
              href={`/portal/requests/${requestId}`}
              className={cn(
                "inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition duration-200 sm:w-auto",
                "bg-brand-600 text-white shadow-md shadow-brand-600/30 hover:bg-brand-700 hover:shadow-lg"
              )}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Open request chat
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.push("/portal/requests")}
            >
              All requests
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 text-xs text-slate-500"
          >
            Redirecting to your requests in {secondsLeft}s…
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
