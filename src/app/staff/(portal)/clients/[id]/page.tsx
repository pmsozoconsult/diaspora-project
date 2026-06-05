import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format-date";
import { serializeServiceRequestForList } from "@/lib/service-request-list";
import { PageHeader } from "@/components/ui/page-header";
import { ClientDetailWorkspace } from "@/components/staff/client-detail-workspace";
import { POA_STATUS_LABELS } from "@/lib/poa";
import { Badge } from "@/components/ui/badge";

export default async function StaffClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;

  const client = await prisma.user.findFirst({
    where: { id, role: Role.CLIENT },
    include: {
      poaCase: true,
      serviceRequests: {
        where: { status: { not: "DRAFT" } },
        orderBy: { updatedAt: "desc" },
        include: {
          client: { select: { name: true, email: true } },
          assignedTo: { select: { id: true, name: true } },
          items: { include: { service: true } },
        },
      },
    },
  });

  if (!client) notFound();

  const requests = client.serviceRequests.map(serializeServiceRequestForList);

  return (
    <div className="page-content space-y-8">
      <PageHeader
        title={client.name}
        description="Client profile — power of attorney and service request history."
        breadcrumbs={[
          { label: "Staff", href: "/staff" },
          { label: "Clients", href: "/staff/clients" },
          { label: client.name },
        ]}
        badge={
          client.poaCase ? (
            <Badge tone="info">{POA_STATUS_LABELS[client.poaCase.status]}</Badge>
          ) : undefined
        }
      />

      <ClientDetailWorkspace
        client={{
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          createdAtLabel: formatDate(client.createdAt),
        }}
        poa={
          client.poaCase
            ? { id: client.poaCase.id, status: client.poaCase.status }
            : null
        }
        requests={requests}
      />
    </div>
  );
}
