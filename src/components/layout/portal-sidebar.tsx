"use client";

import {
  LayoutDashboard,
  FileSignature,
  ClipboardList,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/brand-logo";
import { NavLink } from "@/components/layout/nav-link";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { BRAND } from "@/lib/brand";

const links = [
  { href: "/portal", label: "Overview", icon: LayoutDashboard, match: "exact" as const },
  { href: "/portal/poa", label: "Power of attorney", icon: FileSignature, match: "prefix" as const },
  {
    href: "/portal/requests",
    label: "My requests",
    icon: ClipboardList,
    match: "requests-list" as const,
  },
  {
    href: "/portal/requests/new",
    label: "New request",
    icon: PlusCircle,
    match: "prefix" as const,
  },
];

export function PortalSidebar({
  userName,
  collapsed,
  onToggleCollapsed,
}: {
  userName: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width)] flex-col border-r border-slate-200/80 bg-white shadow-sm transition-[width] duration-300 ease-in-out",
        collapsed ? "overflow-visible" : "overflow-hidden"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-slate-100",
          collapsed ? "justify-center px-2 py-4" : "justify-between gap-2 px-4 py-5"
        )}
      >
        <NavLink
          href="/portal"
          className={cn("flex min-w-0 items-center gap-2", collapsed && "justify-center")}
          title={BRAND.name}
        >
          <BrandLogo variant="portal" collapsed={collapsed} />
        </NavLink>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center border-b border-slate-100 py-2">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        </div>
      )}

      <div
        className={cn(
          "border-b border-slate-100",
          collapsed ? "px-2 py-3 text-center" : "px-5 py-4"
        )}
      >
        {!collapsed ? (
          <>
            <p className="truncate text-sm font-semibold text-slate-800">{userName}</p>
            <p className="text-xs text-slate-500">Signed in</p>
          </>
        ) : (
          <p
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700"
            title={userName}
          >
            {userName.charAt(0).toUpperCase()}
          </p>
        )}
      </div>

      <nav className={cn("flex-1 space-y-1 overflow-y-auto", collapsed ? "p-2" : "p-3")}>
        {links.map(({ href, label, icon: Icon, match }) => {
          const active =
            match === "exact"
              ? pathname === href
              : match === "requests-list"
                ? pathname === "/portal/requests" ||
                  (pathname.startsWith("/portal/requests/") &&
                    !pathname.startsWith("/portal/requests/new"))
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
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2 : 1.75} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className={cn("border-t border-slate-100", collapsed ? "p-2" : "p-3")}>
        <SignOutButton callbackUrl="/" variant="client" collapsed={collapsed} />
      </div>
    </aside>
  );
}
