import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { MarketingLink } from "@/components/layout/marketing-link";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
      <div className="page-container flex h-16 items-center justify-between">
        <MarketingLink href="/" variant="ghost" className="!text-lg !font-bold !text-slate-900 hover:!no-underline">
          <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            S
          </span>
          Sozo <span className="text-brand-700">Diaspora</span>
        </MarketingLink>
        <nav className="flex items-center gap-2 sm:gap-4">
          {session?.user ? (
            session.user.role === Role.CLIENT ? (
              <MarketingLink href="/portal" variant="ghost" className="font-semibold text-brand-700">
                My portal
              </MarketingLink>
            ) : (
              <MarketingLink href="/staff" variant="ghost" className="font-semibold text-brand-700">
                Staff portal
              </MarketingLink>
            )
          ) : (
            <>
              <MarketingLink href="/login" variant="ghost">
                Sign in
              </MarketingLink>
              <MarketingLink href="/register" variant="primary" className="!px-4 !py-2">
                Get started
              </MarketingLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
