"use client";

import Link from "next/link";
import { useNavLoading } from "@/components/layout/navigation-loading-provider";
import { ComponentProps } from "react";

export function NavLink({ onClick, href, ...props }: ComponentProps<typeof Link>) {
  const { startNavigation } = useNavLoading();

  return (
    <Link
      href={href}
      onClick={(e) => {
        if (typeof href === "string" && href.length > 0) {
          startNavigation();
        }
        onClick?.(e);
      }}
      {...props}
    />
  );
}
