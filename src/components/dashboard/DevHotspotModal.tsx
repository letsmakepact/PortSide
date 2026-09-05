"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "./DashboardProvider";
import { SupporterBadge } from "@/components/ui/SupporterBadge";

export function DevHotspotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isSupporter, openSupport } = useDashboard();
  const [active, setActive] = useState(false);
  const [ssid, setSsid] = useState("PortSide-DevNet");
  const [key, setKey] = useState("portside123");
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 font-bold text-lg">
              📶
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dev Wi-Fi Hotspot</h2>
                <SupporterBadge size="xs" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Broadcast a dedicated Wi-Fi network from your PC for device testing
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
            {active ? "● Broadcasting" : "○ Inactive"}
          </span>
        </div>

        {!serverConfirmed ? (
          <div className="mt-6 rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-white dark:from-amber-950/30 dark:via-orange-950/20 dark:to-slate-900 p-6 text-center shadow-xs">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-2xl text-white shadow-md shadow-orange-500/20">
              🔒
            </span>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Unlock Dev Wi-Fi Hotspot
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Dev Hotspot creates an isolated wireless access point directly from your development machine. Connected phones and TVs resolve your custom <code className="font-mono text-amber-600 dark:text-amber-400">*.localhost</code> domains with zero configuration, even with no local router.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => {
                  onClose();
                  openSupport();
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
              >
                ☕ Unlock with Supporter
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Broadcast State</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {active ? "Hotspot is active on 192.168.137.1" : "Turn on to allow nearby devices to connect"}
                  </p>
                </div>
                <Button
                  variant={active ? "secondary" : "primary"}
                  onClick={toggleHotspot}
                  loading={saving}
                >
                  {active ? "Stop Hotspot" : "Start Hotspot"}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Network Name (SSID)
                </label>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">{ssid}</p>
                <p className="mt-1 text-[11px] text-slate-400">Search for this Wi-Fi network on your phone or Smart TV.</p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Wi-Fi Password
                  </label>
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 font-medium"
                  >
                    {copiedKey ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {showKey ? key : "••••••••••••"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">WPA2 Personal encryption key.</p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 dark:border-amber-900/30 dark:bg-amber-950/20 p-3 text-xs text-amber-950 dark:text-amber-200">
              <span className="font-semibold">💡 Instant Access:</span> Once connected to the hotspot, open any browser on your device and navigate directly to <code className="rounded bg-amber-100/80 dark:bg-amber-900/60 px-1 font-mono text-[11px] font-bold">http://portside.local</code> or your service subdomains.
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
