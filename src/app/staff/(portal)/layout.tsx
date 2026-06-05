import { requireStaff } from "@/lib/session";
import { StaffSidebarWrapper } from "@/components/layout/staff-sidebar-wrapper";
import { Suspense } from "react";

export default async function StaffPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaff();

  return (
    <div className="min-h-screen bg-slate-100">
      <Suspense>
        <StaffSidebarWrapper
          userName={session.user.name}
          role={session.user.role}
        />
      </Suspense>
      <div className="pl-[var(--sidebar-width)]">
        <main className="page-container min-h-screen py-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
