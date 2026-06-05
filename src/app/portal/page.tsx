import Link from "next/link";
import { requireClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  getOrCreatePoaCase,
  POA_STATUS_LABELS,
  clientCanRequestServices,
} from "@/lib/poa";
import { getClientJourneyPhase } from "@/lib/client-journey";
import { PageHeader } from "@/components/ui/page-header";
import {
  MetricGrid,
  StatusMetricCard,
  poaVisualState,
  poaShortStatus,
} from "@/components/ui/status-metric-card";
import { JourneyStepper } from "@/components/ui/journey-stepper";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PoaStatus } from "@prisma/client";
import {
  FileSignature,
  ClipboardList,
  ArrowRight,
  AlertCircle,
  Lock,
  Unlock,
} from "lucide-react";

export default async function PortalHomePage() {
  const session = await requireClient();
  const poa = await getOrCreatePoaCase(session.user.id);
  const canRequest = await clientCanRequestServices(session.user.id);
  const phase = getClientJourneyPhase(poa.status, canRequest);

  const [requestCount, activeCount, recentRequests] = await Promise.all([
    prisma.serviceRequest.count({ where: { clientId: session.user.id } }),
    prisma.serviceRequest.count({
      where: {
        clientId: session.user.id,
        status: { notIn: ["COMPLETED", "CANCELLED", "REJECTED"] },
      },
    }),
    prisma.serviceRequest.findMany({
      where: { clientId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { items: { include: { service: true } } },
    }),
  ]);

  return (
    <div className="page-content space-y-8">
      <PageHeader
        title={`Welcome back, ${session.user.name.split(" ")[0]}`}
        description="Track your power of attorney and service requests in one place."
        breadcrumbs={[{ label: "Portal", href: "/portal" }, { label: "Overview" }]}
      />

      <JourneyStepper currentPhase={phase} />

      <MetricGrid columns={3}>
        <StatusMetricCard
          label="POA"
          statusText={poaShortStatus(poa.status)}
          detail={POA_STATUS_LABELS[poa.status]}
          icon={FileSignature}
          visualState={poaVisualState(poa.status)}
          href="/portal/poa"
        />
        <StatusMetricCard
          label="Active requests"
          metric={activeCount}
          statusText={activeCount === 1 ? "request in progress" : "requests in progress"}
          detail={`${requestCount} total submitted`}
          icon={ClipboardList}
          visualState={activeCount > 0 ? "pending" : "neutral"}
          href="/portal/requests"
        />
        <StatusMetricCard
          label="Services"
          statusText={canRequest ? "Unlocked" : "Locked"}
          detail={
            canRequest ? "You can submit new requests" : "Complete POA first"
          }
          icon={canRequest ? Unlock : Lock}
          visualState={canRequest ? "success" : "locked"}
          href={canRequest ? "/portal/requests/new" : "/portal/poa"}
        />
      </MetricGrid>

      {poa.status === PoaStatus.NOT_STARTED && (
        <Card variant="accent" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <AlertCircle className="h-6 w-6" />
            </span>
            <div>
              <CardTitle>Your next step</CardTitle>
              <CardDescription>
                Pay the POA fee to unlock embassy and legal office instructions.
              </CardDescription>
            </div>
          </div>
          <Link href="/portal/poa">
            <Button size="lg">
              Continue POA <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>
      )}

      <Card variant="elevated">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <CardTitle>Recent requests</CardTitle>
          <Link
            href="/portal/requests"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            View all
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            No requests yet. Complete POA to get started.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentRequests.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/portal/requests/${r.id}`}
                  className="-mx-2 flex flex-wrap items-center justify-between gap-4 rounded-lg px-2 py-4 transition hover:bg-slate-50/80"
                >
                  <div>
                    <p className="font-mono text-sm font-bold text-slate-900">
                      {r.referenceNo}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {r.items.map((i) => i.service.name).join(", ")}
                    </p>
                  </div>
                  <Badge tone="info">{r.status.replace(/_/g, " ")}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
