import { PoaStatus } from "@prisma/client";

export type JourneyPhase = "account" | "poa" | "services";

const AFTER_MOFA: PoaStatus[] = [
  PoaStatus.MOFA_SUBMITTED,
  PoaStatus.REGISTERED_IN_ETHIOPIA,
  PoaStatus.POA_COMPLETED,
];

const AFTER_EMBASSY: PoaStatus[] = [
  PoaStatus.REGISTERED_IN_ETHIOPIA,
  PoaStatus.POA_COMPLETED,
];

export function getClientJourneyPhase(
  poaStatus: PoaStatus,
  canRequestServices: boolean
): JourneyPhase {
  if (canRequestServices) return "services";
  if (poaStatus === PoaStatus.POA_COMPLETED) return "services";
  return "poa";
}

export const JOURNEY_STEPS = [
  {
    id: "account" as const,
    label: "Your account",
    short: "Account",
    description: "Profile created — you are in our system.",
  },
  {
    id: "poa" as const,
    label: "Power of attorney",
    short: "POA",
    description: "Pay POA fee, follow embassy steps, we register your mandate.",
  },
  {
    id: "services" as const,
    label: "Service requests",
    short: "Services",
    description: "Select services, pay, track each request and chat with our team.",
  },
];

export function getPoaSubsteps(status: PoaStatus) {
  const steps = [
    {
      key: "fee",
      label: "Pay POA fee",
      done: status !== PoaStatus.NOT_STARTED,
    },
    {
      key: "mofa",
      label: "MOFA app & form",
      done: AFTER_MOFA.includes(status),
    },
    {
      key: "embassy",
      label: "Embassy processing",
      done: AFTER_EMBASSY.includes(status),
    },
    {
      key: "complete",
      label: "Registered in Ethiopia",
      done: status === PoaStatus.POA_COMPLETED,
    },
  ];
  const currentIndex = steps.findIndex((s) => !s.done);
  return { steps, currentIndex: currentIndex === -1 ? steps.length : currentIndex };
}
