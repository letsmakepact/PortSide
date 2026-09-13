import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-sky-600 text-white hover:bg-sky-500 border border-sky-500/80 font-medium focus-visible:ring-1 focus-visible:ring-sky-400 active:bg-sky-700 shadow-none transition-colors",
  secondary: "bg-[#111827] text-slate-200 border border-[#1f2937] hover:bg-[#161f30] hover:text-white hover:border-slate-700 focus-visible:ring-1 focus-visible:ring-slate-500 active:bg-[#0d131f] shadow-none transition-colors",
  ghost: "text-slate-400 hover:bg-[#111827] hover:text-slate-200 focus-visible:ring-1 focus-visible:ring-slate-500 active:bg-[#161f30] transition-colors",
  danger: "bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/50 hover:text-rose-200 focus-visible:ring-1 focus-visible:ring-rose-500 active:bg-rose-950/70 transition-colors",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-2.5 text-xs font-medium gap-1.5",
  md: "h-9 px-3.5 text-xs font-medium gap-2",
  lg: "h-10 px-4 text-sm font-medium gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
