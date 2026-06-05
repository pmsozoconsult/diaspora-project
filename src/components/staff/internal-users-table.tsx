"use client";

import { useState } from "react";
import { DataTable, DataTableRow, DataTableCell } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EditInternalUserDialog,
  type InternalUserRow,
} from "@/components/staff/edit-internal-user-dialog";

export function InternalUsersTable({
  adminId,
  users,
}: {
  adminId: string;
  users: InternalUserRow[];
}) {
  const [editing, setEditing] = useState<InternalUserRow | null>(null);

  return (
    <>
      <DataTable headers={["Name", "Email", "Role", "Created by", ""]}>
        {users.map((u) => (
          <DataTableRow key={u.id}>
            <DataTableCell className="font-semibold">{u.name}</DataTableCell>
            <DataTableCell>{u.email}</DataTableCell>
            <DataTableCell>
              <Badge tone={u.role === "ADMIN" ? "warning" : "info"}>{u.role}</Badge>
            </DataTableCell>
            <DataTableCell className="text-slate-500">
              {u.createdByName ?? "—"}
            </DataTableCell>
            <DataTableCell className="text-right">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(u)}
              >
                Edit
              </Button>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>

      {editing && (
        <EditInternalUserDialog
          adminId={adminId}
          user={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
