"use client";

import Image from "next/image";
import { useState } from "react";
import { Shield } from "lucide-react";
import { BRAND, getBrandLogoSrc, type BrandLogoVariant } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function BrandLogo({
  variant = "portal",
  collapsed = false,
  showText = true,
}: {
  variant?: BrandLogoVariant;
  collapsed?: boolean;
  showText?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const logoSrc = getBrandLogoSrc(variant);
  const useImage = Boolean(logoSrc) && !imageFailed;

  const title = variant === "staff" ? BRAND.staffName : BRAND.name;
  const subtitle =
    variant === "staff" ? BRAND.staffPortalSubtitle : BRAND.clientPortalSubtitle;

  const isSidebar = variant === "portal" || variant === "staff";
  const isMarketing = variant === "marketing";
  const isFooter = variant === "footer";

  return (
    <>
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center",
          isSidebar && "h-11 w-11",
          isMarketing && "h-11 w-auto max-w-[11rem]",
          isFooter && "h-auto w-auto max-w-[15rem]",
          !useImage &&
            isSidebar &&
            "overflow-hidden rounded-lg " +
              (variant === "staff" ? "bg-brand-600" : "bg-gradient-to-br from-brand-600 to-brand-800")
        )}
      >
        {useImage ? (
          <Image
            src={logoSrc}
            alt={BRAND.logoAlt}
            width={isFooter ? 240 : isMarketing ? 176 : 44}
            height={isFooter ? 64 : isMarketing ? 44 : 44}
            className={cn(
              "object-contain",
              isSidebar && "h-11 w-11",
              isMarketing && "h-10 w-auto max-w-[10.5rem] sm:h-11 sm:max-w-[11rem]",
              isFooter && "h-14 w-auto max-w-[13rem] sm:h-16 sm:max-w-[15rem]"
            )}
            onError={() => setImageFailed(true)}
            unoptimized={logoSrc.endsWith(".svg")}
            priority={isMarketing || isFooter}
          />
        ) : variant === "staff" ? (
          <Shield className="h-5 w-5 text-white" />
        ) : (
          <span className="text-sm font-bold text-white">S</span>
        )}
      </span>

      {showText && !collapsed && isSidebar && (
        <div className="min-w-0">
          <p
            className={cn(
              "truncate text-sm font-bold",
              variant === "staff" ? "text-white" : "text-slate-900"
            )}
          >
            {title}
          </p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      )}
    </>
  );
}
