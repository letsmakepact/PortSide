"use client";

import { useEffect, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "./DashboardProvider";
import { SupporterBadge } from "@/components/ui/SupporterBadge";
import {
  Wifi,
  Radio,
  Server,
  Globe,
  Smartphone,
  Laptop,
  Tv,
  QrCode,
  Copy,
  Zap,
  SlidersHorizontal,
  ExternalLink,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DevHotspotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openSupport } = useDashboard();
  const [active, setActive] = useState(false);
  const [ssid, setSsid] = useState("PortSide-DevNet");
  const [key, setKey] = useState("portside123");
  const [customHost, setCustomHost] = useState("portside.test");
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [serverConfirmed, setServerConfirmed] = useState(false);
  const [subTab, setSubTab] = useState<"config" | "qr">("config");
  const [wifiQrUrl, setWifiQrUrl] = useState<string | null>(null);
  const [portalQrUrl, setPortalQrUrl] = useState<string | null>(null);

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
        if (d.customHost) setCustomHost(d.customHost);
      })
      .catch(() => {
        setServerConfirmed(false);
      })
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const escapeWifi = (str: string) => str.replace(/([\\;,":])/g, "\\$1");
    const wifiPayload = `WIFI:S:${escapeWifi(ssid)};T:WPA;P:${escapeWifi(key)};;`;
    QRCode.toDataURL(wifiPayload, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 280,
      color: { dark: "#0284c7", light: "#ffffff" },
    }).then(setWifiQrUrl).catch(() => {});

    QRCode.toDataURL("http://192.168.137.1/lan", {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 280,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then(setPortalQrUrl).catch(() => {});
  }, [open, ssid, key]);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      fetch("/api/hotspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "heartbeat" }),
      }).catch(() => {});
    }, 12000);

    const handleUnload = () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/hotspot",
          new Blob([JSON.stringify({ action: "teardown" })], { type: "application/json" })
        );
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [active]);

  async function toggleHotspot() {
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch("/api/hotspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active, ssid, key, customHost }),
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

  async function saveSettings(e: FormEvent) {
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
        body: JSON.stringify({ active, ssid, key, customHost }),
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

  function generateKey() {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 12; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setKey(gen);
  }

  function copyPassword() {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  return (
    <Modal open={open} onClose={onClose} title="" size="lg">
      <div className="relative pt-1 space-y-5">
        {/* HEADER COCKPIT */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl border transition-all",
                active
                  ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-400 shadow-md shadow-emerald-500/20"
                  : "border-slate-800 bg-slate-900/80 text-slate-400"
              )}
            >
              <Wifi className={cn("h-6 w-6", active && "animate-pulse")} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Dev Wi-Fi Hotspot</h2>
                <SupporterBadge size="xs" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hardware-isolated development network with custom domain routing
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 shrink-0",
              active
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-slate-200 dark:ring-slate-700"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-emerald-400 animate-pulse" : "bg-slate-400")} />
            {active ? "Broadcasting Live" : "Standby"}
          </span>
        </div>

        {!serverConfirmed ? (
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 p-6 text-center shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/20">
              <Lock className="h-6 w-6" />
            </span>
            <h3 className="mt-3 text-sm font-bold text-white">
              Unlock Dev Wi-Fi Hotspot Perks
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400 max-w-md mx-auto">
              Supporters unlock the ability to broadcast private isolated networks directly from Windows with custom DNS resolution and instant camera auto-connect.
            </p>

            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => {
                  onClose();
                  openSupport();
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Unlock with Supporter
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* TELEMETRY STRIP */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b14] p-2.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Gateway IP</span>
                <p className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-0.5">192.168.137.1</p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b14] p-2.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Custom Host</span>
                <p className="font-mono text-xs font-bold text-emerald-400 mt-0.5 truncate">*.{customHost || "portside.test"}</p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b14] p-2.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Security</span>
                <p className="font-mono text-xs font-bold text-sky-400 mt-0.5">WPA2-AES</p>
              </div>
            </div>

            {/* SUB-TABS */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSubTab("config")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer",
                  subTab === "config"
                    ? "bg-white dark:bg-[#161f30] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-[#27354a]"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Wi-Fi Config & Radio
              </button>
              <button
                type="button"
                onClick={() => setSubTab("qr")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5",
                  subTab === "qr"
                    ? "bg-white dark:bg-[#161f30] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-[#27354a]"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <QrCode className="h-3.5 w-3.5 text-sky-400" />
                <span>Camera QR Quick-Connect</span>
              </button>
            </div>

            {subTab === "config" ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070b14]/70 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Broadcast Transmitter</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Control hardware Wi-Fi AP</p>
                  </div>
                  <Button
                    variant={active ? "secondary" : "primary"}
                    onClick={toggleHotspot}
                    loading={saving}
                    size="sm"
                    className={active ? "border-rose-500/40 bg-rose-500/10 text-rose-300" : "bg-emerald-600 hover:bg-emerald-500 text-white"}
                  >
                    <Radio className="h-3.5 w-3.5 mr-1" />
                    {active ? "Stop Hotspot" : "Start Hotspot"}
                  </Button>
                </div>

                <form onSubmit={saveSettings} className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={ssid}
                      onChange={(e) => setSsid(e.target.value)}
                      maxLength={32}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="e.g. PortSide-DevNet"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        WPA2 Passphrase
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={generateKey}
                          className="text-[10px] text-amber-500 hover:text-amber-400 font-medium"
                        >
                          Generate
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          type="button"
                          onClick={copyPassword}
                          className="text-[10px] text-sky-500 hover:text-sky-400 font-medium"
                        >
                          {copiedKey ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 relative flex items-center">
                      <input
                        type={showKey ? "text" : "password"}
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        minLength={8}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 pr-12"
                        placeholder="Min 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 text-[10px] text-slate-400 hover:text-slate-200"
                      >
                        {showKey ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Hotspot TLD (Top-Level Domain)
                    </label>
                    <input
                      type="text"
                      value={customHost}
                      onChange={(e) => setCustomHost(e.target.value.toLowerCase().trim())}
                      maxLength={48}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="test"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      On connected devices: <code className="text-emerald-400 font-mono">http://&lt;service&gt;.{customHost || "test"}</code> opens projects, and <code className="text-sky-400 font-mono">http://router.{customHost || "test"}</code> opens PortSide Cockpit.
                    </p>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between pt-1">
                    <span className="text-xs font-medium text-emerald-500">{savedMsg}</span>
                    <Button type="submit" size="sm" variant="secondary" loading={saving}>
                      Save Wi-Fi Config
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070b14]/70 p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                  <div className="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                      <Wifi className="h-3.5 w-3.5 text-sky-500" />
                      1. Join Hotspot Wi-Fi
                    </h4>
                    {wifiQrUrl && (
                      <img src={wifiQrUrl} alt="Wi-Fi QR" className="h-40 w-40 rounded bg-white p-1" />
                    )}
                    <p className="mt-2 text-[11px] font-mono text-sky-500 font-bold">{ssid}</p>
                    <p className="text-[10px] text-slate-400">Scan with phone camera to auto-join</p>
                  </div>

                  <div className="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-emerald-500" />
                      2. Open LAN Cockpit
                    </h4>
                    {portalQrUrl && (
                      <img src={portalQrUrl} alt="Portal QR" className="h-40 w-40 rounded bg-white p-1" />
                    )}
                    <p className="mt-2 text-[11px] font-mono text-emerald-500 font-bold">192.168.137.1/lan</p>
                    <p className="text-[10px] text-slate-400">Universal IP route for all mobile OS</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Multi-Platform Access Notes:</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    • <strong>Android & Smart TVs:</strong> Always use <code className="text-sky-500 font-mono">http://192.168.137.1/lan</code> or wildcard <code className="text-sky-500 font-mono">&lt;service&gt;.192.168.137.1.nip.io</code>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    • <strong>iOS & macOS:</strong> Supports <code className="text-emerald-500 font-mono">http://portside.local</code> (Bonjour mDNS) and custom domains
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
          <Button size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
