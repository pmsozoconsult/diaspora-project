"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerClient } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await registerClient(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/login?registered=1");
  }

  return (
    <form onSubmit={onSubmit} autoComplete="off" className="relative space-y-5">
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
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        aria-hidden
      />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Free registration. Your journey starts with power of attorney after login.
        </p>
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      <div>
        <Label htmlFor="register-name">Full name</Label>
        <Input
          id="register-name"
          name="name"
          required
          autoComplete="off"
          placeholder="Your full name"
        />
      </div>
      <div>
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          required
          autoComplete="off"
          placeholder="you@email.com"
        />
      </div>
      <div>
        <Label htmlFor="register-phone">Phone (optional)</Label>
        <Input
          id="register-phone"
          name="phone"
          type="tel"
          autoComplete="off"
          placeholder="Phone number"
        />
      </div>
      <div>
        <Label htmlFor="register-password">Password (min 8 characters)</Label>
        <Input
          id="register-password"
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          placeholder="Choose a password"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
