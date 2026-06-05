"use client";

import { PoaStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  confirmMofaSubmissionByStaff,
  updatePoaStatus,
} from "@/actions/poa";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  PlayCircle,
  Smartphone,
} from "lucide-react";
import { PoaScanUpload } from "@/components/staff/poa-scan-upload";

export function PoaStaffActions({
  poaCaseId,
  staffId,
  status,
  scanUrl,
  scanFileName,
  scanUploadedAt,
}: {
  poaCaseId: string;
  staffId: string;
  status: PoaStatus;
  scanUrl: string | null;
  scanFileName: string | null;
  scanUploadedAt: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(newStatus: PoaStatus) {
    setLoading(true);
    setError(null);
    const result = await updatePoaStatus(staffId, poaCaseId, newStatus);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function markMofaSubmitted() {
    setLoading(true);
    setError(null);
    const result = await confirmMofaSubmissionByStaff(staffId, poaCaseId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <PoaScanUpload
        poaCaseId={poaCaseId}
        staffId={staffId}
        status={status}
        scanUrl={scanUrl}
        scanFileName={scanFileName}
        scanUploadedAt={scanUploadedAt}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
          Status actions
        </p>
        <div className="flex flex-wrap gap-2">
          {status === PoaStatus.POA_FEE_PAID && (
            <Button
              variant="secondary"
              disabled={loading}
              className="gap-2"
              onClick={markMofaSubmitted}
            >
              <Smartphone className="h-4 w-4" />
              Mark MOFA submitted (step 2)
            </Button>
          )}
          {status === PoaStatus.MOFA_SUBMITTED && (
            <Button
              variant="secondary"
              disabled={loading}
              className="gap-2"
              onClick={() => setStatus(PoaStatus.REGISTERED_IN_ETHIOPIA)}
            >
              <PlayCircle className="h-4 w-4" />
              Mark embassy complete (step 3 → 4)
            </Button>
          )}
          {status === PoaStatus.REGISTERED_IN_ETHIOPIA && (
            <Button
              disabled={loading}
              className="gap-2"
              onClick={() => setStatus(PoaStatus.POA_COMPLETED)}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark POA completed
            </Button>
          )}
          {status !== PoaStatus.CANCELLED && status !== PoaStatus.POA_COMPLETED && (
            <Button
              variant="danger"
              disabled={loading}
              className="gap-2"
              onClick={() => setStatus(PoaStatus.CANCELLED)}
            >
              <XCircle className="h-4 w-4" />
              Cancel POA
            </Button>
          )}
        </div>
        {status === PoaStatus.POA_FEE_PAID && (
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Use <strong className="text-slate-700">Mark MOFA submitted</strong> if the
            client completed the MOFA app but cannot click the button on their portal.
          </p>
        )}
      </div>
    </div>
  );
}
