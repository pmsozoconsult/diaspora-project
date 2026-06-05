import { requireClient } from "@/lib/session";
import {
  getOrCreatePoaCase,
  getPoaFeeCents,
  POA_STATUS_LABELS,
  canSeePoaInstructions,
} from "@/lib/poa";
import { getPoaMessagesForCase } from "@/lib/poa-messages";
import { PageHeader } from "@/components/ui/page-header";
import { PoaProgress } from "@/components/ui/poa-progress";
import { PoaInstructions } from "@/components/portal/poa-instructions";
import { PoaChat } from "@/components/poa/poa-chat";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PoaPayButton } from "@/components/portal/poa-pay-button";
import { formatMoney } from "@/lib/utils";
import { poaShortStatus, poaVisualState } from "@/components/ui/status-metric-card";
import { PoaStatus } from "@prisma/client";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function PortalPoaPage() {
  const session = await requireClient();
  const poa = await getOrCreatePoaCase(session.user.id);
  const feeCents = await getPoaFeeCents();
  const showInstructions = canSeePoaInstructions(poa.status);
  const visual = poaVisualState(poa.status);
  const chatClosed =
    poa.status === PoaStatus.POA_COMPLETED || poa.status === PoaStatus.CANCELLED;
  const showChat =
    poa.status !== PoaStatus.NOT_STARTED && poa.status !== PoaStatus.CANCELLED;

  const messages = showChat || chatClosed ? await getPoaMessagesForCase(poa.id) : [];

  const statusTone =
    visual === "success"
      ? "success"
      : visual === "warning"
        ? "warning"
        : visual === "danger"
          ? "danger"
          : "info";

  return (
    <div className="page-content">
      <PageHeader
        title="Power of attorney"
        description="Complete MOFA and embassy steps with our team in POA chat — separate from service requests."
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: "Power of attorney" },
        ]}
        badge={<Badge tone={statusTone}>{poaShortStatus(poa.status)}</Badge>}
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {poa.status === PoaStatus.NOT_STARTED && (
            <Card
              variant="accent"
              className={cn("overflow-hidden border-l-4 border-l-amber-500")}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                    <CreditCard className="h-7 w-7" />
                  </span>
                  <div>
                    <CardTitle>POA engagement fee</CardTitle>
                    <CardDescription className="max-w-md">
                      Payment confirms your agreement to proceed. Instructions and
                      POA chat unlock immediately after.
                    </CardDescription>
                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {formatMoney(feeCents)}
                    </p>
                  </div>
                </div>
                <PoaPayButton userId={session.user.id} feeCents={feeCents} />
              </div>
            </Card>
          )}

          {showInstructions && (
            <Card variant="elevated">
              <CardTitle>Your POA process</CardTitle>
              <CardDescription className="mb-6">
                Current status: {POA_STATUS_LABELS[poa.status]}
              </CardDescription>
              <PoaInstructions status={poa.status} userId={session.user.id} />
            </Card>
          )}

          {(showChat || (chatClosed && messages.length > 0)) && (
            <div id="poa-chat">
              <PoaChat
                poaCaseId={poa.id}
                userId={session.user.id}
                userRole={session.user.role}
                initialMessages={messages}
                closed={chatClosed}
              />
            </div>
          )}

          {poa.status === PoaStatus.POA_COMPLETED && (
            <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/80 to-white">
              <div className="flex gap-4">
                <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-600" />
                <div>
                  <CardTitle>POA on file</CardTitle>
                  <CardDescription>
                    Your power of attorney is registered. POA chat is closed — use
                    service requests for further work.
                  </CardDescription>
                </div>
              </div>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <PoaProgress status={poa.status} showChatLink />
        </aside>
      </div>
    </div>
  );
}
