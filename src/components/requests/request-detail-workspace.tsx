"use client";

import { useEffect, useMemo, useState } from "react";
import { ServiceRequestStatus, Role } from "@prisma/client";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequestItemProgress } from "@/components/requests/request-item-progress";
import { RequestItemStatusPanel } from "@/components/staff/request-item-status-panel";
import { RequestAssignmentPanel } from "@/components/staff/request-assignment-panel";
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

type StaffOption = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type ItemGroupTab = "in_progress" | "completed";

function splitItemsByProgress(items: RequestItemView[]) {
  const inProgress = items.filter(
    (item) => item.status !== ServiceRequestStatus.COMPLETED
  );
  const completed = items.filter(
    (item) => item.status === ServiceRequestStatus.COMPLETED
  );
  return { inProgress, completed };
}

function getDefaultSelectedId(items: RequestItemView[]) {
  const inProgress = items.filter(
    (item) => item.status !== ServiceRequestStatus.COMPLETED
  );
  return inProgress[0]?.id ?? items[0]?.id ?? "";
}

export function RequestDetailWorkspace({
  requestId,
  referenceNo,
  requestStatus,
  items,
  messages,
  userRole,
  isStaff,
  staffId,
  clientName,
  clientEmail,
  assignedTo = null,
  staffMembers = [],
}: {
  requestId: string;
  referenceNo: string;
  requestStatus: ServiceRequestStatus;
  items: RequestItemView[];
  messages: MessageView[];
  userRole: Role;
  isStaff: boolean;
  staffId?: string;
  clientName?: string;
  clientEmail?: string;
  assignedTo?: { id: string; name: string } | null;
  staffMembers?: StaffOption[];
}) {
  const [itemGroupTab, setItemGroupTab] = useState<ItemGroupTab>("in_progress");
  const [selectedId, setSelectedId] = useState(() => getDefaultSelectedId(items));

  const { inProgress, completed } = useMemo(
    () => splitItemsByProgress(items),
    [items]
  );

  const visibleItems = itemGroupTab === "completed" ? completed : inProgress;

  const selected = useMemo(
    () => visibleItems.find((i) => i.id === selectedId) ?? visibleItems[0],
    [visibleItems, selectedId]
  );

  function handleGroupTabChange(tab: ItemGroupTab) {
    setItemGroupTab(tab);
    const nextItems = tab === "completed" ? completed : inProgress;
    if (nextItems[0]) {
      setSelectedId(nextItems[0].id);
    }
  }

  useEffect(() => {
    if (!visibleItems.some((item) => item.id === selectedId) && visibleItems[0]) {
      setSelectedId(visibleItems[0].id);
    }
  }, [itemGroupTab, visibleItems, selectedId]);

  const progress = countItemProgress(items);
  const overallTone = requestStatusTone(requestStatus);
  const showItemGroupTabs = isStaff && items.length > 0;
  const showServicePicker = isStaff
    ? visibleItems.length > 0
    : items.length > 1;
  const servicePickerItems = isStaff ? visibleItems : items;

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

      {isStaff && staffId && (
        <RequestAssignmentPanel
          requestId={requestId}
          currentUserId={staffId}
          currentUserRole={userRole}
          assignedTo={assignedTo}
          staffMembers={staffMembers}
        />
      )}

      {showItemGroupTabs && (
        <div
          className="flex w-full flex-wrap gap-2 border-b border-slate-200 pb-1"
          role="tablist"
          aria-label="Service progress groups"
        >
          {(
            [
              { key: "in_progress" as const, label: "In progress", count: inProgress.length },
              { key: "completed" as const, label: "Completed", count: completed.length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={itemGroupTab === tab.key}
              onClick={() => handleGroupTabChange(tab.key)}
              className={cn(
                "rounded-t-lg px-4 py-2.5 text-sm font-semibold transition",
                itemGroupTab === tab.key
                  ? "border-b-2 border-brand-600 text-brand-700"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-2 rounded-full px-2 py-0.5 text-xs",
                  itemGroupTab === tab.key
                    ? "bg-brand-100 text-brand-800"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {showItemGroupTabs && visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            {itemGroupTab === "completed"
              ? "No completed services in this request yet."
              : "No services in progress — open the Completed tab to review finished services."}
          </p>
        </div>
      ) : (
        <>
          {showServicePicker && (
            <div
              className={cn(
                "flex w-full gap-2",
                servicePickerItems.length === 1 ? "max-w-md" : "flex-wrap"
              )}
              role="tablist"
              aria-label="Services in this request"
            >
              {servicePickerItems.map((item) => {
                const visual = getServiceVisual(item.serviceName);
                const Icon = visual.icon;
                const isActive = item.id === selected?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "flex min-w-0 items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition sm:px-4",
                      servicePickerItems.length === 1
                        ? "w-full"
                        : "min-w-[12rem] flex-1 basis-0",
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

          {selected && (
            <RequestItemProgress
              status={selected.status ?? ServiceRequestStatus.IN_PROGRESS}
              serviceName={selected.serviceName}
            />
          )}
        </>
      )}

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

          {selected && (
            <Card variant="elevated">
              <CardTitle icon={<Package className="h-5 w-5 text-brand-600" />}>
                {items.length > 1 ? "Selected service" : "Services"}
              </CardTitle>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm font-medium text-slate-800">
                    {selected.serviceName}
                  </span>
                  <span className="text-sm font-bold">
                    {formatMoney(selected.priceCents)}
                  </span>
                </div>
                {items.length > 1 && (
                  <ul className="space-y-2 text-xs text-slate-500">
                    {servicePickerItems.map((i) => (
                      <li key={i.id} className="flex justify-between gap-2">
                        <span
                          className={cn(
                            i.id === selected.id && "font-semibold text-slate-700"
                          )}
                        >
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
          )}

          {isStaff && staffId && selected && (
            <Card variant="accent">
              <CardTitle icon={<ListChecks className="h-5 w-5 text-brand-600" />}>
                Update service status
              </CardTitle>
              <p className="mb-4 mt-1 text-xs text-slate-600">
                Status is tracked per service. The overall request completes when every
                service is marked completed.
              </p>
              <RequestItemStatusPanel
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
