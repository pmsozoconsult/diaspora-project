import { SiteHeader } from "@/components/layout/site-header";
import { LandingPageContent } from "@/components/marketing/landing-page-content";
import { SiteFooter } from "@/components/marketing/site-footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <LandingPageContent />
      <SiteFooter />
    </div>
  );
}
