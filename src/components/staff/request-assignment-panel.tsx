"use client";

import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { assignRequestToStaff, pickUpRequest } from "@/actions/requests";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserCheck, UserPlus } from "lucide-react";

type StaffOption = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

function isAdminRole(role: Role | string) {
  return role === Role.ADMIN || role === "ADMIN";
}

export function RequestAssignmentPanel({
  requestId,
  currentUserId,
  currentUserRole,
  assignedTo,
  staffMembers,
}: {
  requestId: string;
  currentUserId: string;
  currentUserRole: Role;
  assignedTo: { id: string; name: string } | null;
  staffMembers: StaffOption[];
}) {
  const router = useRouter();
  const [selectedStaffId, setSelectedStaffId] = useState(
    assignedTo?.id ?? staffMembers[0]?.id ?? currentUserId
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [assignee, setAssignee] = useState(assignedTo);

  const isAdmin = isAdminRole(currentUserRole);
  const isAssignedToMe = assignee?.id === currentUserId;
  const isUnassigned = !assignee;

  useEffect(() => {
    setAssignee(assignedTo);
    if (assignedTo?.id) {
      setSelectedStaffId(assignedTo.id);
    }
  }, [assignedTo]);

  async function handleAssign() {
    if (!selectedStaffId) {
      setError("Select a staff member.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await assignRequestToStaff(requestId, selectedStaffId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.success && result.assigneeName && result.assigneeId) {
      setAssignee({ id: result.assigneeId, name: result.assigneeName });
      router.refresh();
    }
  }

  async function handlePickUp() {
    setLoading(true);
    setError(null);
    const result = await pickUpRequest(requestId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.success && result.assigneeName && result.assigneeId) {
      setAssignee({ id: result.assigneeId, name: result.assigneeName });
      router.refresh();
    }
  }

  const assignOptions =
    staffMembers.length > 0
      ? staffMembers
      : [{ id: currentUserId, name: "You", email: "", role: currentUserRole }];

  return (
    <Card variant="elevated">
      <CardTitle icon={<UserCheck className="h-5 w-5 text-brand-600" />}>
        Assignment
      </CardTitle>

      <div className="mt-4 space-y-4">
        {assignee ? (
          <p className="text-sm text-slate-700">
            Assigned to{" "}
            <strong className="text-slate-900">
              {isAssignedToMe ? "you" : assignee.name}
            </strong>
            {isAssignedToMe ? (
              <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">
                You
              </span>
            ) : null}
          </p>
        ) : (
          <p className="text-sm text-slate-600">No one is assigned to this request yet.</p>
        )}

        {isAdmin && (
          <div className="space-y-2">
            <Label htmlFor="request-assign-staff" className="text-xs text-slate-500">
              Assign to staff member
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                id="request-assign-staff"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {assignOptions.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                    {member.id === currentUserId ? " (you)" : ""}
                    {isAdminRole(member.role)
                      ? " — Admin"
                      : member.role
                        ? " — Staff"
                        : ""}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                disabled={loading || !selectedStaffId}
                onClick={handleAssign}
              >
                Assign
              </Button>
            </div>
            {staffMembers.length === 0 && (
              <p className="text-xs text-slate-500">
                Add more team members under Staff → Team to assign requests to others.
              </p>
            )}
          </div>
        )}

        {!isAdmin && isUnassigned && (
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={loading}
            onClick={handlePickUp}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Pick up request
          </Button>
        )}

        {isAdmin && isUnassigned && (
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={loading}
            onClick={handlePickUp}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Assign to me
          </Button>
        )}

        {!isAdmin && assignee && !isAssignedToMe && (
          <p className="text-xs text-slate-500">
            Only an administrator can reassign this request.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
      </div>
    </Card>
  );
}
