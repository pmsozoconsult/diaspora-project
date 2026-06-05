import { requireClient } from "@/lib/session";
import { PortalSidebarWrapper } from "@/components/layout/portal-sidebar-wrapper";
import { Suspense } from "react";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireClient();

  return (
    <div className="min-h-screen bg-mesh-portal">
      <Suspense>
        <PortalSidebarWrapper userName={session.user.name} />
      </Suspense>
      <div className="pl-[var(--sidebar-width)]">
        <main className="page-container min-h-screen py-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
