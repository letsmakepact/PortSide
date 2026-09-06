"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "./DashboardProvider";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

export function LanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { services, isSupporter, openSupport } = useDashboard();
  const [lanData, setLanData] = useState<{
    lanIp: string;
    port: string;
    portalUrl: string;
    publicTunnelUrl?: string;
    vanityDomain?: string;
    brandedUrl?: string;
    qrDataUrl: string;
    qrTarget: string;
    requiresCustomUrl?: boolean;
    isSupporter?: boolean;
  } | null>(null);
  
  // Default to the first service so free users get instant direct QR redirects
  const [selectedService, setSelectedService] = useState<string>("");
  const [connectionMode, setConnectionMode] = useState<"tunnel" | "lan">("lan");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !selectedService && services.length > 0) {
      if (!isSupporter) {
        setSelectedService(services[0].hostname);
      }
    }
  }, [open, services, isSupporter, selectedService]);

  const isLanDashboardSelected = selectedService === "__lan__" || (!selectedService && isSupporter);
  const activeHostname = selectedService === "__lan__" ? "" : selectedService;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (activeHostname) params.set("hostname", activeHostname);
    params.set("mode", connectionMode);
    fetch(`/api/lan?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setLanData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, activeHostname, connectionMode]);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const lanIp = lanData?.lanIp || "127.0.0.1";
  const port = lanData?.port || "80";
  const portSuffix = port === "80" || port === "443" ? "" : `:${port}`;
  const portalUrl = lanData?.portalUrl || `http://${lanIp}${portSuffix}/lan`;
  const directSvcUrl = activeHostname ? `http://${lanIp}${portSuffix}/s/${activeHostname}` : "";
  const wildcardSvcUrl = activeHostname ? `http://${activeHostname}.${lanIp}.nip.io${portSuffix}` : "";
  const localMdnsUrl = activeHostname ? `http://${activeHostname}.local${portSuffix}` : `http://portside.local${portSuffix}`;

  const hasCustomUrl = Boolean(lanData?.vanityDomain || lanData?.publicTunnelUrl);
  const is5GUnlocked = Boolean(isSupporter || lanData?.isSupporter || hasCustomUrl);

  return (
    <Modal open={open} onClose={onClose} title="" size="lg">
      <div className="relative pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 font-bold">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mobile & TV Access</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Open your websites instantly on phones, tablets & Smart TVs</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800">
            Wi-Fi: {lanIp}
          </span>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Scan with Phone Camera
            </p>
            {connectionMode === "tunnel" && !is5GUnlocked ? (
              <div className="flex flex-col items-center justify-center h-48 w-48 rounded-xl border border-dashed border-sky-400/50 bg-sky-50/50 dark:bg-sky-950/20 p-4 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 mb-2 border border-sky-500/20">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                </span>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Custom URL Required
                </span>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Global 5G access requires a permanent custom URL (*.portside.lol).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openSupport();
                  }}
                  className="mt-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1 text-[11px] font-semibold text-white shadow-xs transition"
                >
                  Get Custom 5G URL
                </button>
              </div>
            ) : isLanDashboardSelected && !isSupporter ? (
              <div className="flex flex-col items-center justify-center h-48 w-48 rounded-xl border border-dashed border-sky-400/50 bg-sky-50/50 dark:bg-sky-950/20 p-4 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 mb-2 border border-sky-500/20">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </span>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Dashboard is a Supporter Perk
                </span>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Free tier includes direct project redirects below.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (services.length > 0) setSelectedService(services[0].hostname);
                  }}
                  className="mt-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white shadow-xs transition"
                >
                  Use Free Project Redirect
                </button>
              </div>
            ) : lanData?.qrDataUrl ? (
              <div className="relative inline-flex items-center justify-center">
                <img
                  src={lanData.qrDataUrl}
                  alt="QR Code for mobile access"
                  className="h-48 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white p-2 shadow-sm"
                />
                {/* Custom center anchor emblem with clean quiet zone ring */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#081426] border border-sky-400 shadow-md shadow-sky-500/30 p-1.5 ring-4 ring-white dark:ring-white">
                    <AnchorLogo className="h-full w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  {loading ? "Generating QR code..." : "Loading..."}
                </span>
              </div>
            )}
            <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-[240px]">
              {connectionMode === "tunnel"
                ? is5GUnlocked
                  ? "Scan to open via Global Encrypted Tunnel. Works everywhere on 5G, LTE, or remote Wi-Fi."
                  : "Local Wi-Fi QR scanning remains 100% free with direct project redirects."
                : activeHostname
                ? `Scan to open ${activeHostname} directly on your phone or TV.`
                : `Point your phone camera to open the mobile launchpad on your local Wi-Fi.`}
            </p>
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Connection Mode
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 p-1">
                <button
                  type="button"
                  onClick={() => setConnectionMode("lan")}
                  className={`rounded-lg py-1.5 text-xs font-semibold transition ${
                    connectionMode === "lan"
                      ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Local Wi-Fi Only
                </button>
                <button
                  type="button"
                  onClick={() => setConnectionMode("tunnel")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                    connectionMode === "tunnel"
                      ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>Global (5G / Remote)</span>
                  <span className="rounded bg-sky-500/15 px-1 py-0.2 text-[9px] font-bold text-sky-600 dark:text-sky-400 border border-sky-500/30">
                    PAID
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Target Project / Service
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.hostname}>
                    {s.name} ({s.hostname}) &mdash; Free Direct Redirect
                  </option>
                ))}
                <option value="__lan__">
                  Personal Launchpad Dashboard (/lan) {isSupporter ? "(Active)" : "[Supporter Perk]"}
                </option>
              </select>
            </div>

            <div className="space-y-3">
              {connectionMode === "tunnel" && !is5GUnlocked ? (
                <div className="rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                      Permanent Domain (*.portside.lol)
                    </span>
                    <span className="rounded bg-sky-600/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400 border border-sky-500/30">
                      PAID / PRO
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Local IP addresses (<span className="font-mono text-[11px]">${lanIp}</span>) only function within your home Wi-Fi router. 5G global access requires a custom permanent <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold">*.portside.lol</span> domain to route live cellular traffic anywhere in the world.
                  </p>
                  <div className="pt-1">
                    <Button
                      size="sm"
                      onClick={() => {
                        onClose();
                        openSupport();
                      }}
                      className="w-full text-xs"
                    >
                      Unlock Custom URL (Supporters)
                    </Button>
                  </div>
                </div>
              ) : connectionMode === "tunnel" && is5GUnlocked ? (
                <>
                  {lanData?.vanityDomain && (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                          <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                          Permanent Branded Domain (*.portside.lol)
                        </label>
                        <button
                          type="button"
                          onClick={() => copy(`https://${lanData.vanityDomain}${activeHostname ? `/s/${activeHostname}` : "/lan"}`, "vanity")}
                          className="text-[11px] text-sky-700 dark:text-sky-400 hover:underline font-semibold"
                        >
                          {copiedKey === "vanity" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="mt-1 font-mono text-xs text-sky-800 dark:text-sky-300 break-all">
                        https://${lanData.vanityDomain}${activeHostname ? `/s/${activeHostname}` : "/lan"}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        Your personal permanent address. Works globally on 5G and any network.
                      </p>
                    </div>
                  )}
                  {lanData?.publicTunnelUrl && !lanData?.vanityDomain && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Global Remote Access (Anywhere / 5G)
                        </label>
                        <button
                          type="button"
                          onClick={() => copy(lanData.publicTunnelUrl!, "tunnel")}
                          className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                        >
                          {copiedKey === "tunnel" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="mt-1 font-mono text-xs text-emerald-800 dark:text-emerald-300 break-all">{lanData.publicTunnelUrl}</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Access from anywhere on cellular data or remote Wi-Fi networks.</p>
                    </div>
                  )}
                </>
              ) : isLanDashboardSelected ? (
                <>
                  {isSupporter ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Mobile Launchpad URL
                        </label>
                        <button
                          type="button"
                          onClick={() => copy(portalUrl, "portal")}
                          className="text-[11px] text-sky-600 hover:underline font-medium"
                        >
                          {copiedKey === "portal" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="mt-1 font-mono text-xs text-sky-600 dark:text-sky-400 break-all">{portalUrl}</p>
                      <p className="mt-1 text-[11px] text-slate-400">Supporter feature: Full multi-service interactive launchpad.</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                          Personal Dashboard (Supporter Perk)
                        </span>
                        <span className="rounded bg-sky-600/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400 border border-sky-500/30">
                          SUPPORTERS
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        The multi-service mobile launchpad dashboard is reserved for Supporters. Free tier users get unlimited direct project redirects.
                      </p>
                      <div className="pt-1">
                        <Button
                          size="sm"
                          onClick={() => {
                            onClose();
                            openSupport();
                          }}
                          className="w-full text-xs"
                        >
                          Unlock Personal Dashboard
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Free Direct Project URL
                      </label>
                      <button
                        type="button"
                        onClick={() => copy(directSvcUrl, "direct")}
                        className="text-[11px] text-sky-600 hover:underline font-medium"
                      >
                        {copiedKey === "direct" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-1 font-mono text-xs text-emerald-600 dark:text-emerald-400 break-all">{directSvcUrl}</p>
                    <p className="mt-1 text-[11px] text-slate-400">Direct project redirect on your local Wi-Fi. 100% Free.</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Wildcard Subdomain Redirect
                      </label>
                      <button
                        type="button"
                        onClick={() => copy(wildcardSvcUrl, "wildcard")}
                        className="text-[11px] text-sky-600 hover:underline font-medium"
                      >
                        {copiedKey === "wildcard" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400 break-all">{wildcardSvcUrl}</p>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Works directly in any mobile or Smart TV browser.</p>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-900/60 p-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Clean Domain on Other Devices (.local / .localhost)</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                        {isSupporter ? "Active" : "Supporter Perk"}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{localMdnsUrl}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {isSupporter
                        ? "Active! Zero-config local domain works across all devices on your Wi-Fi."
                        : "Supporters can use clean .local / .localhost domains on other devices without typing IP numbers."}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-950">
              <span className="font-semibold">On Smart TVs:</span> Open the TV browser and visit{" "}
              <code className="rounded bg-sky-100/80 px-1 font-mono text-[11px] font-semibold text-sky-900">
                http://${lanIp}${portSuffix}/s/${activeHostname || "your-project"}
              </code>{" "}
              to launch your project directly with your remote control.
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <Button size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
