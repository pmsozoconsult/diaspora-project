import { Mail, MapPin, Phone } from "lucide-react";
import { MarketingLink } from "@/components/layout/marketing-link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="page-container py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <MarketingLink
              href="/"
              variant="ghost"
              className="!inline-flex !items-center gap-3 !text-white hover:!no-underline"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
                S
              </span>
              <span className="text-left">
                <span className="block text-lg font-bold leading-tight">Sozo Diaspora</span>
                <span className="block text-xs font-medium text-slate-400">
                  Sozo Consulting PLC
                </span>
              </span>
            </MarketingLink>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
              Structured representation for the Ethiopian diaspora — power of attorney,
              embassy coordination, and on-the-ground services in Ethiopia.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">
                Platform
              </p>
              <ul className="mt-5 space-y-3">
                <li>
                  <MarketingLink href="/register" variant="footer" className="!text-slate-300">
                    Create account
                  </MarketingLink>
                </li>
                <li>
                  <MarketingLink href="/login" variant="footer" className="!text-slate-300">
                    Sign in
                  </MarketingLink>
                </li>
                <li>
                  <MarketingLink href="/#how-it-works" variant="footer" className="!text-slate-300">
                    How it works
                  </MarketingLink>
                </li>
                <li>
                  <MarketingLink href="/#services" variant="footer" className="!text-slate-300">
                    Services
                  </MarketingLink>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">
                Legal
              </p>
              <ul className="mt-5 space-y-3 text-sm text-slate-400">
                <li>Privacy policy (coming soon)</li>
                <li>Terms of use (coming soon)</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">
              Contact
            </p>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <a
                  href="mailto:support@sozo.local"
                  className="text-slate-300 transition hover:text-white"
                >
                  support@sozo.local
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <span>+251 — contact line</span>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <span>Addis Ababa, Ethiopia</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="page-container flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© {year} Sozo Consulting PLC. All rights reserved.</p>
          <p>Licensed representation · Diaspora services portal</p>
        </div>
      </div>
    </footer>
  );
}
