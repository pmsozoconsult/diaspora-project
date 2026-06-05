"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmMofaSubmission } from "@/actions/poa";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Send } from "lucide-react";

export function PoaMofaSubmitButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    const result = await confirmMofaSubmission(userId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <p className="max-w-xs text-right text-xs text-red-600">{error}</p>
      )}
      <Button size="sm" className="gap-2 shadow-sm" disabled={loading} onClick={onClick}>
        {loading ? (
          "Saving…"
        ) : (
          <>
            <Send className="h-4 w-4" />
            I submitted in the MOFA app
          </>
        )}
      </Button>
    </div>
  );
}

export function PoaMofaSubmittedBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
      <CheckCircle2 className="h-4 w-4" />
      MOFA submission recorded
    </span>
  );
}
