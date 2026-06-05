"use client";

import { useEffect, useState } from "react";
import { Role } from "@prisma/client";
import { StaffSidebar } from "@/components/layout/staff-sidebar";

const STORAGE_KEY = "staff-sidebar-collapsed";
const SIDEBAR_EXPANDED = "17rem";
const SIDEBAR_COLLAPSED = "4.75rem";

export function StaffPortalShell({
  userName,
  role,
  children,
}: {
  userName: string;
  role: Role;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "1") {
      setCollapsed(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const width = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;
    document.documentElement.style.setProperty("--sidebar-width", width);
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed, ready]);

  function toggleCollapsed() {
    setCollapsed((value) => !value);
  }

  return (
    <>
      <StaffSidebar
        userName={userName}
        role={role}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />
      <div className="min-h-screen pl-[var(--sidebar-width)] transition-[padding] duration-300 ease-in-out">
        <main className="page-container min-h-screen py-8 lg:py-10">{children}</main>
      </div>
    </>
  );
}
