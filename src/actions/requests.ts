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

export async function createServiceRequestDraft(
  userId: string,
  serviceIds: string[]
) {
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
  staffId: string,
  itemId: string,
  status: ServiceRequestStatus
) {
  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || (staff.role !== Role.STAFF && staff.role !== Role.ADMIN)) {
    return { error: "Unauthorized" };
  }

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

export async function postRequestMessage(
  authorId: string,
  requestId: string,
  formData: FormData
) {
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

  const author = await prisma.user.findUnique({ where: { id: authorId } });
  if (!author) return { error: "Unauthorized" };

  const isClient = author.role === Role.CLIENT;
  if (isClient && request.clientId !== authorId) {
    return { error: "Unauthorized" };
  }
  if (!isClient && author.role !== Role.STAFF && author.role !== Role.ADMIN) {
    return { error: "Unauthorized" };
  }

  let fileName: string | undefined;
  let filePath: string | undefined;

  if (hasFile && file) {
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
