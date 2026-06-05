"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Role, ServiceRequestStatus } from "@prisma/client";
import { RequestListActions } from "@/components/staff/request-list-actions";
import {
  countByTab,
  EMPTY_SERVICE_REQUEST_FILTERS,
  filterServiceRequests,
  REQUEST_LIST_TAB_LABELS,
  type RequestListTab,
  type ServiceRequestFilters,
  type ServiceRequestListItem,
} from "@/lib/service-request-list";
import { REQUEST_STATUS_LABELS, requestStatusTone } from "@/lib/requests";
import { DataTable, DataTableRow, DataTableCell } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Filter, Search, X } from "lucide-react";

type StaffOption = {
  id: string;
  name: string;
  role: Role;
};

export function ServiceRequestsExplorer({
  requests,
  showClientColumn = true,
  emptyMessage = "No service requests match your filters.",
  showAssignmentActions = false,
  currentUserId,
  currentUserRole,
  staffMembers = [],
}: {
  requests: ServiceRequestListItem[];
  showClientColumn?: boolean;
  emptyMessage?: string;
  showAssignmentActions?: boolean;
  currentUserId?: string;
  currentUserRole?: Role;
  staffMembers?: StaffOption[];
}) {
  const [tab, setTab] = useState<RequestListTab>("all");
  const [filters, setFilters] = useState<ServiceRequestFilters>(
    EMPTY_SERVICE_REQUEST_FILTERS
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const tabCounts = useMemo(() => countByTab(requests), [requests]);

  const filtered = useMemo(
    () => filterServiceRequests(requests, tab, filters),
    [requests, tab, filters]
  );

  const hasActiveFilters =
    filters.query.trim() !== "" ||
    filters.requestStatus !== "" ||
    filters.itemStatus !== "" ||
    filters.serviceName.trim() !== "";

  function clearFilters() {
    setFilters(EMPTY_SERVICE_REQUEST_FILTERS);
  }

  const headers = [
    "Reference",
    ...(showClientColumn ? ["Client"] : []),
    "Services",
    "Total",
    "Status",
    ...(showAssignmentActions ? ["Assignee & actions"] : ["Assignee", ""]),
  ];

  const columnWidths = showAssignmentActions
    ? showClientColumn
      ? ["12%", "14%", "32%", "9%", "15%", "18%"]
      : ["14%", "36%", "10%", "16%", "24%"]
    : showClientColumn
      ? ["11%", "13%", "28%", "8%", "14%", "12%", "14%"]
      : ["13%", "34%", "9%", "15%", "14%", "15%"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-center lg:gap-4">
        <div
          className="flex shrink-0 flex-wrap items-center gap-1"
          role="tablist"
          aria-label="Request status"
        >
          {(Object.keys(REQUEST_LIST_TAB_LABELS) as RequestListTab[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition",
                tab === key
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              {REQUEST_LIST_TAB_LABELS[key]}
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[11px]",
                  tab === key ? "bg-white/20 text-white" : "bg-white text-slate-600"
                )}
              >
                {tabCounts[key]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="sr-search"
              aria-label="Search service requests"
              value={filters.query}
              onChange={(e) =>
                setFilters((f) => ({ ...f, query: e.target.value }))
              }
              placeholder="Search reference, client, services, status…"
              className="h-10 pl-9"
              autoComplete="off"
            />
          </div>
          <Button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="h-10 shrink-0 bg-brand-600 px-4 text-sm shadow-md shadow-brand-600/25 hover:bg-brand-700"
          >
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">
              {showAdvanced ? "Hide filters" : "Advanced filters"}
            </span>
            <span className="sm:hidden">Filters</span>
          </Button>
        </div>
      </div>

      {showAdvanced && (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="sr-request-status" className="text-xs text-slate-500">
              Request status
            </Label>
            <select
              id="sr-request-status"
              value={filters.requestStatus}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  requestStatus: e.target.value as ServiceRequestStatus | "",
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              {Object.entries(REQUEST_STATUS_LABELS)
                .filter(([k]) => k !== "DRAFT")
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label htmlFor="sr-item-status" className="text-xs text-slate-500">
              Service line status
            </Label>
            <select
              id="sr-item-status"
              value={filters.itemStatus}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  itemStatus: e.target.value as ServiceRequestStatus | "",
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              {Object.entries(REQUEST_STATUS_LABELS)
                .filter(([k]) => k !== "DRAFT" && k !== "SUBMITTED")
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label htmlFor="sr-service-name" className="text-xs text-slate-500">
              Service name contains
            </Label>
            <Input
              id="sr-service-name"
              value={filters.serviceName}
              onChange={(e) =>
                setFilters((f) => ({ ...f, serviceName: e.target.value }))
              }
              placeholder="e.g. Property title"
              className="mt-1 bg-white"
              autoComplete="off"
            />
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <p>
            Showing <strong>{filtered.length}</strong> of {requests.length} requests
          </p>
          <Button type="button" variant="ghost" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear filters
          </Button>
        </div>
      )}

      <DataTable
        headers={headers}
        columnWidths={columnWidths}
        emptyMessage={emptyMessage}
      >
        {filtered.map((r) => (
          <DataTableRow key={r.id}>
            <DataTableCell>
              <Link
                href={`/staff/requests/${r.id}`}
                className="font-mono font-bold text-brand-700 hover:underline"
              >
                {r.referenceNo}
              </Link>
              <p className="mt-0.5 text-xs text-slate-500">Created {r.createdAtLabel}</p>
            </DataTableCell>
            {showClientColumn && (
              <DataTableCell>
                <Link
                  href={`/staff/clients/${r.clientId}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {r.clientName}
                </Link>
                <p className="text-xs text-slate-500">{r.clientEmail}</p>
              </DataTableCell>
            )}
            <DataTableCell>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {r.services.map((s, idx) => (
                  <li
                    key={`${r.id}-${idx}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50/80 px-2 py-1"
                  >
                    <span className="font-medium text-slate-800">{s.name}</span>
                    <span className="text-xs text-slate-500">
                      {s.statusLabel} · {s.priceFormatted}
                    </span>
                  </li>
                ))}
              </ul>
            </DataTableCell>
            <DataTableCell className="font-semibold">{r.totalFormatted}</DataTableCell>
            <DataTableCell>
              <Badge tone={requestStatusTone(r.status)}>{r.statusLabel}</Badge>
            </DataTableCell>
            {showAssignmentActions && currentUserId && currentUserRole ? (
              <DataTableCell>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 text-sm">
                    {r.assignedToName ? (
                      <span className="font-medium text-slate-800">{r.assignedToName}</span>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </div>
                  <RequestListActions
                    requestId={r.id}
                    referenceNo={r.referenceNo}
                    assignedToId={r.assignedToId}
                    assignedToName={r.assignedToName}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    staffMembers={staffMembers}
                  />
                </div>
              </DataTableCell>
            ) : (
              <>
                <DataTableCell className="text-sm">
                  {r.assignedToName ? (
                    <span className="font-medium text-slate-800">{r.assignedToName}</span>
                  ) : (
                    <span className="text-slate-400">Unassigned</span>
                  )}
                </DataTableCell>
                <DataTableCell className="text-right">
                  <Link
                    href={`/staff/requests/${r.id}`}
                    className="text-sm font-semibold text-brand-700 hover:underline"
                  >
                    Open →
                  </Link>
                </DataTableCell>
              </>
            )}
          </DataTableRow>
        ))}
      </DataTable>
    </div>
  );
}
