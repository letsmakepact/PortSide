import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-lg border border-[#1f2937] bg-[#0b0f17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30 disabled:bg-[#111827] disabled:text-slate-600";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-[80px] resize-y", className)} {...props} />;
}
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "pr-8 bg-[#0b0f17]", className)} {...props} />;
}
export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-xs font-medium text-slate-300", className)} {...props} />;
}

export function StatusDot({ status, className }: { status: "online" | "offline" | "unknown"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full shrink-0",
        status === "online" && "bg-emerald-500",
        status === "offline" && "bg-rose-500",
        status === "unknown" && "bg-slate-600",
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
        "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium font-mono",
        status === "online" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        status === "offline" && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        status === "unknown" && "bg-slate-800 text-slate-400 border border-slate-700/50",
      )}
    >
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1f2937] bg-[#111827]/40 px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#1f2937] bg-[#0b0f17] text-slate-400 text-base">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-400 leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-[#1f2937]/50", className)} />;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border border-[#1f2937] bg-[#111827] shadow-sm", className)}>{children}</div>;
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
