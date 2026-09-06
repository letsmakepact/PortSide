"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "./DashboardProvider";
import { AnchorLogo } from "@/components/ui/AnchorLogo";
import { Smartphone, Globe, Copy, Check, ExternalLink, Sparkles, Tv, Lock } from "lucide-react";

export function LanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { services, isSupporter: contextIsSupporter } = useDashboard();
  const [lanData, setLanData] = useState<{
    lanIp: string;
    port: string;
    portalUrl: string;
    publicTunnelUrl?: string;
    vanityDomain?: string;
    brandedUrl?: string;
    urls?: {
      lanIp: string;
      localMdnsUrl?: string | null;
      portalLocalUrl?: string | null;
      subdomainUrl: string;
      directUrl: string;
      portalUrl: string;
    };
    qrDataUrl: string;
    qrTarget: string;
    requiresCustomUrl?: boolean;
    isSupporter?: boolean;
  } | null>(null);

  const [selectedService, setSelectedService] = useState<string>("");
  const [connectionMode, setConnectionMode] = useState<"lan" | "tunnel">("lan");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customHandle, setCustomHandle] = useState<string>("");
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [, setLoading] = useState(false);

  useEffect(() => {
    if (open && !selectedService && services.length > 0) {
      setSelectedService(services[0].hostname);
    }
  }, [open, services, selectedService]);

  const activeHostname = selectedService === "__lan__" ? "" : selectedService;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (activeHostname) params.set("hostname", activeHostname);
    params.set("mode", connectionMode);
    if (customHandle) params.set("domain", customHandle);

    fetch(`/api/lan?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setLanData(d);
        if (!customHandle && d.vanityDomain) {
          const rawHandle = d.vanityDomain.replace(".portside.lol", "");
          setCustomHandle(rawHandle);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, activeHostname, connectionMode, customHandle]);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const isSupporter = Boolean(lanData?.isSupporter ?? contextIsSupporter);
  const lanIp = lanData?.lanIp || "127.0.0.1";
  const port = lanData?.port || "80";
  const portSuffix = port === "80" || port === "443" ? "" : `:${port}`;
  const portalUrl = lanData?.portalUrl || `http://${lanIp}${portSuffix}/lan`;
  const directSvcUrl = activeHostname ? `http://${lanIp}${portSuffix}/s/${activeHostname}` : portalUrl;

  const localMdnsUrl = activeHostname
    ? `http://${activeHostname}.local${portSuffix}`
    : `http://portside.local${portSuffix}`;

  const vanityDomain = lanData?.vanityDomain || (customHandle ? `${customHandle}.portside.lol` : "pact.portside.lol");
  const portsideRedirectUrl = activeHostname
    ? `https://${vanityDomain}/s/${activeHostname}`
    : `https://${vanityDomain}/lan`;

  const activeQrTarget = lanData?.qrTarget ? lanData.qrTarget.split("?")[0] : "";

  return (
    <Modal open={open} onClose={onClose} title="" size="lg">
      <div className="relative pt-1 text-slate-100">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-400 shadow-md shadow-sky-500/10 shrink-0">
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Mobile & TV Access</h2>
                {isSupporter && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    <Sparkles className="h-3 w-3" />
                    SUPPORTER
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Open active dev services seamlessly on phones, tablets & Smart TVs</p>
            </div>
          </div>
          <span className="self-start sm:self-auto rounded-full bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
            Wi-Fi: {lanIp}
          </span>
        </div>

        {/* Body Content */}
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          {/* Left: QR Code Card */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-[#080e1a] p-5 text-center shadow-inner">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              <span>
                {connectionMode === "tunnel" ? "Scan 5G / Remote Link" : "Scan with Phone Camera"}
              </span>
            </div>

            {connectionMode === "tunnel" && !isSupporter ? (
              <div className="flex flex-col items-center justify-center h-48 w-48 rounded-2xl border border-amber-500/20 bg-amber-950/15 p-4 text-center">
                <Lock className="h-8 w-8 text-amber-400 mb-2" />
                <span className="text-xs font-bold text-amber-300">Supporter Feature</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Remote access requires an active Supporter plan.
                </p>
              </div>
            ) : lanData?.qrDataUrl ? (
              <div className="relative inline-flex items-center justify-center p-2 rounded-2xl bg-white shadow-xl">
                <img
                  src={lanData.qrDataUrl}
                  alt="Portside Mobile QR Code"
                  className="h-44 w-44 rounded-xl"
                />
                {/* Center Anchor Emblem with clean quiet zone ring */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#081426] border border-sky-400 shadow-md shadow-sky-500/30 p-1.5 ring-4 ring-white">
                    <AnchorLogo className="h-full w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 w-48 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400">
                <div className="h-8 w-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mb-2" />
                <span className="font-semibold text-slate-300">Generating QR code...</span>
              </div>
            )}

            <div className="mt-3.5 max-w-[240px]">
              <p className="font-mono text-[11px] text-sky-400 truncate font-semibold" title={activeQrTarget}>
                {connectionMode === "tunnel" && !isSupporter
                  ? "Supporter Locked"
                  : activeQrTarget || "Connecting..."}
              </p>
              <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                {connectionMode === "tunnel"
                  ? isSupporter
                    ? "Remote redirect. Connect seamlessly from external devices."
                    : "Upgrade to Supporter to enable remote links."
                  : isSupporter
                  ? "Local Wi-Fi redirect (.local for iOS & Apple Bonjour). Point camera to launch."
                  : "Local Wi-Fi redirect. Point your camera to launch immediately."}
              </p>
            </div>
          </div>

          {/* Right: Controls & Routing Details */}
          <div className="flex flex-col justify-between space-y-4">
            {/* Mode Switcher */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Connection Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-900 border border-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setConnectionMode("lan")}
                  className={`rounded-lg py-2 text-xs font-semibold transition touch-action-manipulation ${
                    connectionMode === "lan"
                      ? "bg-slate-800 text-sky-400 shadow-xs border border-slate-700/60"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Local Wi-Fi
                </button>
                <button
                  type="button"
                  onClick={() => setConnectionMode("tunnel")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition touch-action-manipulation ${
                    connectionMode === "tunnel"
                      ? "bg-slate-800 text-sky-400 shadow-xs border border-slate-700/60"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Remote Access</span>
                </button>
              </div>
            </div>

            {/* Target Service Selection */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Target Project / Service
              </label>
              <div className="relative">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 pr-9 font-medium"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.hostname}>
                      {s.name} ({s.hostname}) &mdash; Direct Project Redirect
                    </option>
                  ))}
                  <option value="__lan__">
                    Personal Launchpad Dashboard (/lan) {isSupporter ? "(Active)" : "[Supporter Perk]"}
                  </option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* TAB 1: GLOBAL 5G / REMOTE -> Shows Custom portside.lol Link */}
            {connectionMode === "tunnel" && (
              isSupporter ? (
                <div className="rounded-xl border border-sky-500/30 bg-sky-950/25 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-sky-400" />
                      Custom portside.lol Link
                    </span>
                    <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-400/30">
                      PERMANENT
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingHandle ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={customHandle}
                          onChange={(e) => setCustomHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          placeholder="your-subdomain"
                          className="flex-1 rounded-lg border border-sky-500/40 bg-slate-900 px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                        <span className="text-xs font-mono text-slate-400">.portside.lol</span>
                        <Button size="sm" onClick={() => setIsEditingHandle(false)} className="h-7 px-2.5 text-xs">
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-xs text-sky-300 font-semibold break-all">
                          {portsideRedirectUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingHandle(true)}
                          className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium ml-2 shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => copy(portsideRedirectUrl, "portside-lol")}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition touch-action-manipulation"
                    >
                      {copiedKey === "portside-lol" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedKey === "portside-lol" ? "Copied!" : "Copy portside.lol Link"}</span>
                    </button>
                    <a
                      href={portsideRedirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                    >
                      <span>Open</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Permanent remote link. Connect seamlessly from any network.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                    <Lock className="h-4 w-4" />
                    <span>Supporter Plan Required</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Custom branded domains and remote access are reserved for Portside Supporters.
                  </p>
                  <a
                    href="https://buymeacoffee.com/pacts"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 transition shadow-md shadow-amber-500/20"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Unlock Supporter Plan</span>
                  </a>
                </div>
              )
            )}

            {/* TAB 2: LOCAL WI-FI -> Shows iOS .local (IF SUPPORTER) & Direct Wi-Fi */}
            {connectionMode === "lan" && (
              <div className="space-y-3">
                {/* Dedicated iOS .local Card (SUPPORTER ONLY) */}
                {isSupporter && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                        iOS & Apple Devices (.local)
                      </span>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                        DIRECT LINK
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-emerald-300 font-bold break-all">
                        {localMdnsUrl}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => copy(localMdnsUrl, "local-mdns")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition touch-action-manipulation"
                      >
                        {copiedKey === "local-mdns" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedKey === "local-mdns" ? "Copied!" : "Copy .local Link"}</span>
                      </button>
                      <a
                        href={localMdnsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                      >
                        <span>Open</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Direct device connection. Opens immediately on your mobile device without typing IP addresses.
                    </p>
                  </div>
                )}

                {/* Direct Project Wi-Fi URL (Standard / Universal) */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Direct Project Wi-Fi URL</span>
                    <button
                      type="button"
                      onClick={() => copy(directSvcUrl, "direct")}
                      className="text-sky-400 hover:underline font-medium text-[11px] touch-action-manipulation"
                    >
                      {copiedKey === "direct" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="font-mono text-slate-300 break-all">{directSvcUrl}</p>
                  <p className="text-[10px] text-slate-500">Universal route for Android, Windows, and Linux devices on your Wi-Fi.</p>
                </div>

                {/* Smart TV Remote Callout */}
                <div className="rounded-xl border border-sky-900/40 bg-sky-950/20 p-3 text-xs text-sky-200">
                  <div className="flex items-center gap-1.5 font-semibold text-sky-400 mb-1">
                    <Tv className="h-3.5 w-3.5" />
                    <span>On Smart TVs (LG, Samsung, Android TV):</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Open your TV browser and visit{" "}
                    <code className="rounded bg-sky-900/60 border border-sky-500/30 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-sky-200">
                      {`http://${lanIp}${portSuffix}/s/${activeHostname || "your-project"}`}
                    </code>{" "}
                    to launch directly with your remote control.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-800 pt-4">
          <Button size="sm" onClick={onClose} className="px-5">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
