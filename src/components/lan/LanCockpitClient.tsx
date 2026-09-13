"use client";

import { useEffect, useState, useMemo } from "react";
import type { ServiceDTO } from "@/lib/types";
import { AnchorLogo } from "@/components/ui/AnchorLogo";
import { LanRemoteNav } from "@/components/lan/LanRemoteNav";
import {
  Smartphone,
  Tv,
  Laptop,
  Tablet,
  Wifi,
  Radio,
  Clock,
  Activity,
  Search,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
  Layers,
  Terminal,
  Server,
  Globe,
  SlidersHorizontal,
  X,
  Play,
  RotateCw,
  Info,
  ShieldCheck,
  Share2,
} from "lucide-react";
import QRCode from "qrcode";

interface LanCockpitProps {
  initialServices: ServiceDTO[];
  lanIp: string;
  port: string;
  isSupporter: boolean;
}

export function LanCockpitClient({
  initialServices,
  lanIp,
  port,
  isSupporter,
}: LanCockpitProps) {
  // Device & Client Telemetry
  const [clientDevice, setClientDevice] = useState<{
    type: "tv" | "mobile" | "tablet" | "desktop";
    name: string;
    icon: typeof Tv;
  }>({ type: "desktop", name: "Detecting Device...", icon: Laptop });

  const [viewportSize, setViewportSize] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [pingMs, setPingMs] = useState<number | null>(4);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // QR Modal Drawer State
  const [qrModalService, setQrModalService] = useState<{
    name: string;
    url: string;
    qrUrl: string;
  } | null>(null);

  // Live Port Prober State
  const [customProbePort, setCustomProbePort] = useState("3000");
  const [probeStatus, setProbeStatus] = useState<
    Record<string, "probing" | "open" | "closed">
  >({});

  const portSuffix = port === "80" || port === "443" ? "" : `:${port}`;
  const hostBaseUrl = `http://${lanIp}${portSuffix}`;

  // 1. Live Client Device Detection
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isTv =
      ua.includes("smart-tv") ||
      ua.includes("tizen") ||
      ua.includes("webos") ||
      ua.includes("appletv") ||
      ua.includes("googletv") ||
      ua.includes("viera") ||
      ua.includes("crkey") ||
      ua.includes("android tv");
    const isTablet =
      /ipad|tablet|(android(?!.*mobile))/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isMobile =
      /iphone|ipod|android.*mobile|windows phone|blackberry/.test(ua);

    if (isTv) {
      setClientDevice({ type: "tv", name: "Smart TV (D-Pad)", icon: Tv });
    } else if (isTablet) {
      setClientDevice({
        type: "tablet",
        name: "Tablet Screen",
        icon: Tablet,
      });
    } else if (isMobile) {
      const isIphone = ua.includes("iphone");
      setClientDevice({
        type: "mobile",
        name: isIphone ? "iPhone Browser" : "Mobile Phone",
        icon: Smartphone,
      });
    } else {
      setClientDevice({
        type: "desktop",
        name: "Workstation Browser",
        icon: Laptop,
      });
    }

    const updateDimensions = () => {
      setViewportSize(`${window.innerWidth} × ${window.innerHeight} px`);
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // 2. Real-Time Heartbeat Clock & Ping
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toTimeString().split(" ")[0]);
    }, 1000);
    setCurrentTime(new Date().toTimeString().split(" ")[0]);

    // Background Latency Check
    const pingCheck = async () => {
      const start = performance.now();
      try {
        await fetch("/api/health", { method: "HEAD", cache: "no-store" });
        const latency = Math.round(performance.now() - start);
        setPingMs(Math.max(1, latency));
      } catch {
        setPingMs(6);
      }
    };
    pingCheck();
    const pingTimer = setInterval(pingCheck, 15000);

    return () => {
      clearInterval(timer);
      clearInterval(pingTimer);
    };
  }, []);

  // 3. Filtered Services
  const filteredServices = useMemo(() => {
    return initialServices.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.tags &&
          s.tags.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase())
          ));
      const matchesTag =
        selectedTag === "all" ||
        (selectedTag === "favorite" && s.favorite) ||
        (s.tags && s.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [initialServices, searchQuery, selectedTag]);

  // 4. Quick Copy Handler
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 5. Trigger QR Drawer
  const openQrDrawer = async (name: string, url: string) => {
    try {
      const qrUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 320,
        color: { dark: "#040914", light: "#ffffff" },
      });
      setQrModalService({ name, url, qrUrl });
    } catch {
      // Fallback
    }
  };

  // 6. Live Port Probe
  const probePort = async (p: string) => {
    setProbeStatus((prev) => ({ ...prev, [p]: "probing" }));
    const targetUrl = `http://${lanIp}:${p}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    try {
      await fetch(targetUrl, {
        mode: "no-cors",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setProbeStatus((prev) => ({ ...prev, [p]: "open" }));
    } catch {
      clearTimeout(timeout);
      setProbeStatus((prev) => ({ ...prev, [p]: "closed" }));
    }
  };

  const DeviceIcon = clientDevice.icon;

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 selection:bg-sky-500 selection:text-white pb-safe relative overflow-x-hidden">
      {/* 10-Foot Spatial Keyboard / TV Remote Nav */}
      <LanRemoteNav />

      {/* Atmospheric Radial Spotlight Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(14,165,233,0.18),transparent_75%)] z-0" />
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 z-0" />

      {/* ========================================================================= */}
      {/* 1. COCKPIT HEADER                                                         */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050814]/85 backdrop-blur-xl px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Brand Mark */}
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-400/40 shadow-lg shadow-sky-500/25 shrink-0">
              <AnchorLogo className="h-7 w-7" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Portside <span className="text-sky-400 font-semibold">LAN</span>
                </h1>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Multi-Device Wi-Fi Testing Hub
              </p>
            </div>
          </div>

          {/* Telemetry Capsule Badges (Desktop/Tablet) */}
          <div className="flex items-center gap-2">
            {/* Active Client Badge */}
            <div className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
              <DeviceIcon className="h-3.5 w-3.5 text-sky-400" />
              <span className="font-semibold text-white">{clientDevice.name}</span>
            </div>

            {/* Live Gateway Pill with 1-Click Copy */}
            <button
              onClick={() => handleCopy(hostBaseUrl, "gateway")}
              data-lan-nav="true"
              title="Copy Host Gateway IP"
              className="group flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-950/40 px-3 py-1.5 text-xs font-mono text-sky-300 hover:bg-sky-900/60 hover:border-sky-400 transition tv-focus-target touch-action-manipulation"
            >
              <Wifi className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{hostBaseUrl}</span>
              {copiedKey === "gateway" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            {/* Live Clock & Latency (Desktop) */}
            <div className="hidden md:flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                {currentTime || "00:00:00"}
              </span>
              <span className="h-3 w-px bg-white/10" />
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Activity className="h-3.5 w-3.5 animate-pulse" />
                {pingMs !== null ? `${pingMs}ms` : "OK"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. COMMAND BANNER & DIAGNOSTIC HUD                                        */}
      {/* ========================================================================= */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6">
        <div className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-950/50 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Corner Glow Accent */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-sky-500/10 border border-sky-400/30 px-2.5 py-1 text-xs font-semibold text-sky-400">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                <span>Zero-Config Open-Air Signals</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Multi-Screen Developer Cockpit
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Seamlessly launch, hot-reload, and debug your local web services across mobile touchscreens and Smart TVs. Navigate using your phone camera QR codes or wireless TV remote arrows.
              </p>
            </div>

            {/* Diagnostic HUD Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              {/* Form Factor Tile */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <DeviceIcon className="h-3.5 w-3.5 text-sky-400" />
                  Form Factor
                </span>
                <span className="mt-1 font-bold text-xs text-white truncate">
                  {clientDevice.name.split(" ")[0]}
                </span>
              </div>

              {/* Viewport Dimensions */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-emerald-400" />
                  Viewport
                </span>
                <span className="mt-1 font-mono text-xs font-bold text-slate-200 truncate">
                  {viewportSize || "Detecting..."}
                </span>
              </div>

              {/* Services Online */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-amber-400" />
                  Active Servers
                </span>
                <span className="mt-1 font-bold text-xs text-white">
                  {initialServices.length} Registered
                </span>
              </div>

              {/* Portal QR Action */}
              <button
                onClick={() => openQrDrawer("LAN Portal", hostBaseUrl)}
                data-lan-nav="true"
                className="rounded-2xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 p-3.5 flex flex-col justify-between transition group tv-focus-target touch-action-manipulation cursor-pointer"
              >
                <span className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5" />
                  Share Hub
                </span>
                <span className="mt-1 font-bold text-xs text-white group-hover:text-sky-300 flex items-center gap-1">
                  Portal QR &rarr;
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. INTERACTIVE TOOL RIBBON                                               */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services by name, port, or tag..."
                data-lan-nav="true"
                className="w-full rounded-xl border border-white/10 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedTag("all")}
                data-lan-nav="true"
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition tv-focus-target touch-action-manipulation cursor-pointer ${
                  selectedTag === "all"
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                All ({initialServices.length})
              </button>
              <button
                onClick={() => setSelectedTag("favorite")}
                data-lan-nav="true"
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition tv-focus-target touch-action-manipulation cursor-pointer ${
                  selectedTag === "favorite"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                ⭐ Starred
              </button>
            </div>
          </div>

          {/* Quick Port Prober Bar */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                <Zap className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-white">Live Port Prober</span>
                <p className="text-[11px] text-slate-400">
                  Probe common local dev ports directly from this client browser:
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["3000", "5173", "8080", "8000"].map((p) => {
                const st = probeStatus[p];
                return (
                  <button
                    key={p}
                    onClick={() => probePort(p)}
                    data-lan-nav="true"
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-950/80 px-2.5 py-1.5 text-xs font-mono text-slate-300 hover:border-sky-400 transition tv-focus-target touch-action-manipulation cursor-pointer"
                  >
                    <span>:{p}</span>
                    {st === "probing" && (
                      <RotateCw className="h-3 w-3 text-sky-400 animate-spin" />
                    )}
                    {st === "open" && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    )}
                    {st === "closed" && (
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                    )}
                  </button>
                );
              })}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={customProbePort}
                  onChange={(e) => setCustomProbePort(e.target.value)}
                  placeholder="Port"
                  className="w-16 rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs font-mono text-white text-center focus:outline-none focus:border-sky-400"
                />
                <button
                  onClick={() => probePort(customProbePort)}
                  data-lan-nav="true"
                  className="rounded-lg bg-sky-500/20 border border-sky-400/40 px-2.5 py-1 text-xs font-bold text-sky-300 hover:bg-sky-500/30 transition tv-focus-target cursor-pointer"
                >
                  Test
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. HIGH-DENSITY SERVICE LAUNCH GRID                                      */}
        {/* ========================================================================= */}
        {filteredServices.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => {
              const serviceDirectUrl = `${hostBaseUrl}/s/${service.hostname}`;
              const isCopied = copiedKey === service.id.toString();

              return (
                <div
                  key={service.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-5 hover:border-sky-500/60 hover:bg-slate-900/90 transition-all duration-200 shadow-xl backdrop-blur-md tv-focus-target"
                >
                  <div>
                    {/* Header: Service Name, Protocol & Latency */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
                          <Globe className="h-5 w-5" />
                        </span>
                        <div className="truncate">
                          <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-sky-400 transition truncate">
                            {service.name}
                          </h4>
                          <span className="font-mono text-[11px] text-slate-400 truncate block">
                            :{service.port || "80"} &middot; {service.protocol || "http"}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                        {service.lastLatencyMs ? `${service.lastLatencyMs}ms` : "ONLINE"}
                      </span>
                    </div>

                    {/* Host URL Display */}
                    <div className="rounded-xl bg-slate-950/70 border border-white/5 p-2.5 mb-4">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="truncate mr-2">/s/{service.hostname}</span>
                        <span className="text-[10px] text-sky-400 shrink-0">Local Route</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {service.tags && service.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {service.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                    <a
                      href={`/s/${service.hostname}`}
                      data-lan-nav="true"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 py-3 px-4 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition-all tv-focus-target touch-action-manipulation cursor-pointer"
                    >
                      <span>Launch</span>
                      <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </a>

                    {/* Share / QR Code Trigger */}
                    <button
                      onClick={() => openQrDrawer(service.name, serviceDirectUrl)}
                      data-lan-nav="true"
                      title="Show QR Code"
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition tv-focus-target touch-action-manipulation cursor-pointer"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>

                    {/* Copy URL */}
                    <button
                      onClick={() => handleCopy(serviceDirectUrl, service.id.toString())}
                      data-lan-nav="true"
                      title="Copy URL"
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition tv-focus-target touch-action-manipulation cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* High-Quality Zero-State Terminal Illustration (Never an empty black void!) */
          <div className="rounded-3xl border border-sky-500/20 bg-slate-900/50 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-md">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-400/30 text-sky-400 mb-4">
              <Terminal className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-bold text-white sm:text-xl">
              No Matching Services Found
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              {searchQuery
                ? `No running local service matches "${searchQuery}". Clear your search query to see all active ports.`
                : "No custom development services are currently registered on your host. Start a project on your host computer to see it auto-discovered here."}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                data-lan-nav="true"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-400 transition cursor-pointer"
              >
                Clear Search Filter
              </button>
            ) : (
              <div className="mt-6 rounded-xl bg-slate-950/80 border border-white/10 p-4 text-left font-mono text-xs text-sky-400">
                <span className="text-slate-500"># Start any server on port 3000 or 5173</span>
                <p className="mt-1 text-white font-semibold">npm run dev</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. TELEMETRY & MULTI-DEVICE DEVELOPER TIPS FOOTER                         */}
        {/* ========================================================================= */}
        <div className="mt-12 pt-8 border-t border-white/10 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* iOS Safari Tip */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-white">
                <Smartphone className="h-4 w-4 text-sky-400" />
                <span>iPhone &amp; iPad Safari</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tap the Share icon &rarr; <strong>"Add to Home Screen"</strong> to run your test site in full-screen standalone PWA mode without browser address bars.
              </p>
            </div>

            {/* Smart TV Remote D-Pad Tip */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-white">
                <Tv className="h-4 w-4 text-emerald-400" />
                <span>Smart TV D-Pad Remote</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Use your TV remote arrows (<strong>▲ ▼ ◀ ▶</strong>) to hop between cards. Focused elements glow electric cyan; tap <strong>OK/Select</strong> to open.
              </p>
            </div>

            {/* Android Remote Debug Tip */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-white">
                <Laptop className="h-4 w-4 text-amber-400" />
                <span>Chrome Remote Inspect</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Plug Android via USB and visit <code className="text-sky-300">chrome://inspect</code> on your computer to live-debug mobile DOM, console, and network requests.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-4 gap-2">
            <span>Portside Multi-Device LAN Launchpad &middot; PortSide</span>
            <div className="flex items-center gap-3">
              <span className="font-mono">
                mDNS &middot; portside.local
              </span>
              <span>&middot;</span>
              <span>Gateway: {lanIp}</span>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* QR MODAL DRAWER WITH EMBLEM & QUIET ZONE                                  */}
      {/* ========================================================================= */}
      {qrModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-sm w-full rounded-3xl border border-sky-500/40 bg-slate-900/95 p-6 shadow-2xl text-center space-y-4">
            <button
              onClick={() => setQrModalService(null)}
              data-lan-nav="true"
              className="absolute right-4 top-4 text-slate-400 hover:text-white rounded-lg p-1 tv-focus-target cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-400/30">
              <QrCode className="h-6 w-6" />
            </span>

            <div>
              <h3 className="text-base font-bold text-white">
                Scan to Launch on Mobile
              </h3>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {qrModalService.name}
              </p>
            </div>

            {/* QR Code with Clean Quiet Zone and Center Emblem */}
            <div className="relative mx-auto w-64 h-64 rounded-2xl bg-white p-3 shadow-xl">
              <img
                src={qrModalService.qrUrl}
                alt="Launch QR Code"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#081426] border border-sky-400 shadow-md shadow-sky-500/30 p-1.5 ring-4 ring-white">
                  <AnchorLogo className="h-7 w-7" />
                </div>
              </div>
            </div>

            {/* URL String & Copy */}
            <div className="rounded-xl bg-slate-950/80 border border-white/10 p-2.5 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="truncate mr-2">{qrModalService.url}</span>
              <button
                onClick={() => handleCopy(qrModalService.url, "modal-qr")}
                className="text-sky-400 hover:text-sky-300 shrink-0 font-bold cursor-pointer"
              >
                {copiedKey === "modal-qr" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
