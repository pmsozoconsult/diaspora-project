import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { POA_STATUS_LABELS } from "@/lib/poa";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableRow, DataTableCell } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Role } from "@prisma/client";

export default async function StaffClientsPage() {
  await requireStaff();

  const clients = await prisma.user.findMany({
    where: { role: Role.CLIENT },
    orderBy: { createdAt: "desc" },
    include: { poaCase: true, _count: { select: { serviceRequests: true } } },
  });

  return (
    <div className="page-content">
      <PageHeader
        title="Clients"
        description="All registered diaspora clients and their POA status."
        breadcrumbs={[{ label: "Staff", href: "/staff" }, { label: "Clients" }]}
      />

      <DataTable
        headers={["Name", "Email", "POA", "Requests", ""]}
        emptyMessage="No clients registered."
      >
        {clients.map((c) => (
          <DataTableRow key={c.id}>
            <DataTableCell className="font-semibold">{c.name}</DataTableCell>
            <DataTableCell className="text-slate-600">{c.email}</DataTableCell>
            <DataTableCell>
              <Badge tone={c.poaCase?.status === "POA_COMPLETED" ? "success" : "muted"}>
                {c.poaCase ? POA_STATUS_LABELS[c.poaCase.status] : "Not started"}
              </Badge>
            </DataTableCell>
            <DataTableCell>{c._count.serviceRequests}</DataTableCell>
            <DataTableCell className="text-right">
              {c.poaCase && (
                <Link
                  href={`/staff/poa/${c.poaCase.id}`}
                  className="text-sm font-semibold text-brand-700 hover:underline"
                >
                  POA →
                </Link>
              )}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
    </div>
  );
}
