"use client";

import { useState } from "react";
import Link from "next/link";
import { PoaStatus } from "@prisma/client";
import { POA_STATUS_LABELS } from "@/lib/poa";
import { PoaProgress } from "@/components/ui/poa-progress";
import { ServiceRequestsExplorer } from "@/components/staff/service-requests-explorer";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ServiceRequestListItem } from "@/lib/service-request-list";
import { FileSignature, ClipboardList, Mail, Phone, User } from "lucide-react";

type ClientInfo = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAtLabel: string;
};

type PoaInfo = {
  id: string;
  status: PoaStatus;
} | null;

export function ClientDetailWorkspace({
  client,
  poa,
  requests,
}: {
  client: ClientInfo;
  poa: PoaInfo;
  requests: ServiceRequestListItem[];
}) {
  const [tab, setTab] = useState<"poa" | "services">("poa");

  return (
    <div className="space-y-8">
      <Card variant="elevated">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <User className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <Mail className="h-4 w-4" />
                {client.email}
              </p>
              {client.phone && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                  <Phone className="h-4 w-4" />
                  {client.phone}
                </p>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Client since {client.createdAtLabel}
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>
              <strong className="text-slate-900">{requests.length}</strong> service
              requests
            </p>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("poa")}
          className={cn(
            "flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition",
            tab === "poa"
              ? "border-b-2 border-brand-600 text-brand-700"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          <FileSignature className="h-4 w-4" />
          Power of attorney
        </button>
        <button
          type="button"
          onClick={() => setTab("services")}
          className={cn(
            "flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition",
            tab === "services"
              ? "border-b-2 border-brand-600 text-brand-700"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          <ClipboardList className="h-4 w-4" />
          Services history
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {requests.length}
          </span>
        </button>
      </div>

      {tab === "poa" && (
        <div className="space-y-6">
          {!poa ? (
            <Card variant="outline" className="bg-slate-50/50">
              <p className="text-sm text-slate-600">
                This client has not started a power of attorney case yet.
              </p>
            </Card>
          ) : (
            <>
              <Card variant="elevated">
                <CardTitle icon={<FileSignature className="h-5 w-5 text-brand-600" />}>
                  POA status
                </CardTitle>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Badge tone="info">{POA_STATUS_LABELS[poa.status]}</Badge>
                  <Link
                    href={`/staff/poa/${poa.id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                  >
                    Open full POA case →
                  </Link>
                </div>
                <div className="mt-6">
                  <PoaProgress status={poa.status} />
                </div>
              </Card>
              <p className="text-sm text-slate-500">
                Chat, scan upload, and status actions are on the full POA case page.
              </p>
            </>
          )}
        </div>
      )}

      {tab === "services" && (
        <ServiceRequestsExplorer
          requests={requests}
          showClientColumn={false}
          emptyMessage="No service requests for this client yet."
        />
      )}
    </div>
  );
}
