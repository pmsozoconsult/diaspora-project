import { requireClient } from "@/lib/session";
import { PortalPortalShell } from "@/components/layout/portal-portal-shell";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireClient();

  return (
    <div className="min-h-screen bg-mesh-portal">
      <PortalPortalShell userName={session.user.name}>{children}</PortalPortalShell>
    </div>
  );
}
