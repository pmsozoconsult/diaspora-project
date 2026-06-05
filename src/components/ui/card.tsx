import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "elevated" | "outline" | "accent";
}) {
  const variants = {
    default: "border-slate-200/80 bg-white shadow-card",
    elevated: "border-transparent bg-white shadow-card-hover",
    outline: "border-2 border-dashed border-slate-200 bg-slate-50/50",
    accent: "border-brand-200/80 bg-gradient-to-br from-brand-50/80 to-white shadow-card",
  };
  return (
    <div
      className={cn("rounded-2xl border p-6", variants[variant], className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  icon,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2
        className={cn("text-lg font-semibold tracking-tight text-slate-900", className)}
        {...props}
      />
    </div>
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-slate-600", className)} {...props} />;
}
