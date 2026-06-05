import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <SiteHeader />
      <main className="page-container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to public site
          </Link>
          <div className="gradient-border rounded-2xl bg-white/95 p-8 shadow-card-hover backdrop-blur animate-slide-up">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
