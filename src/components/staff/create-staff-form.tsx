"use client";

import { useRef, useState } from "react";
import { createStaffUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateStaffForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    const formData = new FormData(form);
    const result = await createStaffUser(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    form.reset();
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      autoComplete="off"
      className="relative space-y-4"
    >
      {/* Decoy fields — stop browser from filling admin login credentials */}
      <input
        type="text"
        name="prevent_autofill"
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        aria-hidden
      />
      <input
        type="password"
        name="prevent_autofill_pw"
        tabIndex={-1}
        autoComplete="new-password"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        aria-hidden
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-green-700">Staff account created successfully.</p>
      )}
      <div>
        <Label htmlFor="staff-create-name">Name</Label>
        <Input
          id="staff-create-name"
          name="name"
          required
          autoComplete="off"
          placeholder="Full name"
        />
      </div>
      <div>
        <Label htmlFor="staff-create-email">Email</Label>
        <Input
          id="staff-create-email"
          name="email"
          type="email"
          required
          autoComplete="off"
          placeholder="name@company.com"
        />
      </div>
      <div>
        <Label htmlFor="staff-create-password">Temporary password</Label>
        <Input
          id="staff-create-password"
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          placeholder="Min. 8 characters"
        />
      </div>
      <div>
        <Label htmlFor="staff-create-role">Role</Label>
        <select
          id="staff-create-role"
          name="role"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          defaultValue="STAFF"
        >
          <option value="STAFF">Staff / Manager</option>
          <option value="ADMIN">Administrator</option>
        </select>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating…" : "Create staff user"}
      </Button>
    </form>
  );
}
