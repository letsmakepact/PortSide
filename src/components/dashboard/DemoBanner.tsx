"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

export function DemoBanner({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (email !== "demo@portside.dev" || dismissed) return null;

  async function handleSwitchToRegister() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/register");
    router.refresh();
  }

  return (
    <div className="border-b border-sky-500/20 bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 px-4 py-3 text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 border border-sky-400/30">
            <AnchorLogo className="h-5 w-5" />
          </span>
          <div className="text-xs sm:text-sm">
            <span className="inline-block rounded bg-sky-500/20 px-2 py-0.5 font-semibold text-sky-300 mr-2">
              Demo Mode
            </span>
            <span className="text-slate-300">
              Exploring template services in action. Ready to name your own local servers?
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleSwitchToRegister}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-sky-600/30 hover:bg-sky-500 transition"
          >
            Create Your Free Account →
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 text-slate-400 hover:text-white transition"
            aria-label="Dismiss banner"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
