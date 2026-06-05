import Link from "next/link";
import { PoaStatus } from "@prisma/client";
import { POA_PROCESS_STEPS, POA_SAMPLE_PDF_PATH } from "@/lib/poa-steps";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PoaMofaSubmitButton,
  PoaMofaSubmittedBadge,
} from "@/components/portal/poa-mofa-submit-button";

export function PoaInstructions({
  status,
}: {
  status: PoaStatus;
}) {
  const showMofaButton = status === PoaStatus.POA_FEE_PAID;
  const mofaDone = status !== PoaStatus.POA_FEE_PAID && status !== PoaStatus.NOT_STARTED;

  return (
    <div className="space-y-6">
      <div className="relative space-y-0">
        {POA_PROCESS_STEPS.map((step, index) => (
          <div key={step.key} className="relative flex gap-5 pb-10 last:pb-0">
            {index < POA_PROCESS_STEPS.length - 1 && (
              <span className="absolute left-5 top-12 h-[calc(100%-24px)] w-0.5 bg-brand-200" />
            )}
            <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-md">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
                {step.highlight === "download" && (
                  <Link href={POA_SAMPLE_PDF_PATH} download>
                    <Button size="sm" className="gap-2 shadow-sm">
                      <Download className="h-4 w-4" />
                      Download sample PDF
                    </Button>
                  </Link>
                )}
                {step.highlight === "mofa-submit" && showMofaButton && (
                  <PoaMofaSubmitButton />
                )}
                {step.highlight === "mofa-submit" && mofaDone && !showMofaButton && (
                  <PoaMofaSubmittedBadge />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
