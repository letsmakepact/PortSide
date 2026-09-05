"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "./DashboardProvider";

export function LanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { services } = useDashboard();
  const [lanData, setLanData] = useState<{
    lanIp: string;
    port: string;
    portalUrl: string;
    qrDataUrl: string;
    qrTarget: string;
  } | null>(null);
  const [selectedService, setSelectedService] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const query = selectedService ? `?hostname=${encodeURIComponent(selectedService)}` : "";
    fetch(`/api/lan${query}`)
      .then((r) => r.json())
      .then((d) => setLanData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, selectedService]);

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
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 font-bold text-lg">
              📱
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Mobile & TV Access</h2>
              <p className="text-xs text-slate-500">Open your websites instantly on phones, tablets & Smart TVs</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            Wi-Fi: {lanIp}
          </span>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Scan with Phone Camera
            </p>
            {lanData?.qrDataUrl ? (
              <img
                src={lanData.qrDataUrl}
                alt="QR Code for mobile access"
                className="h-48 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs text-slate-400">
                {loading ? "Generating QR code..." : "No QR code"}
              </div>
            )}
            <p className="mt-3 text-[11px] text-slate-500 max-w-[240px]">
              No configuration required. Point your phone camera to open {selectedService ? `${selectedService}` : "the mobile launchpad"} instantly.
            </p>
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Target Service
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              >
                <option value="">📱 Full Mobile Launchpad (/lan)</option>
                {services.map((s) => (
                  <option key={s.id} value={s.hostname}>
                    {s.icon} {s.name} ({s.hostname})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {!selectedService ? (
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Mobile Launchpad URL</span>
                    <button
                      type="button"
                      onClick={() => copy(portalUrl, "portal")}
                      className="text-sky-600 hover:text-sky-700 font-medium"
                    >
                      {copiedKey === "portal" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-1 font-mono text-xs text-slate-500 break-all">{portalUrl}</p>
                  <p className="mt-1 text-[11px] text-slate-400">Opens a clean touch/remote dashboard for all services.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Subdomain Address</span>
                      <button
                        type="button"
                        onClick={() => copy(wildcardSvcUrl, "wildcard")}
                        className="text-sky-600 hover:text-sky-700 font-medium"
                      >
                        {copiedKey === "wildcard" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-500 break-all">{wildcardSvcUrl}</p>
                    <p className="mt-1 text-[11px] text-slate-400">Works in any phone or TV browser without setup.</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Direct IP Path</span>
                      <button
                        type="button"
                        onClick={() => copy(directSvcUrl, "direct")}
                        className="text-sky-600 hover:text-sky-700 font-medium"
                      >
                        {copiedKey === "direct" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-500 break-all">{directSvcUrl}</p>
                    <p className="mt-1 text-[11px] text-slate-400">Direct fallback if your Wi-Fi is offline from the internet.</p>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-950">
              <span className="font-semibold">📺 On Smart TVs:</span> Open the TV browser and visit{" "}
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
