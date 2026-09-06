"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "./DashboardProvider";
import { SupporterBadge } from "@/components/ui/SupporterBadge";

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
    isSupporter?: boolean;
    serverConfirmed?: boolean;
  } | null>(null);
  const [selectedService, setSelectedService] = useState<string>("");
  const [connectionMode, setConnectionMode] = useState<"tunnel" | "lan">("tunnel");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedService) params.set("hostname", selectedService);
    params.set("mode", connectionMode);
    fetch(`/api/lan?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setLanData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, selectedService, connectionMode]);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const lanIp = lanData?.lanIp || "127.0.0.1";
  const port = lanData?.port || "80";
  const portSuffix = port === "80" || port === "443" ? "" : `:${port}`;
  const portalUrl = lanData?.portalUrl || `http://${lanIp}${portSuffix}/lan`;
  const directSvcUrl = selectedService ? `http://${lanIp}${portSuffix}/s/${selectedService}` : "";
  const wildcardSvcUrl = selectedService ? `http://${selectedService}.${lanIp}.nip.io${portSuffix}` : "";
  const localMdnsUrl = selectedService ? `http://${selectedService}.local${portSuffix}` : `http://portside.local${portSuffix}`;

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
                <SupporterBadge size="xs" />
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
            {lanData?.qrDataUrl ? (
              <img
                src={lanData.qrDataUrl}
                alt="QR Code for mobile access"
                className="h-48 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white p-2 shadow-sm"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 w-48 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-xs text-slate-400">
                <span className="text-xs font-medium text-slate-500">
                  {loading ? "Generating QR code..." : "No local address detected"}
                </span>
              </div>
            )}
            <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-[240px]">
              {connectionMode === "tunnel" && lanData?.publicTunnelUrl
                ? "Scan to open via Global Encrypted Tunnel. Works everywhere on 5G, LTE, or remote Wi-Fi."
                : `Point your phone camera to open ${selectedService ? selectedService : "the mobile launchpad"} on your local Wi-Fi.`}
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
                  onClick={() => setConnectionMode("tunnel")}
                  className={`rounded-lg py-1.5 text-xs font-semibold transition ${
                    connectionMode === "tunnel"
                      ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Global (5G / Remote)
                </button>
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
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Target Service
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Full Mobile Launchpad (/lan)</option>
                {services.map((s) => (
                  <option key={s.id} value={s.hostname}>
                    {s.name} ({s.hostname})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {!selectedService ? (
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
                  <p className="mt-1 text-[11px] text-slate-400">Mobile-friendly directory of all running services.</p>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Zero-Config LAN URL
                      </label>
                      <button
                        type="button"
                        onClick={() => copy(localMdnsUrl, "mdns")}
                        className="text-[11px] text-sky-600 hover:underline font-medium"
                      >
                        {copiedKey === "mdns" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-1 font-mono text-xs text-emerald-600 dark:text-emerald-400 break-all">{localMdnsUrl}</p>
                    <p className="mt-1 text-[11px] text-slate-400">Requires zero router or DNS setup on your local network.</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Fallback Direct IP URL
                      </label>
                      <button
                        type="button"
                        onClick={() => copy(directSvcUrl, "direct")}
                        className="text-[11px] text-sky-600 hover:underline font-medium"
                      >
                        {copiedKey === "direct" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400 break-all">{directSvcUrl}</p>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Direct fallback if your Wi-Fi is offline from the internet.</p>
                  </div>
                </>
              )}
              {lanData?.vanityDomain && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                      <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                      Permanent Branded Domain (*.portside.lol)
                    </label>
                    <button
                      type="button"
                      onClick={() => copy(`https://${lanData.vanityDomain}${selectedService ? `/s/${selectedService}` : "/lan"}`, "vanity")}
                      className="text-[11px] text-sky-700 dark:text-sky-400 hover:underline font-semibold"
                    >
                      {copiedKey === "vanity" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-1 font-mono text-xs text-sky-800 dark:text-sky-300 break-all">
                    https://{lanData.vanityDomain}{selectedService ? `/s/${selectedService}` : "/lan"}
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
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-950">
              <span className="font-semibold">On Smart TVs:</span> Open the TV browser and visit{" "}
              <code className="rounded bg-sky-100/80 px-1 font-mono text-[11px] font-semibold text-sky-900">
                http://{lanIp}{portSuffix}
              </code>{" "}
              to browse and launch all your custom web projects with your remote control.
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
