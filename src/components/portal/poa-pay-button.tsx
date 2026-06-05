"use client";

import { useState } from "react";
import { initiatePoaPayment } from "@/actions/poa";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export function PoaPayButton({
  userId,
  feeCents,
}: {
  userId: string;
  feeCents: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    const result = await initiatePoaPayment(userId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    window.location.reload();
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <Button onClick={pay} disabled={loading}>
        {loading ? "Processing…" : `Pay POA fee (${formatMoney(feeCents)})`}
      </Button>
    </div>
  );
}
