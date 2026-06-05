"use client";

import {
  LayoutDashboard,
  FileSignature,
  ClipboardList,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/layout/nav-link";
import { SignOutButton } from "@/components/layout/sign-out-button";

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
  pathname,
}: {
  userName: string;
  pathname: string;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width)] flex-col border-r border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-6">
        <NavLink href="/portal" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold text-white">
            S
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">Sozo Diaspora</p>
            <p className="text-xs text-slate-500">Client portal</p>
          </div>
        </NavLink>
      </div>

      <div className="border-b border-slate-100 px-5 py-4">
        <p className="truncate text-sm font-semibold text-slate-800">{userName}</p>
        <p className="text-xs text-slate-500">Signed in</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200",
                active
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2 : 1.75} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <SignOutButton callbackUrl="/" variant="client" />
      </div>
    </aside>
  );
}
