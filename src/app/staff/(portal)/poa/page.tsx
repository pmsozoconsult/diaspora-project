import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { POA_STATUS_LABELS } from "@/lib/poa";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableRow, DataTableCell } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { PoaStatus } from "@prisma/client";
import { formatDate } from "@/lib/format-date";

function poaTone(status: PoaStatus) {
  if (status === PoaStatus.POA_COMPLETED) return "success";
  if (status === PoaStatus.CANCELLED) return "danger";
  if (status === PoaStatus.MOFA_SUBMITTED) return "warning";
  if (status === PoaStatus.REGISTERED_IN_ETHIOPIA) return "warning";
  return "info";
}

export default async function StaffPoaListPage() {
  await requireStaff();

  const cases = await prisma.poaCase.findMany({
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });

  return (
    <div className="page-content">
      <PageHeader
        title="POA cases"
        description="Manage power of attorney from fee paid through scan upload and completion."
        breadcrumbs={[{ label: "Staff", href: "/staff" }, { label: "POA cases" }]}
      />

      <DataTable
        headers={["Client", "Contact", "Status", "Updated", ""]}
        emptyMessage="No POA cases yet."
      >
        {cases.map((c) => (
          <DataTableRow key={c.id}>
            <DataTableCell>
              <p className="font-semibold text-slate-900">{c.user.name}</p>
            </DataTableCell>
            <DataTableCell>
              <p className="text-sm text-slate-600">{c.user.email}</p>
              {c.user.phone && (
                <p className="text-xs text-slate-500">{c.user.phone}</p>
              )}
            </DataTableCell>
            <DataTableCell>
              <Badge tone={poaTone(c.status)}>{POA_STATUS_LABELS[c.status]}</Badge>
            </DataTableCell>
            <DataTableCell className="text-sm text-slate-500">
              {formatDate(c.updatedAt)}
            </DataTableCell>
            <DataTableCell className="text-right">
              <Link
                href={`/staff/poa/${c.id}`}
                className="text-sm font-semibold text-brand-700 hover:underline"
              >
                Manage →
              </Link>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
    </div>
  );
}
