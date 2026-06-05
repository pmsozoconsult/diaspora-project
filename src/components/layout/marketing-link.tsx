"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useNavLoading } from "@/components/layout/navigation-loading-provider";
import { ComponentProps } from "react";

export function MarketingLink({
  className,
  href,
  variant = "ghost",
  children,
  onClick,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost" | "footer";
}) {
  const { startNavigation } = useNavLoading();

  const variants = {
    primary:
      "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/35 active:translate-y-0 active:scale-100 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-500 hover:before:translate-x-full",
    secondary:
      "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-brand-500 hover:bg-brand-50 hover:text-brand-900 hover:shadow-lg hover:shadow-brand-500/15 active:translate-y-0 active:scale-100",
    ghost:
      "text-sm font-medium text-slate-600 transition-all duration-200 hover:text-brand-700 hover:underline underline-offset-4",
    footer:
      "text-sm text-slate-400 transition-all duration-200 hover:translate-x-1 hover:text-white",
  };

  return (
    <Link
      href={href}
      className={cn(variants[variant], className)}
      onClick={(e) => {
        if (typeof href === "string") startNavigation();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
