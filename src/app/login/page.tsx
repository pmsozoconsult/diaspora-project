import { Suspense } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense>
        <LoginForm title="Sign in" />
      </Suspense>
      <p className="mt-6 text-center text-sm text-slate-600">
        No account?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Register free
        </Link>
      </p>
    </AuthLayout>
  );
}
