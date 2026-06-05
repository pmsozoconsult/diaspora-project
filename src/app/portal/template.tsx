"use client";

import { PageTransition } from "@/components/layout/page-transition";

export default function PortalTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
