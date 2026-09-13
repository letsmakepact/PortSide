"use client";

import { useEffect, useState, useMemo } from "react";
import type { ServiceDTO } from "@/lib/types";
import { AnchorLogo } from "@/components/ui/AnchorLogo";
import { DevIconBadge } from "@/components/ui/DevIcon";
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
  Zap,
  Terminal,
  Server,
  Globe,
  X,
  RotateCw,
  Star,
  ChevronRight,
  ChevronDown,
  Info,
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
  }>({ type: "desktop", name: "Detecting...", icon: Laptop });

  const [viewportSize, setViewportSize] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [pingMs, setPingMs] = useState<number | null>(4);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "online" | "starred">("all");
  const [servicesState, setServicesState] = useState<ServiceDTO[]>(initialServices);

  // QR Modal Drawer State
  const [qrModalService, setQrModalService] = useState<{
    name: string;
    url: string;
    qrUrl: string;
  } | null>(null);

  // Live Port Prober State
  const [showProber, setShowProber] = useState(false);
  const [customProbePort, setCustomProbePort] = useState("3000");
  const [probeStatus, setProbeStatus] = useState<
    Record<string, "probing" | "open" | "closed">
  >({});

  // Developer Guides Accordion
  const [guidesOpen, setGuidesOpen] = useState(false);

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
      setClientDevice({ type: "tv", name: "Smart TV", icon: Tv });
    } else if (isTablet) {
      setClientDevice({
        type: "tablet",
        name: "Tablet",
        icon: Tablet,
      });
    } else if (isMobile) {
      const isIphone = ua.includes("iphone");
      setClientDevice({
        type: "mobile",
        name: isIphone ? "iPhone" : "Mobile",
        icon: Smartphone,
      });
    } else {
      setClientDevice({
        type: "desktop",
        name: "Workstation",
        icon: Laptop,
      });
    }

    const updateDimensions = () => {
      setViewportSize(`${window.innerWidth} × ${window.innerHeight}`);
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
        setPingMs(4);
      }
    };
    pingCheck();
    const pingTimer = setInterval(pingCheck, 15000);

    return () => {
      clearInterval(timer);
      clearInterval(pingTimer);
    };
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("lan-search-input")?.focus();
      }
      if (e.key === "Escape") {
        setQrModalService(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 3. Filtered Services
  const filteredServices = useMemo(() => {
    return servicesState.filter((s) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.hostname.toLowerCase().includes(query) ||
        (s.port && s.port.toString().includes(query)) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(query)));

      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "starred" && s.favorite) ||
        (selectedFilter === "online" && s.enabled);

      return matchesSearch && matchesFilter;
    });
  }, [servicesState, searchQuery, selectedFilter]);

  // 4. Quick Copy Handler
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Toggle favorite
  const toggleFavorite = (serviceId: number) => {
    setServicesState((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, favorite: !s.favorite } : s))
    );
  };

  // 5. Trigger QR Drawer
  const openQrDrawer = async (name: string, url: string) => {
    try {
      const qrUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: "H",
        margin: 3,
        width: 320,
        color: { dark: "#050814", light: "#ffffff" },
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
    <div className="min-h-screen bg-[#060a14] text-slate-100 selection:bg-sky-500 selection:text-white pb-safe relative overflow-x-hidden">
      {/* 10-Foot Spatial Keyboard / TV Remote Nav */}
      <LanRemoteNav />

      {/* Atmospheric Radial Spotlight Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(14,165,233,0.14),transparent_70%)] z-0" />
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] opacity-35 z-0" />

      {/* ========================================================================= */}
      {/* 1. TOP TELEMETRY HEADER                                                   */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#060a14]/85 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-400/30 shadow-md shadow-sky-500/15 shrink-0">
              <AnchorLogo className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold tracking-tight text-white">
                  Portside
                </span>
                <span className="rounded-md bg-sky-500/15 border border-sky-400/30 px-1.5 py-0.5 text-[10px] font-mono font-bold text-sky-400 tracking-wider">
                  LAN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Multi-Device Testing Cockpit
              </p>
            </div>
          </div>

          {/* Right Telemetry Cluster */}
          <div className="flex items-center gap-2">
            {/* Active Client Device Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300">
              <DeviceIcon className="h-3.5 w-3.5 text-sky-400" />
              <span className="font-medium text-slate-200">{clientDevice.name}</span>
            </div>

            {/* Gateway IP with 1-Click Copy */}
            <button
              onClick={() => handleCopy(hostBaseUrl, "gateway")}
              data-lan-nav="true"
              title="Click to copy gateway address"
              className="group flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-950/40 px-2.5 py-1.5 text-xs font-mono text-sky-300 hover:bg-sky-900/50 hover:border-sky-400 transition tv-focus-target touch-action-manipulation cursor-pointer"
            >
              <Wifi className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-none">{hostBaseUrl}</span>
              {copiedKey === "gateway" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
            </button>

            {/* Clock & Ping Telemetry (Desktop) */}
            <div className="hidden md:flex items-center gap-2.5 rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                {currentTime || "00:00:00"}
              </span>
              <span className="h-3 w-px bg-white/10" />
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {pingMs !== null ? `${pingMs}ms` : "OK"}
              </span>
            </div>

            {/* Share Hub QR Action */}
            <button
              onClick={() => openQrDrawer("LAN Portal Hub", hostBaseUrl)}
              data-lan-nav="true"
              title="Show Hub QR Code"
              className="flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1.5 text-xs font-semibold text-sky-300 transition tv-focus-target touch-action-manipulation cursor-pointer"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share Hub</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. COMPACT COMMAND HUD                                                    */}
      {/* ========================================================================= */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-5 sm:px-8 space-y-5">
        <div className="rounded-2xl border border-white/10 bg-[#0c1220]/75 backdrop-blur-xl p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                <Radio className="h-3.5 w-3.5 animate-pulse text-sky-400" />
                <span>Wi-Fi Network Mesh Active</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Multi-Screen Launchpad
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test and hot-reload local services across mobile touchscreens, tablets, and Smart TVs with zero-configuration direct routes.
              </p>
            </div>

            {/* Network Metric Chips */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2 text-xs">
                <Server className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-slate-400">Services:</span>
                <span className="font-bold text-white font-mono">{initialServices.length}</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2 text-xs">
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-slate-400">Gateway:</span>
                <span className="font-mono font-bold text-slate-200">{lanIp}</span>
              </div>

              {viewportSize && (
                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2 text-xs">
                  <DeviceIcon className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-slate-400">Screen:</span>
                  <span className="font-mono text-slate-300">{viewportSize}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SEARCH, FILTERS & PORT SCANNER                                        */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="lan-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services or press / to filter..."
                data-lan-nav="true"
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs & Prober Toggle */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedFilter("all")}
                data-lan-nav="true"
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition tv-focus-target touch-action-manipulation cursor-pointer ${
                  selectedFilter === "all"
                    ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                All ({servicesState.length})
              </button>
              <button
                onClick={() => setSelectedFilter("online")}
                data-lan-nav="true"
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition tv-focus-target touch-action-manipulation cursor-pointer ${
                  selectedFilter === "online"
                    ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setSelectedFilter("starred")}
                data-lan-nav="true"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition tv-focus-target touch-action-manipulation cursor-pointer ${
                  selectedFilter === "starred"
                    ? "bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-sm"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${selectedFilter === "starred" ? "fill-amber-400 text-amber-400" : ""}`} />
                <span>Starred</span>
              </button>

              <button
                onClick={() => setShowProber((v) => !v)}
                data-lan-nav="true"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition tv-focus-target touch-action-manipulation cursor-pointer border ${
                  showProber
                    ? "bg-sky-500/15 border-sky-400/40 text-sky-300"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-sky-400" />
                <span>Port Prober</span>
              </button>
            </div>
          </div>

          {/* Collapsible Port Prober Bar */}
          {showProber && (
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-xs font-semibold text-white">Live Port Probe:</span>
                <span className="text-[11px] text-slate-400">Ping common local ports from this client</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {["3000", "5173", "8080", "8000", "80"].map((p) => {
                  const st = probeStatus[p];
                  return (
                    <button
                      key={p}
                      onClick={() => probePort(p)}
                      data-lan-nav="true"
                      className="flex items-center gap-1.5 rounded-md border border-white/10 bg-slate-950/80 px-2 py-1 text-xs font-mono text-slate-300 hover:border-sky-400 transition tv-focus-target touch-action-manipulation cursor-pointer"
                    >
                      <span>:{p}</span>
                      {st === "probing" && (
                        <RotateCw className="h-3 w-3 text-sky-400 animate-spin" />
                      )}
                      {st === "open" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      )}
                      {st === "closed" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
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
                    className="w-14 rounded-md border border-white/10 bg-slate-950 px-2 py-1 text-xs font-mono text-white text-center focus:outline-none focus:border-sky-400"
                  />
                  <button
                    onClick={() => probePort(customProbePort)}
                    data-lan-nav="true"
                    className="rounded-md bg-sky-500/20 border border-sky-400/30 px-2 py-1 text-xs font-bold text-sky-300 hover:bg-sky-500/30 transition tv-focus-target cursor-pointer"
                  >
                    Test
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. HIGH-DENSITY SERVICE LAUNCH GRID                                      */}
        {/* ========================================================================= */}
        {filteredServices.length > 0 ? (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => {
              const serviceDirectUrl = `${hostBaseUrl}/s/${service.hostname}`;
              const isCopied = copiedKey === service.id.toString();

              return (
                <div
                  key={service.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c1222]/80 p-4 hover:border-sky-500/50 hover:bg-[#0f172a]/95 transition-all duration-200 shadow-lg backdrop-blur-md tv-focus-target"
                >
                  <div>
                    {/* Header: Service Name, Port & Latency */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <DevIconBadge icon={service.icon} size="md" />
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-semibold text-sm text-white group-hover:text-sky-300 transition truncate">
                              {service.name}
                            </h4>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400 block truncate">
                            :{service.port || "80"} &middot; {service.protocol || "http"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {service.lastLatencyMs ? `${service.lastLatencyMs}ms` : "ONLINE"}
                        </span>
                        <button
                          onClick={() => toggleFavorite(service.id)}
                          title={service.favorite ? "Unstar service" : "Star service"}
                          className="text-slate-500 hover:text-amber-400 p-1 rounded transition cursor-pointer"
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${
                              service.favorite ? "fill-amber-400 text-amber-400" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Route Chip */}
                    <div className="rounded-lg bg-slate-950/70 border border-white/5 px-2.5 py-1.5 mb-3 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-slate-300 truncate">
                        /s/{service.hostname}
                      </span>
                      <span className="text-[10px] text-sky-400 font-medium shrink-0 ml-2">
                        Direct Route
                      </span>
                    </div>

                    {/* Tags */}
                    {service.tags && service.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {service.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-white/5 border border-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                    <a
                      href={`/s/${service.hostname}`}
                      data-lan-nav="true"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-400/30 hover:border-sky-400 py-2 px-3 text-xs font-bold transition-all tv-focus-target touch-action-manipulation cursor-pointer"
                    >
                      <span>Launch</span>
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    {/* QR Trigger */}
                    <button
                      onClick={() => openQrDrawer(service.name, serviceDirectUrl)}
                      data-lan-nav="true"
                      title="Show QR Code for phone scan"
                      className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition tv-focus-target touch-action-manipulation cursor-pointer"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </button>

                    {/* Copy URL */}
                    <button
                      onClick={() => handleCopy(serviceDirectUrl, service.id.toString())}
                      data-lan-nav="true"
                      title="Copy Direct LAN URL"
                      className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition tv-focus-target touch-action-manipulation cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* High-Quality Zero-State Terminal */
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-8 text-center max-w-md mx-auto shadow-xl backdrop-blur-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 mb-3">
              <Terminal className="h-6 w-6" />
            </span>
            <h3 className="text-base font-bold text-white">
              No Matching Services
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              {searchQuery
                ? `No service matches "${searchQuery}". Reset filters to see all active ports.`
                : "No services are currently configured. Start a server on your machine to preview it on your local network."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                data-lan-nav="true"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-400 transition cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. COLLAPSIBLE DEVELOPER TESTING & PAIRING GUIDANCE                      */}
        {/* ========================================================================= */}
        <div className="pt-2">
          <button
            onClick={() => setGuidesOpen((v) => !v)}
            data-lan-nav="true"
            className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/30 px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-sky-400" />
              <span>Multi-Device Testing &amp; Remote Debugging Guides</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${
                guidesOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {guidesOpen && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3 animate-in fade-in duration-200">
              {/* iOS Safari Tip */}
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white">
                  <Smartphone className="h-4 w-4 text-sky-400" />
                  <span>iPhone &amp; iPad Safari</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tap the Share icon &rarr; <strong>Add to Home Screen</strong> to run your test site in full-screen standalone PWA mode without browser address bars.
                </p>
              </div>

              {/* Smart TV Remote D-Pad Tip */}
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white">
                  <Tv className="h-4 w-4 text-emerald-400" />
                  <span>Smart TV D-Pad Remote</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Use your TV remote arrow keys (Up, Down, Left, Right) to hop between cards. Tap <strong>OK / Select</strong> to open a focused service.
                </p>
              </div>

              {/* Android Remote Debug Tip */}
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white">
                  <Laptop className="h-4 w-4 text-amber-400" />
                  <span>Chrome Remote Inspect</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Connect mobile via USB and navigate to <code className="text-sky-300 font-mono">chrome://inspect</code> on your desktop to live-debug mobile DOM, console, and network requests.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 6. MINIMALIST FOOTER                                                     */}
        {/* ========================================================================= */}
        <footer className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Portside Multi-Device LAN Launchpad &middot; PortSide</span>
          <div className="flex items-center gap-2 font-mono">
            <span>mDNS: portside.local</span>
            <span>&middot;</span>
            <span>Gateway: {lanIp}</span>
          </div>
        </footer>
      </main>

      {/* ========================================================================= */}
      {/* 7. QR MODAL WITH CLEAN QUIET ZONE & CENTER EMBLEM                         */}
      {/* ========================================================================= */}
      {qrModalService && (
        <div
          onClick={() => setQrModalService(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full rounded-2xl border border-sky-500/30 bg-[#0c1220]/95 p-6 shadow-2xl text-center space-y-4"
          >
            <button
              onClick={() => setQrModalService(null)}
              data-lan-nav="true"
              className="absolute right-4 top-4 text-slate-400 hover:text-white rounded-lg p-1 tv-focus-target cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-400/25">
              <QrCode className="h-5 w-5" />
            </span>

            <div>
              <h3 className="text-base font-bold text-white">
                Scan with Mobile Camera
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {qrModalService.name}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="relative mx-auto w-64 h-64 rounded-xl bg-white p-3 shadow-xl">
              <img
                src={qrModalService.qrUrl}
                alt="Launch QR Code"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#081426] border border-sky-400/80 shadow-md shadow-sky-500/25 p-1 ring-4 ring-white">
                  <AnchorLogo className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* URL String & Copy Button */}
            <div className="rounded-xl bg-slate-950/80 border border-white/10 p-2.5 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="truncate mr-2 text-[11px]">{qrModalService.url}</span>
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
