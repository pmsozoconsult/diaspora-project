import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ITEM_STATUS_SHORT, REQUEST_STATUS_LABELS } from "@/lib/requests";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableRow, DataTableCell } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";

function statusTone(status: string) {
  if (status === "COMPLETED") return "success";
  if (status === "REJECTED" || status === "CANCELLED") return "danger";
  if (status === "WITH_THIRD_PARTY") return "warning";
  if (status === "SUBMITTED") return "info";
  return "muted";
}

export default async function StaffRequestsPage() {
  await requireStaff();

  const requests = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true, email: true } },
      items: { include: { service: true } },
    },
  });

  return (
    <div className="page-content">
      <PageHeader
        title="Service requests"
        description="Open a request to update status or chat with the client."
        breadcrumbs={[{ label: "Staff", href: "/staff" }, { label: "Requests" }]}
      />

      <DataTable
        headers={["Reference", "Client", "Services", "Total", "Status", ""]}
        emptyMessage="No service requests."
      >
        {requests.map((r) => (
          <DataTableRow key={r.id}>
            <DataTableCell>
              <span className="font-mono font-bold text-slate-900">{r.referenceNo}</span>
            </DataTableCell>
            <DataTableCell>
              <p className="font-medium">{r.client.name}</p>
              <p className="text-xs text-slate-500">{r.client.email}</p>
            </DataTableCell>
            <DataTableCell className="max-w-md">
              <ul className="space-y-1 text-sm text-slate-600">
                {r.items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-2">
                    <span className="truncate">{i.service.name}</span>
                    <span className="shrink-0 text-xs font-medium text-slate-500">
                      {ITEM_STATUS_SHORT[i.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </DataTableCell>
            <DataTableCell className="font-medium">{formatMoney(r.totalCents)}</DataTableCell>
            <DataTableCell>
              <Badge tone={statusTone(r.status)}>{REQUEST_STATUS_LABELS[r.status]}</Badge>
            </DataTableCell>
            <DataTableCell className="text-right">
              <Link
                href={`/staff/requests/${r.id}`}
                className="text-sm font-semibold text-brand-700 hover:underline"
              >
                Open →
              </Link>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
    </div>
  );
}
