import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default",
  size = "md",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info" | "muted";
  size?: "sm" | "md";
}) {
  const tones = {
    default: "bg-brand-100 text-brand-800 ring-brand-200/60",
    success: "bg-emerald-100 text-emerald-800 ring-emerald-200/60",
    warning: "bg-amber-100 text-amber-900 ring-amber-200/60",
    danger: "bg-red-100 text-red-800 ring-red-200/60",
    info: "bg-sky-100 text-sky-800 ring-sky-200/60",
    muted: "bg-slate-100 text-slate-600 ring-slate-200/60",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium ring-1 ring-inset",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
