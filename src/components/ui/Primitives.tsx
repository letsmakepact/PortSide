import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0f172a]/60 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs transition-colors focus:border-slate-400 dark:focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-sky-500/10 disabled:bg-slate-50 dark:disabled:bg-slate-900/40 disabled:text-slate-400 dark:disabled:text-slate-600";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-[80px] resize-y", className)} {...props} />;
}
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "pr-8 bg-white dark:bg-[#0f172a]", className)} {...props} />;
}
export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300", className)} {...props} />;
}

export function StatusDot({ status, className }: { status: "online" | "offline" | "unknown"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full shrink-0",
        status === "online" && "bg-emerald-500 dark:bg-emerald-400",
        status === "offline" && "bg-rose-500",
        status === "unknown" && "bg-slate-300 dark:bg-slate-600",
        className,
      )}
    />
  );
}

export function StatusBadge({ status }: { status: "online" | "offline" | "unknown" }) {
  const label = status === "online" ? "Online" : status === "offline" ? "Offline" : "Paused";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        status === "online" && "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        status === "offline" && "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
        status === "unknown" && "bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/60",
      )}
    >
      <StatusDot status={status} className="h-1.5 w-1.5" />
      {label}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0f172a]/30 px-6 py-14 text-center shadow-xs">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-[#1e293b]/50 text-slate-600 dark:text-slate-300 text-lg shadow-xs">
        {icon}
      </div>
      <h3 className="mt-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800/60", className)} />;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/70 shadow-xs backdrop-blur-xs", className)}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
