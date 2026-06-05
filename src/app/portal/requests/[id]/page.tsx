import { notFound } from "next/navigation";
import { ServiceRequestStatus } from "@prisma/client";
import { requireClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { RequestDetailWorkspace } from "@/components/requests/request-detail-workspace";
import { getRequestMessagesForThread } from "@/lib/request-messages";
import { REQUEST_STATUS_LABELS, requestStatusTone } from "@/lib/requests";
import { Badge } from "@/components/ui/badge";

export default async function PortalRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireClient();
  const { id } = await params;

  const request = await prisma.serviceRequest.findFirst({
    where: { id, clientId: session.user.id },
    include: {
      items: { include: { service: true }, orderBy: { id: "asc" } },
    },
  });

  if (!request) notFound();

  const messages = await getRequestMessagesForThread(request.id);

  return (
    <div className="page-content space-y-8">
      <PageHeader
        title={request.referenceNo}
        description="Track each service separately. Status updates and chat apply to this request."
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: "Requests", href: "/portal/requests" },
          { label: request.referenceNo },
        ]}
        badge={
          <Badge tone={requestStatusTone(request.status)}>
            {REQUEST_STATUS_LABELS[request.status]}
          </Badge>
        }
      />

      <RequestDetailWorkspace
        requestId={request.id}
        referenceNo={request.referenceNo}
        requestStatus={request.status}
        items={request.items.map((i) => ({
          id: i.id,
          serviceName: i.service.name,
          priceCents: i.priceCents,
          status: i.status ?? ServiceRequestStatus.IN_PROGRESS,
        }))}
        messages={messages}
        userRole={session.user.role}
        isStaff={false}
      />
    </div>
  );
}
