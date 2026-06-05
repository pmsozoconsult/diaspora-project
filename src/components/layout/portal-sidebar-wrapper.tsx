"use client";

import { usePathname } from "next/navigation";
import { PortalSidebar } from "@/components/layout/portal-sidebar";

export function PortalSidebarWrapper({ userName }: { userName: string }) {
  const pathname = usePathname();
  return <PortalSidebar userName={userName} pathname={pathname} />;
}
