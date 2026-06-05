import { Role } from "@prisma/client";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { serializeServiceRequestForList } from "@/lib/service-request-list";
import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestsExplorer } from "@/components/staff/service-requests-explorer";

export default async function StaffRequestsPage() {
  const session = await requireStaff();

  const requests = await prisma.serviceRequest.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { updatedAt: "desc" },
    include: {
      client: { select: { name: true, email: true } },
      assignedTo: { select: { id: true, name: true } },
      items: { include: { service: true } },
    },
  });

  const staffMembers =
    session.user.role === Role.ADMIN
      ? await prisma.user.findMany({
          where: { role: { in: [Role.STAFF, Role.ADMIN] } },
          select: { id: true, name: true, role: true },
          orderBy: { name: "asc" },
        })
      : [];

  const items = requests.map(serializeServiceRequestForList);

  return (
    <div className="page-content space-y-8">
      <PageHeader
        title="Service requests"
        description="Filter and search all requests. Assign or pick up tasks, then open a row to work on services."
        breadcrumbs={[{ label: "Staff", href: "/staff" }, { label: "Requests" }]}
      />

      <ServiceRequestsExplorer
        requests={items}
        showClientColumn
        showAssignmentActions
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
        staffMembers={staffMembers}
      />
    </div>
  );
}
