import { PoaStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const POA_STATUS_LABELS: Record<PoaStatus, string> = {
  NOT_STARTED: "Not started",
  POA_FEE_PAID: "POA fee paid — complete MOFA submission",
  MOFA_SUBMITTED: "MOFA submitted — embassy processing",
  REGISTERED_IN_ETHIOPIA: "Registered in Ethiopia — finalizing",
  POA_COMPLETED: "Power of attorney completed",
  CANCELLED: "Cancelled",
};

export async function getOrCreatePoaCase(userId: string) {
  let poa = await prisma.poaCase.findUnique({ where: { userId } });
  if (!poa) {
    poa = await prisma.poaCase.create({
      data: { userId, status: PoaStatus.NOT_STARTED },
    });
  }
  return poa;
}

export async function clientCanRequestServices(userId: string) {
  const poa = await prisma.poaCase.findUnique({ where: { userId } });
  return poa?.status === PoaStatus.POA_COMPLETED;
}

export async function getPoaInstructions() {
  const settings = await prisma.appSettings.findUnique({
    where: { id: "default" },
  });
  return settings?.poaInstructions ?? "";
}

export async function getPoaFeeCents() {
  const settings = await prisma.appSettings.findUnique({
    where: { id: "default" },
  });
  return settings?.poaFeeCents ?? 50000;
}

export function canSeePoaInstructions(status: PoaStatus) {
  return (
    status === PoaStatus.POA_FEE_PAID ||
    status === PoaStatus.MOFA_SUBMITTED ||
    status === PoaStatus.REGISTERED_IN_ETHIOPIA ||
    status === PoaStatus.POA_COMPLETED
  );
}

export function isStaffRole(role: Role) {
  return role === Role.STAFF || role === Role.ADMIN;
}
