import { notFound } from "next/navigation";
import { Role, ServiceRequestStatus } from "@prisma/client";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { RequestDetailWorkspace } from "@/components/requests/request-detail-workspace";
import { getRequestMessagesForThread } from "@/lib/request-messages";
import { REQUEST_STATUS_LABELS, requestStatusTone } from "@/lib/requests";

export default async function StaffRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireStaff();
  const { id } = await params;

  const request = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      client: true,
      assignedTo: true,
      items: { include: { service: true }, orderBy: { id: "asc" } },
    },
  });

  if (!request) notFound();

  const staffMembers =
    session.user.role === Role.ADMIN
      ? await prisma.user.findMany({
          where: { role: { in: [Role.STAFF, Role.ADMIN] } },
          select: { id: true, name: true, email: true, role: true },
          orderBy: { name: "asc" },
        })
      : [];

  const messages = await getRequestMessagesForThread(request.id);

  return (
    <div className="page-content space-y-8">
      <PageHeader
        title={request.referenceNo}
        description="Update status per service. Use chat for documents and questions."
        breadcrumbs={[
          { label: "Staff", href: "/staff" },
          { label: "Requests", href: "/staff/requests" },
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
        isStaff
        staffId={session.user.id}
        clientName={request.client.name}
        clientEmail={request.client.email}
        assignedTo={
          request.assignedTo
            ? { id: request.assignedTo.id, name: request.assignedTo.name }
            : null
        }
        staffMembers={staffMembers}
      />
    </div>
  );
}
