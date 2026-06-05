"use client";

import { motion } from "framer-motion";

export function SignInPending() {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Signing in"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center pt-2"
    >
      <div className="auth-signin-loader" aria-hidden>
        <div className="auth-signin-loader__wrap">
          <div className="auth-signin-loader__box one" />
          <div className="auth-signin-loader__box two" />
          <div className="auth-signin-loader__box three" />
          <div className="auth-signin-loader__box four" />
          <div className="auth-signin-loader__box five" />
          <div className="auth-signin-loader__box six" />
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-700">Signing in…</p>
      <p className="mt-0.5 text-xs text-slate-500">Taking you to your workspace</p>
    </motion.div>
  );
}
