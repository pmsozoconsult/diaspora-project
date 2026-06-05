import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { CreateStaffForm } from "@/components/staff/create-staff-form";
import { DataTable, DataTableRow, DataTableCell } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";

export default async function StaffTeamPage() {
  const session = await requireAdmin();

  const team = await prisma.user.findMany({
    where: { role: { in: [Role.STAFF, Role.ADMIN] } },
    orderBy: { createdAt: "asc" },
    include: { createdBy: { select: { name: true } } },
  });

  return (
    <div className="page-content max-w-5xl">
      <PageHeader
        title="Team management"
        description="Create staff and manager accounts for the operations portal."
        breadcrumbs={[{ label: "Staff", href: "/staff" }, { label: "Team" }]}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <Card variant="elevated">
          <CardTitle icon={<UserPlus className="h-5 w-5 text-brand-600" />}>
            Create staff user
          </CardTitle>
          <CardDescription className="mb-6">
            New users can sign in at /login immediately.
          </CardDescription>
          <CreateStaffForm adminId={session.user.id} />
        </Card>

        <Card variant="outline" className="bg-slate-50/50">
          <CardTitle>Roles</CardTitle>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>
              <strong className="text-slate-800">STAFF</strong> — manage POA, requests,
              clients
            </li>
            <li>
              <strong className="text-slate-800">ADMIN</strong> — all staff access plus
              create users
            </li>
          </ul>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Internal users</h2>
        <DataTable headers={["Name", "Email", "Role", "Created by"]}>
          {team.map((u) => (
            <DataTableRow key={u.id}>
              <DataTableCell className="font-semibold">{u.name}</DataTableCell>
              <DataTableCell>{u.email}</DataTableCell>
              <DataTableCell>
                <Badge tone={u.role === "ADMIN" ? "warning" : "info"}>{u.role}</Badge>
              </DataTableCell>
              <DataTableCell className="text-slate-500">
                {u.createdBy?.name ?? "—"}
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
