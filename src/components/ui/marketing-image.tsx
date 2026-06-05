"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MarketingImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Fill-mode image for a `relative` + sized parent (e.g. aspect box or absolute inset-0 layer). */
export function MarketingImage({
  src,
  alt,
  className,
  sizes,
  priority,
}: MarketingImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-slate-200 via-brand-100 to-slate-300",
          className
        )}
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={cn("object-cover", className)}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
