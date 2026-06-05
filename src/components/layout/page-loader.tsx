"use client";

import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="page-loader-panel relative flex flex-col items-center overflow-hidden rounded-3xl px-14 pb-12 pt-10 shadow-2xl shadow-black/30"
      >
        <div className="page-loader-pencil-wrap" aria-hidden>
          <div className="page-loader-pencil" />
        </div>
        <div className="page-loader-text" role="status" aria-label="Loading" />
      </motion.div>
    </div>
  );
}
