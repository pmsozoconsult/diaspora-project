import Link from "next/link";
import { LucideIcon, ArrowUpRight, CheckCircle2, AlertCircle, Lock, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type VisualState =
  | "success"
  | "warning"
  | "pending"
  | "neutral"
  | "locked"
  | "danger";

const stateStyles: Record<
  VisualState,
  { border: string; iconBg: string; dot: string }
> = {
  success: {
    border: "border-l-emerald-500 bg-gradient-to-br from-emerald-50/80 to-white",
    iconBg: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  warning: {
    border: "border-l-amber-500 bg-gradient-to-br from-amber-50/60 to-white",
    iconBg: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  pending: {
    border: "border-l-sky-500 bg-gradient-to-br from-sky-50/60 to-white",
    iconBg: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
  },
  neutral: {
    border: "border-l-slate-300 bg-white",
    iconBg: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
  locked: {
    border: "border-l-slate-400 bg-gradient-to-br from-slate-50 to-white",
    iconBg: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
  },
  danger: {
    border: "border-l-red-500 bg-gradient-to-br from-red-50/60 to-white",
    iconBg: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
};

function StateIcon({ state }: { state: VisualState }) {
  if (state === "success") return <CheckCircle2 className="h-4 w-4" />;
  if (state === "locked") return <Lock className="h-4 w-4" />;
  if (state === "warning") return <AlertCircle className="h-4 w-4" />;
  return <Clock className="h-4 w-4" />;
}

export function MetricGrid({
  columns = 3,
  children,
}: {
  columns?: 3 | 4;
  children: React.ReactNode;
}) {
  const cols =
    columns === 4
      ? "sm:grid-cols-2 xl:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={cn("grid grid-cols-1 gap-4 auto-rows-fr", cols)}>{children}</div>
  );
}

export function StatusMetricCard({
  label,
  statusText,
  detail,
  metric,
  icon: Icon,
  visualState,
  href,
}: {
  label: string;
  statusText: string;
  detail?: string;
  metric?: string | number;
  icon: LucideIcon;
  visualState: VisualState;
  href?: string;
}) {
  const styles = stateStyles[visualState];

  const inner = (
    <div
      className={cn(
        "group flex h-full min-h-[148px] flex-col rounded-xl border border-slate-200/80 border-l-4 p-5 shadow-sm transition duration-200",
        styles.border,
        href && "hover:shadow-md hover:ring-1 hover:ring-slate-200/80"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              styles.iconBg
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", styles.dot)} aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {label}
            </span>
          </span>
        </div>
        {href && (
          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-brand-600" />
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-between gap-2">
        <div>
          {metric !== undefined && (
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
              {metric}
            </p>
          )}
          <p
            className={cn(
              "font-semibold leading-snug text-slate-800",
              metric !== undefined ? "text-sm" : "text-base"
            )}
          >
            {statusText}
          </p>
          {detail && (
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{detail}</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
          <StateIcon state={visualState} />
          <span className="capitalize">{visualState === "locked" ? "Locked" : visualState}</span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function poaVisualState(status: string): VisualState {
  switch (status) {
    case "POA_COMPLETED":
      return "success";
    case "POA_FEE_PAID":
      return "success";
    case "MOFA_SUBMITTED":
      return "pending";
    case "REGISTERED_IN_ETHIOPIA":
      return "pending";
    case "NOT_STARTED":
      return "warning";
    case "CANCELLED":
      return "danger";
    default:
      return "neutral";
  }
}

export function poaShortStatus(status: string): string {
  switch (status) {
    case "NOT_STARTED":
      return "Fee not paid";
    case "POA_FEE_PAID":
      return "Fee paid";
    case "MOFA_SUBMITTED":
      return "MOFA submitted";
    case "REGISTERED_IN_ETHIOPIA":
      return "Registering";
    case "POA_COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Unknown";
  }
}
