import { ServiceRequestStatus } from "@prisma/client";
import { formatDate } from "@/lib/format-date";
import { formatMoney } from "@/lib/utils";
import { ITEM_STATUS_SHORT, REQUEST_STATUS_LABELS } from "@/lib/requests";

export type RequestListTab = "all" | "in_progress" | "completed";

export const REQUEST_LIST_TAB_LABELS: Record<RequestListTab, string> = {
  all: "All",
  in_progress: "In progress",
  completed: "Completed",
};

const IN_PROGRESS_STATUSES: ServiceRequestStatus[] = [
  ServiceRequestStatus.SUBMITTED,
  ServiceRequestStatus.IN_PROGRESS,
  ServiceRequestStatus.WITH_THIRD_PARTY,
];

export type ServiceRequestListItem = {
  id: string;
  clientId: string;
  referenceNo: string;
  clientName: string;
  clientEmail: string;
  assignedToId: string | null;
  assignedToName: string | null;
  status: ServiceRequestStatus;
  statusLabel: string;
  totalCents: number;
  totalFormatted: string;
  createdAt: string;
  createdAtLabel: string;
  updatedAt: string;
  updatedAtLabel: string;
  services: {
    name: string;
    status: ServiceRequestStatus;
    statusLabel: string;
    priceFormatted: string;
  }[];
  searchText: string;
};

export type ServiceRequestFilters = {
  query: string;
  requestStatus: ServiceRequestStatus | "";
  itemStatus: ServiceRequestStatus | "";
  serviceName: string;
};

export const EMPTY_SERVICE_REQUEST_FILTERS: ServiceRequestFilters = {
  query: "",
  requestStatus: "",
  itemStatus: "",
  serviceName: "",
};

type RequestWithRelations = {
  id: string;
  clientId: string;
  referenceNo: string;
  status: ServiceRequestStatus;
  totalCents: number;
  createdAt: Date;
  updatedAt: Date;
  client: { name: string; email: string };
  assignedTo?: { id: string; name: string } | null;
  items: {
    status: ServiceRequestStatus;
    priceCents: number;
    service: { name: string };
  }[];
};

export function serializeServiceRequestForList(
  request: RequestWithRelations
): ServiceRequestListItem {
  const services = request.items.map((item) => ({
    name: item.service.name,
    status: item.status,
    statusLabel: ITEM_STATUS_SHORT[item.status],
    priceFormatted: formatMoney(item.priceCents),
  }));

  const statusLabel = REQUEST_STATUS_LABELS[request.status];
  const totalFormatted = formatMoney(request.totalCents);
  const createdAtLabel = formatDate(request.createdAt);
  const updatedAtLabel = formatDate(request.updatedAt);

  const searchText = [
    request.referenceNo,
    request.client.name,
    request.client.email,
    request.assignedTo?.name ?? "unassigned",
    statusLabel,
    request.status,
    totalFormatted,
    String(request.totalCents / 100),
    createdAtLabel,
    updatedAtLabel,
    ...services.flatMap((s) => [
      s.name,
      s.statusLabel,
      s.status,
      s.priceFormatted,
    ]),
  ]
    .join(" ")
    .toLowerCase();

  return {
    id: request.id,
    clientId: request.clientId,
    referenceNo: request.referenceNo,
    clientName: request.client.name,
    clientEmail: request.client.email,
    assignedToId: request.assignedTo?.id ?? null,
    assignedToName: request.assignedTo?.name ?? null,
    status: request.status,
    statusLabel,
    totalCents: request.totalCents,
    totalFormatted,
    createdAt: request.createdAt.toISOString(),
    createdAtLabel,
    updatedAt: request.updatedAt.toISOString(),
    updatedAtLabel,
    services,
    searchText,
  };
}

export function requestMatchesTab(
  status: ServiceRequestStatus,
  tab: RequestListTab
): boolean {
  if (status === ServiceRequestStatus.DRAFT) return false;
  if (tab === "all") return true;
  if (tab === "in_progress") return IN_PROGRESS_STATUSES.includes(status);
  if (tab === "completed") return status === ServiceRequestStatus.COMPLETED;
  return true;
}

export function matchesServiceRequestFilters(
  item: ServiceRequestListItem,
  filters: ServiceRequestFilters
): boolean {
  const query = filters.query.trim().toLowerCase();
  if (query) {
    const terms = query.split(/\s+/).filter(Boolean);
    const matchesAll = terms.every((term) => item.searchText.includes(term));
    if (!matchesAll) return false;
  }

  if (filters.requestStatus && item.status !== filters.requestStatus) {
    return false;
  }

  if (filters.itemStatus) {
    const hasItem = item.services.some((s) => s.status === filters.itemStatus);
    if (!hasItem) return false;
  }

  const serviceNeedle = filters.serviceName.trim().toLowerCase();
  if (serviceNeedle) {
    const hasService = item.services.some((s) =>
      s.name.toLowerCase().includes(serviceNeedle)
    );
    if (!hasService) return false;
  }

  return true;
}

export function filterServiceRequests(
  items: ServiceRequestListItem[],
  tab: RequestListTab,
  filters: ServiceRequestFilters
): ServiceRequestListItem[] {
  return items.filter(
    (item) =>
      requestMatchesTab(item.status, tab) &&
      matchesServiceRequestFilters(item, filters)
  );
}

export function countByTab(items: ServiceRequestListItem[]) {
  return {
    all: items.filter((i) => requestMatchesTab(i.status, "all")).length,
    in_progress: items.filter((i) => requestMatchesTab(i.status, "in_progress"))
      .length,
    completed: items.filter((i) => requestMatchesTab(i.status, "completed")).length,
  };
}
