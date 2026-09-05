"use client";

import { cn } from "@/lib/utils";

export function SupporterBadge({
  size = "sm",
  className,
  showIcon = true,
}: {
  size?: "xs" | "sm" | "md";
  className?: string;
  showIcon?: boolean;
}) {
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[9px] gap-1",
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold tracking-wide uppercase rounded-full",
        "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs",
        "dark:from-amber-400 dark:to-orange-500 dark:text-slate-950",
        sizeClasses,
        className
      )}
    >
      {showIcon && <span className="text-[1.1em] leading-none">⭐</span>}
      <span>PRO</span>
    </span>
  );
}
