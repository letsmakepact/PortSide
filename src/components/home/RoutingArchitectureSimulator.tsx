"use client";

import { useState } from "react";
import {
  Laptop,
  Smartphone,
  Radio,
  Globe,
  Palette,
  Check,
  Copy,
  Terminal,
  QrCode,
  Tv,
  Lock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  Wifi,
  Send,
  RefreshCw,
  Cpu,
  Layers,
} from "lucide-react";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  port: number;
  runtime: string;
  category: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: "shop",
    name: "Storefront Web",
    slug: "shop",
    port: 3000,
    runtime: "Next.js 16 (App Router)",
    category: "Frontend",
  },
  {
    id: "api",
    name: "Go REST Engine",
    slug: "api",
    port: 8080,
    runtime: "Go 1.23 + Gin Engine",
    category: "Backend API",
  },
  {
    id: "auth",
    name: "Auth Microservice",
    slug: "auth",
    port: 5000,
    runtime: "FastAPI / Uvicorn",
    category: "Auth Service",
  },
  {
    id: "docs",
    name: "Storybook Docs",
    slug: "docs",
    port: 6006,
    runtime: "Vite + Storybook 8",
    category: "UI Components",
  },
];

type ModeKey = "localhost" | "lan" | "hotspot" | "tunnel" | "profile";

interface ModeTab {
  id: ModeKey;
  label: string;
  sublabel: string;
  badge: "Free" | "Universal" | "Hardware" | "Supporter";
  badgeVariant: "sky" | "cyan" | "amber" | "emerald" | "purple";
  icon: typeof Laptop;
}

const TABS: ModeTab[] = [
  {
    id: "localhost",
    label: "Localhost",
    sublabel: "*.localhost on Port 80",
    badge: "Free",
    badgeVariant: "sky",
    icon: Laptop,
  },
  {
    id: "lan",
    label: "Mobile & TV",
    sublabel: "Wi-Fi LAN & Open-Air",
    badge: "Universal",
    badgeVariant: "cyan",
    icon: Smartphone,
  },
  {
    id: "hotspot",
    label: "Dev Hotspot",
    sublabel: "Hardware SoftAP Radio",
    badge: "Hardware",
    badgeVariant: "amber",
    icon: Radio,
  },
  {
    id: "tunnel",
    label: "Global Tunnel",
    sublabel: "Worldwide Edge & 5G",
    badge: "Supporter",
    badgeVariant: "emerald",
    icon: Globe,
  },
  {
    id: "profile",
    label: "Showcase",
    sublabel: "Vanity Hub & Bio",
    badge: "Supporter",
    badgeVariant: "purple",
    icon: Palette,
  },
];

export function RoutingArchitectureSimulator() {
  const [activeTab, setActiveTab] = useState<ModeKey>("localhost");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("shop");
  const [lanSubView, setLanSubView] = useState<"qr" | "tv">("qr");
  const [tvFocusIndex, setTvFocusIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [simulatedWebhook, setSimulatedWebhook] = useState(false);
  const [profileTheme, setProfileTheme] = useState<"cyberpunk" | "obsidian" | "matrix">("cyberpunk");

  const activeService = SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];

  const getTargetUrl = () => {
    switch (activeTab) {
      case "localhost":
        return `http://${activeService.slug}.localhost/`;
      case "lan":
        return `http://192.168.1.168/s/${activeService.slug}`;
      case "hotspot":
        return `http://192.168.137.1/s/${activeService.slug}`;
      case "tunnel":
        return `https://pact.portside.lol/${activeService.slug}`;
      case "profile":
        return `https://pact.portside.lol`;
    }
  };

  const targetUrl = getTargetUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerWebhookSimulation = () => {
    setSimulatedWebhook(true);
    setTimeout(() => setSimulatedWebhook(false), 3000);
  };

  return (
    <section id="simulator" className="relative py-20 border-b border-white/[0.08] bg-[#070b14] text-slate-200">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-sky-500/[0.03] rounded-full blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-950/30 text-sky-400 text-xs font-mono mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Routing Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            One daemon. Five operational modes.
          </h2>
          <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            PortSide claims port 80 at boot, eliminating port numbers, hosts file tampering, and client isolation firewalls across every developer environment.
          </p>
        </div>

        {/* 5-Column Responsive Segmented Dock (Immune to clipping / wrapping bugs) */}
        <div className="w-full mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1.5 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] shadow-inner">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex flex-col items-start p-3 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                    isActive
                      ? "bg-[#141d30] border border-sky-500/40 shadow-lg shadow-sky-500/5 text-white"
                      : "bg-transparent border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Top Row: Icon + Badge */}
                  <div className="w-full flex items-center justify-between mb-1.5">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive
                          ? "bg-sky-500/10 text-sky-400"
                          : "bg-black/40 text-slate-500 group-hover:text-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-medium ${
                        tab.badgeVariant === "sky"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : tab.badgeVariant === "cyan"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : tab.badgeVariant === "amber"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : tab.badgeVariant === "emerald"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </div>

                  {/* Bottom Row: Name + Subtitle */}
                  <span className="text-xs font-semibold text-white tracking-tight truncate w-full">
                    {tab.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 truncate w-full">
                    {tab.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Master Studio Surface (Zero Russian-doll nesting & Zero Dead Space) */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220] shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Top Window Bar */}
          <div className="px-5 py-3.5 bg-[#090d18] border-b border-white/[0.06] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span className="ml-2 text-slate-400 font-mono text-xs hidden sm:inline">
                portside daemon &middot; port 80
              </span>
            </div>

            {/* Active URL bar */}
            <div className="flex-1 max-w-md mx-2 px-3 py-1.5 rounded-md bg-black/60 border border-white/[0.08] flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="truncate text-sky-400 font-medium">{targetUrl}</span>
              <span className="text-[10px] text-emerald-400 ml-2 shrink-0">200 OK</span>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#141b2b] hover:bg-[#1a243a] text-xs font-mono text-slate-300 border border-white/[0.08] transition cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>

          {/* Equal-Height Split Canvas (Left Control Deck + Right Interactive Engine) */}
          <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
            {/* LEFT COLUMN: Service Directory & Protocol Deck */}
            <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-6">
              {/* Top: Active Dev Service Switcher */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Registered Service Target
                  </span>
                  <span className="text-[10px] font-mono text-sky-400">
                    Click to switch
                  </span>
                </div>

                <div className="space-y-1.5">
                  {SERVICES.map((srv) => {
                    const isSelected = selectedServiceId === srv.id;
                    return (
                      <button
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? "bg-[#141d30] border-sky-500/40 text-white shadow-xs"
                            : "bg-[#090d16] border-white/[0.04] text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isSelected ? "bg-sky-400" : "bg-slate-600"
                            }`}
                          />
                          <div className="truncate">
                            <div className="font-semibold text-xs text-white truncate">
                              {srv.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 truncate">
                              {srv.slug}.localhost &middot; {srv.category}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-sky-400 px-2 py-0.5 rounded bg-black/60 border border-white/[0.06] shrink-0 ml-2">
                          :{srv.port}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Middle: Live Protocol Telemetry Grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                  Kernel Telemetry &middot; RFC Protocol Verification
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 block">DNS Overhead</span>
                    <span className="text-emerald-400 font-medium">0.00ms (Bypassed)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 block">Daemon Overhead</span>
                    <span className="text-sky-400 font-medium">&lt; 0.18ms (Zero-Copy)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 block">Memory Footprint</span>
                    <span className="text-slate-300 font-medium">~12 MB (Go Binary)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 block">Hosts File Tampering</span>
                    <span className="text-purple-400 font-medium">Zero / Clean</span>
                  </div>
                </div>
              </div>

              {/* Bottom: Deep Operational Insight */}
              <div className="pt-3 border-t border-white/[0.06] text-xs text-slate-400 leading-relaxed">
                {activeTab === "localhost" && (
                  <p>
                    <strong className="text-white">RFC 6761 §6.3 Native Loopback:</strong> Compliant browser engines resolve any <code className="text-sky-300">*.localhost</code> domain directly to 127.0.0.1. PortSide matches the incoming Host header to internal sockets with zero `/etc/hosts` editing.
                  </p>
                )}
                {activeTab === "lan" && (
                  <p>
                    <strong className="text-white">Dual Ingress for Mobile &amp; TV:</strong> Direct <code className="text-cyan-300">/s/&lt;slug&gt;</code> routing and Level H QR camera scan let any phone or TV load your build (100% free), plus Supporter Open-Air signals (<code className="text-cyan-300">*.local</code>).
                  </p>
                )}
                {activeTab === "hotspot" && (
                  <p>
                    <strong className="text-white">Solving the Coffee Shop Trap:</strong> Guest networks in hotels &amp; cafés enforce Client Isolation. PortSide broadcasts an isolated hardware SoftAP (<code className="text-amber-300">PortSide-DevNet</code>) so devices connect directly.
                  </p>
                )}
                {activeTab === "tunnel" && (
                  <p>
                    <strong className="text-white">Encrypted Core Edge:</strong> Outbound TLS 1.3 multiplexed stream connects to Our edge POP. Receive Stripe webhooks or test on 5G without exposing your home IP or touching router port forwarding.
                  </p>
                )}
                {activeTab === "profile" && (
                  <p>
                    <strong className="text-white">Developer Identity Hub:</strong> Publish a live portfolio at <code className="text-purple-300">pact.portside.lol</code> with real-time process indicators, custom theme styles, and active demo links.
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Mode-Specific Interactive Visual Simulator */}
            <div className="lg:col-span-7 p-6 bg-[#080c18]/80 flex flex-col justify-between space-y-6">
              {/* MODE 1: LOCALHOST ROUTING PIPELINE & TELEMETRY */}
              {activeTab === "localhost" && (
                <div className="space-y-5 h-full flex flex-col justify-between">
                  {/* Visual Route Pipeline Diagram */}
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.06]">
                      <span className="text-xs font-mono text-slate-400">
                        Visual Packet Pipeline &middot; Port 80 Loopback
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                        0.18ms Loopback
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div className="p-3 rounded-lg bg-[#0d131f] border border-white/[0.06]">
                        <span className="text-[10px] text-slate-500 block mb-1">Browser Request</span>
                        <span className="text-sky-300 font-semibold truncate block">
                          {activeService.slug}.localhost
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-1">RFC 6761 Loopback</span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#141d30] border border-sky-500/30 shadow-xs">
                        <span className="text-[10px] text-sky-400 block mb-1">PortSide Daemon</span>
                        <span className="text-white font-bold block">:80 Multiplexer</span>
                        <span className="text-[9px] text-emerald-400 block mt-1">Zero-Copy Go Pipe</span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#0d131f] border border-white/[0.06]">
                        <span className="text-[10px] text-slate-500 block mb-1">Target Process</span>
                        <span className="text-emerald-400 font-semibold block">
                          127.0.0.1:{activeService.port}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-1">{activeService.runtime.split(" ")[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terminal Header & Wire Log */}
                  <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs space-y-2 text-slate-300">
                    <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-white/[0.06]">
                      <span>wire inspection</span>
                      <span className="text-emerald-400">GET / HTTP/1.1</span>
                    </div>
                    <div className="space-y-1 text-slate-400">
                      <p className="text-sky-300">Host: {activeService.slug}.localhost</p>
                      <p>User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)</p>
                      <p>X-Forwarded-Host: {activeService.slug}.localhost</p>
                      <p>X-Portside-Route: {activeService.slug} &rarr; 127.0.0.1:{activeService.port}</p>
                      <p className="text-emerald-400 pt-1">
                        [UPSTREAM] TCP loopback established in 0.18ms &middot; HTTP 200 OK
                      </p>
                    </div>
                  </div>

                  {/* Bottom Verification Note */}
                  <div className="p-3 rounded-lg bg-[#0d131f] border border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Hosts file remains completely untouched.</span>
                    </div>
                    <span className="text-sky-400 font-semibold">100% Native</span>
                  </div>
                </div>
              )}

              {/* MODE 2: MOBILE QR SCAN & SMART TV REMOTE */}
              {activeTab === "lan" && (
                <div className="space-y-5 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLanSubView("qr")}
                        className={`text-xs font-mono px-3 py-1 rounded transition cursor-pointer ${
                          lanSubView === "qr"
                            ? "bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Phone Camera QR
                      </button>
                      <button
                        onClick={() => setLanSubView("tv")}
                        className={`text-xs font-mono px-3 py-1 rounded transition cursor-pointer ${
                          lanSubView === "tv"
                            ? "bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Smart TV 10-Foot UI
                      </button>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400">Wi-Fi LAN</span>
                  </div>

                  {lanSubView === "qr" ? (
                    <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                      {/* High-Redundancy QR Code Card with Anchor Emblem */}
                      <div className="relative p-2.5 rounded-2xl bg-white shadow-xl shrink-0">
                        <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                          <rect width="100" height="100" fill="white" />
                          <rect x="6" y="6" width="24" height="24" fill="#0b0f17" />
                          <rect x="9" y="9" width="18" height="18" fill="white" />
                          <rect x="12" y="12" width="12" height="12" fill="#0b0f17" />

                          <rect x="70" y="6" width="24" height="24" fill="#0b0f17" />
                          <rect x="73" y="9" width="18" height="18" fill="white" />
                          <rect x="76" y="12" width="12" height="12" fill="#0b0f17" />

                          <rect x="6" y="70" width="24" height="24" fill="#0b0f17" />
                          <rect x="9" y="73" width="18" height="18" fill="white" />
                          <rect x="12" y="76" width="12" height="12" fill="#0b0f17" />

                          <circle cx="45" cy="18" r="2.5" fill="#0b0f17" />
                          <circle cx="55" cy="18" r="2.5" fill="#0b0f17" />
                          <circle cx="40" cy="28" r="2.5" fill="#0b0f17" />
                          <circle cx="18" cy="45" r="2.5" fill="#0b0f17" />
                          <circle cx="82" cy="45" r="2.5" fill="#0b0f17" />
                          <circle cx="45" cy="82" r="2.5" fill="#0b0f17" />
                          <circle cx="55" cy="82" r="2.5" fill="#0b0f17" />
                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-xl bg-[#081426] border border-sky-400 shadow p-1 ring-2 ring-white flex items-center justify-center">
                            <AnchorLogo className="w-full h-full" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs font-mono">
                        <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold block">
                          Level H Error Correction (30% Redundant)
                        </span>
                        <h4 className="text-white font-semibold text-sm">
                          Point iPhone / Android Camera
                        </h4>
                        <p className="text-slate-400 font-sans text-xs leading-relaxed">
                          Opens immediately on physical mobile screens over your Wi-Fi network with zero configuration.
                        </p>
                        <div className="space-y-1 text-[11px] pt-1">
                          <div className="text-slate-400">
                            Free Route: <span className="text-cyan-300">http://192.168.1.168/s/{activeService.slug}</span>
                          </div>
                          <div className="text-slate-400">
                            Supporter: <span className="text-emerald-400">http://{activeService.slug}.local</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-1">
                      <div className="text-xs font-mono text-slate-400">
                        10-Foot Spatial UI &middot; Couch Testing with Remote D-Pad
                      </div>

                      {/* Simulated Smart TV Screen */}
                      <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] grid grid-cols-3 gap-3">
                        {SERVICES.slice(0, 3).map((srv, idx) => {
                          const isFocused = tvFocusIndex === idx;
                          return (
                            <div
                              key={srv.id}
                              className={`p-3 rounded-xl text-center transition-all ${
                                isFocused
                                  ? "bg-[#141d30] border-2 border-sky-400 shadow-lg shadow-sky-500/25 scale-105"
                                  : "bg-black/40 border border-white/[0.04] opacity-50"
                              }`}
                            >
                              <div className="text-xs font-bold text-white mb-0.5">{srv.name}</div>
                              <span className="text-[10px] font-mono text-cyan-400">/s/{srv.slug}</span>
                              {isFocused && (
                                <span className="text-[9px] font-mono text-sky-300 block mt-1.5 uppercase font-semibold">
                                  [Active Focus]
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Interactive TV Remote Control Buttons */}
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          onClick={() => setTvFocusIndex((p) => (p > 0 ? p - 1 : 2))}
                          className="px-3 py-1.5 rounded-lg bg-[#141d30] hover:bg-[#1a243a] text-white text-xs font-mono border border-white/[0.08] cursor-pointer"
                        >
                          ◄ Left
                        </button>
                        <button
                          onClick={() => alert(`Launching ${SERVICES[tvFocusIndex].name} full-screen on TV!`)}
                          className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-sky-600/30"
                        >
                          OK / Enter
                        </button>
                        <button
                          onClick={() => setTvFocusIndex((p) => (p < 2 ? p + 1 : 0))}
                          className="px-3 py-1.5 rounded-lg bg-[#141d30] hover:bg-[#1a243a] text-white text-xs font-mono border border-white/[0.08] cursor-pointer"
                        >
                          Right ►
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-[#0d131f] border border-white/[0.06] text-xs font-mono text-slate-400">
                    Works on LG webOS, Samsung Tizen, Apple TV, Fire TV, and Android TV.
                  </div>
                </div>
              )}

              {/* MODE 3: DEV WI-FI HOTSPOT (HARDWARE AP) */}
              {activeTab === "hotspot" && (
                <div className="space-y-5 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-xs font-mono text-slate-400">
                      Hardware SoftAP &middot; <span className="text-amber-400">Active Dev Radio</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                      Layer 2 Isolated
                    </span>
                  </div>

                  {/* Hotspot Credentials Card */}
                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08] grid grid-cols-3 gap-2 text-xs font-mono text-center">
                    <div className="p-2 rounded-lg bg-[#0d131f] border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block mb-1">Wi-Fi SSID</span>
                      <span className="text-amber-400 font-bold text-xs truncate block">PortSide-DevNet</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0d131f] border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block mb-1">WPA2 Password</span>
                      <span className="text-white font-semibold text-xs truncate block">portside123</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0d131f] border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block mb-1">Hardware Gateway</span>
                      <span className="text-sky-400 font-semibold text-xs truncate block">192.168.137.1</span>
                    </div>
                  </div>

                  {/* Visual Comparison: Client Isolation vs PortSide Hardware AP */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-red-950/15 border border-red-800/30 space-y-1">
                      <span className="text-red-400 font-bold text-xs block">Public Coffee Shop Wi-Fi:</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        AP Client Isolation blocks peer packets. Your phone cannot connect to your laptop.
                      </p>
                      <span className="text-[9px] font-mono text-red-400 bg-red-950/40 px-1.5 py-0.2 rounded border border-red-800/40 inline-block mt-1">
                        Blocked by Firewall
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-950/15 border border-emerald-800/30 space-y-1">
                      <span className="text-emerald-400 font-bold text-xs block">PortSide Hardware AP:</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        Laptop Wi-Fi card creates an isolated private cell. Zero hotel network interference.
                      </p>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40 inline-block mt-1">
                        100% Offline &middot; Private
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0d131f] border border-white/[0.06] text-xs font-mono text-slate-400">
                    Bypasses hotel captive portals and corporate firewall restrictions completely.
                  </div>
                </div>
              )}

              {/* MODE 4: GLOBAL ENCRYPTED TUNNEL */}
              {activeTab === "tunnel" && (
                <div className="space-y-5 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-xs font-mono text-slate-400">
                      Primary Edge Tunnel &middot; <span className="text-emerald-400">Connected</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                      Zero Open Router Ports
                    </span>
                  </div>

                  {/* Live Webhook Simulator Action Bar */}
                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08] flex items-center justify-between gap-3 text-xs">
                    <div className="truncate">
                      <span className="text-slate-500 font-mono text-[10px] block">Public 5G Endpoint</span>
                      <span className="text-emerald-400 font-mono font-semibold truncate block">
                        https://pact.portside.lol/{activeService.slug}
                      </span>
                    </div>

                    <button
                      onClick={triggerWebhookSimulation}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                    >
                      <Send className="w-3 h-3" />
                      <span>Simulate Webhook</span>
                    </button>
                  </div>

                  {/* Webhook Stream Payload Animation */}
                  <div className="p-3.5 rounded-xl bg-[#090d16] border border-white/[0.06] font-mono text-xs space-y-1.5">
                    <div className="text-slate-500 text-[10px] flex items-center justify-between border-b border-white/[0.06] pb-1">
                      <span>Inbound TLS 1.3 Multiplexer</span>
                      <span className={simulatedWebhook ? "text-emerald-400 animate-pulse" : "text-slate-500"}>
                        {simulatedWebhook ? "Incoming Payload Dispatched!" : "Ready for events"}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] leading-relaxed">
                      <p className="text-emerald-400">
                        POST https://pact.portside.lol/{activeService.slug}
                      </p>
                      <p className="text-sky-300">
                        [TUNNEL] Demuxing stream frame &rarr; 127.0.0.1:{activeService.port}
                      </p>
                      <p className="text-slate-500">
                        ✓ Anti-replay nonce verified &middot; Accessible on 5G cellular worldwide
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0d131f] border border-white/[0.06] text-xs font-mono text-slate-400">
                    Perfect for testing Stripe checkouts, GitHub apps, and client mobile previews.
                  </div>
                </div>
              )}

              {/* MODE 5: BRANDED SHOWCASE PORTFOLIO */}
              {activeTab === "profile" && (
                <div className="space-y-5 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-xs font-mono text-slate-400">
                      Vanity Domain Showcase &middot; <span className="text-purple-400">pact.portside.lol</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(["cyberpunk", "obsidian", "matrix"] as const).map((thm) => (
                        <button
                          key={thm}
                          onClick={() => setProfileTheme(thm)}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize transition cursor-pointer ${
                            profileTheme === thm
                              ? "bg-purple-600 text-white font-bold"
                              : "text-slate-400 hover:text-white bg-black/40"
                          }`}
                        >
                          {thm}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stylized Developer Profile Card */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      profileTheme === "cyberpunk"
                        ? "bg-gradient-to-br from-purple-950/40 via-slate-950 to-indigo-950/40 border-purple-500/30"
                        : profileTheme === "obsidian"
                        ? "bg-gradient-to-br from-slate-900 via-slate-950 to-black border-slate-700"
                        : "bg-gradient-to-br from-emerald-950/40 via-slate-950 to-teal-950/40 border-emerald-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center p-1">
                          <AnchorLogo className="w-full h-full" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">pact</div>
                          <span className="text-[10px] font-mono text-slate-400">pact.portside.lol</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-500/40 px-2 py-0.5 rounded">
                        Verified Supporter
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {SERVICES.slice(0, 3).map((srv) => (
                        <div
                          key={srv.id}
                          className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-white">{srv.name}</span>
                          </div>
                          <span className="text-[10px] text-sky-400">/s/{srv.slug} &rarr;</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0d131f] border border-white/[0.06] text-xs font-mono text-slate-400">
                    Custom themes, bio tags, and live process launchpad for your personal domain.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
