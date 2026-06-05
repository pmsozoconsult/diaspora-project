import { requireClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { clientCanRequestServices } from "@/lib/poa";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { NewRequestForm } from "@/components/portal/new-request-form";

export default async function NewRequestPage() {
  const session = await requireClient();
  const canRequest = await clientCanRequestServices(session.user.id);
  if (!canRequest) redirect("/portal/poa");

  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="page-content space-y-8">
      <PageHeader
        title="New service request"
        description="Select one or more services. Payment is required before your request is sent to our team."
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: "Requests", href: "/portal/requests" },
          { label: "New request" },
        ]}
      />

      <section className="w-full">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
            Available services
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            What do you need help with?
          </h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            Each service has its own price and dedicated chat thread. Select everything
            you need in one request — your total amount is calculated from your selection.
          </p>
        </header>

        <NewRequestForm services={services} />
      </section>
    </div>
  );
}
