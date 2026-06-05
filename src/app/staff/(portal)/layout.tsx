import { requireStaff } from "@/lib/session";
import { StaffPortalShell } from "@/components/layout/staff-portal-shell";

export default async function StaffPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaff();

  return (
    <div className="min-h-screen bg-slate-100">
      <StaffPortalShell userName={session.user.name} role={session.user.role}>
        {children}
      </StaffPortalShell>
    </div>
  );
}
