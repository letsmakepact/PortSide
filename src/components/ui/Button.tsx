import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 shadow-xs dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 dark:border-sky-400/40 dark:font-semibold focus-visible:ring-slate-900/20 dark:focus-visible:ring-sky-500/20 active:bg-slate-950 dark:active:bg-sky-600",
  secondary: "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 dark:bg-[#0f172a] dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-800/80 dark:hover:text-white dark:hover:border-slate-700 shadow-xs focus-visible:ring-slate-400/20 dark:focus-visible:ring-slate-500/20 active:bg-slate-100 dark:active:bg-slate-900",
  ghost: "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100 focus-visible:ring-slate-400/20 dark:focus-visible:ring-slate-500/20 active:bg-slate-200/60 dark:active:bg-slate-800",
  danger: "bg-rose-600 text-white hover:bg-rose-500 border border-rose-600 dark:bg-rose-600/90 dark:border-rose-500/40 shadow-xs focus-visible:ring-rose-500/20 active:bg-rose-700",
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
