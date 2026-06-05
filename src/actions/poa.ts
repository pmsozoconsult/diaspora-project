"use server";

import path from "path";
import { PoaStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteStoredFile, saveUpload } from "@/lib/storage";
import {
  completeMockPayment,
  createPoaFeePayment,
  isMockPaymentsEnabled,
} from "@/lib/payments";
import { getPoaFeeCents } from "@/lib/poa";
import { POA_TERMS_VERSION } from "@/lib/poa-terms";
import { canStaffSetPoaStatus } from "@/lib/requests";

export async function initiatePoaPayment(userId: string, termsAccepted: boolean) {
  if (!termsAccepted) {
    return { error: "You must accept the terms and conditions to proceed." };
  }

  const poa = await prisma.poaCase.findUnique({ where: { userId } });
  if (!poa || poa.status !== PoaStatus.NOT_STARTED) {
    return { error: "POA fee already paid or not applicable." };
  }

  await prisma.poaCase.update({
    where: { userId },
    data: {
      termsAcceptedAt: new Date(),
      termsAcceptedVersion: POA_TERMS_VERSION,
    },
  });

  const amountCents = await getPoaFeeCents();
  const payment = await createPoaFeePayment(userId, amountCents);

  if (isMockPaymentsEnabled()) {
    await completeMockPayment(payment.id);
    revalidatePath("/portal/poa");
    return { success: true, mock: true };
  }

  return { success: true, paymentId: payment.id, mock: false };
}

export async function updatePoaStatus(
  staffId: string,
  poaCaseId: string,
  status: PoaStatus,
  notes?: string
) {
  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || (staff.role !== Role.STAFF && staff.role !== Role.ADMIN)) {
    return { error: "Unauthorized" };
  }

  const poa = await prisma.poaCase.findUnique({ where: { id: poaCaseId } });
  if (!poa) return { error: "POA case not found" };

  if (!canStaffSetPoaStatus(poa.status, status)) {
    return { error: "That status change is not allowed." };
  }

  if (status === PoaStatus.POA_COMPLETED) {
    if (!poa.scanFilePath) {
      return { error: "Upload scanned POA before marking completed." };
    }
  }

  await prisma.poaCase.update({
    where: { id: poaCaseId },
    data: { status, notes: notes ?? poa.notes },
  });

  revalidatePath("/staff/poa");
  revalidatePath(`/staff/poa/${poaCaseId}`);
  revalidatePath("/portal/poa");
  return { success: true };
}

export async function confirmMofaSubmissionByStaff(staffId: string, poaCaseId: string) {
  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || (staff.role !== Role.STAFF && staff.role !== Role.ADMIN)) {
    return { error: "Unauthorized" };
  }

  const poa = await prisma.poaCase.findUnique({ where: { id: poaCaseId } });
  if (!poa) return { error: "POA case not found." };
  if (poa.status !== PoaStatus.POA_FEE_PAID) {
    return { error: "MOFA can only be confirmed while waiting for client MOFA submission." };
  }

  await prisma.poaCase.update({
    where: { id: poaCaseId },
    data: { status: PoaStatus.MOFA_SUBMITTED },
  });

  revalidatePath("/staff/poa");
  revalidatePath(`/staff/poa/${poaCaseId}`);
  revalidatePath("/portal/poa");
  return { success: true };
}

export async function confirmMofaSubmission(userId: string) {
  const poa = await prisma.poaCase.findUnique({ where: { userId } });
  if (!poa) return { error: "POA case not found." };
  if (poa.status !== PoaStatus.POA_FEE_PAID) {
    return { error: "MOFA can only be confirmed after the POA fee is paid." };
  }

  await prisma.poaCase.update({
    where: { id: poa.id },
    data: { status: PoaStatus.MOFA_SUBMITTED },
  });

  revalidatePath("/portal/poa");
  revalidatePath("/portal");
  return { success: true };
}

export async function uploadPoaScan(
  staffId: string,
  poaCaseId: string,
  formData: FormData
) {
  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || (staff.role !== Role.STAFF && staff.role !== Role.ADMIN)) {
    return { error: "Unauthorized" };
  }

  const poa = await prisma.poaCase.findUnique({ where: { id: poaCaseId } });
  if (!poa) return { error: "POA case not found" };
  if (poa.status === PoaStatus.POA_COMPLETED) {
    return { error: "Cannot replace scan after POA is completed." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided" };

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { error: "File must be 10 MB or smaller." };
  }

  const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.name).toLowerCase();
  if (!allowed.includes(ext)) {
    return { error: "Use PDF, JPG, PNG, or WEBP." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = await saveUpload("poa", file.name, buffer);

  await deleteStoredFile(poa.scanFilePath);

  await prisma.poaCase.update({
    where: { id: poaCaseId },
    data: {
      scanFileName: file.name,
      scanFilePath: filePath,
      scanUploadedAt: new Date(),
    },
  });

  revalidatePath(`/staff/poa/${poaCaseId}`);
  revalidatePath("/staff/poa");
  return { success: true, fileName: file.name };
}

export async function deletePoaScan(staffId: string, poaCaseId: string) {
  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || (staff.role !== Role.STAFF && staff.role !== Role.ADMIN)) {
    return { error: "Unauthorized" };
  }

  const poa = await prisma.poaCase.findUnique({ where: { id: poaCaseId } });
  if (!poa) return { error: "POA case not found" };
  if (poa.status === PoaStatus.POA_COMPLETED) {
    return { error: "Cannot remove scan after POA is completed." };
  }
  if (!poa.scanFilePath) return { error: "No scan on file." };

  await deleteStoredFile(poa.scanFilePath);
  await prisma.poaCase.update({
    where: { id: poaCaseId },
    data: {
      scanFileName: null,
      scanFilePath: null,
      scanUploadedAt: null,
    },
  });

  revalidatePath(`/staff/poa/${poaCaseId}`);
  revalidatePath("/staff/poa");
  return { success: true };
}

export async function updatePoaInstructions(
  adminId: string,
  instructions: string
) {
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin || admin.role !== Role.ADMIN) {
    return { error: "Unauthorized" };
  }

  await prisma.appSettings.update({
    where: { id: "default" },
    data: { poaInstructions: instructions },
  });

  revalidatePath("/portal/poa");
  return { success: true };
}
