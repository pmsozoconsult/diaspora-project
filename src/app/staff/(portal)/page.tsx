import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PoaStatus, ServiceRequestStatus } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { MetricGrid, StatusMetricCard } from "@/components/ui/status-metric-card";
import { DataTable, DataTableRow, DataTableCell } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { REQUEST_STATUS_LABELS } from "@/lib/requests";
import { POA_STATUS_LABELS } from "@/lib/poa";
import { FileSignature, ClipboardList, Users, Inbox } from "lucide-react";

export default async function StaffDashboardPage() {
  await requireStaff();

  const [poaPending, requestsActive, clients, recentRequests, recentPoa, submittedCount] =
    await Promise.all([
      prisma.poaCase.count({
        where: {
          status: {
            in: [
              PoaStatus.POA_FEE_PAID,
              PoaStatus.MOFA_SUBMITTED,
              PoaStatus.REGISTERED_IN_ETHIOPIA,
            ],
          },
        },
      }),
      prisma.serviceRequest.count({
        where: {
          status: {
            in: [
              ServiceRequestStatus.SUBMITTED,
              ServiceRequestStatus.IN_PROGRESS,
              ServiceRequestStatus.WITH_THIRD_PARTY,
            ],
          },
        },
      }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.serviceRequest.findMany({
        orderBy: { updatedAt: "desc" },
        take: 8,
        include: {
          client: { select: { name: true, email: true } },
          items: { include: { service: true } },
        },
      }),
      prisma.poaCase.findMany({
        where: {
          status: {
            in: [
              PoaStatus.POA_FEE_PAID,
              PoaStatus.MOFA_SUBMITTED,
              PoaStatus.REGISTERED_IN_ETHIOPIA,
            ],
          },
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.serviceRequest.count({
        where: { status: ServiceRequestStatus.SUBMITTED },
      }),
    ]);

  return (
    <div className="page-content space-y-8">
      <PageHeader
        title="Operations dashboard"
        description="Overview of POA cases, active service requests, and client activity."
        breadcrumbs={[{ label: "Staff", href: "/staff" }, { label: "Dashboard" }]}
      />

      <MetricGrid columns={4}>
        <StatusMetricCard
          label="POA in progress"
          metric={poaPending}
          statusText="cases active"
          detail="Fee paid or at embassy"
          icon={FileSignature}
          visualState={poaPending > 0 ? "pending" : "neutral"}
          href="/staff/poa"
        />
        <StatusMetricCard
          label="Active requests"
          metric={requestsActive}
          statusText="open cases"
          detail="Submitted through third party"
          icon={ClipboardList}
          visualState={requestsActive > 0 ? "pending" : "neutral"}
          href="/staff/requests"
        />
        <StatusMetricCard
          label="Clients"
          metric={clients}
          statusText="registered"
          icon={Users}
          visualState="neutral"
          href="/staff/clients"
        />
        <StatusMetricCard
          label="Inbox"
          metric={submittedCount}
          statusText="awaiting pickup"
          detail="Newly submitted requests"
          icon={Inbox}
          visualState={submittedCount > 0 ? "warning" : "success"}
          href="/staff/requests"
        />
      </MetricGrid>

      <div className="flex w-full flex-col gap-8">
        <section className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent requests</h2>
            <Link href="/staff/requests" className="text-sm font-semibold text-brand-700">
              View all →
            </Link>
          </div>
          <DataTable
            headers={["Reference", "Client", "Status"]}
            emptyMessage="No requests yet."
          >
            {recentRequests.map((r) => (
              <DataTableRow key={r.id}>
                <DataTableCell>
                  <Link
                    href={`/staff/requests/${r.id}`}
                    className="font-mono font-bold text-brand-700 hover:underline"
                  >
                    {r.referenceNo}
                  </Link>
                </DataTableCell>
                <DataTableCell>
                  <p className="font-medium text-slate-800">{r.client.name}</p>
                  <p className="text-xs text-slate-500">{r.client.email}</p>
                </DataTableCell>
                <DataTableCell>
                  <Badge tone="info">{REQUEST_STATUS_LABELS[r.status]}</Badge>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        </section>

        <section className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">POA queue</h2>
            <Link href="/staff/poa" className="text-sm font-semibold text-brand-700">
              View all →
            </Link>
          </div>
          <DataTable headers={["Client", "POA status"]} emptyMessage="No active POA cases.">
            {recentPoa.map((c) => (
              <DataTableRow key={c.id}>
                <DataTableCell>
                  <Link
                    href={`/staff/poa/${c.id}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {c.user.name}
                  </Link>
                  <p className="text-xs text-slate-500">{c.user.email}</p>
                </DataTableCell>
                <DataTableCell>
                  <Badge tone="warning">{POA_STATUS_LABELS[c.status]}</Badge>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        </section>
      </div>
    </div>
  );
}
