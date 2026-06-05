"use client";

import { BrandLogo } from "@/components/layout/brand-logo";
import { MarketingLink } from "@/components/layout/marketing-link";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function SiteBrand({
  href = "/",
  className,
  footer = false,
}: {
  href?: string;
  className?: string;
  footer?: boolean;
}) {
  return (
    <MarketingLink
      href={href}
      variant="ghost"
      className={cn(
        "!inline-flex !items-center !gap-3 !p-0 hover:!no-underline",
        footer ? "!text-white" : "!text-slate-900",
        className
      )}
    >
      <BrandLogo variant={footer ? "footer" : "marketing"} showText={false} />
      <span className="text-left">
        {footer ? (
          <>
            <span className="block text-lg font-bold leading-tight">{BRAND.name}</span>
            <span className="block text-xs font-medium text-slate-400">
              Sozo Consulting PLC
            </span>
          </>
        ) : (
          <span className="text-lg font-bold text-slate-900">
            Sozo <span className="text-brand-700">Diaspora</span>
          </span>
        )}
      </span>
    </MarketingLink>
  );
}
