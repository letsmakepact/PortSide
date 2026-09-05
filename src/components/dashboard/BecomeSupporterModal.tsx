"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Primitives";
import { useDashboard } from "./DashboardProvider";

const BMC_URL = "https://buymeacoffee.com/letsmakepact";

const perks = [
  {
    icon: "📡",
    title: "Zero-config local domains",
    body: "Open your projects from phones, tablets, and TVs on the same network with no setup. They resolve instantly.",
  },
  {
    icon: "📶",
    title: "Dev Wi-Fi hotspot",
    body: "Spin up a dedicated PortSide network from your PC so any device can connect directly — even without a router.",
  },
  {
    icon: "🖥️",
    title: "Official desktop app",
    body: "Supporter perks live in the PortSide desktop app. After you donate monthly, download the app and they unlock automatically.",
  },
];

export function BecomeSupporterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isSupporter, activateLicense } = useDashboard();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [key, setKey] = useState("");
  const [activating, setActivating] = useState(false);

  async function handleActivate(e: FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setActivating(true);
    const res = await activateLicense(key.trim());
    setActivating(false);
    if (res.ok) {
      setKey("");
      setShowKeyInput(false);
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Become a Supporter"
      description="Any amount, once a month. Every perk unlocks."
      size="lg"
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/80 via-orange-50/40 to-white dark:from-amber-900/40 dark:via-orange-900/20 dark:to-slate-900 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-xl text-white shadow-md shadow-orange-500/20">
              ☕
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Support PortSide monthly</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Pick any amount on Buy Me a Coffee and donate once a month. That is the whole requirement — there is no minimum and no extra tier.
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
                  <span className="text-lg">{perk.icon}</span>
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
              ⭐ You are an active PortSide supporter! All perks are unlocked.
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
              ☕ Become a supporter on Buy Me a Coffee
            </a>

            {!showKeyInput ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowKeyInput(true)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline"
                >
                  Already have a key or BMC supporter code?
                </button>
              </div>
            ) : (
              <form onSubmit={handleActivate} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2.5">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Enter Cryptographic License Key</p>
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
