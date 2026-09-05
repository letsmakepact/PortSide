"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Toast = { id: number; title: string; description?: string; tone: "success" | "error" | "info" };
type ToastInput = Omit<Toast, "id">;

const ToastContext = createContext<{ toast: (t: ToastInput) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((t: ToastInput) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3500);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "animate-fade-up pointer-events-auto rounded-xl border bg-white/95 dark:bg-[#0f172a]/95 dark:border-slate-800 p-3.5 shadow-lg shadow-slate-900/10 backdrop-blur",
              t.tone === "success" && "border-emerald-200 dark:border-emerald-800/60",
              t.tone === "error" && "border-rose-200 dark:border-rose-800/60",
              t.tone === "info" && "border-slate-200 dark:border-slate-800",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                  t.tone === "success" && "bg-emerald-500",
                  t.tone === "error" && "bg-rose-500",
                  t.tone === "info" && "bg-indigo-500",
                )}
              >
                {t.tone === "success" ? "✓" : t.tone === "error" ? "!" : "i"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{t.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}
