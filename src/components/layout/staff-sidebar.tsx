"use client";

import {
  LayoutDashboard,
  FileSignature,
  ClipboardList,
  Users,
  UserCog,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/brand-logo";
import { NavLink } from "@/components/layout/nav-link";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { BRAND } from "@/lib/brand";

export function StaffSidebar({
  userName,
  role,
  collapsed,
  onToggleCollapsed,
}: {
  userName: string;
  role: Role;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/staff", label: "Dashboard", icon: LayoutDashboard, match: "exact" as const },
    { href: "/staff/poa", label: "POA cases", icon: FileSignature, match: "prefix" as const },
    {
      href: "/staff/requests",
      label: "Service requests",
      icon: ClipboardList,
      match: "prefix" as const,
    },
    { href: "/staff/clients", label: "Clients", icon: Users, match: "prefix" as const },
  ];

  if (role === Role.ADMIN) {
    links.push({ href: "/staff/team", label: "Team", icon: UserCog, match: "prefix" as const });
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width)] flex-col border-r border-slate-800/50 bg-slate-900 text-slate-300 shadow-xl transition-[width] duration-300 ease-in-out",
        collapsed ? "overflow-visible" : "overflow-hidden"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-slate-800",
          collapsed ? "justify-center px-2 py-4" : "justify-between gap-2 px-4 py-5"
        )}
      >
        <NavLink
          href="/staff"
          className={cn(
            "flex min-w-0 items-center gap-2",
            collapsed && "justify-center"
          )}
          title={BRAND.staffName}
        >
          <BrandLogo variant="staff" collapsed={collapsed} />
        </NavLink>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center border-b border-slate-800 py-2">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        </div>
      )}

      <div
        className={cn(
          "border-b border-slate-800",
          collapsed ? "px-2 py-3 text-center" : "px-5 py-4"
        )}
      >
        {!collapsed ? (
          <>
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
              {role}
            </p>
          </>
        ) : (
          <p
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white"
            title={`${userName} (${role})`}
          >
            {userName.charAt(0).toUpperCase()}
          </p>
        )}
      </div>

      <nav className={cn("flex-1 space-y-1", collapsed ? "p-2" : "p-3")}>
        {links.map(({ href, label, icon: Icon, match }) => {
          const active =
            match === "exact"
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <NavLink
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-xl text-sm font-medium transition duration-200",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-900/50"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className={cn("border-t border-slate-800", collapsed ? "p-2" : "p-3")}>
        <SignOutButton
          callbackUrl="/login"
          variant="staff"
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}
