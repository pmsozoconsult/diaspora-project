import Link from "next/link";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  accent = "brand",
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
  accent?: "brand" | "amber" | "slate" | "emerald";
  trend?: string;
}) {
  const accents = {
    brand: "from-brand-500/15 to-brand-600/5 text-brand-700",
    amber: "from-amber-500/15 to-amber-600/5 text-amber-800",
    slate: "from-slate-500/10 to-slate-600/5 text-slate-700",
    emerald: "from-emerald-500/15 to-emerald-600/5 text-emerald-800",
  };

  const content = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition duration-300",
        href && "hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
      )}
    >
      <div
        className={cn(
          "absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-80",
          accents[accent]
        )}
      />
      <div className="relative flex items-start justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br",
            accents[accent]
          )}
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>
        {href && (
          <ArrowUpRight className="h-5 w-5 text-slate-400 transition group-hover:text-brand-600" />
        )}
      </div>
      <p className="relative mt-4 text-sm font-medium text-slate-500">{title}</p>
      <p className="relative mt-1 font-display text-4xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      {subtitle && (
        <p className="relative mt-2 text-sm text-slate-600">{subtitle}</p>
      )}
      {trend && (
        <p className="relative mt-2 text-xs font-medium text-brand-600">{trend}</p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
