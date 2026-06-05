"use client";

import {
  LayoutDashboard,
  FileSignature,
  ClipboardList,
  Users,
  UserCog,
  Shield,
} from "lucide-react";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/layout/nav-link";
import { SignOutButton } from "@/components/layout/sign-out-button";

export function StaffSidebar({
  userName,
  role,
  pathname,
}: {
  userName: string;
  role: Role;
  pathname: string;
}) {
  const links = [
    { href: "/staff", label: "Dashboard", icon: LayoutDashboard, match: "exact" as const },
    { href: "/staff/poa", label: "POA cases", icon: FileSignature, match: "prefix" as const },
    { href: "/staff/requests", label: "Service requests", icon: ClipboardList, match: "prefix" as const },
    { href: "/staff/clients", label: "Clients", icon: Users, match: "prefix" as const },
  ];

  if (role === Role.ADMIN) {
    links.push({ href: "/staff/team", label: "Team", icon: UserCog, match: "prefix" as const });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width)] flex-col border-r border-slate-800/50 bg-slate-900 text-slate-300 shadow-xl">
      <div className="border-b border-slate-800 px-5 py-6">
        <NavLink href="/staff" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">Sozo Operations</p>
            <p className="text-xs text-slate-500">Staff portal</p>
          </div>
        </NavLink>
      </div>

      <div className="border-b border-slate-800 px-5 py-4">
        <p className="truncate text-sm font-semibold text-white">{userName}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
          {role}
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon, match }) => {
          const active =
            match === "exact"
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <NavLink
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200",
                active
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-900/50"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <SignOutButton callbackUrl="/login" variant="staff" />
      </div>
    </aside>
  );
}
