"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Role } from "@prisma/client";
import { updateInternalUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export type InternalUserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdByName: string | null;
};

export function EditInternalUserDialog({
  user,
  onClose,
}: {
  user: InternalUserRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await updateInternalUser(
      user.id,
      new FormData(e.currentTarget)
    );
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <h3 id="edit-user-title" className="pr-8 text-lg font-bold text-slate-900">
            Edit internal user
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Update name, email, role, or set a new password.
          </p>

          <form onSubmit={onSubmit} autoComplete="off" className="mt-6 space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <div>
              <Label htmlFor="edit-user-name">Name</Label>
              <Input
                id="edit-user-name"
                name="name"
                defaultValue={user.name}
                required
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="edit-user-email">Email</Label>
              <Input
                id="edit-user-email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="edit-user-role">Role</Label>
              <select
                id="edit-user-role"
                name="role"
                defaultValue={user.role}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="STAFF">Staff / Manager</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-user-password">New password (optional)</Label>
              <Input
                id="edit-user-password"
                name="password"
                type="password"
                minLength={8}
                placeholder="Leave blank to keep current password"
                autoComplete="new-password"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
