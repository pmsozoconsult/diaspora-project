"use client";

import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import { StaffSidebar } from "@/components/layout/staff-sidebar";

export function StaffSidebarWrapper({
  userName,
  role,
}: {
  userName: string;
  role: Role;
}) {
  const pathname = usePathname();
  return <StaffSidebar userName={userName} role={role} pathname={pathname} />;
}
