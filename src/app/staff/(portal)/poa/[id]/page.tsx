import { notFound } from "next/navigation";
import path from "path";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { POA_STATUS_LABELS } from "@/lib/poa";
import { getPoaMessagesForCase } from "@/lib/poa-messages";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PoaProgress } from "@/components/ui/poa-progress";
import { PoaStaffActions } from "@/components/staff/poa-actions";
import { PoaChat } from "@/components/poa/poa-chat";
import { PoaStatus } from "@prisma/client";
import { User } from "lucide-react";

export default async function StaffPoaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireStaff();
  const { id } = await params;

  const poa = await prisma.poaCase.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!poa) notFound();

  const messages = await getPoaMessagesForCase(poa.id);
  const chatClosed =
    poa.status === PoaStatus.POA_COMPLETED || poa.status === PoaStatus.CANCELLED;

  const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
  const scanUrl =
    poa.scanFilePath && poa.scanFilePath.startsWith(uploadDir)
      ? `/api/uploads/${path.relative(uploadDir, poa.scanFilePath)}`
      : null;

  return (
    <div className="page-content space-y-8">
      <PageHeader
        title={`POA — ${poa.user.name}`}
        description="Support the client in POA chat. Upload the registered scan before completing."
        breadcrumbs={[
          { label: "Staff", href: "/staff" },
          { label: "POA", href: "/staff/poa" },
          { label: poa.user.name },
        ]}
        badge={<Badge tone="info">{POA_STATUS_LABELS[poa.status]}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card variant="elevated" className="lg:col-span-1">
          <CardTitle icon={<User className="h-5 w-5 text-brand-600" />}>
            Client
          </CardTitle>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Name</dt>
              <dd className="font-medium">{poa.user.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Email</dt>
              <dd>{poa.user.email}</dd>
            </div>
            {poa.user.phone && (
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Phone</dt>
                <dd>{poa.user.phone}</dd>
              </div>
            )}
          </dl>
          <div className="mt-6">
            <PoaProgress status={poa.status} />
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <PoaChat
            poaCaseId={poa.id}
            userId={session.user.id}
            userRole={session.user.role}
            initialMessages={messages}
            closed={chatClosed}
          />

          <Card variant="elevated">
            <CardTitle>Staff actions</CardTitle>
            <div className="mt-4">
              <PoaStaffActions
                staffId={session.user.id}
                poaCaseId={poa.id}
                status={poa.status}
                scanUrl={scanUrl}
                scanFileName={poa.scanFileName}
                scanUploadedAt={poa.scanUploadedAt?.toISOString() ?? null}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
