import {
  Download,
  Smartphone,
  Plane,
  FileCheck,
  type LucideIcon,
} from "lucide-react";

export type PoaProcessStep = {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  highlight?: "download" | "mofa-submit";
};

/** Instruction cards shown after POA fee is paid (chat is separate, under POA process sidebar). */
export const POA_PROCESS_STEPS: PoaProcessStep[] = [
  {
    key: "download",
    title: "Download & complete the POA form",
    description:
      "Download our sample authorization form, fill it in, and keep a copy for your records.",
    icon: Download,
    highlight: "download",
  },
  {
    key: "mofa",
    title: "Submit via the digital MOFA app",
    description:
      "Enter your details in Ethiopia’s digital MOFA application. The app routes your file to the embassy in your country.",
    icon: Smartphone,
    highlight: "mofa-submit",
  },
  {
    key: "embassy",
    title: "Embassy processing abroad",
    description:
      "Your host embassy processes the file, then forwards the authenticated document to the Ethiopian embassy. Our team updates this step when processing is complete.",
    icon: Plane,
  },
  {
    key: "registered",
    title: "Registered in Ethiopia",
    description:
      "Sozo collects the document in Ethiopia, registers your power of attorney, uploads the scan, and marks your POA complete.",
    icon: FileCheck,
  },
];

export const POA_SAMPLE_PDF_PATH = "/downloads/poa-authorization-sample.pdf";
