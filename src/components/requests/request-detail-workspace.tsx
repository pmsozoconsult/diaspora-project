"use client";

import { useMemo, useState } from "react";
import { ServiceRequestStatus, Role } from "@prisma/client";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequestItemProgress } from "@/components/requests/request-item-progress";
import { RequestItemStatusPanel } from "@/components/staff/request-item-status-panel";
import { RequestChat } from "@/components/chat/request-chat";
import { getServiceVisual } from "@/lib/service-catalog";
import {
  ITEM_STATUS_SHORT,
  REQUEST_STATUS_LABELS,
  countItemProgress,
  requestStatusTone,
} from "@/lib/requests";
import { formatMoney, cn } from "@/lib/utils";
import { MessageSquare, Package, ListChecks, User } from "lucide-react";

export type RequestItemView = {
  id: string;
  serviceName: string;
  priceCents: number;
  status: ServiceRequestStatus;
};

type MessageView = {
  id: string;
  body: string | null;
  fileName: string | null;
  fileUrl: string | null;
  createdAt: string;
  author: { name: string; role: string };
};

export function RequestDetailWorkspace({
  requestId,
  referenceNo,
  requestStatus,
  items,
  messages,
  userId,
  userRole,
  isStaff,
  staffId,
  clientName,
  clientEmail,
}: {
  requestId: string;
  referenceNo: string;
  requestStatus: ServiceRequestStatus;
  items: RequestItemView[];
  messages: MessageView[];
  userId: string;
  userRole: Role;
  isStaff: boolean;
  staffId?: string;
  clientName?: string;
  clientEmail?: string;
}) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? items[0],
    [items, selectedId]
  );

  const progress = countItemProgress(items);
  const overallTone = requestStatusTone(requestStatus);

  if (!selected) return null;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-brand-200/60 bg-gradient-to-br from-white to-brand-50/40 p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              Overall request
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-slate-900">{referenceNo}</p>
            <p className="mt-1 text-sm text-slate-600">
              {progress.completed} of {progress.total} services completed
              {progress.total > 1 ? " — select a service below to view its progress" : ""}
            </p>
          </div>
          <Badge tone={overallTone}>{REQUEST_STATUS_LABELS[requestStatus]}</Badge>
        </div>

        {items.length > 1 && (
          <div className="mt-5 flex gap-2">
            {items.map((item) => {
              const done = item.status === ServiceRequestStatus.COMPLETED;
              const failed =
                item.status === ServiceRequestStatus.CANCELLED ||
                item.status === ServiceRequestStatus.REJECTED;
              const thirdParty = item.status === ServiceRequestStatus.WITH_THIRD_PARTY;
              return (
                <div
                  key={item.id}
                  title={`${item.serviceName} — ${ITEM_STATUS_SHORT[item.status ?? ServiceRequestStatus.IN_PROGRESS]}`}
                  className="h-3 min-w-[2rem] flex-1 overflow-hidden rounded-full bg-slate-200/90"
                >
                  <div
                    className={cn(
                      "h-full w-full rounded-full transition-all duration-300",
                      done &&
                        "bg-emerald-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-emerald-700/30",
                      failed && "bg-red-500/90",
                      thirdParty && !done && !failed && "bg-amber-400/45",
                      !done &&
                        !failed &&
                        !thirdParty &&
                        "bg-brand-500/25"
                    )}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {items.length > 1 && (
        <div
          className="flex w-full gap-2"
          role="tablist"
          aria-label="Services in this request"
        >
          {items.map((item) => {
            const visual = getServiceVisual(item.serviceName);
            const Icon = visual.icon;
            const isActive = item.id === selected.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  "flex min-w-0 flex-1 basis-0 items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition sm:px-4",
                  isActive
                    ? "border-brand-600 bg-white shadow-md ring-2 ring-brand-200"
                    : "border-slate-200 bg-white hover:border-brand-300"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                    visual.accent
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {item.serviceName}
                  </span>
                  <span className="text-xs text-slate-500">
                    {ITEM_STATUS_SHORT[item.status ?? ServiceRequestStatus.IN_PROGRESS]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <RequestItemProgress
        status={selected.status ?? ServiceRequestStatus.IN_PROGRESS}
        serviceName={selected.serviceName}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="space-y-6">
          {isStaff && clientName && (
            <Card variant="elevated">
              <CardTitle icon={<User className="h-5 w-5 text-brand-600" />}>
                Client
              </CardTitle>
              <p className="mt-3 font-semibold">{clientName}</p>
              {clientEmail && (
                <p className="text-sm text-slate-600">{clientEmail}</p>
              )}
            </Card>
          )}

          <Card variant="elevated">
            <CardTitle icon={<Package className="h-5 w-5 text-brand-600" />}>
              {items.length > 1 ? "Selected service" : "Services"}
            </CardTitle>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-800">
                  {selected.serviceName}
                </span>
                <span className="text-sm font-bold">{formatMoney(selected.priceCents)}</span>
              </div>
              {items.length > 1 && (
                <ul className="space-y-2 text-xs text-slate-500">
                  {items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-2">
                      <span className={cn(i.id === selected.id && "font-semibold text-slate-700")}>
                        {i.serviceName}
                      </span>
                      <span>
                        {ITEM_STATUS_SHORT[i.status ?? ServiceRequestStatus.IN_PROGRESS]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {isStaff && staffId && (
            <Card variant="accent">
              <CardTitle icon={<ListChecks className="h-5 w-5 text-brand-600" />}>
                Update service status
              </CardTitle>
              <p className="mb-4 mt-1 text-xs text-slate-600">
                Status is tracked per service. The overall request completes when every
                service is marked completed.
              </p>
              <RequestItemStatusPanel
                staffId={staffId}
                itemId={selected.id}
                serviceName={selected.serviceName}
                currentStatus={
                  selected.status ?? ServiceRequestStatus.IN_PROGRESS
                }
              />
            </Card>
          )}
        </div>

        <Card variant="elevated">
          <CardTitle icon={<MessageSquare className="h-5 w-5 text-brand-600" />}>
            Conversation — {referenceNo}
          </CardTitle>
          <p className="mb-4 text-xs text-slate-500">
            Shared thread for this request. Attach documents when needed.
          </p>
          <RequestChat
            requestId={requestId}
            userId={userId}
            userRole={userRole}
            initialMessages={messages}
            closed={
              requestStatus === ServiceRequestStatus.CANCELLED ||
              requestStatus === ServiceRequestStatus.REJECTED
            }
          />
        </Card>
      </div>
    </div>
  );
}
