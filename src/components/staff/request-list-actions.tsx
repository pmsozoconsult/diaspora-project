"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  assignRequestToStaff,
  dropRequestTask,
  pickUpRequest,
} from "@/actions/requests";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Hand, UserCheck, UserMinus, X } from "lucide-react";

type StaffOption = {
  id: string;
  name: string;
  role: Role;
};

function isAdminRole(role: Role | string) {
  return role === Role.ADMIN || role === "ADMIN";
}

export function RequestListActions({
  requestId,
  referenceNo,
  assignedToId,
  assignedToName,
  currentUserId,
  currentUserRole,
  staffMembers,
}: {
  requestId: string;
  referenceNo: string;
  assignedToId: string | null;
  assignedToName: string | null;
  currentUserId: string;
  currentUserRole: Role;
  staffMembers: StaffOption[];
}) {
  const router = useRouter();
  const [assignOpen, setAssignOpen] = useState(false);
  const [pickConfirmOpen, setPickConfirmOpen] = useState(false);
  const [dropConfirmOpen, setDropConfirmOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(
    assignedToId ?? staffMembers[0]?.id ?? currentUserId
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigneeId, setAssigneeId] = useState(assignedToId);
  const [assigneeName, setAssigneeName] = useState(assignedToName);

  const isAdmin = isAdminRole(currentUserRole);
  const isAssignedToMe = assigneeId === currentUserId;
  const isAssignedToOther = !!assigneeId && !isAssignedToMe;

  const assignOptions =
    staffMembers.length > 0
      ? staffMembers
      : [{ id: currentUserId, name: "You", role: currentUserRole }];

  useEffect(() => {
    setAssigneeId(assignedToId);
    setAssigneeName(assignedToName);
  }, [assignedToId, assignedToName]);

  async function handlePickUp() {
    setLoading(true);
    setError(null);
    const result = await pickUpRequest(currentUserId, requestId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.success && result.assigneeId && result.assigneeName) {
      setAssigneeId(result.assigneeId);
      setAssigneeName(result.assigneeName);
      setPickConfirmOpen(false);
      router.refresh();
    }
  }

  async function handleDrop() {
    setLoading(true);
    setError(null);
    const result = await dropRequestTask(currentUserId, requestId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.success) {
      setAssigneeId(null);
      setAssigneeName(null);
      setDropConfirmOpen(false);
      router.refresh();
    }
  }

  async function handleAssign() {
    if (!selectedStaffId) {
      setError("Select a staff member.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await assignRequestToStaff(
      currentUserId,
      requestId,
      selectedStaffId
    );
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.success && result.assigneeId && result.assigneeName) {
      setAssigneeId(result.assigneeId);
      setAssigneeName(result.assigneeName);
      setAssignOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="flex flex-col items-stretch gap-1.5">
          {isAdmin ? (
            <Button
              type="button"
              size="sm"
              disabled={loading}
              className="w-full min-w-[6.5rem] bg-brand-600 shadow-md shadow-brand-600/25 hover:bg-brand-700"
              onClick={() => {
                setError(null);
                setSelectedStaffId(assigneeId ?? staffMembers[0]?.id ?? currentUserId);
                setAssignOpen(true);
              }}
            >
              <UserCheck className="mr-1.5 h-4 w-4" />
              Assign
            </Button>
          ) : isAssignedToMe ? (
            <Button
              type="button"
              size="sm"
              disabled={loading}
              className="w-full min-w-[6.5rem] bg-amber-600 text-white shadow-md shadow-amber-600/25 hover:bg-amber-700"
              onClick={() => {
                setError(null);
                setDropConfirmOpen(true);
              }}
            >
              <UserMinus className="mr-1.5 h-4 w-4" />
              Drop task
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={loading || isAssignedToOther}
              className="w-full min-w-[6.5rem] bg-brand-600 shadow-md shadow-brand-600/25 hover:bg-brand-700"
              onClick={() => {
                setError(null);
                setPickConfirmOpen(true);
              }}
              title={
                isAssignedToOther
                  ? `Assigned to ${assigneeName ?? "another team member"}`
                  : "Pick up this request"
              }
            >
              <Hand className="mr-1.5 h-4 w-4" />
              Pick task
            </Button>
          )}
          <Link
            href={`/staff/requests/${requestId}`}
            className="inline-flex w-full min-w-[6.5rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Open →
          </Link>
        </div>

        {error && !assignOpen && !pickConfirmOpen && !dropConfirmOpen && (
          <p className="max-w-[14rem] text-right text-xs text-red-600">{error}</p>
        )}
      </div>

      <AnimatePresence>
        {pickConfirmOpen && !isAdmin && (
          <ConfirmDialog
            title="Pick up this task?"
            description={
              <>
                You will be assigned to request{" "}
                <span className="font-mono font-semibold">{referenceNo}</span> and can
                start working on it.
              </>
            }
            confirmLabel={loading ? "Picking up…" : "Pick task"}
            loading={loading}
            error={error}
            onCancel={() => !loading && setPickConfirmOpen(false)}
            onConfirm={handlePickUp}
          />
        )}

        {dropConfirmOpen && !isAdmin && isAssignedToMe && (
          <ConfirmDialog
            title="Drop this task?"
            description={
              <>
                You will be unassigned from{" "}
                <span className="font-mono font-semibold">{referenceNo}</span>. Another
                team member can pick it up later.
              </>
            }
            confirmLabel={loading ? "Dropping…" : "Drop task"}
            confirmClassName="bg-amber-600 hover:bg-amber-700"
            loading={loading}
            error={error}
            onCancel={() => !loading && setDropConfirmOpen(false)}
            onConfirm={handleDrop}
          />
        )}

        {assignOpen && isAdmin && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && setAssignOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-labelledby="assign-request-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="assign-request-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    Assign request
                  </h2>
                  <p className="mt-1 font-mono text-sm text-slate-600">{referenceNo}</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => !loading && setAssignOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {assigneeName && (
                <p className="mb-4 text-sm text-slate-600">
                  Currently assigned to <strong>{assigneeName}</strong>
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor={`assign-staff-${requestId}`}>Staff member</Label>
                  <select
                    id={`assign-staff-${requestId}`}
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {assignOptions.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                        {member.id === currentUserId ? " (you)" : ""}
                        {isAdminRole(member.role) ? " — Admin" : " — Staff"}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={loading}
                    onClick={() => setAssignOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={loading}
                    className="bg-brand-600 hover:bg-brand-700"
                    onClick={handleAssign}
                  >
                    <UserCheck className="mr-1.5 h-4 w-4" />
                    {loading ? "Assigning…" : "Assign"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmClassName,
  loading,
  error,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  confirmClassName?: string;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" disabled={loading} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading}
            className={cn(
              "bg-brand-600 shadow-md shadow-brand-600/25 hover:bg-brand-700",
              confirmClassName
            )}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
