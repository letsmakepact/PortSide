"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Primitives";
import { useDashboard } from "./DashboardProvider";

const BMC_URL = "https://buymeacoffee.com/pacts";

const perks = [
  {
    iconType: "domain",
    title: "Custom Subdomain",
    body: "Dedicated *.portside.lol subdomain and live developer showcase link with zero cloud setup.",
  },
  {
    iconType: "lan",
    title: "Zero-config local domains",
    body: "Open your projects from phones, tablets, and TVs on the same network with no setup. They resolve instantly.",
  },
  {
    iconType: "hotspot",
    title: "Dev Wi-Fi hotspot",
    body: "Spin up a dedicated PortSide network from your PC so any device can connect directly — even without a router.",
  },
];

export function BecomeSupporterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isSupporter, activateLicense } = useDashboard();
  const [activeSubMode, setActiveSubMode] = useState<"buttons" | "claim" | "manual">("buttons");
  const [key, setKey] = useState("");
  const [activating, setActivating] = useState(false);
  const [claimInput, setClaimInput] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  async function handleActivate(e: FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setActivating(true);
    const res = await activateLicense(key.trim());
    setActivating(false);
    if (res.ok) {
      setKey("");
      setActiveSubMode("buttons");
      onClose();
    }
  }

  async function handleClaim(e: FormEvent) {
    e.preventDefault();
    if (!claimInput.trim()) return;
    setClaiming(true);
    setClaimError(null);

    const isEmail = claimInput.includes("@");
    const payload = isEmail
      ? { email: claimInput.trim() }
      : { transactionId: claimInput.trim() };

    try {
      // 1. Hit sovereign claim endpoint on portside.lol
      const res = await fetch("https://portside.lol/api/license/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.licenseKey) {
        // 2. Automatically activate the minted license key locally
        const actRes = await activateLicense(data.licenseKey);
        if (actRes.ok) {
          setClaimInput("");
          setActiveSubMode("buttons");
          onClose();
          return;
        } else {
          setClaimError(actRes.error || "Failed to activate license key locally.");
        }
      } else {
        setClaimError(data.error || "No active supporter payment was found. Please check your Buy Me a Coffee receipt.");
      }
    } catch {
      setClaimError("Failed to reach verification server. Please check your connection.");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Become a Supporter"
      description="$4.99/mo. Every perk unlocks instantly."
      size="lg"
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/80 via-orange-50/40 to-white dark:from-amber-900/40 dark:via-orange-900/20 dark:to-slate-900 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" /></svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Support PortSide monthly — $4.99/mo</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Unlock your custom vanity subdomain (*.portside.lol), instant mobile & TV device access, dev Wi-Fi hotspot broadcasting, and unlimited routes for $4.99/mo on Buy Me a Coffee.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">What you get</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {perks.map((perk) => (
              <div key={perk.title} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-brand-surface dark:bg-brand-surface-dark p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded text-amber-500">
                    {perk.iconType === "domain" && (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                    )}
                    {perk.iconType === "lan" && (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                    )}
                    {perk.iconType === "hotspot" && (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
                    )}
                    {perk.iconType === "app" && (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                    )}
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{perk.title}</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{perk.body}</p>
              </div>
            ))}
          </div>
        </div>

        {isSupporter ? (
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/30 dark:bg-emerald-950/20 p-3.5 text-center">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              You are an active PortSide supporter! All perks are unlocked.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <a
              href={BMC_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-amber-500/25 transition hover:bg-amber-600"
            >
              Become a supporter for $4.99/mo on Buy Me a Coffee
            </a>

            {activeSubMode === "buttons" && (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setActivating(true);
                    const res = await fetch("/api/supporter/check");
                    const data = await res.json();
                    setActivating(false);
                    if (data.isSupporter) {
                      onClose();
                    } else {
                      setActiveSubMode("claim");
                    }
                  }}
                  disabled={activating}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-1.5"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                  Check / Refresh Monthly Supporter Status
                </button>

                <div className="flex items-center justify-center gap-3 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveSubMode("claim")}
                    className="font-medium text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 underline"
                  >
                    Claim with Buy Me a Coffee receipt or email
                  </button>
                  <span className="text-slate-500">&bull;</span>
                  <button
                    type="button"
                    onClick={() => setActiveSubMode("manual")}
                    className="font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline"
                  >
                    Enter license key
                  </button>
                </div>
              </div>
            )}

            {activeSubMode === "claim" && (
              <form onSubmit={handleClaim} className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Auto-Claim from Buy Me a Coffee
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSubMode("buttons")}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    Back
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Paid anonymously or with a different email? Enter the email or Receipt ID from your Buy Me a Coffee confirmation.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="BMC Email or Transaction ID"
                    value={claimInput}
                    onChange={(e) => setClaimInput(e.target.value)}
                    className="text-xs"
                    required
                  />
                  <Button type="submit" size="sm" loading={claiming} disabled={!claimInput.trim()}>
                    Claim & Unlock
                  </Button>
                </div>
                {claimError && (
                  <p className="text-[11px] text-rose-400 font-semibold">{claimError}</p>
                )}
              </form>
            )}

            {activeSubMode === "manual" && (
              <form onSubmit={handleActivate} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Enter Cryptographic License Key</p>
                  <button
                    type="button"
                    onClick={() => setActiveSubMode("buttons")}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    Back
                  </button>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="PSL1.eyJlbWFpbCI6..."
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="text-xs"
                    required
                  />
                  <Button type="submit" size="sm" loading={activating} disabled={!key.trim()}>
                    Activate
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
