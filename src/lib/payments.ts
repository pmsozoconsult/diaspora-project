import {
  PaymentPurpose,
  PaymentStatus,
  PoaStatus,
  ServiceRequestStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreatePoaCase } from "@/lib/poa";

const MOCK = process.env.MOCK_PAYMENTS === "true";

export async function completeMockPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { serviceRequest: true },
  });
  if (!payment || payment.status === PaymentStatus.COMPLETED) {
    return payment;
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: PaymentStatus.COMPLETED },
  });

  if (payment.purpose === PaymentPurpose.POA_FEE) {
    const poa = await getOrCreatePoaCase(payment.userId);
    if (poa.status === PoaStatus.NOT_STARTED) {
      await prisma.poaCase.update({
        where: { id: poa.id },
        data: { status: PoaStatus.POA_FEE_PAID },
      });
    }
  }

  if (
    payment.purpose === PaymentPurpose.SERVICE_REQUEST &&
    payment.serviceRequest
  ) {
    const requestId = payment.serviceRequest.id;
    await prisma.serviceRequestItem.updateMany({
      where: { requestId },
      data: { status: ServiceRequestStatus.IN_PROGRESS },
    });
    await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status: ServiceRequestStatus.SUBMITTED },
    });
  }

  return prisma.payment.findUnique({ where: { id: paymentId } });
}

export function isMockPaymentsEnabled() {
  return MOCK || !process.env.STRIPE_SECRET_KEY;
}

export async function createPoaFeePayment(userId: string, amountCents: number) {
  return prisma.payment.create({
    data: {
      userId,
      purpose: PaymentPurpose.POA_FEE,
      amountCents,
      status: PaymentStatus.PENDING,
    },
  });
}

export async function createServiceRequestPayment(
  userId: string,
  requestId: string,
  amountCents: number
) {
  const payment = await prisma.payment.create({
    data: {
      userId,
      purpose: PaymentPurpose.SERVICE_REQUEST,
      amountCents,
      status: PaymentStatus.PENDING,
    },
  });
  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { paymentId: payment.id },
  });
  return payment;
}
