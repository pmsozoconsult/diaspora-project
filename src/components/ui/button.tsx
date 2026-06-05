import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-md shadow-brand-600/30 hover:bg-brand-700 hover:shadow-lg",
  secondary:
    "bg-white border border-slate-200 text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-300",
  outline:
    "border-2 border-brand-600 text-brand-700 bg-transparent hover:bg-brand-50",
  ghost: "text-slate-700 hover:bg-slate-100",
  danger: "bg-red-600 text-white shadow-md hover:bg-red-700",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }
>(({ className, variant = "primary", size = "md", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:pointer-events-none",
      size === "sm" && "px-3 py-1.5 text-xs",
      size === "md" && "px-4 py-2.5 text-sm",
      size === "lg" && "px-6 py-3 text-base",
      variants[variant],
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
