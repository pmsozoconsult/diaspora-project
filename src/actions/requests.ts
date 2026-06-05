"use server";

import { ServiceRequestStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateReferenceNo } from "@/lib/utils";
import { clientCanRequestServices } from "@/lib/poa";
import {
  completeMockPayment,
  createServiceRequestPayment,
  isMockPaymentsEnabled,
} from "@/lib/payments";
import { saveUpload } from "@/lib/storage";
import {
  canStaffSetItemStatus,
  deriveRequestStatusFromItems,
  REQUEST_STATUS_LABELS,
} from "@/lib/requests";
import {
  requireActionAdmin,
  requireActionAuth,
  requireActionClient,
  requireActionStaff,
} from "@/lib/action-auth";
import { validateChatUpload } from "@/lib/upload-validation";

export async function createServiceRequestDraft(serviceIds: string[]) {
  const authResult = await requireActionClient();
  if (!authResult.session) return { error: authResult.error ?? "Unauthorized" };
  const userId = authResult.session.user.id;

  const canRequest = await clientCanRequestServices(userId);
  if (!canRequest) {
    return { error: "Complete power of attorney before requesting services." };
  }

  if (!serviceIds.length) {
    return { error: "Select at least one service." };
  }

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, active: true },
  });

  if (services.length !== serviceIds.length) {
    return { error: "Invalid service selection." };
  }

  const totalCents = services.reduce((sum, s) => sum + s.priceCents, 0);
  let referenceNo = generateReferenceNo();
  let exists = await prisma.serviceRequest.findUnique({
    where: { referenceNo },
  });
  while (exists) {
    referenceNo = generateReferenceNo();
    exists = await prisma.serviceRequest.findUnique({
      where: { referenceNo },
    });
  }

  const request = await prisma.serviceRequest.create({
    data: {
      referenceNo,
      clientId: userId,
      status: ServiceRequestStatus.DRAFT,
      totalCents,
      items: {
        create: services.map((s) => ({
          serviceId: s.id,
          priceCents: s.priceCents,
          status: ServiceRequestStatus.IN_PROGRESS,
        })),
      },
    },
  });

  const payment = await createServiceRequestPayment(
    userId,
    request.id,
    totalCents
  );

  if (isMockPaymentsEnabled()) {
    await completeMockPayment(payment.id);
    revalidatePath("/portal/requests");
    return {
      success: true,
      referenceNo,
      requestId: request.id,
      mock: true,
    };
  }

  return {
    success: true,
    referenceNo,
    requestId: request.id,
    paymentId: payment.id,
    mock: false,
  };
}

export async function updateRequestItemStatus(
  itemId: string,
  status: ServiceRequestStatus
) {
  const authResult = await requireActionStaff();
  if (!authResult.session) return { error: authResult.error ?? "Unauthorized" };
  const staffId = authResult.session.user.id;

  const item = await prisma.serviceRequestItem.findUnique({
    where: { id: itemId },
    include: {
      service: true,
      request: { include: { items: true } },
    },
  });
  if (!item) return { error: "Service line not found" };

  if (item.request.status === ServiceRequestStatus.DRAFT) {
    return { error: "Request has not been submitted yet." };
  }

  if (!canStaffSetItemStatus(item.status, status)) {
    return {
      error: `Cannot change ${item.service.name} from ${REQUEST_STATUS_LABELS[item.status]} to ${REQUEST_STATUS_LABELS[status]}.`,
    };
  }

  await prisma.serviceRequestItem.update({
    where: { id: itemId },
    data: { status },
  });

  const refreshedItems = item.request.items.map((i) =>
    i.id === itemId ? { ...i, status } : i
  );
  const nextRequestStatus = deriveRequestStatusFromItems(
    refreshedItems,
    item.request.status
  );

  await prisma.serviceRequest.update({
    where: { id: item.requestId },
    data: {
      status: nextRequestStatus,
      assignedToId: staffId,
    },
  });

  revalidatePath(`/staff/requests/${item.requestId}`);
  revalidatePath(`/portal/requests/${item.requestId}`);
  revalidatePath("/staff/requests");
  revalidatePath("/portal/requests");

  return {
    success: true,
    serviceName: item.service.name,
    newStatus: status,
    requestStatus: nextRequestStatus,
  };
}

async function assertStaffUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (user.role !== Role.STAFF && user.role !== Role.ADMIN)) {
    return null;
  }
  return user;
}

export async function assignRequestToStaff(
  requestId: string,
  staffUserId: string
) {
  const authResult = await requireActionAdmin();
  if (!authResult.session) {
    return { error: "Only administrators can assign requests." };
  }

  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) return { error: "Request not found." };
  if (request.status === ServiceRequestStatus.DRAFT) {
    return { error: "This request has not been submitted yet." };
  }

  const staff = await assertStaffUser(staffUserId);
  if (!staff) return { error: "Select a valid staff member." };

  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { assignedToId: staffUserId },
  });

  revalidatePath(`/staff/requests/${requestId}`);
  revalidatePath("/staff/requests");

  return {
    success: true,
    assigneeName: staff.name,
    assigneeId: staff.id,
  };
}

export async function pickUpRequest(requestId: string) {
  const authResult = await requireActionStaff();
  if (!authResult.session) return { error: authResult.error ?? "Unauthorized" };
  const staffId = authResult.session.user.id;
  const staff = await assertStaffUser(staffId);
  if (!staff) return { error: "Unauthorized" };

  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { assignedTo: true },
  });
  if (!request) return { error: "Request not found." };
  if (request.status === ServiceRequestStatus.DRAFT) {
    return { error: "This request has not been submitted yet." };
  }

  if (request.assignedToId && request.assignedToId !== staffId) {
    return {
      error: `This request is already assigned to ${request.assignedTo?.name ?? "another team member"}.`,
    };
  }

  if (request.assignedToId === staffId) {
    return { success: true, assigneeName: staff.name, assigneeId: staff.id };
  }

  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { assignedToId: staffId },
  });

  revalidatePath(`/staff/requests/${requestId}`);
  revalidatePath("/staff/requests");

  return {
    success: true,
    assigneeName: staff.name,
    assigneeId: staff.id,
  };
}

export async function dropRequestTask(requestId: string) {
  const authResult = await requireActionStaff();
  if (!authResult.session) return { error: authResult.error ?? "Unauthorized" };
  const staffId = authResult.session.user.id;

  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) return { error: "Request not found." };
  if (request.status === ServiceRequestStatus.DRAFT) {
    return { error: "This request has not been submitted yet." };
  }
  if (request.assignedToId !== staffId) {
    return { error: "You can only drop requests assigned to you." };
  }

  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { assignedToId: null },
  });

  revalidatePath(`/staff/requests/${requestId}`);
  revalidatePath("/staff/requests");

  return { success: true };
}

export async function postRequestMessage(
  requestId: string,
  formData: FormData
) {
  const authResult = await requireActionAuth();
  if (!authResult.session) return { error: authResult.error ?? "Unauthorized" };
  const authorId = authResult.session.user.id;
  const role = authResult.session.user.role;

  const body = String(formData.get("body") ?? "").trim();
  const file = formData.get("file") as File | null;
  const hasFile = file && file.size > 0;

  if (!body && !hasFile) {
    return { error: "Write a message or attach a file." };
  }

  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { client: true },
  });
  if (!request) return { error: "Request not found" };

  if (
    request.status === ServiceRequestStatus.CANCELLED ||
    request.status === ServiceRequestStatus.REJECTED
  ) {
    return { error: "This request is closed." };
  }

  const isClient = role === Role.CLIENT;
  if (isClient && request.clientId !== authorId) {
    return { error: "Unauthorized" };
  }
  if (!isClient && role !== Role.STAFF && role !== Role.ADMIN) {
    return { error: "Unauthorized" };
  }

  let fileName: string | undefined;
  let filePath: string | undefined;

  if (hasFile && file) {
    const uploadError = validateChatUpload(file);
    if (uploadError) return { error: uploadError };
    const buffer = Buffer.from(await file.arrayBuffer());
    filePath = await saveUpload("request-chat", file.name, buffer);
    fileName = file.name;
  }

  await prisma.requestMessage.create({
    data: {
      requestId,
      authorId,
      body: body || null,
      fileName,
      filePath,
    },
  });

  revalidatePath(`/portal/requests/${requestId}`);
  revalidatePath(`/staff/requests/${requestId}`);
  return { success: true };
}
