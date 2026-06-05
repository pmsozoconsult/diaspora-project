import Link from "next/link";
import { requireClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ITEM_STATUS_SHORT, REQUEST_STATUS_LABELS } from "@/lib/requests";
import { clientCanRequestServices } from "@/lib/poa";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableRow, DataTableCell } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatMoney } from "@/lib/utils";

function statusTone(status: string) {
  if (status === "COMPLETED") return "success";
  if (status === "REJECTED" || status === "CANCELLED") return "danger";
  if (status === "WITH_THIRD_PARTY") return "warning";
  return "info";
}

export default async function PortalRequestsPage() {
  const session = await requireClient();
  const canRequest = await clientCanRequestServices(session.user.id);

  const requests = await prisma.serviceRequest.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { service: true } } },
  });

  return (
    <div className="page-content">
      <PageHeader
        title="Service requests"
        description="Each request has its own reference number and dedicated chat thread."
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: "Requests" },
        ]}
        action={
          canRequest ? (
            <Link href="/portal/requests/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New request
              </Button>
            </Link>
          ) : undefined
        }
      />

      {!canRequest && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Complete your{" "}
          <Link href="/portal/poa" className="font-semibold underline">
            power of attorney
          </Link>{" "}
          before submitting service requests.
        </div>
      )}

      <DataTable
        headers={["Reference", "Services", "Total", "Status", ""]}
        emptyMessage="No service requests yet."
      >
        {requests.map((r) => (
          <DataTableRow key={r.id}>
            <DataTableCell>
              <Link
                href={`/portal/requests/${r.id}`}
                className="font-mono font-bold text-brand-700 hover:underline"
              >
                {r.referenceNo}
              </Link>
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
            <DataTableCell className="font-medium">
              {formatMoney(r.totalCents)}
            </DataTableCell>
            <DataTableCell>
              <Badge tone={statusTone(r.status)}>
                {REQUEST_STATUS_LABELS[r.status]}
              </Badge>
            </DataTableCell>
            <DataTableCell className="text-right">
              <Link
                href={`/portal/requests/${r.id}`}
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
