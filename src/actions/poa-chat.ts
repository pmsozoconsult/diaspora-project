"use server";

import { PoaStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/storage";

async function canAccessPoaChat(userId: string, role: Role, poaCaseId: string) {
  const poa = await prisma.poaCase.findUnique({
    where: { id: poaCaseId },
    include: { user: true },
  });
  if (!poa) return { error: "POA case not found" as const, poa: null };
  if (poa.status === PoaStatus.POA_COMPLETED || poa.status === PoaStatus.CANCELLED) {
    return { error: "POA chat is closed for this case." as const, poa: null };
  }
  const isClient = role === Role.CLIENT;
  if (isClient && poa.userId !== userId) {
    return { error: "Unauthorized" as const, poa: null };
  }
  if (!isClient && role !== Role.STAFF && role !== Role.ADMIN) {
    return { error: "Unauthorized" as const, poa: null };
  }
  if (isClient && poa.status === PoaStatus.NOT_STARTED) {
    return { error: "Pay the POA fee to unlock chat." as const, poa: null };
  }
  return { poa, error: null };
}

export async function postPoaMessage(
  authorId: string,
  role: Role,
  poaCaseId: string,
  formData: FormData
) {
  const body = String(formData.get("body") ?? "").trim();
  const file = formData.get("file") as File | null;
  const hasFile = file && file.size > 0;

  if (!body && !hasFile) {
    return { error: "Write a message or attach a file." };
  }

  const access = await canAccessPoaChat(authorId, role, poaCaseId);
  if (access.error || !access.poa) return { error: access.error ?? "Denied" };

  let fileName: string | undefined;
  let filePath: string | undefined;

  if (hasFile && file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    filePath = await saveUpload("poa-chat", file.name, buffer);
    fileName = file.name;
  }

  await prisma.poaMessage.create({
    data: {
      poaCaseId,
      authorId,
      body: body || null,
      fileName,
      filePath,
    },
  });

  revalidatePath("/portal/poa");
  revalidatePath(`/staff/poa/${poaCaseId}`);
  return { success: true };
}
