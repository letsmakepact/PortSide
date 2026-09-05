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
      {showIcon && (
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current shrink-0">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )}
      <span>PRO</span>
    </span>
  );
}
