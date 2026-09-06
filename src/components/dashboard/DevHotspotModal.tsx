"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "./DashboardProvider";
import { SupporterBadge } from "@/components/ui/SupporterBadge";

export function DevHotspotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openSupport } = useDashboard();
  const [active, setActive] = useState(false);
  const [ssid, setSsid] = useState("PortSide-DevNet");
  const [key, setKey] = useState("portside123");
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [serverConfirmed, setServerConfirmed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/hotspot")
      .then((r) => r.json())
      .then((d) => {
        setServerConfirmed(Boolean(d.isSupporter && d.serverConfirmed));
        if (d.active !== undefined) setActive(d.active);
        if (d.ssid) setSsid(d.ssid);
        if (d.key && d.key !== "********") setKey(d.key);
      })
      .catch(() => {
        setServerConfirmed(false);
      })
      .finally(() => setLoading(false));
  }, [open]);

  async function toggleHotspot() {
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch("/api/hotspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active, ssid, key }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 || data.requiresSupporter) {
          setServerConfirmed(false);
          onClose();
          openSupport();
          return;
        }
      } else {
        setActive(data.active);
        setServerConfirmed(true);
        setSavedMsg(data.active ? "Hotspot broadcasting live!" : "Hotspot stopped.");
        setTimeout(() => setSavedMsg(""), 3000);
      }
    } catch {
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (key.length < 8) {
      alert("Wi-Fi password must be at least 8 characters long.");
      return;
    }
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch("/api/hotspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active, ssid, key }),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedMsg("Settings saved to machine.");
        setTimeout(() => setSavedMsg(""), 3000);
      }
    } catch {
    } finally {
      setSaving(false);
    }
  }

  function copyPassword() {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  return (
    <Modal open={open} onClose={onClose} title="" size="lg">
      <div className="relative pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 font-bold">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Device Connectivity</h2>
                <SupporterBadge size="xs" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Zero-config network routing or private isolated Wi-Fi
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
              active
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-slate-200 dark:ring-slate-700"
            }`}
          >
            {active ? "● Hotspot Active" : "○ Hotspot Off"}
          </span>
        </div>

        {!serverConfirmed ? (
          <div className="mt-6 rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-white dark:from-amber-950/30 dark:via-orange-950/20 dark:to-slate-900 p-6 text-center shadow-xs">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/20">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </span>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Unlock Multi-Device & Hotspot Perks
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Supporters get enhanced multi-device routing out of the box, plus the ability to spawn private networks directly from your workstation.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => {
                  onClose();
                  openSupport();
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
              >
                Unlock with Supporter
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Mode 1: Zero-Config LAN (Active by Default) */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Local Network Routing</p>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Nearby devices on your Wi-Fi can access active services directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode 2: Dedicated Secure Wi-Fi Hotspot */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Secure Dev Wi-Fi Hotspot</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          active
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {active ? "ACTIVE" : "OFF"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Broadcast an isolated, encrypted network when you need private testing or don&apos;t have a local router.
                    </p>
                  </div>
                </div>
                <Button
                  variant={active ? "secondary" : "primary"}
                  onClick={toggleHotspot}
                  loading={saving}
                  size="sm"
                >
                  {active ? "Stop Hotspot" : "Start Hotspot"}
                </Button>
              </div>

              {/* Wi-Fi Credentials Configuration Form */}
              <form onSubmit={saveSettings} className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    maxLength={32}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. PortSide-DevNet"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">Search for this SSID on your mobile device.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      WPA2 Password
                    </label>
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="rounded-md px-2 py-0.5 text-xs text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 hover:underline font-medium touch-action-manipulation transition"
                    >
                      {copiedKey ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="mt-1 relative flex items-center">
                    <input
                      type={showKey ? "text" : "password"}
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      minLength={8}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 pr-12"
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showKey ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">Must be at least 8 characters.</p>
                </div>

                <div className="sm:col-span-2 flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{savedMsg}</span>
                  <Button type="submit" size="sm" variant="secondary" loading={saving}>
                    Save Wi-Fi Config
                  </Button>
                </div>
              </form>
            </div>

            <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 dark:border-amber-900/30 dark:bg-amber-950/20 p-3 text-xs text-amber-950 dark:text-amber-200">
              <span className="font-semibold">Instant Access:</span> Once connected, open any browser on your device to access your custom projects directly.
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
          <Button size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
