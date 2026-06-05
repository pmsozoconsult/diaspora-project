import { PoaStatus, ServiceRequestStatus } from "@prisma/client";
import {
  Ban,
  Building2,
  CheckCircle2,
  Loader2,
  type LucideIcon,
  XCircle,
} from "lucide-react";

export const REQUEST_STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted — in our queue",
  IN_PROGRESS: "In progress",
  WITH_THIRD_PARTY: "With third party (bank, government, etc.)",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

export const ITEM_STATUS_SHORT: Record<ServiceRequestStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Queued",
  IN_PROGRESS: "In progress",
  WITH_THIRD_PARTY: "Third party",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

export const ITEM_WORKFLOW_STEPS = [
  {
    status: ServiceRequestStatus.IN_PROGRESS,
    label: "In progress",
    description: "Our team is working on this service.",
  },
  {
    status: ServiceRequestStatus.WITH_THIRD_PARTY,
    label: "With third party",
    description: "Waiting on a bank, government office, or other external party.",
  },
  {
    status: ServiceRequestStatus.COMPLETED,
    label: "Completed",
    description: "This service is finished.",
  },
] as const;

const TERMINAL_ITEM_STATUSES: ServiceRequestStatus[] = [
  ServiceRequestStatus.COMPLETED,
  ServiceRequestStatus.CANCELLED,
  ServiceRequestStatus.REJECTED,
];

export const ITEM_STAFF_TRANSITIONS: Record<
  ServiceRequestStatus,
  ServiceRequestStatus[]
> = {
  DRAFT: [],
  SUBMITTED: [ServiceRequestStatus.IN_PROGRESS, ServiceRequestStatus.CANCELLED],
  IN_PROGRESS: [
    ServiceRequestStatus.WITH_THIRD_PARTY,
    ServiceRequestStatus.COMPLETED,
    ServiceRequestStatus.CANCELLED,
    ServiceRequestStatus.REJECTED,
  ],
  WITH_THIRD_PARTY: [
    ServiceRequestStatus.IN_PROGRESS,
    ServiceRequestStatus.COMPLETED,
    ServiceRequestStatus.CANCELLED,
  ],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

export type StatusTransitionMeta = {
  title: string;
  description: string;
  clientNotice: string;
  tone: "positive" | "neutral" | "warning" | "danger";
  icon: LucideIcon;
};

export const STATUS_TRANSITION_META: Partial<
  Record<ServiceRequestStatus, StatusTransitionMeta>
> = {
  [ServiceRequestStatus.IN_PROGRESS]: {
    title: "Mark as in progress",
    description: "Confirm the team is actively working on this service.",
    clientNotice: "The client will see that work has started on this service.",
    tone: "neutral",
    icon: Loader2,
  },
  [ServiceRequestStatus.WITH_THIRD_PARTY]: {
    title: "With third party",
    description:
      "Use when progress depends on a bank, government office, or other external party.",
    clientNotice:
      "The client will see that their case is waiting on an external institution.",
    tone: "warning",
    icon: Building2,
  },
  [ServiceRequestStatus.COMPLETED]: {
    title: "Mark service completed",
    description: "Only when this specific service is fully finished.",
    clientNotice:
      "The client will see this service as completed. The overall request completes when every service is done.",
    tone: "positive",
    icon: CheckCircle2,
  },
  [ServiceRequestStatus.CANCELLED]: {
    title: "Cancel this service",
    description: "Stops work on this line item only. Other services in the request can continue.",
    clientNotice: "The client will be notified this service was cancelled.",
    tone: "danger",
    icon: Ban,
  },
  [ServiceRequestStatus.REJECTED]: {
    title: "Reject this service",
    description: "Use when this service cannot be fulfilled (missing documents, out of scope, etc.).",
    clientNotice: "The client will see this service as rejected with the overall request updated.",
    tone: "danger",
    icon: XCircle,
  },
};

export const STAFF_ALLOWED_TRANSITIONS: Record<
  ServiceRequestStatus,
  ServiceRequestStatus[]
> = {
  DRAFT: ["SUBMITTED", "CANCELLED", "REJECTED"],
  SUBMITTED: ["IN_PROGRESS", "CANCELLED", "REJECTED"],
  IN_PROGRESS: ["WITH_THIRD_PARTY", "COMPLETED", "CANCELLED", "REJECTED"],
  WITH_THIRD_PARTY: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

export const POA_STAFF_TRANSITIONS: Record<PoaStatus, PoaStatus[]> = {
  [PoaStatus.NOT_STARTED]: [],
  [PoaStatus.POA_FEE_PAID]: [PoaStatus.MOFA_SUBMITTED, PoaStatus.CANCELLED],
  [PoaStatus.MOFA_SUBMITTED]: [PoaStatus.REGISTERED_IN_ETHIOPIA, PoaStatus.CANCELLED],
  [PoaStatus.REGISTERED_IN_ETHIOPIA]: [PoaStatus.POA_COMPLETED, PoaStatus.CANCELLED],
  [PoaStatus.POA_COMPLETED]: [],
  [PoaStatus.CANCELLED]: [],
};

export function canStaffSetPoaStatus(from: PoaStatus, to: PoaStatus) {
  return POA_STAFF_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canStaffSetItemStatus(from: ServiceRequestStatus, to: ServiceRequestStatus) {
  return ITEM_STAFF_TRANSITIONS[from]?.includes(to) ?? false;
}

function isTerminalItemStatus(status: ServiceRequestStatus) {
  return TERMINAL_ITEM_STATUSES.includes(status);
}

export function deriveRequestStatusFromItems(
  items: { status: ServiceRequestStatus }[],
  requestStatus: ServiceRequestStatus
): ServiceRequestStatus {
  if (requestStatus === ServiceRequestStatus.DRAFT) {
    return ServiceRequestStatus.DRAFT;
  }
  if (items.length === 0) return requestStatus;

  if (items.every((i) => i.status === ServiceRequestStatus.COMPLETED)) {
    return ServiceRequestStatus.COMPLETED;
  }
  if (items.every((i) => i.status === ServiceRequestStatus.CANCELLED)) {
    return ServiceRequestStatus.CANCELLED;
  }
  if (items.every((i) => i.status === ServiceRequestStatus.REJECTED)) {
    return ServiceRequestStatus.REJECTED;
  }

  if (items.every((i) => isTerminalItemStatus(i.status))) {
    if (items.some((i) => i.status === ServiceRequestStatus.REJECTED)) {
      return ServiceRequestStatus.REJECTED;
    }
    if (items.some((i) => i.status === ServiceRequestStatus.CANCELLED)) {
      return ServiceRequestStatus.CANCELLED;
    }
    return ServiceRequestStatus.COMPLETED;
  }

  if (items.some((i) => i.status === ServiceRequestStatus.WITH_THIRD_PARTY)) {
    return ServiceRequestStatus.WITH_THIRD_PARTY;
  }
  if (items.some((i) => i.status === ServiceRequestStatus.IN_PROGRESS)) {
    return ServiceRequestStatus.IN_PROGRESS;
  }
  return ServiceRequestStatus.SUBMITTED;
}

export function getItemProgressIndex(status: ServiceRequestStatus): number {
  const idx = ITEM_WORKFLOW_STEPS.findIndex((s) => s.status === status);
  if (idx >= 0) return idx;
  if (status === ServiceRequestStatus.SUBMITTED) return 0;
  if (status === ServiceRequestStatus.DRAFT) return -1;
  return -1;
}

export function requestStatusTone(status: ServiceRequestStatus) {
  if (status === ServiceRequestStatus.COMPLETED) return "success" as const;
  if (status === ServiceRequestStatus.REJECTED || status === ServiceRequestStatus.CANCELLED) {
    return "danger" as const;
  }
  if (status === ServiceRequestStatus.WITH_THIRD_PARTY) return "warning" as const;
  return "info" as const;
}

export function countItemProgress(items: { status: ServiceRequestStatus }[]) {
  const completed = items.filter(
    (i) => i.status === ServiceRequestStatus.COMPLETED
  ).length;
  const inProgress = items.filter(
    (i) =>
      i.status === ServiceRequestStatus.IN_PROGRESS ||
      i.status === ServiceRequestStatus.WITH_THIRD_PARTY ||
      i.status === ServiceRequestStatus.SUBMITTED
  ).length;
  const terminal = items.filter((i) => isTerminalItemStatus(i.status)).length;
  return { completed, inProgress, terminal, total: items.length };
}
