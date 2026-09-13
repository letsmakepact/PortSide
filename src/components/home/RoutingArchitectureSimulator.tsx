"use client";

import { useState } from "react";
import {
  Laptop,
  Smartphone,
  Radio,
  Globe,
  Check,
  Copy,
  Tv,
  ArrowRight,
  Wifi,
  Send,
  FolderGit2,
  Play,
  ShoppingCart,
  Database,
  Code2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  ChevronRight,
  Layers,
  Search,
} from "lucide-react";
import { AnchorLogo } from "@/components/ui/AnchorLogo";

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  port: number;
  runtime: string;
  category: string;
  color: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: "shop",
    name: "Storefront Web",
    slug: "shop",
    port: 3000,
    runtime: "Next.js 15 (App Router)",
    category: "Frontend",
    color: "sky",
  },
  {
    id: "api",
    name: "Go REST Engine",
    slug: "api",
    port: 8080,
    runtime: "Go 1.23 + Gin Engine",
    category: "Backend API",
    color: "emerald",
  },
  {
    id: "docs",
    name: "Storybook & Docs",
    slug: "docs",
    port: 6006,
    runtime: "Vite + Storybook 8",
    category: "Design System",
    color: "purple",
  },
];

type ModeKey = "localhost" | "lan" | "hotspot" | "tunnel" | "projects";

interface ModeTab {
  id: ModeKey;
  label: string;
  sublabel: string;
  badge: string;
  badgeColor: string;
  icon: typeof Laptop;
}

const TABS: ModeTab[] = [
  {
    id: "localhost",
    label: "*.localhost Domains",
    sublabel: "Clean Port 80 URLs",
    badge: "Core Free",
    badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    icon: Globe,
  },
  {
    id: "lan",
    label: "Mobile & TV Cockpit",
    sublabel: "Instant QR & /lan",
    badge: "Universal",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    icon: Smartphone,
  },
  {
    id: "hotspot",
    label: "Dev Wi-Fi Hotspot",
    sublabel: "Off-Grid Café Testing",
    badge: "Hardware AP",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: Radio,
  },
  {
    id: "tunnel",
    label: "Remote Edge Tunnels",
    sublabel: "Share Links & Webhooks",
    badge: "Supporter",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: Send,
  },
  {
    id: "projects",
    label: "Projects & Groups",
    sublabel: "Multi-Repo Workspaces",
    badge: "Workspace",
    badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    icon: FolderGit2,
  },
];

export function RoutingArchitectureSimulator() {
  const [activeTab, setActiveTab] = useState<ModeKey>("localhost");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("shop");
  const [lanView, setLanView] = useState<"mobile" | "tv">("mobile");
  const [mobileActiveService, setMobileActiveService] = useState<string | null>(null);
  const [tvFocusIdx, setTvFocusIdx] = useState(0);
  const [hotspotActive, setHotspotActive] = useState(true);
  const [webhookStatus, setWebhookStatus] = useState<"idle" | "sending" | "success">("idle");
  const [copiedUrl, setCopiedUrl] = useState(false);

  const activeService = SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];

  const getTargetUrl = () => {
    switch (activeTab) {
      case "localhost":
        return "http://" + activeService.slug + ".localhost/";
      case "lan":
        return "http://192.168.1.168/s/" + activeService.slug;
      case "hotspot":
        return "http://192.168.137.1/s/" + activeService.slug;
      case "tunnel":
        return "https://pact.portside.lol/s/" + activeService.slug;
      case "projects":
        return "http://portside.local/dashboard";
    }
  };

  const currentUrl = getTargetUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleTriggerWebhook = () => {
    setWebhookStatus("sending");
    setTimeout(() => {
      setWebhookStatus("success");
      setTimeout(() => setWebhookStatus("idle"), 4000);
    }, 900);
  };

  return (
    <section id="simulator" className="relative py-16 sm:py-24 border-b border-[#1f2937] bg-[#070b14] text-slate-200">
      {/* Subtle background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[350px] bg-sky-500/[0.04] rounded-full blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-950/40 text-sky-400 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Feature Tour</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Everything local development was missing.
          </h2>
          <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            From clean named subdomains on your desktop to real phone testing on Wi-Fi and off-grid café hotspots—click each mode below to see it in action.
          </p>
        </div>

        {/* 5 Clean Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 p-1.5 rounded-2xl bg-[#0c1220] border border-[#1f2937] mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-start p-3 rounded-xl transition-all duration-150 text-left cursor-pointer border ${
                  isActive
                    ? "bg-[#141d30] border-sky-500/50 shadow-md shadow-sky-500/10 text-white"
                    : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive ? "bg-sky-500/20 text-sky-300" : "bg-black/40 text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                </div>
                <span className="text-xs font-semibold text-white truncate w-full">
                  {tab.label}
                </span>
                <span className="text-[11px] text-slate-400 truncate w-full mt-0.5">
                  {tab.sublabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Studio Surface Showcase */}
        <div className="rounded-2xl border border-[#1f2937] bg-[#0c1220] shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Studio Top Address Bar */}
          <div className="px-4 py-3 bg-[#090d18] border-b border-[#1f2937] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-slate-400 font-mono text-xs hidden sm:inline">
                PortSide &middot; Port 80
              </span>
            </div>

            {/* Active URL bar */}
            <div className="flex-1 max-w-lg mx-2 px-3 py-1.5 rounded-lg bg-black/60 border border-[#1f2937] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate text-sky-300 font-medium">{currentUrl}</span>
              </div>
              <span className="text-[10px] text-emerald-400 ml-2 shrink-0 font-semibold">200 OK</span>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141b2b] hover:bg-[#1a243a] text-xs font-mono text-slate-300 border border-[#1f2937] transition cursor-pointer shrink-0"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* TAB 1: LOCALHOST SUBDOMAINS */}
          {activeTab === "localhost" && (
            <div className="p-6 lg:p-8 space-y-6">
              {/* Service Switcher Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Select Running Local App
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any service to see how Portside binds clean subdomains on port 80:
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map((srv) => {
                    const isSelected = selectedServiceId === srv.id;
                    return (
                      <button
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-2 border ${
                          isSelected
                            ? "bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold shadow-xs"
                            : "bg-[#090d16] text-slate-400 hover:text-slate-200 border-white/[0.06]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-sky-400" : "bg-slate-600"
                          }`}
                        />
                        <span>{srv.slug}.localhost</span>
                        <span className="text-[10px] text-slate-500">:{srv.port}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Realistic Web Browser Window Rendering Selected Service */}
              <div className="rounded-xl border border-white/[0.08] bg-[#090e1a] overflow-hidden shadow-xl">
                {/* Browser Sub-Header */}
                <div className="px-4 py-2 bg-black/40 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">● Mapped:</span>
                    <span className="text-slate-300">127.0.0.1:{activeService.port}</span>
                    <span className="text-slate-500">&rarr;</span>
                    <span className="text-sky-300 font-semibold">{activeService.slug}.localhost</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans hidden sm:inline">
                    Zero /etc/hosts modifications
                  </span>
                </div>

                {/* Simulated Web App Canvas */}
                <div className="p-6 sm:p-8 min-h-[260px] flex flex-col justify-center">
                  {selectedServiceId === "shop" && (
                    <div className="max-w-xl mx-auto w-full space-y-4">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                            <ShoppingCart className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">Acme Commerce Storefront</h4>
                            <p className="text-[11px] text-slate-400 font-mono">Running on local port :3000</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                          Live Next.js 15
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                          <span className="text-[11px] text-slate-400">Cart Checkout Session</span>
                          <div className="text-base font-bold text-white">$149.00 USD</div>
                          <span className="text-[10px] text-emerald-400 font-mono">2 items in cart</span>
                        </div>
                        <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                          <span className="text-[11px] text-slate-400">Subdomain Cookie Scope</span>
                          <div className="text-xs font-mono text-sky-300">shop.localhost</div>
                          <span className="text-[10px] text-slate-400">Isolated from other ports</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-400">
                          Ready for customer checkout testing on <code className="text-sky-300 font-mono">http://shop.localhost</code>
                        </span>
                        <button className="px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium cursor-pointer transition">
                          Simulate Purchase
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedServiceId === "api" && (
                    <div className="max-w-xl mx-auto w-full space-y-3 font-mono">
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2 text-xs">
                          <Database className="w-4 h-4 text-emerald-400" />
                          <span className="text-white font-semibold">REST Engine Endpoint</span>
                          <span className="text-slate-500">:8080</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                          GET /healthz 200 OK
                        </span>
                      </div>

                      <div className="p-3.5 rounded-lg bg-black/60 border border-white/[0.06] text-xs text-slate-300 space-y-1 font-mono">
                        <p className="text-slate-500">// Response from api.localhost (127.0.0.1:8080)</p>
                        <p className="text-sky-300">&#123;</p>
                        <p className="pl-4 text-emerald-300">&quot;status&quot;: &quot;healthy&quot;,</p>
                        <p className="pl-4 text-slate-300">&quot;service&quot;: &quot;order-processing-v2&quot;,</p>
                        <p className="pl-4 text-slate-300">&quot;engine&quot;: &quot;Go 1.23 Gin Router&quot;,</p>
                        <p className="pl-4 text-slate-300">&quot;latency_ms&quot;: 0.18</p>
                        <p className="text-sky-300">&#125;</p>
                      </div>

                      <p className="text-xs text-slate-400 font-sans">
                        No CORS clashes between your frontend and API because both use proper named subdomains.
                      </p>
                    </div>
                  )}

                  {selectedServiceId === "docs" && (
                    <div className="max-w-xl mx-auto w-full space-y-4">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                            <Code2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">Storybook UI Component Explorer</h4>
                            <p className="text-[11px] text-slate-400 font-mono">Vite server on port :6006</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-purple-300 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded">
                          docs.localhost
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
                          <span className="text-[10px] text-slate-400 block mb-1">Primary Button</span>
                          <button className="px-3 py-1 rounded bg-sky-600 text-white text-[11px] font-medium">Button</button>
                        </div>
                        <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
                          <span className="text-[10px] text-slate-400 block mb-1">Status Badge</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">Active</span>
                        </div>
                        <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
                          <span className="text-[10px] text-slate-400 block mb-1">Outline Variant</span>
                          <button className="px-2 py-1 rounded border border-slate-700 text-slate-300 text-[11px]">Outline</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3 Core Value Pillars */}
              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>No More Port Numbers</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Open <code className="text-sky-300 font-mono text-[11px]">shop.localhost</code> directly instead of guessing between :3000, :8080, and :5173.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>Zero /etc/hosts Hacks</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    RFC 6761 compliant loopback resolution means your OS system files and DNS settings stay 100% clean.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Isolated Cookies &amp; Auth</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Each service runs in its own distinct subdomain origin, preventing session collisions and cookie leaks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOBILE & SMART TV LAN COCKPIT */}
          {activeTab === "lan" && (
            <div className="p-6 lg:p-8 space-y-6">
              {/* Top View Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLanView("mobile")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                      lanView === "mobile"
                        ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📱 Mobile Phone View
                  </button>
                  <button
                    onClick={() => setLanView("tv")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                      lanView === "tv"
                        ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📺 Smart TV 10-Foot UI
                  </button>
                </div>
                <span className="text-xs font-mono text-cyan-400 hidden sm:inline">
                  Local Wi-Fi Network &middot; 192.168.1.168
                </span>
              </div>

              {lanView === "mobile" ? (
                <div className="grid lg:grid-cols-12 gap-6 items-center">
                  {/* Left: Realistic Mobile Phone Device Frame */}
                  <div className="lg:col-span-6 flex justify-center">
                    <div className="w-[300px] rounded-[32px] border-[6px] border-[#1e293b] bg-[#090d16] shadow-2xl p-4 overflow-hidden relative">
                      {/* Phone Speaker Notch */}
                      <div className="w-24 h-4 bg-[#1e293b] rounded-full mx-auto mb-3 flex items-center justify-center">
                        <div className="w-8 h-1.5 bg-slate-700 rounded-full" />
                      </div>

                      {/* Inside Phone Screen */}
                      <div className="space-y-3">
                        {/* Cockpit Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                          <div className="flex items-center gap-2">
                            <AnchorLogo size={20} />
                            <div>
                              <div className="text-xs font-bold text-white leading-tight">PortSide LAN</div>
                              <div className="text-[9px] font-mono text-slate-400">192.168.1.168/lan</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                            Wi-Fi Online
                          </span>
                        </div>

                        {mobileActiveService ? (
                          <div className="space-y-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white capitalize">
                                {mobileActiveService} App
                              </span>
                              <button
                                onClick={() => setMobileActiveService(null)}
                                className="text-[10px] text-sky-400 underline font-mono cursor-pointer"
                              >
                                &larr; Back to Cockpit
                              </button>
                            </div>
                            <div className="p-4 rounded-xl bg-black/50 border border-white/[0.08] text-center space-y-2">
                              <span className="text-xs text-emerald-400 font-mono block">HTTP 200 OK</span>
                              <p className="text-xs text-white font-medium">
                                Rendering directly on physical mobile screen!
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                http://192.168.1.168/s/{mobileActiveService}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                              Available Dev Services
                            </span>

                            {SERVICES.map((srv) => (
                              <button
                                key={srv.id}
                                onClick={() => setMobileActiveService(srv.slug)}
                                className="w-full p-2.5 rounded-xl bg-black/40 hover:bg-white/[0.04] border border-white/[0.06] flex items-center justify-between text-left cursor-pointer transition"
                              >
                                <div className="truncate mr-2">
                                  <div className="text-xs font-semibold text-white truncate">{srv.name}</div>
                                  <div className="text-[9px] font-mono text-slate-400">/s/{srv.slug} &middot; :{srv.port}</div>
                                </div>
                                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/40 shrink-0">
                                  Open &rarr;
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04] text-[10px] text-slate-400 text-center">
                          Tap any app above to test touch gestures &amp; responsiveness.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Camera QR Code & Clear Guidance */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-black/40 border border-white/[0.08]">
                      {/* High-Contrast Scannable QR Code */}
                      <div className="p-3 rounded-2xl bg-white shadow-xl shrink-0">
                        <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none">
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
                      </div>

                      <div className="space-y-2 text-center sm:text-left">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold block">
                          Instant Camera Pairing
                        </span>
                        <h4 className="text-base font-bold text-white">
                          Point your iPhone or Android camera
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Your phone automatically detects the local cockpit URL. Tap the yellow camera notification to load all running apps instantly.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                        <span className="text-slate-300">Free Direct Path Route:</span>
                        <code className="text-cyan-300 font-mono">http://192.168.1.168/s/shop</code>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                        <span className="text-slate-300">Supporter Open-Air Signal:</span>
                        <code className="text-emerald-300 font-mono">http://shop.local</code>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 max-w-2xl mx-auto py-2">
                  <div className="text-center space-y-1">
                    <h4 className="text-base font-bold text-white">Smart TV 10-Foot Spatial Navigation</h4>
                    <p className="text-xs text-slate-400">
                      Test your web apps on living room Smart TVs using standard D-pad remote controls.
                    </p>
                  </div>

                  {/* Simulated Smart TV Screen */}
                  <div className="p-5 rounded-2xl bg-black/60 border border-white/[0.08] grid grid-cols-3 gap-3">
                    {SERVICES.map((srv, idx) => {
                      const isFocused = tvFocusIdx === idx;
                      return (
                        <div
                          key={srv.id}
                          className={`p-4 rounded-xl text-center transition-all ${
                            isFocused
                              ? "bg-sky-600/30 border-2 border-sky-400 shadow-lg shadow-sky-500/25 scale-105"
                              : "bg-black/40 border border-white/[0.04] opacity-60"
                          }`}
                        >
                          <div className="text-xs font-bold text-white mb-1">{srv.name}</div>
                          <span className="text-[10px] font-mono text-cyan-300">/s/{srv.slug}</span>
                          {isFocused && (
                            <span className="text-[9px] font-mono text-sky-300 block mt-2 uppercase font-semibold">
                              [Active Focus]
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Remote Controller */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setTvFocusIdx((p) => (p > 0 ? p - 1 : 2))}
                      className="px-3.5 py-1.5 rounded-lg bg-[#141d30] hover:bg-[#1a243a] text-white text-xs font-mono border border-white/[0.08] cursor-pointer"
                    >
                      ◄ Left
                    </button>
                    <button
                      onClick={() => alert(`Launching ${SERVICES[tvFocusIdx].name} on Smart TV!`)}
                      className="px-5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-sky-600/30"
                    >
                      OK / Launch
                    </button>
                    <button
                      onClick={() => setTvFocusIdx((p) => (p < 2 ? p + 1 : 0))}
                      className="px-3.5 py-1.5 rounded-lg bg-[#141d30] hover:bg-[#1a243a] text-white text-xs font-mono border border-white/[0.08] cursor-pointer"
                    >
                      Right ►
                    </button>
                  </div>

                  <p className="text-center text-xs font-mono text-slate-500">
                    Works on Apple TV, LG webOS, Samsung Tizen, Fire TV, and Android TV.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEV WI-FI HOTSPOT */}
          {activeTab === "hotspot" && (
            <div className="p-6 lg:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                <div>
                  <h4 className="text-base font-bold text-white">Hardware Dev Wi-Fi Hotspot</h4>
                  <p className="text-xs text-slate-400">
                    Broadcast a private, off-grid developer network straight from your laptop.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Hotspot Radio:</span>
                  <button
                    onClick={() => setHotspotActive(!hotspotActive)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition cursor-pointer border ${
                      hotspotActive
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs"
                        : "bg-red-500/20 text-red-400 border-red-500/40"
                    }`}
                  >
                    {hotspotActive ? "● BROADCASTING" : "○ STOPPED"}
                  </button>
                </div>
              </div>

              {/* Hardware Hotspot Credentials & Connected Devices */}
              <div className="grid sm:grid-cols-3 gap-3 font-mono text-xs text-center">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 block mb-1">SSID Name</span>
                  <span className="text-amber-400 font-bold text-sm block">PortSide-DevNet</span>
                  <span className="text-[10px] text-slate-500">WPA2 Protected</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 block mb-1">Wi-Fi Password</span>
                  <span className="text-white font-bold text-sm block">portside123</span>
                  <span className="text-[10px] text-slate-500">Auto-configured</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 block mb-1">Gateway IP</span>
                  <span className="text-sky-400 font-bold text-sm block">192.168.137.1</span>
                  <span className="text-[10px] text-emerald-400">Private Gateway Active</span>
                </div>
              </div>

              {/* Why This Solves the Coffee Shop Problem */}
              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-rose-950/15 border border-rose-800/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <span>❌ The Coffee Shop / Hotel Problem</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Public guest networks in cafés, airports, and hotels enforce <strong>Client Isolation</strong>. Devices are forbidden from talking to each other, making phone testing completely impossible.
                  </p>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40 inline-block">
                    Blocked by Router Firewall
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-800/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <span>✅ The PortSide Solution</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    PortSide commands your machine's Wi-Fi card to broadcast an isolated developer access point. Devices connect directly to your laptop—completely off-grid without internet.
                  </p>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 inline-block">
                    100% Offline &middot; Zero Cloud Needed
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Custom Local Root Domains supported over Hotspot:</span>
                <span className="text-sky-300 font-semibold">*.test &middot; *.lan &middot; *.portside</span>
              </div>
            </div>
          )}

          {/* TAB 4: REMOTE EDGE TUNNELS */}
          {activeTab === "tunnel" && (
            <div className="p-6 lg:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                <div>
                  <h4 className="text-base font-bold text-white">Encrypted Remote Edge Tunnels</h4>
                  <p className="text-xs text-slate-400">
                    Expose local builds to clients, remote teammates, and mobile cellular data.
                  </p>
                </div>
                <button
                  onClick={handleTriggerWebhook}
                  disabled={webhookStatus === "sending"}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {webhookStatus === "sending"
                      ? "Sending Event..."
                      : webhookStatus === "success"
                      ? "✓ Webhook Received!"
                      : "Simulate Stripe Webhook"}
                  </span>
                </button>
              </div>

              {/* Live Tunnel URL Bar */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/[0.08] flex items-center justify-between gap-4">
                <div className="truncate">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Public Edge Vanity URL
                  </span>
                  <span className="text-emerald-400 font-mono font-semibold text-sm truncate block">
                    https://pact.portside.lol/s/shop
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded shrink-0">
                  Global Edge Active
                </span>
              </div>

              {/* Animated Packet Stream Visual */}
              <div className="p-4 rounded-xl bg-[#080c16] border border-white/[0.06] font-mono text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-slate-500 text-[11px]">
                  <span>Live Stream Telemetry</span>
                  <span className={webhookStatus === "success" ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                    {webhookStatus === "sending"
                      ? "Routing through edge network..."
                      : webhookStatus === "success"
                      ? "HTTP 200 OK &middot; Latency 24ms"
                      : "Waiting for incoming events"}
                  </span>
                </div>

                <div className="space-y-1 text-slate-300 text-xs">
                  <p className="text-emerald-400">POST https://pact.portside.lol/s/shop</p>
                  <p className="text-sky-300">&rarr; Multiplexing stream to 127.0.0.1:3000</p>
                  <p className="text-slate-500 text-[11px]">
                    Zero open router ports &middot; Home IP address never exposed &middot; Valid SSL/TLS
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06] space-y-1">
                  <span className="font-semibold text-white block">Direct Project Routing</span>
                  <p className="text-slate-400 leading-relaxed">
                    Share individual services cleanly via <code className="text-emerald-300 font-mono">/s/&lt;project&gt;</code>.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06] space-y-1">
                  <span className="font-semibold text-white block">No Port Forwarding</span>
                  <p className="text-slate-400 leading-relaxed">
                    Safely tunnel outward without messing with router firewall rules or NAT configuration.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06] space-y-1">
                  <span className="font-semibold text-white block">5G Cellular Verified</span>
                  <p className="text-slate-400 leading-relaxed">
                    Test Stripe payments, webhook callbacks, or client review links from anywhere on mobile.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROJECTS & WORKSPACES */}
          {activeTab === "projects" && (
            <div className="p-6 lg:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <h4 className="text-base font-bold text-white">Multi-Repo Workspace Organization</h4>
                  <p className="text-xs text-slate-400">
                    Group services by client, project, or stack with unified status and instant launch.
                  </p>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 px-2.5 py-1 rounded">
                  2 Projects Configured
                </span>
              </div>

              {/* Project Cards Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Project 1 */}
                <div className="p-4 rounded-xl bg-black/40 border border-sky-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      <h5 className="font-bold text-white text-sm">E-Commerce Platform</h5>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">2 Services Online</span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="p-2 rounded bg-black/50 border border-white/[0.04] flex items-center justify-between">
                      <span className="text-slate-300">Storefront (Next.js)</span>
                      <span className="text-sky-300">shop.localhost:3000</span>
                    </div>
                    <div className="p-2 rounded bg-black/50 border border-white/[0.04] flex items-center justify-between">
                      <span className="text-slate-300">Backend API (Go)</span>
                      <span className="text-emerald-300">api.localhost:8080</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Repo: github.com/acme/shop</span>
                    <span className="text-sky-400 cursor-pointer hover:underline">Open Group &rarr;</span>
                  </div>
                </div>

                {/* Project 2 */}
                <div className="p-4 rounded-xl bg-black/40 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      <h5 className="font-bold text-white text-sm">Developer Design System</h5>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">1 Service Online</span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="p-2 rounded bg-black/50 border border-white/[0.04] flex items-center justify-between">
                      <span className="text-slate-300">Storybook UI Kit</span>
                      <span className="text-purple-300">docs.localhost:6006</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Repo: github.com/acme/design</span>
                    <span className="text-purple-400 cursor-pointer hover:underline">Open Group &rarr;</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Start or stop all services within a project with one click.</span>
                <span className="text-indigo-400 font-semibold">Bulk Operations Enabled</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
